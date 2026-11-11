import type { JsonObject } from "../types/json";
import { reasoningBlockOf } from "./reasoning-block-of";
import { toolUseBlockOf } from "./tool-use-block-of";
import type { AssistantPart } from "./types";

export function assistantBlockOf(part: AssistantPart, model: string): JsonObject[] {
  switch (part.type) {
    case "text":
      return [{ text: part.text }];
    case "tool-call":
      return [toolUseBlockOf(part, model)];
    case "reasoning":
      return reasoningBlockOf(part);
    case "tool-result":
    case "file":
      return [];
  }
}
