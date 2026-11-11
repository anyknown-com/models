import type { JsonValue } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { toContentPart } from "./to-content-part";

export function userContentOf(provider: string, content: UserModelMessage["content"]): JsonValue {
  if (typeof content === "string") return content;

  const parts = content.filter((part) => part.type !== "text" || part.text !== "");

  if (parts.length === 1 && parts[0].type === "text") return parts[0].text;

  return parts.map((part) =>
    part.type === "text" ? { type: "text", text: part.text } : toContentPart(provider, part),
  );
}
