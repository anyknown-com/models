import { fieldOf } from "../speech/field-of";
import type { JsonObject } from "../types/json";
import type { TokenUsage } from "../types/token-usage";

const countOf = (value: unknown): number => (typeof value === "number" ? value : 0);

export function tokenUsageOf(usage: JsonObject | undefined): TokenUsage {
  const input = usage?.["input_tokens_details"];

  return {
    input: countOf(usage?.["input_tokens"]),
    output: countOf(usage?.["output_tokens"]),
    reasoning: countOf(fieldOf(usage?.["output_tokens_details"], "reasoning_tokens")),
    cacheRead: countOf(fieldOf(input, "cached_tokens")),
    cacheWrite: countOf(fieldOf(input, "cache_write_tokens")),
  };
}
