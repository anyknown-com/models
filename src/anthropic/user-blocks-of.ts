import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { textBlockOf } from "./text-block-of";
import { userMediaBlockOf } from "./user-media-block-of";

export function userBlocksOf(content: UserModelMessage["content"]): JsonObject[] {
  if (typeof content === "string") return [{ type: "text", text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => (part.type === "text" ? textBlockOf(part) : userMediaBlockOf(part)));
}
