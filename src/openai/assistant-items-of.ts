import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";
import { unsupported } from "./unsupported";

const outputOf = (text: string): JsonObject => ({
  role: "assistant",
  content: [{ type: "output_text", text }],
});

export function assistantItemsOf(
  provider: string,
  content: AssistantModelMessage["content"],
): JsonObject[] {
  if (typeof content === "string") return [outputOf(content)];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => {
      if (part.type !== "text") {
        throw unsupported(provider, `openai does not send an assistant ${part.type} part yet`);
      }

      return outputOf(part.text);
    });
}
