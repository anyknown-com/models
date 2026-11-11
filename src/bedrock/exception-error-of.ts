import { ModelError } from "../model-error";
import { PROVIDER, STREAM_EXCEPTIONS, UNKNOWN_STREAM_EXCEPTION } from "./constants";
import { modelErrorOf } from "./model-error-of";

const decoder = new TextDecoder();

export function exceptionErrorOf(type: string | undefined, payload: Uint8Array): ModelError {
  const exception = STREAM_EXCEPTIONS[type ?? ""] ?? UNKNOWN_STREAM_EXCEPTION;
  const { kind, message } = modelErrorOf(decoder.decode(payload), exception.status, new Headers());

  return new ModelError({
    kind: kind ?? exception.kind,
    provider: PROVIDER,
    retryable: exception.retryable,
    message,
    ...(type === undefined ? {} : { code: type }),
  });
}
