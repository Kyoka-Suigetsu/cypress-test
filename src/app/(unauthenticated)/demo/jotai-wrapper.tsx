"use client";

import { DEFAULT_LANGUAGE } from "@/lib/supported-languages";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type React from "react";

export type Transcript = {
  id: string;
  audioStart?: number;
  original?: string;
  translated?: string;
  language?: string;
  audio?: Array<string>;
  audioComplete?: boolean;
};

export const transcriptsAtom = atom<Transcript[]>([]);
export const speakerTranscriptsAtom = atom<Transcript[]>((get) => {
  const transcripts = get(transcriptsAtom);

  return transcripts.map((transcripts) => ({
    id: transcripts.id,
    original: transcripts?.original,
  }));
});

export const languageAtom = atomWithStorage("lang", DEFAULT_LANGUAGE);
export const deepgramLanguageAtom = atom<{ deepgram: string; rtc: string }>({
  deepgram: "en",
  rtc: "eng_Latn",
});
export const activeLanguageAtom = atom<{ deepgram: string; rtc: string }>({
  deepgram: "es",
  rtc: "spa_Latn",
});

export default function JotaiWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
