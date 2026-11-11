import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";
import { functionCallOf } from "./function-call-of";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

type AssistantPart = Exclude<AssistantModelMessage["content"], string>[number];

const modelPartOf = (part: AssistantPart, gemini3: boolean): JsonObject[] => {
  switch (part.type) {
    case "text":
      return part.text === "" ? [] : [{ text: part.text }];
    case "reasoning":
      return part.text === "" ? [] : [{ text: part.text, thought: true }];
    case "tool-call":
      return [functionCallOf(part, gemini3)];
    case "tool-result":
      return [];
    case "file":
      throw unsupported(PROVIDER, "google does not send an assistant file part yet");
  }
};

export function modelPartsOf(content: AssistantModelMessage["content"], gemini3: boolean) {
  const parts = typeof content === "string" ? [{ type: "text" as const, text: content }] : content;

  return parts.flatMap((part) => modelPartOf(part, gemini3));
}
