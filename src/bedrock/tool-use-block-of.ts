import type { JsonObject } from "../types/json";
import type { ToolCallPart } from "../types/parts";
import { isJsonObject } from "../wire/is-json-object";
import { toolUseIdOf } from "./tool-use-id-of";

export const toolUseBlockOf = (
  { toolCallId, toolName, input }: ToolCallPart,
  model: string,
): JsonObject => ({
  toolUse: {
    toolUseId: toolUseIdOf(toolCallId, model),
    name: toolName.replace(/[^a-zA-Z0-9_-]/g, "") || "_",
    input: isJsonObject(input) ? input : { rawInvalidInput: input },
  },
});
