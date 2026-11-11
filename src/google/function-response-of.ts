import type { JsonObject, JsonValue } from "../types/json";
import type { ToolResultPart } from "../types/parts";

export function functionResponseOf(
  part: ToolResultPart,
  content: JsonValue,
  parts: JsonObject[] = [],
): JsonObject {
  const { toolCallId: id, toolName: name } = part;

  return {
    functionResponse: {
      id,
      name,
      response: { name, content },
      ...(parts.length > 0 ? { parts } : {}),
    },
  };
}
