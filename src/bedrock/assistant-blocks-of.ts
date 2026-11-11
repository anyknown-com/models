import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";
import { assistantBlockOf } from "./assistant-block-of";
import { assistantPartsOf } from "./assistant-parts-of";

export function assistantBlocksOf(
  { content }: AssistantModelMessage,
  trimsLast: boolean,
  model: string,
): JsonObject[] {
  const parts = assistantPartsOf(content);
  const hasReasoning = parts.some((part) => part.type === "reasoning");

  return parts.flatMap((part, i) => {
    if (part.type !== "text") return assistantBlockOf(part, model);
    if (part.text.trim() === "" && !hasReasoning) return [];

    return assistantBlockOf(
      trimsLast && i === parts.length - 1 ? { ...part, text: part.text.trim() } : part,
      model,
    );
  });
}
