import { ModelError } from "../model-error";
import { PROVIDER } from "./constants";

export function toModelError(error: unknown, signal?: AbortSignal): ModelError {
  return new ModelError({
    kind: signal?.aborted ? "abort" : "server",
    provider: PROVIDER,
    retryable: false,
    message: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}
