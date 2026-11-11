import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

const partsOf = ({ content }: ModelMessage) =>
  typeof content === "string"
    ? [{ type: "text" as const, text: content }]
    : content.filter(
        (part) => part.type !== "text" || part.text !== "" || part.providerOptions !== undefined,
      );

export function assistantBlocksOf(message: ModelMessage, trimsLast: boolean): JsonObject[] {
  const parts = partsOf(message);

  return parts.flatMap((part, i) => {
    if (part.type !== "text") {
      throw unsupported(PROVIDER, `bedrock does not send an assistant ${part.type} part yet`);
    }

    if (part.text.trim() === "") return [];

    return [{ text: trimsLast && i === parts.length - 1 ? part.text.trim() : part.text }];
  });
}
