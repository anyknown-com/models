import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import type { TextRequest } from "../types/text-request";
import { assistantMessageOf } from "./assistant-message-of";
import { toolContentOf } from "./tool-content-of";
import { userContentOf } from "./user-content-of";

const toChatMessage = (provider: string, message: ModelMessage): JsonObject[] => {
  if (message.role === "user") {
    return [{ role: "user", content: userContentOf(provider, message.content) }];
  }

  if (message.role === "assistant") return [assistantMessageOf(message.content)];

  return message.content.map(({ toolCallId, output }) => ({
    role: "tool",
    tool_call_id: toolCallId,
    content: toolContentOf(provider, output),
  }));
};

export function toChatMessages(
  provider: string,
  { system = [], messages }: TextRequest,
): JsonObject[] {
  return [
    ...system.map(({ text }) => ({ role: "system", content: text })),
    ...messages.flatMap((message) => toChatMessage(provider, message)),
  ];
}
