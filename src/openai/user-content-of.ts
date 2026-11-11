import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { unsupported } from "./unsupported";

export function userContentOf(
  provider: string,
  content: UserModelMessage["content"],
): JsonObject[] {
  if (typeof content === "string") return [{ type: "input_text", text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => {
      if (part.type !== "text") {
        throw unsupported(provider, `openai does not send a user ${part.type} part yet`);
      }

      return { type: "input_text", text: part.text };
    });
}
