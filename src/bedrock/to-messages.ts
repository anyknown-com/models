import type { ModelMessage } from "../types/model-message";
import { assistantBlocksOf } from "./assistant-blocks-of";
import { groupedByRole } from "./grouped-by-role";
import type { BedrockMessage } from "./types";
import { userBlocksOf } from "./user-blocks-of";

export function toMessages(messages: ModelMessage[]): BedrockMessage[] {
  const groups = groupedByRole(messages);

  return groups.flatMap(({ role, messages: group }, i): BedrockMessage[] => {
    if (role === "user") return [{ role, content: group.flatMap(userBlocksOf) }];

    const last = i === groups.length - 1;

    const content = group.flatMap((message, j) =>
      assistantBlocksOf(message, last && j === group.length - 1),
    );

    return content.length > 0 ? [{ role, content }] : [];
  });
}
