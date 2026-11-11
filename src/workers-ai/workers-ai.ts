import type { EmbedAdapter } from "../types/embed-adapter";
import type { RerankAdapter } from "../types/rerank-adapter";
import { PROVIDER } from "./constants";
import { embedBatches } from "./embed-batches";
import { rerankDocuments } from "./rerank-documents";
import type { WorkersAiConfig } from "./types";

export function workersAi({ binding }: WorkersAiConfig): EmbedAdapter & RerankAdapter {
  return {
    provider: PROVIDER,
    embed: (request) => embedBatches(binding, request),
    rerank: (request) => rerankDocuments(binding, request),
  };
}
