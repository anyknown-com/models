import type { TokenUsage } from "./token-usage";

export type RerankResult = { ranking: { index: number; score: number }[]; usage?: TokenUsage };
