import { embed } from "../../../src/embed";
import { rerank } from "../../../src/rerank";
import type { EmbedRequest } from "../../../src/types/embed-request";
import type { EmbedResult } from "../../../src/types/embed-result";
import type { RerankRequest } from "../../../src/types/rerank-request";
import type { RerankResult } from "../../../src/types/rerank-result";
import { workersAi } from "../../../src/workers-ai";
import { EMBED_CASES, RERANK_CASES } from "../cases";
import type { EmbedInput, RerankInput } from "../cases";
import type { EmbedKind } from "./types";

export const EMBED: EmbedKind<EmbedInput, EmbedRequest, EmbedResult> = {
  kind: "embed",
  cases: EMBED_CASES,
  requestOf: ({ values, model }, manifestModel) => ({ model: model ?? manifestModel, values }),
  adapters: {
    "workers-ai": (binding) => (request) => embed(workersAi({ binding }), request),
  },
};

export const RERANK: EmbedKind<RerankInput, RerankRequest, RerankResult> = {
  kind: "rerank",
  cases: RERANK_CASES,
  requestOf: ({ model, ...input }, manifestModel) => ({ ...input, model: model ?? manifestModel }),
  adapters: {
    "workers-ai": (binding) => (request) => rerank(workersAi({ binding }), request),
  },
};
