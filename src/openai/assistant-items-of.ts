import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";
import { assistantItemOf } from "./assistant-item-of";

export function assistantItemsOf(content: AssistantModelMessage["content"]): JsonObject[] {
  if (typeof content === "string") return assistantItemOf({ type: "text", text: content });

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .flatMap(assistantItemOf);
}
