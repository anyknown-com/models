import type { ModelMessage } from "../types/model-message";

type Group = { role: "user" | "assistant"; messages: ModelMessage[] };

export function groupedByRole(messages: ModelMessage[]): Group[] {
  const groups: Group[] = [];

  for (const message of messages) {
    const role = message.role === "assistant" ? "assistant" : "user";
    const last = groups.at(-1);

    if (last?.role === role) last.messages.push(message);
    else groups.push({ role, messages: [message] });
  }

  return groups;
}
