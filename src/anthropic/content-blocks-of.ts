import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import { assistantBlocksOf } from "./assistant-blocks-of";
import { toolResultBlockOf } from "./tool-result-block-of";
import { userBlocksOf } from "./user-blocks-of";

export function contentBlocksOf(message: ModelMessage, isLast: boolean): JsonObject[] {
  if (message.role === "tool") return message.content.map(toolResultBlockOf);
  if (message.role === "assistant") return assistantBlocksOf(message.content, isLast);

  return userBlocksOf(message.content);
}
