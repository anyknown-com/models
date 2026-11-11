import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

export function userPartsOf(content: UserModelMessage["content"]): JsonObject[] {
  if (typeof content === "string") return [{ text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => {
      if (part.type !== "text") {
        throw unsupported(PROVIDER, `google does not send a user ${part.type} part yet`);
      }

      return { text: part.text };
    });
}
