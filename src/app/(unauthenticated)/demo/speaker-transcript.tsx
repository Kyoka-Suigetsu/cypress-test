"use client";

import { useAtomValue } from "jotai";
import { speakerTranscriptsAtom } from "./jotai-wrapper";
import SpeakerChatBubble from "./speaker-chat-bubble";

export default function SpeakerTranscript() {
  const transcripts = useAtomValue(speakerTranscriptsAtom);

  return (
    <ul
      data-cy="demo-speaker-transcripts"
      className="h-[472px] w-full space-y-2 overflow-y-auto overflow-x-hidden rounded-md bg-content3 p-2"
    >
      {transcripts.map((item, index) => (
        <SpeakerChatBubble
          key={item.id}
          index={index}
          transcriptsAtom={speakerTranscriptsAtom}
        />
      ))}
    </ul>
  );
}
