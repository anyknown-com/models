import type { StreamEvent } from "../types/stream-event";
import { toolCallOf } from "./tool-call-of";
import { toolUseIdOf } from "./tool-use-id-of";
import type { ConverseEvent, ToolCallDraft } from "./types";

export function readToolCalls(model: string, declared: ReadonlySet<string>) {
  const drafts = new Map<number, ToolCallDraft>();

  return ({
    contentBlockStart: start,
    contentBlockDelta: delta,
    contentBlockStop: stop,
  }: ConverseEvent): StreamEvent[] => {
    const toolUse = start?.start?.toolUse;

    if (start && toolUse) {
      const draft = { callId: toolUseIdOf(toolUse.toolUseId, model), name: toolUse.name, json: "" };

      drafts.set(start.contentBlockIndex, draft);

      return [{ type: "tool-input-start", callId: draft.callId, name: draft.name }];
    }

    const typing = delta && drafts.get(delta.contentBlockIndex);

    if (typing) typing.json += delta.delta?.toolUse?.input ?? "";

    const draft = stop && drafts.get(stop.contentBlockIndex);

    if (!stop || !draft) return [];

    drafts.delete(stop.contentBlockIndex);

    return [toolCallOf(draft, declared)];
  };
}
