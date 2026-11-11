import { fieldOf } from "../speech/field-of";
import type { ProviderError } from "../wire/types";

const stringOf = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export function errorOf(value: unknown): ProviderError | undefined {
  const error = fieldOf(value, "error");
  const message = stringOf(fieldOf(error, "message"));
  const code = stringOf(fieldOf(error, "status"));

  if (message === undefined) return undefined;

  return code === undefined ? { message } : { message, code };
}
