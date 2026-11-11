import type { JsonObject } from "../types/json";
import { GENERATION_OPTIONS } from "./constants";

export function generationConfigOf(
  maxOutputTokens: number | undefined,
  options: JsonObject = {},
): JsonObject {
  const set = GENERATION_OPTIONS.filter((key) => options[key]);

  return {
    ...(maxOutputTokens === undefined ? {} : { maxOutputTokens }),
    ...Object.fromEntries(set.map((key) => [key, options[key]])),
  };
}
