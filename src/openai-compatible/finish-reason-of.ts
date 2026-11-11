import type { FinishReason } from "../types/finish-reason";

const REASONS: Record<string, FinishReason> = {
  stop: "stop",
  length: "length",
  content_filter: "content-filter",
  function_call: "tool-calls",
  tool_calls: "tool-calls",
};

export const finishReasonOf = (reason: string): FinishReason => REASONS[reason] ?? "other";
