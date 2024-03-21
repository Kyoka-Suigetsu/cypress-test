import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localeEn from "dayjs/locale/en";
import { NOVA_2_LANGUAGES } from "./deepgram-model-languages";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDaysAgo = (postDate: string) => {
  dayjs.extend(relativeTime).locale(localeEn);
  return dayjs(postDate).fromNow();
};

export function findRtcCode(deepgramCode: string): string {
  for (const language of NOVA_2_LANGUAGES) {
    if (language.deepgramCode === deepgramCode) {
      return language.rtcCode;
    }
  }
  return ""; // return null if no match is found
}

export function findDeepgramCode(rtcCode: string): string {
  for (const language of NOVA_2_LANGUAGES) {
    if (language.rtcCode === rtcCode) {
      return language.deepgramCode;
    }
  }
  return ""; // return null if no match is found
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export type Browser = 'Opera' | 'Edge' | 'Chrome' | 'Firefox' | 'Safari' | 'IE' | 'Unknown';
export function getBrowser(): Browser {
  const browsers = [
    { name: 'Opera', pattern: /Opera|OPR\// },
    { name: 'Edge', pattern: /Edg/ },
    { name: 'Chrome', pattern: /Chrome/ },
    { name: 'Firefox', pattern: /Firefox/ },
    { name: 'Safari', pattern: /Safari/ },
    { name: 'IE', pattern: /MSIE|Trident/ },
  ] as const;

  for (const element of browsers) {
    if (element.pattern.test(navigator.userAgent)) {
      return element.name;
    }
  }

  return 'Unknown';
}