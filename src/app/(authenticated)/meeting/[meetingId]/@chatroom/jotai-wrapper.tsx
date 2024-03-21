"use client";

import {
  transcriptsAtom,
  type Transcript,
} from "@/app/(authenticated)/jotai-wrapper";
import { type Meeting } from "@prisma/client";
import { atom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import type React from "react";

export const meetingAtom = atom<Meeting | undefined>(undefined);
export const meetingTranscriptsAtom = atom<Transcript[]>((get) =>
  get(transcriptsAtom).filter((t) => t.meetingId === get(meetingAtom)?.id),
);
export const userIdAtom = atom<string | undefined>(undefined);
export const deepgramModelAtom = atom<string>("nova-2");
export const deepgramLanguageAtom = atom<{ deepgram: string; rtc: string }>({
  deepgram: "en",
  rtc: "eng_Latn",
});

export default function JotaiWrapper({
  children,
  meeting,
}: {
  children: React.ReactNode;
  meeting: Meeting;
}) {
  useHydrateAtoms([[meetingAtom, meeting]], {
    dangerouslyForceHydrate: true,
  });

  return children;
}
