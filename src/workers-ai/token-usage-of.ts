import type { TokenUsage } from "../types/token-usage";

const countOf = (usage: object, key: string): number => {
  const value: unknown = key in usage ? Reflect.get(usage, key) : undefined;

  return typeof value === "number" ? value : 0;
};

export function tokenUsageOf(output: unknown): TokenUsage {
  const usage =
    typeof output === "object" && output !== null && "usage" in output ? output.usage : undefined;

  const counted = typeof usage === "object" && usage !== null ? usage : {};

  return {
    input: countOf(counted, "prompt_tokens"),
    output: countOf(counted, "completion_tokens"),
    reasoning: 0,
    cacheRead: 0,
    cacheWrite: 0,
  };
}
