import type { ModelMessage } from "../types/model-message";
import type { TextRequest } from "../types/text-request";
import { functionResponsesOf } from "./function-responses-of";
import { isGemini3 } from "./is-gemini-3";
import { modelPartsOf } from "./model-parts-of";
import type { GoogleContent, GoogleContents } from "./types";
import { userPartsOf } from "./user-parts-of";
import { withSystemPrefix } from "./with-system-prefix";
import { withToolMessagesJoined } from "./with-tool-messages-joined";

const contentOf = (message: ModelMessage, gemini3: boolean): GoogleContent => {
  if (message.role === "user") return { role: "user", parts: userPartsOf(message.content) };

  if (message.role === "assistant") {
    return { role: "model", parts: modelPartsOf(message.content, gemini3) };
  }

  return {
    role: "user",
    parts: message.content.flatMap((part) => functionResponsesOf(part, gemini3)),
  };
};

export function toContents({ model, system = [], messages }: TextRequest): GoogleContents {
  const gemini3 = isGemini3(model);
  const contents = withToolMessagesJoined(messages).map((message) => contentOf(message, gemini3));
  const parts = system.map(({ text }) => ({ text }));
  const gemma = model.toLowerCase().startsWith("gemma-");

  if (gemma) return { contents: withSystemPrefix(contents, parts) };

  return { contents, ...(parts.length > 0 ? { systemInstruction: { parts } } : {}) };
}
