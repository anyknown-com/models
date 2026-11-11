import type { ModelMessage } from "../types/model-message";
import { contentBlocksOf } from "./content-blocks-of";
import type { AnthropicMessage } from "./types";
import { withToolUseLast } from "./with-tool-use-last";

const roleOf = ({ role }: ModelMessage): AnthropicMessage["role"] =>
  role === "assistant" ? "assistant" : "user";

const isSent = (message: ModelMessage): boolean =>
  message.role !== "tool" || message.content.length > 0;

export function toMessages(messages: ModelMessage[]): AnthropicMessage[] {
  const merged: AnthropicMessage[] = [];
  const sent = messages.filter(isSent);

  sent.forEach((message, index) => {
    const role = roleOf(message);
    const content = contentBlocksOf(message, index === sent.length - 1);
    const previous = merged.at(-1);

    if (previous?.role === role) previous.content.push(...content);
    else merged.push({ role, content });
  });

  return merged.map((message) =>
    message.role === "assistant"
      ? { ...message, content: withToolUseLast(message.content) }
      : message,
  );
}
