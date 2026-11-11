import { ModelError } from "../model-error";

export function streamErrorOf(provider: string, message: string, code?: string): ModelError {
  return new ModelError({
    kind: "network",
    provider,
    retryable: false,
    message,
    ...(code === undefined ? {} : { code }),
  });
}
