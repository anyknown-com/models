import type { JsonObject } from "../types/json";
import type { ToolDeclaration } from "../types/tool";

const toolSpecOf = ({ name, description, inputSchema }: ToolDeclaration): JsonObject => ({
  toolSpec: {
    name,
    ...(description.trim() === "" ? {} : { description }),
    inputSchema: { json: inputSchema },
  },
});

export const toToolConfig = (tools: ToolDeclaration[]): JsonObject => ({
  tools: tools.map(toolSpecOf),
  toolChoice: { auto: {} },
});
