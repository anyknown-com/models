import type { JsonValue } from "../types/json";

export function parsedOf(text: string): JsonValue | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
