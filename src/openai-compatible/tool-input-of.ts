import type { JsonValue } from "../types/json";

const parsedOf = (text: string): JsonValue | undefined => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export function toolInputOf(args: string, declared: boolean): JsonValue | string {
  if (declared && args.trim() === "") return {};

  const parsed = parsedOf(args);

  if (parsed === undefined) return args;

  return declared ? parsed : JSON.stringify(parsed);
}
