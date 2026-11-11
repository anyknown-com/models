import type { ModelMessage } from "../types/model-message";
import { assistantBlocksOf } from "./assistant-blocks-of";
import { groupedByRole } from "./grouped-by-role";
import type { BedrockMessage } from "./types";
import { userBlocksOf } from "./user-blocks-of";

export function toMessages(messages: ModelMessage[], model: string): BedrockMessage[] {
  const groups = groupedByRole(
    messages.filter((message) => message.role !== "tool" || message.content.length > 0),
  );

  return groups.flatMap((group, i): BedrockMessage[] => {
    if (group.role === "user") {
      return [{ role: "user", content: group.messages.flatMap((m) => userBlocksOf(m, model)) }];
    }

    const last = i === groups.length - 1;

    const content = group.messages.flatMap((message, j) =>
      assistantBlocksOf(message, last && j === group.messages.length - 1, model),
    );

    return content.length > 0 ? [{ role: "assistant", content }] : [];
  });
}
