import type { ModelMessage } from "../types/model-message";
import type { RoleGroup } from "./types";

export function groupedByRole(messages: ModelMessage[]): RoleGroup[] {
  const groups: RoleGroup[] = [];

  for (const message of messages) {
    const last = groups.at(-1);

    if (message.role !== "assistant") {
      if (last?.role === "user") last.messages.push(message);
      else groups.push({ role: "user", messages: [message] });
    } else if (last?.role === "assistant") last.messages.push(message);
    else groups.push({ role: "assistant", messages: [message] });
  }

  return groups;
}
