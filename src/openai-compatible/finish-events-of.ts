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
  usage: JsonObject | undefined,
): StreamEvent[] {
  const finished = {
    reason: reason ?? "error",
    usage: tokenUsageOf(usage),
    ...(usage ? { raw: usage } : {}),
  };

  return [
    { type: "step-finish", ...finished },
    { type: "finish", ...finished, ...(reason ? {} : { error: noFinishReason(provider) }) },
  ];
}
