import type { EmbedRequest } from "../../../src/types/embed-request";
import type { EmbedResult } from "../../../src/types/embed-result";
import type { RerankRequest } from "../../../src/types/rerank-request";
import type { RerankResult } from "../../../src/types/rerank-result";
import type { EmbedAsserts } from "../embed/types";
import { embedErrorAsserts } from "./embed-error-asserts";
import { embedded } from "./embedded";
import { ranked } from "./ranked";

export const EMBED_ASSERTS: EmbedAsserts<EmbedRequest, EmbedResult> = {
  embed: embedded,
  "embed-batch": embedded,
  ...embedErrorAsserts("embed"),
};

export const RERANK_ASSERTS: EmbedAsserts<RerankRequest, RerankResult> = {
  rerank: ranked,
  ...embedErrorAsserts("rerank"),
};
