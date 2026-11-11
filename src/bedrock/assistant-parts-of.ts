import type { AssistantModelMessage } from "../types/model-message";
import type { AssistantPart } from "./types";

export const assistantPartsOf = (content: AssistantModelMessage["content"]): AssistantPart[] =>
  typeof content === "string"
    ? [{ type: "text", text: content }]
    : content.filter(
        (part) => part.type !== "text" || part.text !== "" || part.providerOptions !== undefined,
      );
