import type { StreamEvent } from "../types/stream-event";
import { toolInputOf } from "./tool-input-of";
import type { ChatDelta, ChatToolCallDelta } from "./types";

type ToolCallDraft = { id?: string; name?: string; args: string };

export function readToolCalls(declared: ReadonlySet<string>) {
  const drafts = new Map<number | string, ToolCallDraft>();
  let latest: number | string = 0;

  const readOne = (delta: ChatToolCallDelta): StreamEvent[] => {
    const key = delta.index ?? delta.id ?? latest;
    const draft = drafts.get(key) ?? { args: "" };
    const named = draft.name !== undefined;

    draft.id ??= delta.id ?? undefined;
    draft.name ??= delta.function?.name ?? undefined;
    draft.args += delta.function?.arguments ?? "";
    drafts.set(key, draft);
    latest = key;

    if (named || draft.name === undefined) return [];

    return [{ type: "tool-input-start", callId: draft.id ?? "", name: draft.name }];
  };

  const read = (delta: ChatDelta | null | undefined): StreamEvent[] =>
    (delta?.tool_calls ?? []).flatMap(readOne);

  const finish = (): StreamEvent[] =>
    [...drafts.values()].flatMap(({ id, name, args }): StreamEvent[] =>
      name === undefined
        ? []
        : [
            {
              type: "tool-call",
              callId: id ?? "",
              name,
              input: toolInputOf(args, declared.has(name)),
            },
          ],
    );

  return { read, finish };
}
