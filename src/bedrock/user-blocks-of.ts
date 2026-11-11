import type { JsonObject } from "../types/json";
import type { ToolModelMessage, UserModelMessage } from "../types/model-message";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";
import { toolResultBlockOf } from "./tool-result-block-of";
import { userPartsOf } from "./user-parts-of";

export function userBlocksOf(
  message: UserModelMessage | ToolModelMessage,
  model: string,
): JsonObject[] {
  if (message.role === "tool") return message.content.map((part) => toolResultBlockOf(part, model));

  return userPartsOf(message.content).map((part) => {
    if (part.type !== "text") {
      throw unsupported(PROVIDER, `bedrock does not send a user ${part.type} part yet`);
    }

    return { text: part.text };
  });
}
