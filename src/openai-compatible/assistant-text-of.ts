import type { AssistantModelMessage } from "../types/model-message";
import { unsupported } from "./unsupported";

export function assistantTextOf(
  provider: string,
  content: AssistantModelMessage["content"],
): string {
  if (typeof content === "string") return content;

  return content
    .map((part) => {
      if (part.type !== "text") throw unsupported(provider, `${part.type} parts are not supported`);

      return part.text;
    })
    .join("");
}
