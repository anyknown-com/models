import type { JsonObject, JsonValue } from "../types/json";
import type { FilePart, ImagePart, TextPart, ToolResultOutput } from "../types/parts";
import { mediaOf } from "./media-of";
import { toContentBlock } from "./to-content-block";

const contentBlockOf = (part: TextPart | ImagePart | FilePart): JsonObject | undefined =>
  part.type === "text" ? { type: "text", text: part.text } : toContentBlock(mediaOf(part));

export function toolResultContentOf(output: ToolResultOutput): JsonValue {
  switch (output.type) {
    case "text":
    case "error-text":
      return output.value;
    case "json":
    case "error-json":
      return JSON.stringify(output.value);
    case "content":
      return output.value.flatMap((part) => contentBlockOf(part) ?? []);
  }
}
