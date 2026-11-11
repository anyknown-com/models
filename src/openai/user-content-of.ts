import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { toContentPart } from "./to-content-part";

export function userContentOf(
  provider: string,
  content: UserModelMessage["content"],
): JsonObject[] {
  if (typeof content === "string") return [{ type: "input_text", text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => toContentPart(provider, part));
}
