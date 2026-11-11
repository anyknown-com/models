import type { JsonObject, JsonValue } from "../types/json";
import type { TokenUsage } from "../types/token-usage";

const fieldOf = (value: JsonValue | undefined, key: string): JsonValue | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? value[key] : undefined;

const countOf = (value: JsonValue | undefined): number => (typeof value === "number" ? value : 0);

export function tokenUsageOf(usage: JsonObject | undefined): TokenUsage {
  return {
    input: countOf(usage?.["prompt_tokens"]),
    output: countOf(usage?.["completion_tokens"]),
    reasoning: countOf(fieldOf(usage?.["completion_tokens_details"], "reasoning_tokens")),
    cacheRead: countOf(fieldOf(usage?.["prompt_tokens_details"], "cached_tokens")),
    cacheWrite: 0,
  };
}
