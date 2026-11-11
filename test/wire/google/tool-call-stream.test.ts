import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import { toolCall } from "../cases";

const sse = (chunks: JsonObject[]): string =>
  chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\r\n\r\n`).join("");

const chunk = (parts: JsonObject[], finishReason?: string) => ({
  candidates: [{ content: { parts, role: "model" }, ...(finishReason ? { finishReason } : {}) }],
});

const call = (name: string, args?: JsonObject, more: JsonObject = {}) => ({
  functionCall: { name, ...(args ? { args } : {}) },
  ...more,
});

const eventsOf = async (body: string, model = "gemini-2.5-flash") => {
  const fetch = async () =>
    Promise.resolve(new Response(body, { headers: { "content-type": "text/event-stream" } }));

  const events: StreamEvent[] = [];

  for await (const event of google({ key: "k", fetch }).stream({ ...toolCall, model })) {
    events.push(event);
  }

  return events;
};

const callIdsOf = (events: StreamEvent[]) => [
  ...new Set(events.flatMap((event) => ("callId" in event ? [event.callId] : []))),
];

describe("google stream tool calls", () => {
  it("gives each functionCall part a start and a call after the text of its chunk, the way the bridge does", async () => {
    const events = await eventsOf(
      sse([
        chunk([{ text: "a" }, call("get_weather", { city: "Paris" }), { text: "b" }]),
        chunk([
          { text: "plan", thought: true },
          call("get_time", {}, { thoughtSignature: "sig" }),
          call("get_time"),
          { functionCall: { id: "given", name: "nope", args: { b: 2 } } },
        ]),
        chunk([{ text: "c" }], "STOP"),
      ]),
      "gemini-3-pro-preview",
    );

    const [weather, time, noArgs] = callIdsOf(events);

    expect(callIdsOf(events)).toEqual([weather, time, noArgs, "given"]);
    expect(new Set([weather, time, noArgs]).size).toBe(3);
    expect(events.filter(({ type }) => type !== "step-finish" && type !== "finish")).toEqual([
      { type: "text-start", id: "0" },
      { type: "text", id: "0", delta: "a" },
      { type: "text", id: "0", delta: "b" },
      { type: "tool-input-start", callId: weather, name: "get_weather" },
      { type: "tool-call", callId: weather, name: "get_weather", input: { city: "Paris" } },
      { type: "text-end", id: "0" },
      { type: "reasoning", delta: "plan" },
      { type: "tool-input-start", callId: time, name: "get_time" },
      { type: "tool-call", callId: time, name: "get_time", input: {} },
      { type: "tool-input-start", callId: noArgs, name: "get_time" },
      { type: "tool-call", callId: noArgs, name: "get_time", input: {} },
      { type: "tool-input-start", callId: "given", name: "nope" },
      { type: "tool-call", callId: "given", name: "nope", input: '{"b":2}' },
      { type: "text-start", id: "2" },
      { type: "text", id: "2", delta: "c" },
      { type: "text-end", id: "2" },
    ]);
    expect(events.at(-1)).toMatchObject({ type: "finish", reason: "tool-calls" });
  });

  it.each([
    ["STOP", "tool-calls"],
    ["MAX_TOKENS", "length"],
  ])("reads finish reason %s after a tool call as %s", async (finishReason, reason) => {
    const events = await eventsOf(
      sse([chunk([call("get_weather", { city: "Paris" })], finishReason)]),
    );

    expect(events.at(-1)).toMatchObject({ type: "finish", reason });
  });
});
