import type { JsonValue } from "../types/json";
import type { ToolResultOutput } from "../types/parts";
import { toContentPart } from "./to-content-part";
import { toolMediaOf } from "./tool-media-of";

export function toolOutputOf(provider: string, output: ToolResultOutput): JsonValue {
  switch (output.type) {
    case "text":
    case "error-text":
      return output.value;
    case "json":
    case "error-json":
      return JSON.stringify(output.value);
    case "content":
      return output.value.map((part) => toContentPart(provider, part, toolMediaOf));
  }
}
