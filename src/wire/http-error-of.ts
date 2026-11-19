import { ModelError } from "../model-error";
import { errorKindOf } from "./error-kind-of";
import { resetAtOf } from "./reset-at-of";
import type { ErrorOf } from "./types";

export function httpErrorOf(
  provider: string,
  status: number,
  body: string,
  errorOf: ErrorOf,
  headers = new Headers(),
): ModelError {
  const { kind, code, message } = errorOf(body, status, headers);

  return new ModelError({
    ...errorKindOf(status),
    ...(kind === undefined ? {} : { kind }),
    provider,
    status,
    message,
    body,
    resetAt: resetAtOf(status, headers, body, Date.now()),
    ...(code === undefined ? {} : { code }),
  });
}
