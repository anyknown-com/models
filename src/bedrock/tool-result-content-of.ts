import type { JsonObject } from "../types/json";
import type { ToolResultOutput } from "../types/parts";
import { mediaOf } from "./media-of";
import { toContentBlock } from "./to-content-block";
import type { MessageContext } from "./types";

export function toolResultContentOf(
  output: ToolResultOutput,
  context: MessageContext,
): JsonObject[] {
  switch (output.type) {
    case "text":
    case "error-text":
      return [{ text: output.value }];
    case "json":
    case "error-json":
      return [{ text: JSON.stringify(output.value) }];
    case "content":
      return output.value.map((part) =>
        part.type === "text" ? { text: part.text } : toContentBlock(mediaOf(part, false), context),
      );
  }
}
