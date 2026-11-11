export const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// https://elevenlabs.io/docs/api-reference/speech-to-text/convert (keyterms: up to 1000, under 50 characters, at most 5 words, no < > { } [ ] \)
export const KEYTERMS_MAX = 1000;

export const KEYTERM_MAX_LENGTH = 49;

export const KEYTERM_MAX_WORDS = 5;

export const KEYTERM_UNSUPPORTED = /[<>{}[\]\\]/;

// https://elevenlabs.io/docs/overview/capabilities/speech-to-text (Mandarin Chinese is `zho`)
export const LANGUAGE_CODES: Partial<Record<string, string>> = { zh: "zho" };
