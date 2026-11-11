import type { ModelMessage } from "../types/model-message";

export function withToolMessagesJoined(messages: ModelMessage[]): ModelMessage[] {
  const joined: ModelMessage[] = [];

  for (const message of messages) {
    const last = joined.at(-1);

    if (message.role === "tool" && last?.role === "tool") {
      joined[joined.length - 1] = { ...last, content: [...last.content, ...message.content] };
    } else {
      joined.push(message);
    }
  }

  return joined;
}
