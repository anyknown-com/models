import type { JsonValue } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { unsupported } from "./unsupported";

export function userContentOf(provider: string, content: UserModelMessage["content"]): JsonValue {
  if (typeof content === "string") return content;

  const parts = content.filter((part) => part.type !== "text" || part.text !== "");

  if (parts.length === 1 && parts[0].type === "text") return parts[0].text;

  return parts.map((part) => {
    if (part.type !== "text") throw unsupported(provider, `${part.type} parts are not supported`);

    return { type: "text", text: part.text };
  });
}
