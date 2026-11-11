import type { JsonObject } from "../types/json";
import type { TokenUsage } from "../types/token-usage";

export function tokenUsageOf(usage: JsonObject = {}): TokenUsage {
  const countOf = (key: string): number => {
    const value = usage[key];

    return typeof value === "number" ? value : 0;
  };

  const cacheRead = countOf("cacheReadInputTokens");
  const cacheWrite = countOf("cacheWriteInputTokens");

  return {
    input: countOf("inputTokens") + cacheRead + cacheWrite,
    output: countOf("outputTokens"),
    reasoning: 0,
    cacheRead,
    cacheWrite,
  };
}
