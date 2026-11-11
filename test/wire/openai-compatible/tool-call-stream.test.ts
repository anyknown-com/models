import { describe, expect, it } from "vitest";
import { readStream } from "../../../src/openai-compatible/read-stream";
import type { StreamEvent } from "../../../src/types/stream-event";
import { responseOf } from "../response-of";

const chunkOf = (toolCalls: unknown[], finish: string | null = null) =>
  `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: toolCalls }, finish_reason: finish }] })}\n\n`;

const toolCallEventsOf = async (chunks: string[]) => {
  const response = responseOf({
    status: 200,
    headers: {},
    chunks: [...chunks, "data: [DONE]\n\n"],
  });

  const events: StreamEvent[] = [];

  for await (const event of readStream("p", response.body!, new Set(["known"]))) {
    if (event.type === "tool-input-start" || event.type === "tool-call") events.push(event);
  }

  return events;
};

describe("openai-compatible stream tool calls", () => {
  it("gives the same input the bridge gives for broken, empty and undeclared calls", async () => {
    const events = await toolCallEventsOf([
      chunkOf([{ index: 0, function: { arguments: '{"a":' } }]),
      chunkOf([{ index: 0, id: "c0", function: { name: "known", arguments: "1}" } }]),
      chunkOf([{ index: 1, id: "c1", function: { name: "known", arguments: '{"a":' } }]),
      chunkOf([{ index: 2, id: "c2", function: { name: "known", arguments: " " } }]),
      chunkOf([{ index: 3, id: "c3", function: { name: "nope", arguments: '{ "b": 2 }' } }]),
      chunkOf([{ index: 4, id: "c4", function: { name: "nope", arguments: "{" } }], "tool_calls"),
    ]);

    expect(events).toEqual([
      { type: "tool-input-start", callId: "c0", name: "known" },
      { type: "tool-input-start", callId: "c1", name: "known" },
      { type: "tool-input-start", callId: "c2", name: "known" },
      { type: "tool-input-start", callId: "c3", name: "nope" },
      { type: "tool-input-start", callId: "c4", name: "nope" },
      { type: "tool-call", callId: "c0", name: "known", input: { a: 1 } },
      { type: "tool-call", callId: "c1", name: "known", input: '{"a":' },
      { type: "tool-call", callId: "c2", name: "known", input: {} },
      { type: "tool-call", callId: "c3", name: "nope", input: '{"b":2}' },
      { type: "tool-call", callId: "c4", name: "nope", input: "{" },
    ]);
  });
});
