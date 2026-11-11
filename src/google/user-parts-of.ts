import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { toPart } from "./to-part";

export function userPartsOf(content: UserModelMessage["content"]): JsonObject[] {
  if (typeof content === "string") return [{ text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => (part.type === "text" ? { text: part.text } : toPart(part)));
}
