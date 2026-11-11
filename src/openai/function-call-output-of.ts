import type { JsonObject } from "../types/json";
import type { ToolResultPart } from "../types/parts";
import { toolOutputOf } from "./tool-output-of";

export function functionCallOutputOf(provider: string, part: ToolResultPart): JsonObject {
  return {
    type: "function_call_output",
    call_id: part.toolCallId,
    output: toolOutputOf(provider, part.output),
  };
}
