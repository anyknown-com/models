import type { SpeechUsage } from "./speech-usage";

export type TranscribeRequest = {
  model: string;
  audio: Blob;
  filename: string;
  language?: string;
  languages?: readonly string[];
  terms?: readonly string[];
  signal?: AbortSignal;
};

export type TranscribeResult = { text: string; usage: SpeechUsage; raw?: unknown };
