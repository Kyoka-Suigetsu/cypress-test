"use client";

import { env } from "@/env";
import Icon from "&/icon";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { useTimeout } from "@mantine/hooks";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback, useRef, useState } from "react";
import useOnMount from "@/hooks/use-on-mount";

import { audioVolumeAtom, storageAudioVolumeAtom, transcriptsAtom } from "@/app/(authenticated)/jotai-wrapper";
import {
  deepgramLanguageAtom,
} from "@/app/(authenticated)/meeting/[meetingId]/@chatroom/jotai-wrapper";
import { createId } from "@paralleldrive/cuid2";
import type { Meeting } from "@prisma/client";
import type { Session } from "next-auth";
import { toast } from "sonner";

type Word = {
  word: string;
  start: number;
  end: number;
  probability: number;
}

type TranscriptData = {
  text: string;
  words: Word[];
  language: string;
  language_probability: number;
  processing_time: number;
}

const microphoneAtom = atom<MediaRecorder | null>(null);
const streamAtom = atom<MediaStream>(new MediaStream());
const processorAtom = atom<ScriptProcessorNode | null>(null);
const audioContextAtom = atom<AudioContext>(new AudioContext());

export default function Transcription({
  meeting,
  session,
  isLiveChat,
  initialToken,
}: Readonly<{
  meeting: Meeting;
  session: Session;
  isLiveChat: boolean;
  initialToken: string;
}>) {
  const [deepgramLanguage] = useAtom(deepgramLanguageAtom);
  const [microphone, setMicrophone] = useAtom(microphoneAtom);
  const [transcripts, setTranscripts] = useAtom(transcriptsAtom);
  const [audioVolume, setAudioVolume] = useAtom(audioVolumeAtom);
  const storageAudioVolume = useAtomValue(storageAudioVolumeAtom);
  const [audioContext, setAudioContext] = useAtom(audioContextAtom);
  const [stream, setStream] = useAtom(streamAtom);
  const [processor, setProcessor] = useAtom(processorAtom);
  const [isMuted, setIsMuted] = useState(true);
  const isRecordingRef = useRef(false);

  const fwSocketRef =  useRef<WebSocket>();

  const { start: pauseMicrophone } = useTimeout(() => {
    microphone?.pause();
    isRecordingRef.current = !isRecordingRef.current;
  }, 2000);

  const startRecording = () => {
    if (isRecordingRef.current) return;

    const AudioContext = window.AudioContext;
    setAudioContext(new AudioContext());
    const bufferSize = 4096;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      setStream(stream);
      const input = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processor.onaudioprocess = processAudio;
      input?.connect(processor);
      processor?.connect(audioContext.destination);
      setProcessor(processor);

      const audioConfig = {
        type: "config",
        data: {
          sampleRate: audioContext.sampleRate,
          bufferSize: bufferSize,
          channels: 1, // Assuming mono channel
          language: deepgramLanguage.deepgram,
          processing_strategy: "silence_at_end_of_chunk", 
          processing_args: {
            chunk_length_seconds: 3,
            chunk_offset_seconds: 0.1
          }
        }
      }
      fwSocketRef.current?.send(JSON.stringify(audioConfig));
    }).catch((e) => {
      console.error(e);
      toast.warning(
        "Error while setting up mic.\nPlease check your mic settings.",
      );
    });
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (processor) {
      processor.disconnect();
      setProcessor(new ScriptProcessorNode());
    }
    if (audioContext) {
      audioContext.close().catch((e) => console.error(e));
    }
  };

  const processAudio = (e: AudioProcessingEvent) => {
    if (!isRecordingRef.current) return;
    console.log('processing audio');
    
    socket.emit("speaking", {
      user_id: session.user.id,
      meeting_id: meeting.id,
      is_live_chat: isLiveChat,
    });

    if (audioVolume > 0.25) {
      setAudioVolume(0.25);
    }

    const inputSampleRate = audioContext.sampleRate;
    const outputSampleRate = 16000; // Target sample rate

    const left = e.inputBuffer.getChannelData(0);
    const downsampledBuffer = downSampleBuffer(left, inputSampleRate, outputSampleRate);
    const audioData = convertFloat32ToInt16(downsampledBuffer);
    if (fwSocketRef.current?.readyState === WebSocket.OPEN) {
      fwSocketRef.current?.send(audioData);
    }
  };

  const downSampleBuffer = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
    if (inputSampleRate === outputSampleRate) {
        return buffer;
    }
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i] ?? 0;
          count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  };

  function convertFloat32ToInt16(buffer: Float32Array) {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
        buf[l] = Math.min(1, buffer[l] ?? 0) * 0x7FFF;
    }
    return buf.buffer;
  };

  const toggleMicrophone = useCallback(async () => {
    if (isRecordingRef.current) {
      toast.warning("Microphone is paused");
      isRecordingRef.current = !isRecordingRef.current;
    } else {
      toast.warning("Microphone is listening");
      isRecordingRef.current = !isRecordingRef.current;
      audioContext.resume().catch((e) => console.error(e));
    }

  }, [microphone]);

  const updateTranscription = (transcriptData: TranscriptData) => {
    const requestID = createId();
    const { text, words, language } = transcriptData;
    if (language !== deepgramLanguage.deepgram) return;
    
    if (text.trim() !== "") {
      setTranscripts((prev) => [
        ...prev,
        {
          id: requestID,
          original: text.trim(),
          meetingId: meeting.id,
          userId: session.user.id,
          audioStart: words[0]?.start ?? 0,
        },
      ]);

      let voiceId = localStorage.getItem("voiceId") ?? "";
      if (voiceId) {
        voiceId = JSON.parse(voiceId) as string;
      }

      socket.emit("transcription-text", {
        id: requestID,
        user_id: session.user.id,
        voice_id: voiceId,
        room_id: meeting.roomId,
        meeting_id: meeting.id,
        transcription: text.trim(),
        is_live_chat: isLiveChat,
        source_language: deepgramLanguage.rtc,
      });

      if (audioVolume !== storageAudioVolume) {
        setAudioVolume(storageAudioVolume);
      }
    }
  };

  useOnMount(() => {
    fwSocketRef.current = new WebSocket(env.NEXT_PUBLIC_FASTER_WHISPER_URL);
    fwSocketRef.current.onopen = () => {
      console.log("Connected to Faster Whisper transcribing server");
      startRecording();
    };
    fwSocketRef.current.onerror = () => {
      console.error("Could not connect to the signaling server!");
    };
    fwSocketRef.current.onclose = () => {
      console.log("Disconnected from Faster Whisper transcribing server");
      stopRecording();
    };
    fwSocketRef.current.onmessage = (e) => {
      const transcriptData = JSON.parse(e.data as string) as TranscriptData;
      updateTranscription(transcriptData);
    };

    return () => {
      fwSocketRef.current?.close();
    };
  });

  return (
    <div className="grid grid-cols-1 justify-items-center text-center ">
      <Tooltip
        showArrow
        color={isMuted ? "primary" : "danger"}
        content={isMuted ? "Unmute Mic" : "Mute Mic"}
      >
        <Button
          isIconOnly
          radius="full"
          isLoading={fwSocketRef.current?.readyState === WebSocket.CONNECTING}
          isDisabled={fwSocketRef.current?.readyState === WebSocket.CLOSED}
          color={isMuted ? "primary" : "danger"}
          variant={isMuted ? "shadow" : "flat"}
          data-cy="microphone-button"
          onPress={() => {
            if (!isMuted) {
              setTimeout(() => {
                setAudioVolume(storageAudioVolume);
              }, 2000)
            }
            setIsMuted(!isMuted);
            toggleMicrophone().catch((e) => console.error(e));
          }}
          className={cn([
            "aspect-square h-14 w-14",
            !isMuted && "animate-pulse",
          ])}
        >
          <Icon
            icon={
              isMuted
                ? "fluent:mic-off-28-filled"
                : "fluent:mic-28-filled"
            }
            width={24}
          />
        </Button>
      </Tooltip>
    </div>
  );
}
