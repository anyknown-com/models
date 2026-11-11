import type { JsonObject } from "../types/json";
import type { ToolResultPart } from "../types/parts";
import { toolResultContentOf } from "./tool-result-content-of";
import { toolUseIdOf } from "./tool-use-id-of";
import type { MessageContext } from "./types";

export const toolResultBlockOf = (
  { toolCallId, output }: ToolResultPart,
  context: MessageContext,
): JsonObject => ({
  toolResult: {
    toolUseId: toolUseIdOf(toolCallId, context.model),
    content: toolResultContentOf(output, context),
  },
});
