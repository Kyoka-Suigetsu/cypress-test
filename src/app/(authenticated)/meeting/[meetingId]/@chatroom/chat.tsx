"use client";

import {
  audioVolumeAtom,
  isAudioMutedAtom,
  transcriptsAtom,
} from "@/app/(authenticated)/jotai-wrapper";
import useOnMount from "@/hooks/use-on-mount";
import { getUserName } from "@/lib/actions/get-user-name";
import { socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useScrollIntoView } from "@mantine/hooks";
import { Badge } from "@nextui-org/badge";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { PermissionStatus, type Prisma } from "@prisma/client";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET, atomWithReset } from "jotai/utils";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import ReactAudioPlayer from "react-audio-player";
import { toast } from "sonner";
import { meetingTranscriptsAtom } from "./jotai-wrapper";
import ListenerChatBubble from "./listener-chat-bubble";
import SpeakerChatBubble from "./speaker-chat-bubble";

type MeetingWithOwner = Prisma.MeetingGetPayload<{
  where: {
    id: true;
    isActive: true;
  };
  include: {
    room: {
      select: {
        ownedBy: true;
      };
    };
  };
}>;

type PlayerAudio = Array<{
  requestId: string;
  isComplete: boolean;
  audio: Array<string>;
}>;

const speakersAtom = atom<string[]>([]);
const isSpeakingAtom = atom(false);

export const playerAudioArrayAtom = atom<PlayerAudio>((get) => {
  const transcripts = get(meetingTranscriptsAtom);

  return transcripts
    .filter((transcript) => typeof transcript.audioStart === "undefined")
    .map((transcript) => ({
      requestId: transcript.id,
      isComplete: transcript.audioComplete ?? false,
      audio: transcript.audio ?? [],
    }));
});
export const manualPlayerIndexAtom = atomWithReset(-1);
export const automaticPlayerIndexAtom = atom(0);
export const playerIndexAtom = atom((get) => {
  const manualPlayIndex = get(manualPlayerIndexAtom);
  const playerIndex = get(automaticPlayerIndexAtom);

  return manualPlayIndex !== -1 ? manualPlayIndex : playerIndex;
});
const playerAudioAtom = atom(
  (get) => get(playerAudioArrayAtom)[get(playerIndexAtom)],
);
export const audioIndexAtom = atomWithReset(0);

export default function Chat({
  session,
  meeting,
}: Readonly<{
  session: Session;
  meeting: MeetingWithOwner;
}>) {
  const router = useRouter();

  const [speakers, setSpeakers] = useAtom(speakersAtom);
  const [isSpeaking, setIsSpeaking] = useAtom(isSpeakingAtom);
  const meetingTranscripts = useAtomValue(meetingTranscriptsAtom);
  const audioArray = useAtomValue(playerAudioArrayAtom);
  const setTranscripts = useSetAtom(transcriptsAtom);
  const [manualIndex, setManualIndex] = useAtom(manualPlayerIndexAtom);
  const [automaticPlayerIndex, setAutomaticPlayerIndex] = useAtom(
    automaticPlayerIndexAtom,
  );
  const [audioIndex, setAudioIndex] = useAtom(audioIndexAtom);
  const playerAudio = useAtomValue(playerAudioAtom);
  const isAudioMuted = useAtomValue(isAudioMutedAtom);
  const audioVolume = useAtomValue(audioVolumeAtom);

  const { scrollIntoView, targetRef, scrollableRef } =
    useScrollIntoView<HTMLDivElement>();
  const { scrollYProgress, scrollY } = useScroll({ container: scrollableRef });
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    if (scrollYProgress.get() > 0.85) {
      scrollIntoView();

      if (showNewMessage) {
        setShowNewMessage(false);
      }
    } else if (showJumpToBottom) {
      setShowNewMessage(true);
    }
  }, [meetingTranscripts]);

  useMotionValueEvent(scrollY, "change", () => {
    if (
      scrollYProgress.get() < 0.85 &&
      !showJumpToBottom &&
      meetingTranscripts.length >= 25
    ) {
      setShowJumpToBottom(true);
    }
    if (scrollYProgress.get() > 0.85 && showJumpToBottom) {
      setShowJumpToBottom(false);
      setShowNewMessage(false);
    }
  });

  const [, startTransition] = useTransition();

  useEffect(() => {
    socket.on(
      "translatedAudio",
      (config: {
        id: string;
        data: string;
        user_id: string;
        peer_id: string;
        transcription: string;
        chunk_number: number;
        is_finished: boolean;
      }) => {
        console.count("translated-audio");
        console.table(config);
        setIsSpeaking(false);
        const { id, data, peer_id, transcription, user_id, is_finished } =
          config;

        const presentTranscript = meetingTranscripts.find(
          (transcript) => transcript.id === id,
        );

        console.log(
          "current-transcripts",
          presentTranscript,
          meetingTranscripts,
        );

        if (presentTranscript) {
          setTranscripts((prev) =>
            prev.map((t) => {
              if (t.id === id) {
                return {
                  ...t,
                  audio:
                    data.trim() !== "" ? [...(t.audio ?? []), data] : t.audio,
                  translated:
                    transcription.trim() !== ""
                      ? `${t.translated ?? ""}${/^['.,]/.test(transcription) ? "" : " "}${transcription}`
                      : t.translated,
                  audioComplete: is_finished,
                };
              } else {
                return t;
              }
            }),
          );
        } else if (transcription.trim() === "" && data.trim() === "") {
          setTranscripts((prev) => [
            ...prev,
            {
              id,
              meetingId: meeting.id,
              peerId: peer_id,
              userId: user_id,
              audio: [data],
              translated: transcription,
            },
          ]);
        }
      },
    );

    socket.on(
      "transcription-result",
      (config: {
        id: string;
        user_id: string;
        peer_id: string;
        transcription: string;
      }) => {
        console.count("transcription-result");
        console.table(config);
        setIsSpeaking(false);
        const { id, peer_id, transcription, user_id } = config;

        const presentTranscript = meetingTranscripts.find(
          (transcript) => transcript.id === id,
        );

        if (presentTranscript) {
          setTranscripts((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, original: transcription } : t,
            ),
          );
        } else {
          setTranscripts((prev) => [
            ...prev,
            {
              id,
              meetingId: meeting.id,
              peerId: peer_id,
              userId: user_id,
              original: transcription,
            },
          ]);
        }
      },
    );

    return () => {
      socket.off("transcription-result");
      socket.off("translatedAudio");
    };
  }, [meetingTranscripts, setTranscripts]);

  useOnMount(() => {
    console.log("joining room");

    try {
      if (socket.connected) {
        socket.emit("join", {
          user_id: session.user.id,
          meeting_id: meeting.id,
          room_id: meeting.roomId,
          is_private: meeting.isPrivate,
          is_live_chat: true,
          is_owner: meeting.room?.ownedBy.id === session.user.id,
        });
      }

      socket.on("connect", () => {
        socket.emit("join", {
          user_id: session.user.id,
          meeting_id: meeting.id,
          room_id: meeting.roomId,
          is_private: meeting.isPrivate,
          is_live_chat: true,
          is_owner: meeting.room?.ownedBy.id === session.user.id,
        });
      });

      socket.on("speaking", async (config: Record<string, boolean>) => {
        setIsSpeaking(true);

        const trueKeys = Object.entries(config)
          .filter(([, value]) => value === true)
          .map(([key]) => key);

        startTransition(async () => {
          try {
            const arr: Array<string> = [];

            for (const userId of trueKeys) {
              const res = await getUserName(userId);
              if (res) {
                arr.push(res);
              }
            }

            setSpeakers(arr);
          } catch (e) {
            console.error(e);
          }
        });
      });

      socket.on(
        "addPeer",
        async (config: { peer_id: string; is_self: boolean }) => {
          if (config.is_self) {
            console.log(
              `Joined the meeting successfully, sid=${config.peer_id}`,
            );
          } else {
            console.log(`Peer has joined the meeting, sid=${config.peer_id}`);
          }
        },
      );

      socket.on("removePeer", (config: { peer_id: string }) => {
        console.log(`Peer has left the meeting, sid=${config.peer_id}`);
      });

      socket.on(
        "request_result",
        (data: {
          permit_status: PermissionStatus;
          room_id: string;
          user_id: string;
        }) => {
          console.log("request received", data);

          if (
            meeting.roomId !== data.room_id ||
            session.user.id !== data.user_id
          ) {
            return;
          }

          if (data.permit_status === PermissionStatus.DENIED) {
            toast.error("Your permission to this course has been revoked!");
            router.replace("/");
          }
        },
      );
    } catch (error) {
      console.log(error);
    }

    return () => {
      console.log("leaving room");
      socket.emit("leave", {
        user_id: session?.user.id,
        meeting_id: meeting.id,
        room_id: meeting.roomId,
        is_live_chat: true,
      });

      socket.off("speaking");
      socket.off("addPeer");
      socket.off("removePeer");
      socket.off("request_result");
    };
  });

  return (
    <>
      <div
        ref={scrollableRef}
        className="relative h-full w-full space-y-2 overflow-x-hidden overflow-y-scroll rounded-lg border border-content3 bg-content2 px-2 shadow md:rounded-l-lg md:rounded-r-none "
      >
        <ul data-cy="chat-transcripts" className="mt-6 space-y-2">
          {meetingTranscripts.map(({ userId, id }, index) => {
            if (session.user.id === userId) {
              return (
                <SpeakerChatBubble
                  key={id + "_speaker"}
                  index={index}
                  transcriptsAtom={meetingTranscriptsAtom}
                />
              );
            }

            return (
              <ListenerChatBubble
                key={id + "_listener"}
                index={index}
                transcriptsAtom={meetingTranscriptsAtom}
                audioArrayIndex={audioArray.findIndex(
                  (audio) => audio.requestId === id,
                )}
              />
            );
          })}
          {isSpeaking && (
            <Card
              shadow="sm"
              radius="sm"
              as={"li"}
              key={"speaker-indicator"}
              className="flex w-fit items-center rounded-tl-none bg-content4 p-4"
            >
              <div className="flex gap-x-2">
                <Icon
                  icon={"svg-spinners:3-dots-bounce"}
                  width={24}
                  height={24}
                />
                {speakers.length > 0 && (
                  <p>{speakers.join(", ")} is speaking...</p>
                )}
              </div>
            </Card>
          )}
          <div key={"scroll-target"} ref={targetRef} />
        </ul>
        {playerAudio?.audio.map((chunk, index) => {
          const data = `data:audio/mpeg;base64,${chunk}`;

          return (
            <ReactAudioPlayer
              id={`${automaticPlayerIndex}-${index}`}
              key={data}
              src={data}
              autoPlay={index === audioIndex}
              controls
              muted={isAudioMuted}
              volume={audioVolume}
              data-cy="audio-player"
              onPlay={(event: Event) => {
                setTimeout(
                  () => {
                    const nextAudioElement = document.getElementById(
                      `${automaticPlayerIndex}-${index + 1}`,
                    ) as HTMLAudioElement;
                    if (nextAudioElement) {
                      nextAudioElement.play().catch((e) => console.log(e));
                    }
                  },
                  ((event.target as HTMLAudioElement).duration - 0.027) * 1000,
                );
              }}
              onEnded={() => {
                setAudioIndex((prevState) => prevState + 1);

                if (
                  !!playerAudio?.isComplete &&
                  playerAudio.audio.length - 1 === audioIndex
                ) {
                  setAudioIndex(RESET);

                  manualIndex !== -1
                    ? setManualIndex(RESET)
                    : setAutomaticPlayerIndex((prevState) => prevState + 1);
                }
              }}
              className="hidden"
            />
          );
        })}
      </div>
      <Button
        variant="solid"
        data-cy="scroll-to-bottom"
        onPress={() => scrollIntoView()}
        className={cn([
          "absolute bottom-6 right-2 z-50 flex h-6 overflow-visible bg-black p-1 pl-2 leading-none",
          showJumpToBottom ? "flex" : "hidden",
        ])}
        key={"scroll-button"}
      >
        <Badge
          content="new"
          placement="top-left"
          color="success"
          showOutline={false}
          data-cy="new-message-badge"
          className={cn([
            "-top-4 font-medium ",
            showNewMessage ? "inline-block" : "!important hidden",
          ])}
        >
          {" "}
        </Badge>
        <span>recent</span>
        <Icon icon={"mingcute:arrows-down-line"} width={16} height={16} />
      </Button>
    </>
  );
}
