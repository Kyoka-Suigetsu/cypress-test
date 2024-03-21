"use client";

import { socket } from "@/lib/socket";
import { Select, SelectItem } from "@nextui-org/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { RESET, atomWithReset } from "jotai/utils";
import { useCallback, useEffect, type ChangeEvent } from "react";
import ReactAudioPlayer from "react-audio-player";
import { DEEPGRAM } from "@/lib/deepgram-model-languages";
import { activeLanguageAtom, transcriptsAtom } from "./jotai-wrapper";
import type { Transcript } from "./jotai-wrapper";
import ListenerChatBubble from "./listener-chat-bubble";
import { findRtcCode } from "@/lib/utils";

const activeLanguageTranscriptsAtom = atom<Transcript[]>((get) => {
  return get(transcriptsAtom).filter(
    (t) => t.language === get(activeLanguageAtom).rtc,
  );
});
const playerAudioArrayAtom = atom((get) => {
  const transcript = get(activeLanguageTranscriptsAtom) ?? [];
  return transcript.map((transcript) => ({
    requestId: transcript.id,
    isComplete: transcript.audioComplete ?? false,
    audio: transcript.audio ?? [],
  }));
});
export const manualPlayerIndexAtom = atomWithReset(-1);
export const automaticPlayerIndexAtom = atom(0);
export const playerIndexAtom = atom((get) => {
  const manualPlayIndex = get(manualPlayerIndexAtom);
  const playerIndex = get(automaticPlayerIndexAtom);

  return manualPlayIndex !== -1 ? manualPlayIndex : playerIndex;
});
const playerAudioAtom = atom(
  (get) => get(playerAudioArrayAtom)[get(playerIndexAtom)],
);
export const audioIndexAtom = atomWithReset(0);
const audioSrcAtom = atom((get) => {
  const encodedString = get(playerAudioAtom)?.audio[get(audioIndexAtom)];

  if (!encodedString) {
    return;
  }

  return `data:audio/mpeg;base64,${encodedString}`;
});

export default function Translations() {
  const [activeLanguageTranscripts] = useAtom(activeLanguageTranscriptsAtom);
  const [transcripts, setTranscripts] = useAtom(transcriptsAtom);
  const [activeLanguage, setActiveLanguage] = useAtom(activeLanguageAtom);
  const [manualIndex, setManualIndex] = useAtom(manualPlayerIndexAtom);
  const setAutomaticPlayerIndex = useSetAtom(automaticPlayerIndexAtom);
  const [audioIndex, setAudioIndex] = useAtom(audioIndexAtom);
  const playerAudio = useAtomValue(playerAudioAtom);
  const audioSrc = useAtomValue(audioSrcAtom);

  useEffect(() => {
    console.log("Translations mounted");

    socket.on(
      "demo-result",
      (config: {
        id: string;
        language: string;
        data: string;
        translated_text: string;
        chunk_number: number;
        is_finished: boolean;
      }) => {
        console.table(config);
        const { id, data, translated_text, is_finished } = config;

        setTranscripts((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              console.log(translated_text, translated_text.trim() !== "");
              return {
                ...t,
                audio:
                  data && data.trim() !== ""
                    ? [...(t.audio ?? []), data]
                    : t.audio,
                translated:
                  translated_text.trim() !== ""
                    ? translated_text
                    : t.translated,
                audioComplete: is_finished,
              };
            } else {
              return t;
            }
          }),
        );
      },
    );

    return () => {
      console.log("Translations unmounted");

      socket.off("demo-result");
    };
  }, [setTranscripts]);

  useEffect(() => {
    setAutomaticPlayerIndex(activeLanguageTranscripts.length);
  }, [activeLanguage]);

  const handleSelectionChange = useCallback(
    async (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value.trim();

      if (value === "" || value === activeLanguage.deepgram) {
        return;
      }

      const rtcCode = findRtcCode(value);
      setActiveLanguage({ deepgram: value, rtc: rtcCode });
      setAudioIndex(RESET);
    },
    [activeLanguage, setAutomaticPlayerIndex],
  );

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex w-full items-center justify-center space-x-4 rounded-md py-1">
        <Select
          label="Translated Language"
          variant="bordered"
          items={DEEPGRAM.NOVA_2_LANGUAGES}
          selectedKeys={[activeLanguage.deepgram]}
          color="secondary"
          radius="sm"
          size="md"
          onChange={handleSelectionChange}
          data-cy="demo-translated-language-selector"
          className="w-full items-center font-semibold"
        >
          {(option) => (
            <SelectItem key={option.deepgramCode}>{option.language}</SelectItem>
          )}
        </Select>
      </div>
      <ul
        data-cy="demo-listener-transcripts"
        className="flex h-[472px] flex-col items-center space-y-2 overflow-y-auto overflow-x-hidden rounded-md bg-content3 px-2 py-2"
      >
        {activeLanguageTranscripts.map((item, index) => (
          <ListenerChatBubble
            key={item.id}
            index={index}
            transcriptsAtom={activeLanguageTranscriptsAtom}
          />
        ))}
      </ul>
      <ReactAudioPlayer
        src={audioSrc}
        autoPlay={true}
        controls
        onEnded={() => {
          setAudioIndex((prevState) => prevState + 1);

          if (
            !!playerAudio?.isComplete &&
            playerAudio?.audio.length - 1 === audioIndex
          ) {
            setAudioIndex(RESET);
            manualIndex !== -1
              ? setManualIndex(RESET)
              : setAutomaticPlayerIndex((prevState) => prevState + 1);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
