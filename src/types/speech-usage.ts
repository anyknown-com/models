export type SpeechUnit = "seconds" | "characters" | "bytes";

export type SpeechUsage = { amount: number | null; unit: SpeechUnit };
