import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import type { TextRequest } from "../types/text-request";
import { assistantItemsOf } from "./assistant-items-of";
import { functionCallOutputOf } from "./function-call-output-of";
import { isReasoningModel } from "./is-reasoning-model";
import { userContentOf } from "./user-content-of";

const itemsOf = (provider: string, message: ModelMessage): JsonObject[] => {
  if (message.role === "user") {
    return [{ role: "user", content: userContentOf(provider, message.content) }];
  }

  if (message.role === "assistant") return assistantItemsOf(message.content);

  return message.content.map((part) => functionCallOutputOf(provider, part));
};

export function toInput(provider: string, { model, system = [], messages }: TextRequest) {
  const role = isReasoningModel(model) ? "developer" : "system";

  return [
    ...system.map(({ text }) => ({ role, content: text })),
    ...messages.flatMap((message) => itemsOf(provider, message)),
  ];
}
