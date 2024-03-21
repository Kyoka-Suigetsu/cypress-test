"use client";

import {
  fontSizeAtom,
  type Transcript,
} from "@/app/(authenticated)/jotai-wrapper";
import { Card } from "@nextui-org/card";
import { useAtomValue, type Atom } from "jotai";

export default function SpeakerChatBubble({
  index,
  transcriptsAtom,
}: Readonly<{
  index: number;
  transcriptsAtom: Atom<Transcript[]>;
}>) {
  const transcripts = useAtomValue(transcriptsAtom);
  const transcript = transcripts[index];
  const fontSize = useAtomValue(fontSizeAtom);

  if (!transcript) {
    return null;
  }

  const { original } = transcript;

  if (!original || original.trim().length <= 0) {
    return null;
  }

  return (
    <li data-cy="speaker-bubble" className="flex w-full items-end justify-end">
      <Card
        shadow="md"
        className="w-fit max-w-3xl rounded-br-none bg-primary bg-gradient-to-br from-primary-500 px-2 py-2"
        radius="sm"
      >
        <p className="text-white" style={{ fontSize: `${fontSize}px` }}>
          {original}
        </p>
      </Card>
    </li>
  );
}
