import { ModelError } from "./model-error";

export function toModelError(error: unknown, provider: string, signal?: AbortSignal): ModelError {
  if (error instanceof ModelError) return error;

  return new ModelError({
    kind: signal?.aborted ? "abort" : "network",
    provider,
    retryable: false,
    message: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}
