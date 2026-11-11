import type { StreamEvent } from "../types/stream-event";
import type { ToolCall } from "../types/tool";
import { toolInputOf } from "../wire/tool-input-of";
import { parallelCallsOf } from "./parallel-calls-of";
import type { ResponsesEvent } from "./types";

const PARALLEL = "parallel";

const startedCallOf = (call: ToolCall): StreamEvent[] => [
  { type: "tool-input-start", callId: call.callId, name: call.name },
  { type: "tool-call", ...call },
];

export function toolCallEventsOf(
  { type, item }: ResponsesEvent,
  declared: ReadonlySet<string>,
): StreamEvent[] {
  if (item?.type !== "function_call") return [];

  const callId = item.call_id ?? "";
  const name = item.name ?? "";
  const args = item.arguments ?? "";
  const wrapper = name === PARALLEL && !declared.has(PARALLEL);

  if (type === "response.output_item.added") {
    return wrapper ? [] : [{ type: "tool-input-start", callId, name }];
  }

  if (type !== "response.output_item.done") return [];

  const call = { callId, name, input: toolInputOf(args, declared.has(name)) };

  if (!wrapper) return [{ type: "tool-call", ...call }];

  return (parallelCallsOf(callId, args, declared) ?? [call]).flatMap(startedCallOf);
}
