import { ModelError } from "../model-error";
import { errorKindOf } from "../wire/error-kind-of";
import { withOverflow } from "../wire/with-overflow";
import { QUOTA } from "./constants";
import { streamStatusOf } from "./stream-status-of";
import type { StreamFailure } from "./types";

export function earlyErrorOf(provider: string, data: string, failure: StreamFailure): ModelError {
  const { message, code = failure.type } = failure;
  const status = streamStatusOf(failure);
  const { kind, retryable } = errorKindOf(status);
  const quota = failure.code === QUOTA || failure.type === QUOTA;

  return new ModelError({
    kind: withOverflow({ message }, data, status).kind ?? kind,
    provider,
    retryable: retryable && !quota,
    status,
    message,
    body: data,
    ...(code === undefined ? {} : { code }),
  });
}
