import type { ModelMessage } from "../types/model-message";
import { contentBlocksOf } from "./content-blocks-of";
import type { AnthropicMessage } from "./types";

const roleOf = ({ role }: ModelMessage): AnthropicMessage["role"] =>
  role === "assistant" ? "assistant" : "user";

const withTrimmedTail = (message: AnthropicMessage): AnthropicMessage => {
  const last = message.content.at(-1);

  if (message.role !== "assistant" || last?.type !== "text" || typeof last.text !== "string") {
    return message;
  }

  return {
    ...message,
    content: [...message.content.slice(0, -1), { ...last, text: last.text.trim() }],
  };
};

export function toMessages(messages: ModelMessage[]): AnthropicMessage[] {
  const merged: AnthropicMessage[] = [];

  for (const message of messages) {
    const role = roleOf(message);
    const content = contentBlocksOf(message);
    const previous = merged.at(-1);

    if (previous?.role === role) previous.content.push(...content);
    else merged.push({ role, content });
  }

  const last = merged.pop();

  return last ? [...merged, withTrimmedTail(last)] : merged;
}
