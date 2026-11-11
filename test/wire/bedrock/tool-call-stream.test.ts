import { describe, expect, it } from "vitest";
import { bedrock } from "../../../src/bedrock";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import { tools } from "../cases";
import { eventFrame } from "./frames";
import { BASE_URL } from "./sent-request";

const CLAUDE = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const USAGE = { inputTokens: 12, outputTokens: 7, totalTokens: 19 };
const COUNTED = { input: 12, output: 7, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

const toolStart = (index: number, toolUseId: string, name: string) =>
  eventFrame("contentBlockStart", {
    contentBlockIndex: index,
    start: { toolUse: { toolUseId, name } },
    p: "ab",
  });

const delta = (index: number, value: JsonObject) =>
  eventFrame("contentBlockDelta", { contentBlockIndex: index, delta: value, p: "abc" });

const inputDelta = (index: number, input: string) => delta(index, { toolUse: { input } });

const blockStop = (index: number) => eventFrame("contentBlockStop", { contentBlockIndex: index });

const START = eventFrame("messageStart", { role: "assistant" });

const END = [
  eventFrame("messageStop", { stopReason: "tool_use" }),
  eventFrame("metadata", { usage: USAGE, metrics: { latencyMs: 300 } }),
];

const TOOL_FINISH = [
  { type: "step-finish", reason: "tool-calls", usage: COUNTED, raw: USAGE },
  { type: "finish", reason: "tool-calls", usage: COUNTED, raw: USAGE },
];

const bytesOf = (frames: number[][]) => Uint8Array.from(frames.flat());

const eventsOf = async (
  body: Uint8Array<ArrayBuffer>,
  model = CLAUDE,
  events: StreamEvent[] = [],
) => {
  const fetch = async () =>
    new Response(body, { headers: { "content-type": "application/vnd.amazon.eventstream" } });

  const adapter = bedrock({ key: "k", fetch, baseUrl: BASE_URL });

  for await (const event of adapter.stream({ ...tools, model })) events.push(event);

  return events;
};

const toolCallOf = async (name: string, ...inputs: string[]) => {
  const pieces = inputs.map((input) => inputDelta(0, input));

  const events = await eventsOf(
    bytesOf([START, toolStart(0, "t1", name), ...pieces, blockStop(0), ...END]),
  );

  return events.find((event) => event.type === "tool-call");
};

describe("bedrock tool call stream", () => {
  it("joins the input pieces of two interleaved tool uses into one call each", async () => {
    const events = await eventsOf(
      bytesOf([
        START,
        delta(0, { text: "Checking." }),
        blockStop(0),
        toolStart(1, "tooluse_a1-B2", "get_weather"),
        toolStart(2, "tooluse_c3", "get_time"),
        inputDelta(1, '{"ci'),
        inputDelta(2, '{"timezone":"UTC"}'),
        inputDelta(1, 'ty":"Paris"}'),
        blockStop(2),
        blockStop(1),
        ...END,
      ]),
    );

    expect(events).toEqual([
      { type: "text-start", id: "0" },
      { type: "text", id: "0", delta: "Checking." },
      { type: "text-end", id: "0" },
      { type: "tool-input-start", callId: "tooluse_a1-B2", name: "get_weather" },
      { type: "tool-input-start", callId: "tooluse_c3", name: "get_time" },
      { type: "tool-call", callId: "tooluse_c3", name: "get_time", input: { timezone: "UTC" } },
      { type: "tool-call", callId: "tooluse_a1-B2", name: "get_weather", input: { city: "Paris" } },
      ...TOOL_FINISH,
    ]);
  });

  it.each([
    { name: "get_weather", inputs: [], input: {} },
    { name: "get_weather", inputs: ["  "], input: {} },
    { name: "get_weather", inputs: ['{"city":'], input: '{"city":' },
    { name: "search", inputs: [], input: "{}" },
    { name: "search", inputs: ['{ "q" : "x" }'], input: '{"q":"x"}' },
    { name: "search", inputs: ['{"q"'], input: '{"q"' },
  ])("reads $name with input $inputs as $input", async ({ name, inputs, input }) => {
    expect(await toolCallOf(name, ...inputs)).toEqual({
      type: "tool-call",
      callId: "t1",
      name,
      input,
    });
  });

  it("shortens the call id for a mistral model the way the request does", async () => {
    const events = await eventsOf(
      bytesOf([START, toolStart(0, "tooluse_a1-B2c3d4", "get_weather"), blockStop(0), ...END]),
      "mistral.mistral-large-2407-v1:0",
    );

    expect(events[0]).toEqual({
      type: "tool-input-start",
      callId: "toolusea1",
      name: "get_weather",
    });
  });

  it("fails the finish on a tool use without a string input and keeps reading", async () => {
    const events = await eventsOf(
      bytesOf([
        START,
        toolStart(0, "t1", "get_weather"),
        delta(0, { toolUse: {} }),
        blockStop(0),
        ...END,
      ]),
    );

    expect(events.slice(0, 3)).toEqual([
      { type: "tool-input-start", callId: "t1", name: "get_weather" },
      { type: "tool-call", callId: "t1", name: "get_weather", input: {} },
      TOOL_FINISH[0],
    ]);
    expect(events[3]).toMatchObject({
      type: "finish",
      reason: "error",
      error: { kind: "network", message: expect.stringContaining("toolUse.input is not a string") },
    });
  });

  it("throws a network error when the stream ends inside a tool use", async () => {
    const body = bytesOf([
      START,
      toolStart(0, "t1", "get_weather"),
      inputDelta(0, '{"city":"Paris"}'),
    ]);

    const events: StreamEvent[] = [];

    await expect(eventsOf(body.slice(0, -5), CLAUDE, events)).rejects.toMatchObject({
      kind: "network",
    });
    expect(events).toEqual([{ type: "tool-input-start", callId: "t1", name: "get_weather" }]);
  });
});
