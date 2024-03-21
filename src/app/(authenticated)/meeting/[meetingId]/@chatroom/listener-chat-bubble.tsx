"use client";

import {
  fontSizeAtom,
  type Transcript,
} from "@/app/(authenticated)/jotai-wrapper";
import useOnMount from "@/hooks/use-on-mount";
import { getUserName } from "@/lib/actions/get-user-name";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Progress } from "@nextui-org/progress";
import { Skeleton } from "@nextui-org/skeleton";
import { useAtom, useAtomValue, useSetAtom, type Atom } from "jotai";
import { RESET } from "jotai/utils";
import { useState, useTransition } from "react";
import {
  audioIndexAtom,
  automaticPlayerIndexAtom,
  manualPlayerIndexAtom,
  playerIndexAtom,
} from "./chat";

export default function ListenerChatBubble({
  index,
  transcriptsAtom,
  audioArrayIndex,
}: Readonly<{
  index: number;
  transcriptsAtom: Atom<Transcript[]>;
  audioArrayIndex: number;
}>) {
  const [automaticIndex, setAutomaticIndex] = useAtom(automaticPlayerIndexAtom);
  const setManualIndex = useSetAtom(manualPlayerIndexAtom);
  const setAudioIndex = useSetAtom(audioIndexAtom);
  const playerIndex = useAtomValue(playerIndexAtom);
  const transcripts = useAtomValue(transcriptsAtom);
  const transcript = transcripts[index]!;
  const fontSize = useAtomValue(fontSizeAtom);

  const { userId, audio, original, translated } = transcript;

  const [, startTransition] = useTransition();
  const [speaker, setSpeaker] = useState<string>();

  useOnMount(() => {
    startTransition(async () => {
      try {
        const res = await getUserName(userId);

        if (res) {
          setSpeaker(res);
        }
      } catch (e) {
        console.error(e);
      }
    });
  });

  if (
    !transcript ||
    (!original && !translated) ||
    (original?.trim().length === 0 && translated?.trim().length === 0)
  ) {
    return null;
  }

  return (
    <li data-cy="listener-bubble" className="w-full items-start">
      <div className="flex w-fit max-w-3xl overflow-hidden rounded-lg border border-content4 bg-black px-0 shadow-lg transition-all hover:shadow-xl">
        <div className="flex flex-col justify-center rounded-t rounded-bl bg-black px-1">
          <Icon
            icon="material-symbols:play-circle-outline"
            width={36}
            height={36}
            data-cy="play-audio-trigger"
            onClick={() => {
              audioArrayIndex >= automaticIndex
                ? setAutomaticIndex(audioArrayIndex)
                : setManualIndex(audioArrayIndex);

              setAudioIndex(RESET);
            }}
            className={cn([
              "cursor-pointer transition-colors duration-150 ",
              playerIndex !== audioArrayIndex
                ? "text-zinc-50 hover:text-warning"
                : "text-warning",
            ])}
          />
        </div>
        <div className="relative">
          <p className="self-start bg-white px-2 text-start text-xs font-semibold capitalize text-black">
            {speaker ?? (
              <Skeleton
                data-cy="speaker-placeholder"
                className="h-4 w-14 rounded-full bg-content4"
              />
            )}
          </p>
          <div
            style={{ fontSize: `${fontSize - 3}px` }}
            className="flex flex-col items-start rounded-bl bg-white px-2 pb-1 text-xs text-slate-500"
          >
            {original}
          </div>
          <div
            style={{ fontSize: `${fontSize}px` }}
            className={cn(
              "w-full max-w-3xl rounded-r-md bg-black px-2 py-1 text-white",
            )}
          >
            {!translated && (
              <Progress
                size="sm"
                isIndeterminate
                aria-label="Loading..."
                className="w-full"
                data-cy="loading-progress"
                classNames={{
                  indicator:
                    "bg-gradient-to-br from-secondary-100 to-primary-600",
                }}
              />
            )}
            {translated}
          </div>
          {playerIndex === audioArrayIndex && (
            <Icon
              icon="material-symbols:volume-up-rounded"
              className="absolute right-1 top-1 text-danger"
            />
          )}
        </div>
      </div>
    </li>
  );
}
