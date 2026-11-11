import type { StreamEvent } from "../types/stream-event";
import { toolInputOf } from "./tool-input-of";
import type { MessagesEvent } from "./types";

type ToolCallDraft = { callId: string; name: string; json: string };

export function readToolCalls(declared: ReadonlySet<string>) {
  const drafts = new Map<number, ToolCallDraft>();

  return ({ type, index = 0, content_block: block, delta }: MessagesEvent): StreamEvent[] => {
    const draft = drafts.get(index);

    if (type === "content_block_start" && block?.type === "tool_use") {
      const callId = block.id ?? "";
      const name = block.name ?? "";

      drafts.set(index, { callId, name, json: "" });

      return [{ type: "tool-input-start", callId, name }];
    }

    if (draft && delta?.type === "input_json_delta") draft.json += delta.partial_json ?? "";
    if (!draft || type !== "content_block_stop") return [];

    const { callId, name, json } = draft;

    drafts.delete(index);

    return [{ type: "tool-call", callId, name, input: toolInputOf(json, declared.has(name)) }];
  };
}
