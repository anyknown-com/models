import type { FinishReason } from "../types/finish-reason";

const REASONS = new Map<string, FinishReason>([
  ["end_turn", "stop"],
  ["pause_turn", "stop"],
  ["stop_sequence", "stop"],
  ["refusal", "content-filter"],
  ["tool_use", "tool-calls"],
  ["max_tokens", "length"],
  ["model_context_window_exceeded", "length"],
]);

export const finishReasonOf = (reason: string | null | undefined): FinishReason =>
  (reason && REASONS.get(reason)) || "other";
