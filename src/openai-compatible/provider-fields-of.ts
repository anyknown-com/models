import type { JsonObject } from "../types/json";

export function providerFieldsOf(options: JsonObject = {}): JsonObject {
  const { reasoningEffort, ...fields } = options;

  return reasoningEffort === undefined ? fields : { ...fields, reasoning_effort: reasoningEffort };
}
