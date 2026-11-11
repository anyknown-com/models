import type { EmbedAdapter } from "../types/embed-adapter";
import type { RerankAdapter } from "../types/rerank-adapter";
import type { TextAdapter } from "../types/text-adapter";
import { PROVIDER } from "./constants";
import { embedBatches } from "./embed-batches";
import { rerankDocuments } from "./rerank-documents";
import { streamOnce } from "./stream-once";
import type { WorkersAiConfig } from "./types";

export function workersAi({
  binding,
}: WorkersAiConfig): TextAdapter & EmbedAdapter & RerankAdapter {
  return {
    provider: PROVIDER,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: (request) => streamOnce(binding, request),
    embed: (request) => embedBatches(binding, request),
    rerank: (request) => rerankDocuments(binding, request),
  };
}
