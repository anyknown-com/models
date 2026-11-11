import type { ModelMessage } from "../types/model-message";
import { assistantPartsOf } from "./assistant-parts-of";
import { isToolPart } from "./is-tool-part";
import { userPartsOf } from "./user-parts-of";

export function toolPartsDropped(message: ModelMessage): ModelMessage[] {
  if (message.role === "tool") return [];
  if (message.role === "user") return userPartsOf(message.content).length > 0 ? [message] : [];

  const content = assistantPartsOf(message.content).filter((part) => !isToolPart(part));

  return content.length > 0 ? [{ ...message, content }] : [];
}
