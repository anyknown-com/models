import type { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { streamErrorOf } from "../wire/stream-error-of";
import { tokenUsageOf } from "./token-usage-of";

type Finish = {
  reason: FinishReason | undefined;
  start: JsonObject | undefined;
  delta: JsonObject | undefined;
  failure: ModelError | undefined;
};

export function finishEventsOf(
  provider: string,
  { reason, start, delta, failure }: Finish,
): StreamEvent[] {
  const raw = start || delta ? { ...start, ...delta } : undefined;

  const error =
    failure ??
    (reason
      ? undefined
      : streamErrorOf(provider, "Response stream ended without a finish reason."));

  const finished = { usage: tokenUsageOf(start, delta), ...(raw ? { raw } : {}) };

  return [
    { type: "step-finish", reason: reason ?? "error", ...finished },
    {
      type: "finish",
      reason: error ? "error" : (reason ?? "error"),
      ...finished,
      ...(error ? { error } : {}),
    },
  ];
}
