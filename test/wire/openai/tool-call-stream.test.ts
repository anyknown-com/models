import { describe, expect, it } from "vitest";
import { readStream } from "../../../src/openai/read-stream";
import type { StreamEvent } from "../../../src/types/stream-event";
import { responseOf } from "../response-of";

const sse = (events: object[]) => events.map((event) => `data: ${JSON.stringify(event)}\n\n`);

const callItem = (index: number, name: string, args: string) => ({
  id: `fc_${index}`,
  type: "function_call",
  call_id: `call_${index}`,
  name,
  arguments: args,
});

const callEvents = (index: number, name: string, parts: string[]) => [
  { type: "response.output_item.added", output_index: index, item: callItem(index, name, "") },
  ...parts.map((delta) => ({
    type: "response.function_call_arguments.delta",
    item_id: `fc_${index}`,
    output_index: index,
    delta,
  })),
  {
    type: "response.output_item.done",
    output_index: index,
    item: callItem(index, name, parts.join("")),
  },
];

const message = { id: "msg_1", type: "message" };
const completed = { type: "response.completed", response: { usage: null } };

const eventsOf = async (events: object[]) => {
  const body = responseOf({ status: 200, headers: {}, chunks: sse([...events, completed]) }).body;
  const out: StreamEvent[] = [];

  for await (const event of readStream("openai", body!, new Set(["known", "other"]))) {
    out.push(event);
  }

  return out;
};

const startedCall = (callId: string, name: string, input: unknown) => [
  { type: "tool-input-start", callId, name },
  { type: "tool-call", callId, name, input },
];

const uses = (recipient: string) =>
  JSON.stringify({
    tool_uses: [
      { recipient_name: "functions.known", parameters: { a: 1 } },
      { recipient_name: recipient, parameters: {} },
    ],
  });

describe("openai stream tool calls", () => {
  it("gives the same events the bridge gives for split, empty, broken and undeclared calls", async () => {
    const events = await eventsOf([
      { type: "response.output_item.added", output_index: 0, item: message },
      { type: "response.output_text.delta", item_id: "msg_1", output_index: 0, delta: "Hi" },
      { type: "response.output_item.done", output_index: 0, item: message },
      ...callEvents(1, "known", ['{"a"', ":1}"]),
      ...callEvents(2, "known", []),
      ...callEvents(3, "known", ['{"a":']),
      ...callEvents(4, "nope", ['{ "b": 2 }']),
      ...callEvents(5, "nope", ["{"]),
    ]);

    expect(events.slice(0, -2)).toEqual([
      { type: "text-start", id: "msg_1" },
      { type: "text", id: "msg_1", delta: "Hi" },
      { type: "text-end", id: "msg_1" },
      ...startedCall("call_1", "known", { a: 1 }),
      ...startedCall("call_2", "known", {}),
      ...startedCall("call_3", "known", '{"a":'),
      ...startedCall("call_4", "nope", '{"b":2}'),
      ...startedCall("call_5", "nope", "{"),
    ]);
    expect(events.at(-1)).toMatchObject({ type: "finish", reason: "tool-calls" });
  });

  it("expands an undeclared parallel wrapper into declared calls the way the bridge does", async () => {
    const events = await eventsOf([
      ...callEvents(0, "parallel", [uses("functions.other")]),
      ...callEvents(1, "parallel", [uses("functions.nope")]),
    ]);

    expect(events.slice(0, -2)).toEqual([
      ...startedCall("call_0_0", "known", { a: 1 }),
      ...startedCall("call_0_1", "other", {}),
      ...startedCall("call_1", "parallel", uses("functions.nope")),
    ]);
  });
});
