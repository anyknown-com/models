import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

export function userBlocksOf(message: ModelMessage): JsonObject[] {
  if (message.role !== "user") {
    throw unsupported(PROVIDER, "bedrock does not send a tool message yet");
  }

  if (typeof message.content === "string") return [{ text: message.content }];

  return message.content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => {
      if (part.type !== "text") {
        throw unsupported(PROVIDER, `bedrock does not send a user ${part.type} part yet`);
      }

      return { text: part.text };
    });
}
