import type { JsonObject } from "../types/json";
import type { FilePart, ImagePart, TextPart } from "../types/parts";
import { inputMediaOf } from "./input-media-of";
import type { Media } from "./types";

export function toContentPart(
  provider: string,
  part: TextPart | ImagePart | FilePart,
  mediaOf: (part: ImagePart | FilePart) => Media,
): JsonObject {
  if (part.type === "text") return { type: "input_text", text: part.text };

  return inputMediaOf(provider, mediaOf(part));
}
