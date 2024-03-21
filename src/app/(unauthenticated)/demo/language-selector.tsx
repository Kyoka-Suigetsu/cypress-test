"use client";

import { DEEPGRAM } from "@/lib/deepgram-model-languages";
import { Select, SelectItem } from "@nextui-org/select";
import { useAtom } from "jotai";
import { useCallback, type ChangeEvent } from "react";
import { deepgramLanguageAtom } from "./jotai-wrapper";
import { findRtcCode } from "@/lib/utils";

export default function LanguageSelector() {
  const [language, setLanguage] = useAtom(deepgramLanguageAtom);

  const handleSelectionChange = useCallback(
    async (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value.trim();

      if (value === "" || value === language.deepgram) {
        return;
      }
      const rtcCode = findRtcCode(value);
      setLanguage({deepgram:value, rtc: rtcCode});
    },
    [language, setLanguage],
  );

  return (
    <Select
      label="Source Language"
      variant="bordered"
      items={DEEPGRAM.NOVA_2_LANGUAGES}
      selectedKeys={[language.deepgram]}
      color="secondary"
      radius="sm"
      size="md"
      onChange={handleSelectionChange}
      data-cy="demo-source-language-selector"
      className="w-full items-center font-semibold"
    >
      {(option) => (
        <SelectItem key={option.deepgramCode} className="dark">{option.language}</SelectItem>
      )}
    </Select>
  );
}
