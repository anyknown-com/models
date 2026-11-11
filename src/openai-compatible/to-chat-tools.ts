import type { JsonObject } from "../types/json";
import type { ToolDeclaration } from "../types/tool";

export function toChatTools(tools: ToolDeclaration[] = []): JsonObject {
  if (tools.length === 0) return {};

  return {
    tools: tools.map(({ name, description, inputSchema }) => ({
      type: "function",
      function: { name, description, parameters: inputSchema },
    })),
    tool_choice: "auto",
  };
}
