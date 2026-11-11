import type { FinishReason } from "../types/finish-reason";

const REASONS = new Map<string, FinishReason>([
  ["max_output_tokens", "length"],
  ["content_filter", "content-filter"],
]);

export function finishReasonOf(reason: string | null | undefined, called: boolean): FinishReason {
  const known = reason ? REASONS.get(reason) : undefined;

  if (known) return known;
  if (called) return "tool-calls";

  return reason ? "other" : "stop";
}
