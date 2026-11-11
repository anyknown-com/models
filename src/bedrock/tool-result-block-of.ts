import type { JsonObject } from "../types/json";
import type { ToolResultPart } from "../types/parts";
import { toolResultContentOf } from "./tool-result-content-of";
import { toolUseIdOf } from "./tool-use-id-of";

export const toolResultBlockOf = (
  { toolCallId, output }: ToolResultPart,
  model: string,
): JsonObject => ({
  toolResult: { toolUseId: toolUseIdOf(toolCallId, model), content: toolResultContentOf(output) },
});
