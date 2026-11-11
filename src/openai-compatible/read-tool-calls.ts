import type { ModelError } from "../model-error";
import type { StreamEvent } from "../types/stream-event";
import { streamErrorOf } from "../wire/stream-error-of";
import { toolInputOf } from "./tool-input-of";
import type { ChatDelta, ChatToolCallDelta } from "./types";

type ToolCallDraft = { id?: string; name?: string; args: string };

export function readToolCalls(provider: string, declared: ReadonlySet<string>) {
  const drafts = new Map<number | string, ToolCallDraft>();
  let latest: number | string = 0;
  let problem: string | undefined;

  const readOne = (delta: ChatToolCallDelta): StreamEvent[] => {
    const key = delta.index ?? delta.id ?? latest;
    const draft = drafts.get(key) ?? { args: "" };
    const name = draft.name === undefined ? (delta.function?.name ?? undefined) : undefined;

    draft.id ??= delta.id ?? undefined;
    draft.args += delta.function?.arguments ?? "";
    drafts.set(key, draft);
    latest = key;

    if (name === undefined) return [];

    if (draft.id === undefined) {
      problem ??= "Expected 'id' to be a string.";

      return [];
    }

    draft.name = name;

    return [{ type: "tool-input-start", callId: draft.id, name }];
  };

  const read = (delta: ChatDelta | null | undefined): StreamEvent[] =>
    (delta?.tool_calls ?? []).flatMap(readOne);

  const finish = (): StreamEvent[] =>
    [...drafts.values()].flatMap(({ id, name, args }): StreamEvent[] => {
      if (id === undefined || name === undefined) {
        problem ??= "Expected 'function.name' to be a string.";

        return [];
      }

      return [
        { type: "tool-call", callId: id, name, input: toolInputOf(args, declared.has(name)) },
      ];
    });

  const failure = (): ModelError | undefined =>
    problem === undefined ? undefined : streamErrorOf(provider, problem);

  return { read, finish, failure };
}
