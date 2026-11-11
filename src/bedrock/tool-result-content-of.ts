import type { JsonObject } from "../types/json";
import type { ToolResultOutput } from "../types/parts";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

export function toolResultContentOf(output: ToolResultOutput): JsonObject[] {
  switch (output.type) {
    case "text":
    case "error-text":
      return [{ text: output.value }];
    case "json":
    case "error-json":
      return [{ text: JSON.stringify(output.value) }];
    case "content":
      return output.value.map((part) => {
        if (part.type !== "text") {
          throw unsupported(PROVIDER, `bedrock does not send a tool result ${part.type} part yet`);
        }

        return { text: part.text };
      });
  }
}
