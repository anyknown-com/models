import type { JsonObject, JsonValue } from "../types/json";

export const isJsonObject = (value: JsonValue): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);
