"use client";

import { languageAtom } from "@/app/(authenticated)/jotai-wrapper";
import { setPreferences } from "@/lib/actions/user/preferences";
import { NOVA_2_LANGUAGES } from "@/lib/deepgram-model-languages";
import { socket } from "@/lib/socket";
import { findDeepgramCode, findRtcCode } from "@/lib/utils";
import { type UserPreferences } from "@/schemas/preference";
import { Select, SelectItem } from "@nextui-org/select";
import { useAtom } from "jotai";
import { atomEffect } from "jotai-effect";
import { useHydrateAtoms } from "jotai/utils";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, type ChangeEvent } from "react";
import { toast } from "sonner";
import { deepgramLanguageAtom, meetingAtom, userIdAtom } from "./jotai-wrapper";

const languageEffect = atomEffect((get, set) => {
  const value = get(languageAtom);
  const meeting = get(meetingAtom);
  const userId = get(userIdAtom);

  if (socket.disconnected || !meeting) {
    return;
  }

  socket.emit("setLanguage", {
    user_id: userId,
    language: value,
    meeting_id: meeting.id,
    room_id: meeting.roomId,
    is_live_chat: true,
  });
});

export default function LanguageSelect({
  session,
}: Readonly<{ session: Session }>) {
  useHydrateAtoms([
    [languageAtom, session.user.languagePreference],
    [userIdAtom, session.user.id],
  ]);

  const { update } = useSession();

  const [language, setLanguage] = useAtom(languageAtom);
  const [deepgramLanguage, setDeepgramLanguage] = useAtom(deepgramLanguageAtom);

  useAtom(languageEffect);

  const handleSelectionChange = useCallback(
    async (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value.trim();

      if (value === "" || value === language || !session) {
        return;
      }

      const rtcCode = findRtcCode(value);
      setDeepgramLanguage({ deepgram: value, rtc: rtcCode });
      setLanguage(rtcCode);

      const newPreferences: UserPreferences = {
        language: rtcCode,
        fontSize: session.user.fontSizePreference,
        muted: session.user.mutedPreference,
        volume: session.user.volumePreference,
      };

      try {
        await setPreferences(session.user.id, newPreferences);
        await update({ languagePreference: rtcCode });
      } catch (e) {
        toast.error("Unable to update language preference.");
      }
    },
    [language, setLanguage, session],
  );

  useEffect(() => {
    const lang = session.user.languagePreference
    const deepgramCode = findDeepgramCode(lang);
    setDeepgramLanguage({ deepgram: deepgramCode, rtc: lang });
    setLanguage(lang);
  }, [session.user.languagePreference]);

  return (
    <Select
      label="Meeting Language"
      variant="flat"
      items={NOVA_2_LANGUAGES}
      selectedKeys={[deepgramLanguage.deepgram]}
      radius="sm"
      size="md"
      data-cy="language-select"
      onChange={handleSelectionChange}
      className="w-full items-center font-semibold"
    >
      {(option) => <SelectItem key={option.deepgramCode}>{option.language}</SelectItem>}
    </Select>
  );
}
