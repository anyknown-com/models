import type { JsonObject } from "../types/json";
import { GENERATION_OPTIONS } from "./constants";
import { thinkingConfigOf } from "./thinking-config-of";

export function generationConfigOf(
  model: string,
  maxOutputTokens: number | undefined,
  options: JsonObject = {},
): JsonObject {
  const set = GENERATION_OPTIONS.filter((key) => options[key]);
  const thinkingConfig = options.thinkingConfig;

  return {
    ...(maxOutputTokens === undefined ? {} : { maxOutputTokens }),
    ...Object.fromEntries(set.map((key) => [key, options[key]])),
    ...(thinkingConfig ? { thinkingConfig: thinkingConfigOf(model, thinkingConfig) } : {}),
  };
}
