import type { JsonObject } from "../types/json";
import type { AssistantPart } from "./types";

export function assistantItemOf(part: AssistantPart): JsonObject[] {
  switch (part.type) {
    case "text":
      return [{ role: "assistant", content: [{ type: "output_text", text: part.text }] }];
    case "tool-call":
      if (part.providerExecuted) return [];

      return [
        {
          type: "function_call",
          call_id: part.toolCallId,
          name: part.toolName,
          arguments: JSON.stringify(part.input),
        },
      ];
    case "reasoning":
    case "tool-result":
    case "file":
      return [];
  }
}
