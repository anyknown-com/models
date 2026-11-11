import { fieldOf } from "../speech/field-of";
import { parsedOf } from "../wire/parsed-of";
import type { ProviderError } from "../wire/types";
import { withOverflow } from "../wire/with-overflow";

const stringOf = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export function modelErrorOf(body: string, status: number): ProviderError {
  const error = fieldOf(parsedOf(body), "error");
  const message = stringOf(fieldOf(error, "message"));
  const code = stringOf(fieldOf(error, "type"));

  if (message === undefined) return withOverflow({ message: body }, body, status);

  return withOverflow(code === undefined ? { message } : { message, code }, body, status);
}
