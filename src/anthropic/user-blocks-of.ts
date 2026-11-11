import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { textBlockOf } from "./text-block-of";
import { unsupportedPart } from "./unsupported-part";

export function userBlocksOf(content: UserModelMessage["content"]): JsonObject[] {
  if (typeof content === "string") return [{ type: "text", text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => {
      if (part.type !== "text") throw unsupportedPart(part.type);

      return textBlockOf(part);
    });
}
