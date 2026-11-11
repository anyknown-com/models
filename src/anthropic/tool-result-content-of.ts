import type { JsonValue } from "../types/json";
import type { ToolResultOutput } from "../types/parts";
import { unsupportedPart } from "./unsupported-part";

export function toolResultContentOf(output: ToolResultOutput): JsonValue {
  switch (output.type) {
    case "text":
    case "error-text":
      return output.value;
    case "json":
    case "error-json":
      return JSON.stringify(output.value);
    case "content":
      return output.value.map((part) => {
        if (part.type !== "text") throw unsupportedPart(part.type);

        return { type: "text", text: part.text };
      });
  }
}
