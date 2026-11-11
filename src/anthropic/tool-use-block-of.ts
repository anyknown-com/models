import type { JsonObject } from "../types/json";
import type { ToolCallPart } from "../types/parts";
import { cacheControlOf } from "./cache-control-of";
import { isJsonObject } from "./is-json-object";

export const toolUseBlockOf = ({
  toolCallId,
  toolName,
  input,
  providerOptions,
}: ToolCallPart): JsonObject => ({
  type: "tool_use",
  id: toolCallId,
  name: toolName,
  input: isJsonObject(input) ? input : { rawInvalidInput: input },
  ...cacheControlOf(providerOptions),
});
