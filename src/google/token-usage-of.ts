import type { JsonObject, JsonValue } from "../types/json";
import type { TokenUsage } from "../types/token-usage";

const countOf = (value: JsonValue | undefined): number => (typeof value === "number" ? value : 0);

export function tokenUsageOf(usage: JsonObject | undefined): TokenUsage {
  const thoughts = countOf(usage?.["thoughtsTokenCount"]);

  return {
    input: countOf(usage?.["promptTokenCount"]),
    output: countOf(usage?.["candidatesTokenCount"]) + thoughts,
    reasoning: thoughts,
    cacheRead: countOf(usage?.["cachedContentTokenCount"]),
    cacheWrite: 0,
  };
}
