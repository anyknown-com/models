import type { StreamEvent } from "../types/stream-event";
import { toolInputOf } from "../wire/tool-input-of";
import type { ToolCallDraft } from "./types";

export const toolCallOf = (
  { callId, name, json }: ToolCallDraft,
  declared: ReadonlySet<string>,
): StreamEvent => ({
  type: "tool-call",
  callId,
  name,
  input: toolInputOf(json === "" ? "{}" : json, declared.has(name)),
});
