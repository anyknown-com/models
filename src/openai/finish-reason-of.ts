import type { FinishReason } from "../types/finish-reason";

const REASONS = new Map<string, FinishReason>([
  ["max_output_tokens", "length"],
  ["content_filter", "content-filter"],
]);

export const finishReasonOf = (reason: string | null | undefined): FinishReason =>
  reason ? (REASONS.get(reason) ?? "other") : "stop";
