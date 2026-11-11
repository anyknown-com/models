import type { FinishReason } from "../types/finish-reason";

const REASONS = new Map<string, FinishReason>([
  ["end_turn", "stop"],
  ["stop_sequence", "stop"],
  ["max_tokens", "length"],
  ["content_filtered", "content-filter"],
  ["guardrail_intervened", "content-filter"],
  ["tool_use", "tool-calls"],
]);

export const finishReasonOf = (reason: string): FinishReason => REASONS.get(reason) ?? "other";
