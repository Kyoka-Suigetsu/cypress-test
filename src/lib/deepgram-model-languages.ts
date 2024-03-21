export const DEFAULT_DEEPGRAM_LANGUAGE = "en";
export const DEFAULT_RTC_LANGUAGE = "eng_Latn";

export const NOVA_2_LANGUAGES = [
  {"language":"Czech","deepgramCode":"cs", "rtcCode":"ces_Latn"},
  {"language":"Danish","deepgramCode":"da", "rtcCode":"dan_Latn"},
  {"language":"Dutch","deepgramCode":"nl", "rtcCode":"nld_Latn"},
  {"language":"English","deepgramCode":"en", "rtcCode":"eng_Latn"},
  // Not supported by RTC
  // {"language":"Flemish","deepgramCode":"nl-BE", "rtcCode":""}, 
  {"language":"French","deepgramCode":"fr", "rtcCode":"fra_Latn"},
  {"language":"German","deepgramCode":"de", "rtcCode":"deu_Latn"},
  {"language":"Greek","deepgramCode":"el", "rtcCode":"ell_Grek"},
  {"language":"Hindi","deepgramCode":"hi", "rtcCode":"hin_Deva"},
  {"language":"Indonesian","deepgramCode":"id", "rtcCode":"ind_Latn"},
  {"language":"Italian","deepgramCode":"it", "rtcCode":"ita_Latn"},
  {"language":"Korean","deepgramCode":"ko", "rtcCode":"kor_Hang"},
  {"language":"Norwegian","deepgramCode":"no", "rtcCode":"nno_Latn"},
  {"language":"Polish","deepgramCode":"pl", "rtcCode":"pol_Latn"},
  {"language":"Portuguese","deepgramCode":"pt", "rtcCode":"por_Latn"},
  {"language":"Russian","deepgramCode":"ru", "rtcCode":"rus_Cyrl"},
  {"language":"Spanish","deepgramCode":"es", "rtcCode":"spa_Latn"},
  {"language":"Swedish","deepgramCode":"sv", "rtcCode":"swe_Latn"},
  {"language":"Turkish","deepgramCode":"tr", "rtcCode":"tur_Latn"},
  {"language":"Ukrainian","deepgramCode":"uk", "rtcCode":"ukr_Cyrl"},
]

export const ENHANCED_LANGUAGES = [
  {"language":"Japanese","deepgramCode":"ja"},
  {"language":"Tamasheq","deepgramCode":"taq"},
  {"language":"Tamil","deepgramCode":"ta"},
]

export const BASE_LANGUAGES = [
  {"language":"Chinese","deepgramCode":"zh"},
]

export const DEEPGRAM = {
  DEFAULT_DEEPGRAM_LANGUAGE,
  DEFAULT_RTC_LANGUAGE,
  NOVA_2_LANGUAGES,
  ENHANCED_LANGUAGES,
  BASE_LANGUAGES,
}