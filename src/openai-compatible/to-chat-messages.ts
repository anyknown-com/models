import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import type { TextRequest } from "../types/text-request";
import { assistantTextOf } from "./assistant-text-of";
import { unsupported } from "./unsupported";
import { userContentOf } from "./user-content-of";

const toChatMessage = (provider: string, message: ModelMessage): JsonObject => {
  const { role, content } = message;

  if (role === "user") return { role, content: userContentOf(provider, content) };
  if (role === "assistant") return { role, content: assistantTextOf(provider, content) };

  throw unsupported(provider, "tool messages are not supported");
};

export function toChatMessages(
  provider: string,
  { system = [], messages }: TextRequest,
): JsonObject[] {
  return [
    ...system.map(({ text }) => ({ role: "system", content: text })),
    ...messages.map((message) => toChatMessage(provider, message)),
  ];
}
