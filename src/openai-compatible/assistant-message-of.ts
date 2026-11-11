import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";

export function assistantMessageOf(content: AssistantModelMessage["content"]): JsonObject {
  if (typeof content === "string") return { role: "assistant", content };

  let text = "";
  let reasoning = "";
  const toolCalls: JsonObject[] = [];

  for (const part of content) {
    if (part.type === "text") text += part.text;
    if (part.type === "reasoning") reasoning += part.text;

    if (part.type === "tool-call") {
      toolCalls.push({
        id: part.toolCallId,
        type: "function",
        function: { name: part.toolName, arguments: JSON.stringify(part.input) },
      });
    }
  }

  return {
    role: "assistant",
    content: toolCalls.length > 0 ? text || null : text,
    ...(reasoning ? { reasoning_content: reasoning } : {}),
    ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
  };
}
