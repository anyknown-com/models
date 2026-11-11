import type { ModelMessage } from "../types/model-message";
import type { TextRequest } from "../types/text-request";
import { modelPartsOf } from "./model-parts-of";
import type { GoogleContent, GoogleContents } from "./types";
import { unsupported } from "./unsupported";
import { userPartsOf } from "./user-parts-of";
import { withSystemPrefix } from "./with-system-prefix";

const contentOf = (message: ModelMessage): GoogleContent => {
  if (message.role === "user") return { role: "user", parts: userPartsOf(message.content) };

  if (message.role === "assistant") return { role: "model", parts: modelPartsOf(message.content) };

  throw unsupported("google does not send a tool message yet");
};

export function toContents({ model, system = [], messages }: TextRequest): GoogleContents {
  const contents = messages.map(contentOf);
  const parts = system.map(({ text }) => ({ text }));
  const gemma = model.toLowerCase().startsWith("gemma-");

  if (gemma) return { contents: withSystemPrefix(contents, parts) };

  return { contents, ...(parts.length > 0 ? { systemInstruction: { parts } } : {}) };
}
