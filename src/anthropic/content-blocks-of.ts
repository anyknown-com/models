import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import { textBlockOf } from "./text-block-of";
import { unsupportedPart } from "./unsupported-part";

export function contentBlocksOf(message: ModelMessage): JsonObject[] {
  if (message.role === "tool") throw unsupportedPart("tool-result");
  if (typeof message.content === "string") return [{ type: "text", text: message.content }];

  return message.content.map((part) => {
    if (part.type !== "text") throw unsupportedPart(part.type);

    return textBlockOf(part);
  });
}
