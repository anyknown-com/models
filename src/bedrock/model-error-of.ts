import { fieldOf } from "../speech/field-of";
import { parsedOf } from "../wire/parsed-of";
import type { ProviderError } from "../wire/types";
import { withOverflow } from "../wire/with-overflow";

export function modelErrorOf(body: string, status: number, headers: Headers): ProviderError {
  const message = fieldOf(parsedOf(body), "message");
  const code = headers.get("x-amzn-errortype")?.split(":")[0];

  return withOverflow(
    { message: typeof message === "string" ? message : body, ...(code ? { code } : {}) },
    body,
    status,
  );
}
