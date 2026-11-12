import type { VisualInput, SpeechCase } from "./types";

const square = {
  prompt: "A red square centered on a white background.",
  providerOptions: { openai: { quality: "low" } },
};

export const IMAGE_CASES = [
  { id: "image-generate", source: "recorded", request: square },
  { id: "image-error-auth", source: "recorded", request: square, record: "wrong-key" },
  { id: "image-error-bad-request", source: "recorded", request: { ...square, prompt: "" } },
  { id: "image-error-rate-limit", source: "derived", from: "image-error-auth", status: 429 },
  { id: "image-error-server", source: "derived", from: "image-error-auth", status: 500 },
  { id: "image-error-network", source: "synthetic", request: square, fetch: "throws" },
  { id: "image-abort", source: "synthetic", request: square, fetch: "aborts" },
] as const satisfies readonly SpeechCase<VisualInput>[];

export type ImageCaseId = (typeof IMAGE_CASES)[number]["id"];
