export type SpeechCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

export type FormField = readonly [name: string, value: string];
