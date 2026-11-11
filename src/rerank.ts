import type { RerankAdapter } from "./types/rerank-adapter";
import type { RerankRequest } from "./types/rerank-request";
import type { RerankResult } from "./types/rerank-result";

export async function rerank(
  adapter: RerankAdapter,
  request: RerankRequest,
): Promise<RerankResult> {
  if (request.documents.length === 0) return { ranking: [] };

  return adapter.rerank(request);
}
