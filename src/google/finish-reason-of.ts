import type { FinishReason } from "../types/finish-reason";

const REASONS = new Map<string, FinishReason>([
  ["STOP", "stop"],
  ["MAX_TOKENS", "length"],
  ["IMAGE_SAFETY", "content-filter"],
  ["RECITATION", "content-filter"],
  ["SAFETY", "content-filter"],
  ["BLOCKLIST", "content-filter"],
  ["PROHIBITED_CONTENT", "content-filter"],
  ["SPII", "content-filter"],
  ["MALFORMED_FUNCTION_CALL", "error"],
]);

export const finishReasonOf = (reason: string, hasToolCalls: boolean): FinishReason =>
  reason === "STOP" && hasToolCalls ? "tool-calls" : (REASONS.get(reason) ?? "other");
