import type { JsonObject, JsonValue } from "../types/json";
import type { TokenUsage } from "../types/token-usage";
import { isJsonObject } from "./is-json-object";

const numberOf = (value: JsonValue | undefined): number | undefined =>
  typeof value === "number" ? value : undefined;

export function tokenUsageOf(start: JsonObject = {}, delta: JsonObject = {}): TokenUsage {
  const countOf = (key: string): number => numberOf(delta[key]) ?? numberOf(start[key]) ?? 0;
  const details = delta["output_tokens_details"];
  const input = countOf("input_tokens");
  const cacheRead = countOf("cache_read_input_tokens");
  const cacheWrite = countOf("cache_creation_input_tokens");

  return {
    input: input + cacheRead + cacheWrite,
    output: numberOf(delta["output_tokens"]) ?? 0,
    reasoning: (details && isJsonObject(details) && numberOf(details["thinking_tokens"])) || 0,
    cacheRead,
    cacheWrite,
  };
}
