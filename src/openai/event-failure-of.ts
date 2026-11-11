import { ModelError } from "../model-error";
import { streamErrorOf } from "../wire/stream-error-of";
import { earlyErrorOf } from "./early-error-of";
import { streamFailureOf } from "./stream-failure-of";
import type { ResponsesEvent } from "./types";

export function eventFailureOf(
  provider: string,
  data: string,
  event: ResponsesEvent | ModelError,
  started: boolean,
): ModelError | undefined {
  if (event instanceof ModelError) return event;

  const failure = streamFailureOf(event, data);

  if (!failure) return undefined;
  if (!started) throw earlyErrorOf(provider, data, failure);

  return streamErrorOf(provider, failure.message, failure.code ?? failure.type);
}
