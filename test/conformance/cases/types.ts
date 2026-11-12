import type { ProviderOptions } from "../../../src/types/provider-options";
import type { TextRequest } from "../../../src/types/text-request";
import type { TranscribeRequest } from "../../../src/types/transcribe-request";

export type TextCase =
  | {
      id: string;
      source: "recorded";
      request: TextRequest;
      record?: "twice" | "wrong-key" | "request-model";
      providerOptionsBy?: Record<string, ProviderOptions>;
    }
  | { id: string; source: "recorded"; fixtureOf: string }
  | { id: string; source: "derived"; from: string; status: number }
  | {
      id: string;
      source: "synthetic";
      request: TextRequest;
      fetch: "throws" | "aborts" | "unused";
    };

export type SpeechAudio = "sample" | "noise";

export type TranscribeInput = Omit<TranscribeRequest, "model" | "audio" | "signal"> & {
  audio: SpeechAudio;
};

export type SynthesizeInput = { text: string; voiceBy?: Record<string, string> };

export type SpeechCase<Input> =
  | { id: string; source: "recorded"; request: Input; record?: "wrong-key" }
  | { id: string; source: "derived"; from: string; status: number }
  | { id: string; source: "synthetic"; request: Input; fetch: "throws" | "aborts" };

export type EmbedInput = { values: string[]; model?: string };

export type RerankInput = { query: string; documents: string[]; model?: string };

export type EmbedCase<Input> =
  | { id: string; source: "recorded"; request: Input }
  | { id: string; source: "synthetic"; request: Input; run: "aborts" };
