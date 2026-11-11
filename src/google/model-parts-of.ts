import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";
import { unsupported } from "./unsupported";

export function modelPartsOf(content: AssistantModelMessage["content"]): JsonObject[] {
  const parts = typeof content === "string" ? [{ type: "text" as const, text: content }] : content;

  return parts
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part) => {
      if (part.type !== "text") {
        throw unsupported(`google does not send an assistant ${part.type} part yet`);
      }

      return { text: part.text };
    });
}
