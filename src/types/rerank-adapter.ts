import type { RerankRequest } from "./rerank-request";
import type { RerankResult } from "./rerank-result";

export interface RerankAdapter {
  readonly provider: string;
  rerank(request: RerankRequest): Promise<RerankResult>;
}
