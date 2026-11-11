import { ModelError } from "../model-error";
import type { FinishReason } from "../types/finish-reason";
import type { JsonObject } from "../types/json";
import type { StreamEvent } from "../types/stream-event";
import { tokenUsageOf } from "./token-usage-of";

const noFinishReason = (provider: string): ModelError =>
  new ModelError({
    kind: "network",
    provider,
    retryable: false,
    message: "Response stream ended without a finish reason.",
  });

export function finishEventsOf(
  provider: string,
  reason: FinishReason | undefined,
  start: JsonObject | undefined,
  delta: JsonObject | undefined,
): StreamEvent[] {
  const raw = start || delta ? { ...start, ...delta } : undefined;

  const finished = {
    reason: reason ?? "error",
    usage: tokenUsageOf(start, delta),
    ...(raw ? { raw } : {}),
  };

  return [
    { type: "step-finish", ...finished },
    { type: "finish", ...finished, ...(reason ? {} : { error: noFinishReason(provider) }) },
  ];
}
