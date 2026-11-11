import type { ErrorFields, ResponsesEvent, StreamFailure } from "./types";

const failureOf = (message: string, { code, type }: ErrorFields): StreamFailure => ({
  message,
  ...(code ? { code } : {}),
  ...(type ? { type } : {}),
});

export function streamFailureOf(event: ResponsesEvent, data: string): StreamFailure | undefined {
  const { type, error, response } = event;

  if (type === "response.failed") {
    const failed = response?.error;

    return failed?.message === undefined
      ? undefined
      : failureOf(failed.message, { code: failed.code });
  }

  if (type !== "error") return undefined;
  if (error) return failureOf(error.message ?? data, error);

  return failureOf(event.message ?? data, { code: event.code });
}
