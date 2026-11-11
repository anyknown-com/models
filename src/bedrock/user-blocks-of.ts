import type { JsonObject } from "../types/json";
import type { ToolModelMessage, UserModelMessage } from "../types/model-message";
import { mediaOf } from "./media-of";
import { toContentBlock } from "./to-content-block";
import { toolResultBlockOf } from "./tool-result-block-of";
import type { MessageContext } from "./types";
import { userPartsOf } from "./user-parts-of";

export function userBlocksOf(
  message: UserModelMessage | ToolModelMessage,
  context: MessageContext,
): JsonObject[] {
  if (message.role === "tool") {
    return message.content.map((part) => toolResultBlockOf(part, context));
  }

  return userPartsOf(message.content).map((part) =>
    part.type === "text" ? { text: part.text } : toContentBlock(mediaOf(part, true), context),
  );
}
