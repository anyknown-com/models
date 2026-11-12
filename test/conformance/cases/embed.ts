import type { EmbedCase, EmbedInput } from "./types";

const PAST_WORKERS_AI_BATCH = 27;

const segments = (count: number) =>
  Array.from({ length: count }, (_, index) => `segment ${index + 1}`);

const three = { values: segments(3) };

export const EMBED_CASES = [
  { id: "embed", source: "recorded", request: three },
  { id: "embed-batch", source: "recorded", request: { values: segments(PAST_WORKERS_AI_BATCH) } },
  {
    id: "embed-error-not-found",
    source: "recorded",
    request: { ...three, model: "anyknown-no-such-model" },
  },
  { id: "embed-abort", source: "synthetic", request: three, run: "aborts" },
] as const satisfies readonly EmbedCase<EmbedInput>[];

export type EmbedCaseId = (typeof EMBED_CASES)[number]["id"];
