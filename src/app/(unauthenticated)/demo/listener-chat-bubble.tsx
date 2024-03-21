"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Progress } from "@nextui-org/progress";
import { useAtom, useAtomValue, useSetAtom, type Atom } from "jotai";
import { RESET } from "jotai/utils";
import { type Transcript } from "./jotai-wrapper";
import {
  audioIndexAtom,
  automaticPlayerIndexAtom,
  manualPlayerIndexAtom,
  playerIndexAtom,
} from "./translations";

export default function ListenerChatBubble({
  index,
  transcriptsAtom,
}: Readonly<{
  index: number;
  transcriptsAtom: Atom<Transcript[]>;
}>) {
  const [automaticIndex, setAutomaticIndex] = useAtom(automaticPlayerIndexAtom);
  const setManualIndex = useSetAtom(manualPlayerIndexAtom);
  const setAudioIndex = useSetAtom(audioIndexAtom);
  const playerIndex = useAtomValue(playerIndexAtom);
  const transcripts = useAtomValue(transcriptsAtom);
  const transcript = transcripts[index]!;

  const { translated, original } = transcript;

  if (
    !transcript ||
    (!original && !translated) ||
    (original?.trim().length === 0 && translated?.trim().length === 0)
  ) {
    return null;
  }

  return (
    <li data-cy="demo-listener-bubble" className="w-full items-start">
      <div className="flex w-fit max-w-3xl overflow-hidden rounded-lg border border-content4 bg-black px-0 shadow-lg transition-all hover:shadow-xl">
        <div className="flex flex-col justify-center">
          <Icon
            icon="fa6-regular:circle-play"
            width={36}
            height={36}
            onClick={() => {
              index >= automaticIndex
                ? setAutomaticIndex(index)
                : setManualIndex(index);

              setAudioIndex(RESET);
            }}
            className={cn([
              "cursor-pointer px-1 text-white hover:text-warning",
              playerIndex !== index
                ? "text-zinc-50 hover:text-warning"
                : "text-warning",
            ])}
          />
        </div>
        <div className={cn("w-full max-w-3xl rounded-md text-white")}>
          <p className="rounded-bl-md bg-white px-2 py-1 text-xs text-gray-500">
            {original}
          </p>
          {!translated ? (
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Loading..."
              className="w-full"
              classNames={{
                indicator:
                  "bg-gradient-to-br from-secondary-100 to-primary-600",
              }}
            />
          ) : (
            <p className="rounded-md bg-black px-2 py-1">{translated}</p>
          )}
        </div>
      </div>
    </li>
  );
}
