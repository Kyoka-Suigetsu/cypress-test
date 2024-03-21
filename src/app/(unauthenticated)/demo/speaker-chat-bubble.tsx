"use client";

import { Card } from "@nextui-org/card";
import { useAtomValue, type Atom } from "jotai";
import { type Transcript } from "./jotai-wrapper";

export default function SpeakerChatBubble({
  index,
  transcriptsAtom,
}: Readonly<{
  index: number;
  transcriptsAtom: Atom<Transcript[]>;
}>) {
  const transcripts = useAtomValue(transcriptsAtom);
  const transcriptObject = transcripts[index];

  if (!transcriptObject) {
    return null;
  }

  const { original: transcript } = transcriptObject;

  if (!transcript || transcript.trim().length <= 0) {
    return null;
  }

  return (
    <li
      data-cy="demo-speaker-bubble"
      className="flex w-full items-end justify-start"
    >
      <Card
        shadow="md"
        radius="sm"
        className="w-fit max-w-3xl rounded-bl-none bg-primary bg-gradient-to-br from-primary-500 px-2 py-2"
      >
        <p className="text-white">{transcript}</p>
      </Card>
    </li>
  );
}
