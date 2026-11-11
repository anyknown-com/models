import type { JsonObject } from "../types/json";
import { textBlockOf } from "./text-block-of";
import { toolUseBlockOf } from "./tool-use-block-of";
import type { AssistantPart } from "./types";

export function assistantBlockOf(part: AssistantPart, trims: boolean): JsonObject[] {
  switch (part.type) {
    case "text":
      return [textBlockOf(trims ? { ...part, text: part.text.trim() } : part)];
    case "tool-call":
      return part.providerExecuted ? [] : [toolUseBlockOf(part)];
    case "reasoning":
    case "tool-result":
    case "file":
      return [];
  }
}
