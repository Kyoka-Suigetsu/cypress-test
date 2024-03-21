"use client";

import Icon from "&/icon";
import { socket } from "@/lib/socket";
import { cn, formatTime, getBrowser, type Browser } from "@/lib/utils";
import { type LiveTranscriptionEvent } from "@deepgram/sdk";
import { useInterval, useListState, useTimeout } from "@mantine/hooks";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import useOnMount from "@/hooks/use-on-mount";
import { getDeepgramClientAiToken } from "@/lib/actions/deepgram";
import { Chip } from "@nextui-org/react";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "sonner";
import {
  activeLanguageAtom,
  deepgramLanguageAtom,
  transcriptsAtom,
} from "./jotai-wrapper";
import TimeoutModal from "./timeout-modal";

type Word = {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word: string;
};

const microphoneAtom = atom<MediaRecorder | null>(null);

export default function TranscriptionMicrophone({
  initialToken,
}: Readonly<{
  initialToken: string;
}>) {
  const [deepgramLanguage] = useAtom(deepgramLanguageAtom);
  const [activeLanguage] = useAtom(activeLanguageAtom);
  const [transcripts, setTranscripts] = useAtom(transcriptsAtom);
  const [microphone, setMicrophone] = useAtom(microphoneAtom);

  const [browser, setBrowser] = useState<Browser>("Unknown");
  const [muted, setMuted] = useState(true);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

  const { start, clear } = useTimeout(() => {
    setIsTimeoutModalOpen(true);
  }, 1000 * 60); // 1 mins

  const [demoStarted, setDemoStarted] = useState(false);
  const [seconds, setSeconds] = useState(60); // 1 mins
  const demoTimeoutInterval = useInterval(
    () => setSeconds((prev) => prev - 1),
    1000,
  );

  const isRecordingRef = useRef(false);
  const [token, setToken] = useState(initialToken);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestID, setRequestID] = useState(createId());

  const [audioQueue, audioQueueHandlers] = useListState<Blob>([]);

  useOnMount(() => {
    setBrowser(getBrowser());
  });

  const { start: pauseMicrophone } = useTimeout(() => {
    browser !== "Safari" && microphone?.pause();
    isRecordingRef.current = !isRecordingRef.current;
  }, 2000);

  const getDeepgramTokenInterval = useInterval(() => {
    getDeepgramClientAiToken()
      .then((res) => {
        console.log(res);
        if (!(res instanceof Error)) {
          setToken(res.key);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }, 1000 * 60);

  useEffect(() => {
    if (demoStarted && !isTimeoutModalOpen) {
      demoTimeoutInterval.start();
    }
    if (isTimeoutModalOpen) {
      if (isRecordingRef.current) {
        toggleMicrophone().catch((e) => console.error(e));
      }
      demoTimeoutInterval.toggle();
      getDeepgramTokenInterval.stop();
      microphone?.stop();
      socket.off("disconnect");
      setMuted(true);
    }
    return demoTimeoutInterval.stop;
  }, [demoStarted, isTimeoutModalOpen]);

  const startRecording = async () => {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const microphone = new MediaRecorder(userMedia);
      microphone.start(500);

      microphone.ondataavailable = (e) => {
        console.log(e);
        if (!isRecordingRef.current) {
          return;
        }

        audioQueueHandlers.append(e.data);
      };

      if (!isRecordingRef.current) {
        browser !== "Safari" && microphone.pause();
      }

      setMicrophone(microphone);
    } catch (e) {
      console.error(e);
      toast.warning(
        "Error while setting up mic.\nPlease check your mic settings.",
      );
    }
  };

  const toggleMicrophone = useCallback(async () => {
    if (isRecordingRef.current) {
      pauseMicrophone();
      toast.warning("Microphone is paused");
    } else {
      browser !== "Safari" && microphone?.resume();
      toast.warning("Microphone is listening");
      isRecordingRef.current = !isRecordingRef.current;
    }
  }, [microphone]);

  const { readyState, sendMessage, lastMessage } = useWebSocket(
    "wss://api.deepgram.com/v1/listen",
    {
      queryParams: {
        model: "nova-2",
        interim_results: "true",
        language: deepgramLanguage.deepgram,
        smart_format: "true",
        vad_events: "true",
        keep_alive: "true",
        utterance_end_ms: "1000",
        punctuate: "true",
        endpointing: "100",
      },
      protocols: ["token", token],
      retryOnError: true,
      shouldReconnect: (closeEvent) => {
        return true;
      },
      reconnectAttempts: 20,
      reconnectInterval: 0,
      onOpen: () => {
        console.log("WebSocket opened");
        startRecording()
          .then(() => getDeepgramTokenInterval.start())
          .catch((e) => console.error(e));
      },
      onClose(event) {
        console.log("WebSocket closed", event);
        getDeepgramTokenInterval.stop();

        if (isRecordingRef.current) {
          toggleMicrophone().catch((e) => console.error(e));
        }

        microphone?.stop();
        // sendJsonMessage({ terminate_session: true })
      },
      onError(event) {
        console.log("WebSocket error", event);
        // sendJsonMessage({ terminate_session: true })
      },
      heartbeat: {
        message: JSON.stringify({ type: "KeepAlive" }),
        interval: 8000,
      },
    },
  );

  // const [captionsRecord, setCaptionsRecord] = useState<Record<number, string>>({});
  const captionsRecordRef = useRef<Record<number, string>>({});
  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const lastTranscript = JSON.parse(lastMessage.data as string) as {
      type: "Results" | "SpeechStarted" | "Metadata" | "UtteranceEnd";
    };

    switch (lastTranscript.type) {
      case "SpeechStarted": {
        break;
      }
      case "Results": {
        const {
          channel,
          start: audioStart,
          is_final: speechFinished,
        } = lastTranscript as LiveTranscriptionEvent;
        const words = channel.alternatives[0]?.words ?? [];
        const caption = words
          .map((word: Word) => word.punctuated_word ?? word.word)
          .join(" ");

        const pastCaption = Object.values(captionsRecordRef.current).at(-1);

        if (caption === "" || pastCaption === caption) {
          break;
        }

        captionsRecordRef.current[audioStart] = caption;

        const captionsArray = Object.values(captionsRecordRef.current);
        const captionString = captionsArray.join(" ");

        const transcriptIndex = transcripts.findIndex(
          (transcript) => transcript.id === requestID,
        );

        if (transcriptIndex !== -1) {
          setTranscripts((prev) => {
            const newTranscripts = structuredClone(prev);
            const existingItem = newTranscripts[transcriptIndex];

            if (existingItem) {
              const updatedItem = {
                ...existingItem,
                original: captionString,
              };

              newTranscripts[transcriptIndex] = updatedItem;
            }

            return newTranscripts;
          });
        } else {
          setTranscripts((prev) => [
            ...prev,
            {
              id: requestID,
              original: captionString,
              audioStart: audioStart,
              language: activeLanguage.rtc,
            },
          ]);
        }

        break;
      }
      case "UtteranceEnd": {
        captionsRecordRef.current = {};

        const transcript = transcripts.find(
          (transcript) => transcript.id === requestID,
        );

        if (!transcript) {
          return;
        }

        socket.emit("demo-transcription", {
          id: transcript.id,
          transcription: transcript.original,
          source_language: deepgramLanguage.rtc,
          target_language: activeLanguage.rtc,
        });

        setRequestID(createId());
        break;
      }
      default: {
        break;
      }
    }
  }, [lastMessage?.data, setTranscripts]);

  useEffect(() => {
    const processQueue = async () => {
      if (audioQueue.length > 0 && !isProcessing) {
        setIsProcessing(true);
        const first = audioQueue.at(0);

        if (readyState === ReadyState.OPEN && first) {
          sendMessage(first);
          audioQueueHandlers.shift();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setIsProcessing(false);
        }, 250);
      }
    };

    processQueue().catch((e) => console.error(e));
  }, [audioQueue.length, isProcessing, readyState, audioQueueHandlers]);

  useEffect(() => {
    if (isRecordingRef.current) {
      setMuted(!muted);
      browser !== "Safari" && microphone?.pause();
      isRecordingRef.current = !isRecordingRef.current;
      toast.warning("Microphone is paused");
    }
  }, [activeLanguage]);

  return (
    <div className="relative grid grid-cols-1 justify-items-center text-center">
      {demoStarted && (
        <Chip
          color="danger"
          data-cy="demo-chip-timer"
          className="absolute -top-8 left-2 lg:-left-10"
        >
          time remaining : {formatTime(seconds)}
        </Chip>
      )}
      <TimeoutModal isOpen={isTimeoutModalOpen} />
      <Tooltip
        showArrow
        color={muted ? "primary" : "danger"}
        content={muted ? "Unmute Mic" : "Mute Mic"}
      >
        <Button
          isIconOnly
          radius="full"
          isLoading={readyState === ReadyState.CONNECTING}
          isDisabled={readyState === ReadyState.UNINSTANTIATED}
          color={muted ? "primary" : "danger"}
          variant={muted ? "shadow" : "flat"}
          data-cy="demo-microphone-button"
          onPress={() => {
            if (isTimeoutModalOpen) {
              return;
            }

            start();

            if (!demoStarted) {
              setDemoStarted(true);
            }

            setMuted(!muted);
            toggleMicrophone().catch((e) => console.error(e));
          }}
          className={cn(["aspect-square h-16 w-16", !muted && "animate-pulse"])}
        >
          <Icon
            icon={muted ? "fluent:mic-off-28-filled" : "fluent:mic-28-filled"}
            width={24}
          />
        </Button>
      </Tooltip>
    </div>
  );
}
