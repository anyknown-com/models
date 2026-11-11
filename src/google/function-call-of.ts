import type { JsonObject } from "../types/json";
import type { ToolCallPart } from "../types/parts";
import { SKIP_THOUGHT_SIGNATURE } from "./constants";

export function functionCallOf(part: ToolCallPart, gemini3: boolean): JsonObject {
  return {
    functionCall: { id: part.toolCallId, name: part.toolName, args: part.input },
    ...(gemini3 ? { thoughtSignature: SKIP_THOUGHT_SIGNATURE } : {}),
  };
}
