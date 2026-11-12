import type { SpeechCase, TranscribeInput } from "./types";

const sample = { audio: "sample", filename: "sample.wav", language: "en" } as const;

export const TRANSCRIBE_CASES = [
  { id: "transcribe", source: "recorded", request: sample },
  {
    id: "transcribe-terms",
    source: "recorded",
    request: { ...sample, terms: ["Amino", "Anyknown"] },
  },
  {
    id: "transcribe-languages",
    source: "recorded",
    request: { audio: "sample", filename: "sample.wav", languages: ["en", "ja"] },
  },
  { id: "transcribe-error-auth", source: "recorded", request: sample, record: "wrong-key" },
  {
    id: "transcribe-error-bad-request",
    source: "recorded",
    request: { ...sample, audio: "noise" },
  },
  {
    id: "transcribe-error-rate-limit",
    source: "derived",
    from: "transcribe-error-bad-request",
    status: 429,
  },
  {
    id: "transcribe-error-server",
    source: "derived",
    from: "transcribe-error-bad-request",
    status: 500,
  },
  { id: "transcribe-error-network", source: "synthetic", request: sample, fetch: "throws" },
  { id: "transcribe-abort", source: "synthetic", request: sample, fetch: "aborts" },
] as const satisfies readonly SpeechCase<TranscribeInput>[];

export type TranscribeCaseId = (typeof TRANSCRIBE_CASES)[number]["id"];
