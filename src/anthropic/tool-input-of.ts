import type { JsonValue } from "../types/json";

const parsedOf = (text: string): JsonValue | undefined => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export function toolInputOf(json: string, declared: boolean): JsonValue | string {
  const input = json === "" ? "{}" : json;

  if (declared && input.trim() === "") return {};

  const parsed = parsedOf(input);

  if (parsed === undefined) return input;

  return declared ? parsed : JSON.stringify(parsed);
}
