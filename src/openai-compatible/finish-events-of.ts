import type { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { streamErrorOf } from "../wire/stream-error-of";
import { tokenUsageOf } from "./token-usage-of";

export function finishEventsOf(
  provider: string,
  reason: FinishReason | undefined,
  usage: JsonObject | undefined,
  failure: ModelError | undefined,
): StreamEvent[] {
  const error =
    failure ??
    (reason
      ? undefined
      : streamErrorOf(provider, "Response stream ended without a finish reason."));

  const finished = { usage: tokenUsageOf(usage), ...(usage ? { raw: usage } : {}) };

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
