import type { ModelMessage } from "../types/model-message";
import { assistantBlocksOf } from "./assistant-blocks-of";
import { documentNamer } from "./document-namer";
import { groupedByRole } from "./grouped-by-role";
import type { BedrockMessage, MessageContext } from "./types";
import { userBlocksOf } from "./user-blocks-of";
import { withCachePoint } from "./with-cache-point";

export function toMessages(messages: ModelMessage[], model: string): BedrockMessage[] {
  const groups = groupedByRole(
    messages.filter((message) => message.role !== "tool" || message.content.length > 0),
  );

  const context: MessageContext = { model, documentName: documentNamer() };

  return groups.flatMap((group, i): BedrockMessage[] => {
    if (group.role === "user") {
      const content = group.messages.flatMap((m) =>
        withCachePoint(userBlocksOf(m, context), m.providerOptions),
      );

      return [{ role: "user", content }];
    }

    const last = i === groups.length - 1;

    const content = group.messages.flatMap((message, j) =>
      withCachePoint(
        assistantBlocksOf(message, last && j === group.messages.length - 1, model),
        message.providerOptions,
      ),
    );

    return content.length > 0 ? [{ role: "assistant", content }] : [];
  });
}
