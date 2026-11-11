import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";
import { assistantBlockOf } from "./assistant-block-of";
import type { AssistantPart } from "./types";

const isSent = (part: AssistantPart): boolean =>
  part.type !== "text" || part.text !== "" || part.providerOptions !== undefined;

export function assistantBlocksOf(
  content: AssistantModelMessage["content"],
  trimsTail: boolean,
): JsonObject[] {
  const parts: AssistantPart[] =
    typeof content === "string" ? [{ type: "text", text: content }] : content.filter(isSent);

  return parts.flatMap((part, index) =>
    assistantBlockOf(part, trimsTail && index === parts.length - 1),
  );
}
