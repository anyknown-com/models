import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart, TextPart } from "../types/parts";
import { unsupported } from "./unsupported";

export function toContentPart(provider: string, part: TextPart | ImagePart | FilePart): JsonObject {
  if (part.type !== "text") {
    throw unsupported(provider, `openai does not send a ${part.type} part yet`);
  }

  return { type: "input_text", text: part.text };
}
