import type { EmbedAdapter } from "./types/embed-adapter";
import type { EmbedRequest } from "./types/embed-request";
import type { EmbedResult } from "./types/embed-result";

export async function embed(adapter: EmbedAdapter, request: EmbedRequest): Promise<EmbedResult> {
  if (request.values.length === 0) return { embeddings: [] };

  return adapter.embed(request);
}
