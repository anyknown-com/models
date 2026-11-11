import type { JsonObject, JsonValue } from "../types/json";
import type { ToolCallPart } from "../types/parts";
import { cacheControlOf } from "./cache-control-of";

const isObject = (value: JsonValue): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const toolUseBlockOf = ({
  toolCallId,
  toolName,
  input,
  providerOptions,
}: ToolCallPart): JsonObject => ({
  type: "tool_use",
  id: toolCallId,
  name: toolName,
  input: isObject(input) ? input : { rawInvalidInput: input },
  ...cacheControlOf(providerOptions),
});
