import type { TokenUsage } from "./token-usage";

export type EmbedResult = { embeddings: number[][]; usage?: TokenUsage };
