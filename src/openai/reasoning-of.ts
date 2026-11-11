import type { JsonObject, JsonValue } from "../types/json";

export function reasoningOf(effort: JsonValue | undefined): JsonObject {
  if (effort === undefined) return {};

  return { reasoning: effort === "none" ? { effort } : { effort, summary: "detailed" } };
}
