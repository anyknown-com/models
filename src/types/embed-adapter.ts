import type { EmbedRequest } from "./embed-request";
import type { EmbedResult } from "./embed-result";

export interface EmbedAdapter {
  readonly provider: string;
  embed(request: EmbedRequest): Promise<EmbedResult>;
}
