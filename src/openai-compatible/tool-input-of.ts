import type { JsonValue } from "../types/json";
import { parsedOf } from "./parsed-of";

export function toolInputOf(args: string, declared: boolean): JsonValue | string {
  if (declared && args.trim() === "") return {};

  const parsed = parsedOf(args);

  if (parsed === undefined) return args;

  return declared ? parsed : JSON.stringify(parsed);
}
