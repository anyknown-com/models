import type { JsonObject } from "../types/json";
import type { ToolDeclaration } from "../types/tool";

export function toTools(tools: ToolDeclaration[]): JsonObject {
  if (tools.length === 0) return {};

  return {
    tools: tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      input_schema: inputSchema,
      eager_input_streaming: true,
    })),
    tool_choice: { type: "auto" },
  };
}
