import type { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import type { TokenUsage } from "../types/token-usage";
import { streamErrorOf } from "./stream-error-of";

type Finish = {
  reason: FinishReason | undefined;
  usage: TokenUsage;
  raw: JsonObject | undefined;
  failure: ModelError | undefined;
};

export function finishEventsOf(
  provider: string,
  { reason, usage, raw, failure }: Finish,
): StreamEvent[] {
  const error =
    failure ??
    (reason
      ? undefined
      : streamErrorOf(provider, "Response stream ended without a finish reason."));

  const finished = { usage, ...(raw ? { raw } : {}) };

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
