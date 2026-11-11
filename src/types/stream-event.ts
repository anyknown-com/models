import type { ModelError } from "../model-error";
import type { FinishReason } from "./finish-reason";
import type { TokenUsage } from "./token-usage";
import type { ToolCall } from "./tool";

export type StreamEvent =
  | { type: "text-start"; id: string }
  | { type: "text"; id: string; delta: string }
  | { type: "text-end"; id: string }
  | { type: "reasoning"; delta: string }
  | { type: "tool-input-start"; callId: string; name: string }
  | ({ type: "tool-call" } & ToolCall)
  | { type: "step-finish"; reason: FinishReason; usage: TokenUsage; raw?: unknown }
  | { type: "abort" }
  | {
      type: "finish";
      reason: FinishReason;
      usage: TokenUsage;
      raw?: unknown;
      error?: ModelError;
    };
