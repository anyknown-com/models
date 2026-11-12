import type { EmbedCase, RerankInput } from "./types";

const meeting = {
  query: "where did we meet",
  documents: [
    "Coffee\n\nWe met at the corner cafe.",
    "Trip\n\nThe flight left at noon.",
    "Dinner\n\nWe had dinner by the river.",
  ],
};

export const RERANK_CASES = [
  { id: "rerank", source: "recorded", request: meeting },
  {
    id: "rerank-error-not-found",
    source: "recorded",
    request: { ...meeting, model: "anyknown-no-such-model" },
  },
  { id: "rerank-abort", source: "synthetic", request: meeting, run: "aborts" },
] as const satisfies readonly EmbedCase<RerankInput>[];

export type RerankCaseId = (typeof RERANK_CASES)[number]["id"];
