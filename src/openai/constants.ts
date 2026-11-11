export const OPENAI_BASE_URL = "https://api.openai.com/v1";

export const IMAGE_QUALITY = "high";

export const IMAGE_SIZE = "1024x1024";

// https://developers.openai.com/api/docs/guides/speech-to-text (gpt-transcribe `languages`: ISO 639-1 codes and the regional zh codes, lowercase as in the examples)
export const GPT_TRANSCRIBE_LANGUAGES: Partial<Record<string, string>> = {
  "zh-TW": "zh-tw",
  "zh-CN": "zh-cn",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
};
