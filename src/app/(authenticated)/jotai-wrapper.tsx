"use client";

import { DEFAULT_LANGUAGE } from "@/lib/supported-languages";
import { type UserPreferences } from "@/schemas/preference";
import { atom } from "jotai";
import { atomWithStorage, useHydrateAtoms } from "jotai/utils";
import type React from "react";

export type Transcript = {
  id: string;
  audioStart?: number;
  userId: string;
  meetingId: string;
  peerId?: string;
  original?: string;
  translated?: string;
  audio?: Array<string>;
  audioComplete?: boolean;
};

type Voice = {
  voiceId: string;
  userId: string;
  name: string;
};

export const transcriptsAtom = atom<Transcript[]>([]);
export const languageAtom = atomWithStorage("lang", DEFAULT_LANGUAGE);
languageAtom.debugLabel = "languageAtom";
export const isAudioMutedAtom = atomWithStorage("mute", false);
isAudioMutedAtom.debugLabel = "isAudioMutedAtom";
export const audioVolumeAtom = atomWithStorage("volume", 1.0);
audioVolumeAtom.debugLabel = "audioVolumeAtom";
export const voicesAtom = atom<Array<Voice>>([]);
voicesAtom.debugLabel = "voicesAtom";
export const voiceIdAtom = atomWithStorage("voiceId", "");
voiceIdAtom.debugLabel = "voiceIdAtom";
export const storageAudioVolumeAtom = atomWithStorage("audioVolume", 1.0);
storageAudioVolumeAtom.debugLabel = "storageAudioVolumeAtom";
export const fontSizeAtom = atomWithStorage("fontSize", 16);

export default function JotaiWrapper({
  children,
  userPreference,
}: {
  children: React.ReactNode;
  userPreference: UserPreferences;
}) {
  useHydrateAtoms([
    [languageAtom, userPreference.language],
    [isAudioMutedAtom, userPreference.muted],
    [audioVolumeAtom, userPreference.volume],
    [fontSizeAtom, userPreference.fontSize],
  ]);

  return children;
}
