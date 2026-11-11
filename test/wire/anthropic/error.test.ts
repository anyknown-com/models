import { describe, expect, it } from "vitest";
import { anthropic } from "../../../src/anthropic";
import { ModelError } from "../../../src/model-error";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import { badRequest } from "../cases";
import type { Fixture } from "../fixture";
import badRequestFixture from "../fixtures/anthropic/bad-request.json";
import { replayFetch } from "../replay-fetch";
import { responseOf } from "../response-of";

const encoder = new TextEncoder();
const USAGE = { input: 4, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 };
const RAW = { input_tokens: 4, output_tokens: 1 };

const sse = (events: JsonObject[]): string =>
  events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join("");

const errorEvent = (type: string, message: string) => ({ type: "error", error: { type, message } });
const errorBody = (type: string, message: string) => JSON.stringify(errorEvent(type, message));

const PING = sse([{ type: "ping" }]);

const START = sse([
  { type: "message_start", message: { usage: RAW } },
  { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
  { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "hi" } },
]);

const STOP = sse([
  { type: "content_block_stop", index: 0 },
  { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 3 } },
  { type: "message_stop" },
]);

const streamOf = (chunks: string[]) => () => responseOf({ status: 200, headers: {}, chunks });

const eventsOf = async (response: () => Response, signal?: AbortSignal) => {
  const events: StreamEvent[] = [];
  const adapter = anthropic({ key: "k", fetch: async () => response() });

  for await (const event of adapter.stream({ ...badRequest, signal })) events.push(event);

  return events;
};

const failedFinish = (message: unknown, extra: Partial<ModelError> = {}) =>
  expect.objectContaining({
    type: "finish",
    reason: "error",
    error: expect.objectContaining({
      kind: "network",
      provider: "anthropic",
      retryable: false,
      message,
      ...extra,
    }),
  });

describe("anthropic errors", () => {
  it("sends the bad-request case", async () => {
    const adapter = anthropic({ key: "", fetch: replayFetch(badRequestFixture as Fixture) });

    await expect(adapter.stream(badRequest)[Symbol.asyncIterator]().next()).rejects.toMatchObject({
      status: 400,
      code: "invalid_request_error",
    });
  });

  it.each([
    {
      body: errorBody("invalid_request_error", "messages: must not be empty"),
      status: 400,
      expected: {
        kind: "bad-request",
        code: "invalid_request_error",
        message: "messages: must not be empty",
      },
    },
    {
      body: errorBody("invalid_request_error", "prompt is too long: 210000 tokens > 200000"),
      status: 400,
      expected: {
        kind: "overflow",
        code: "invalid_request_error",
        message: "prompt is too long: 210000 tokens > 200000",
      },
    },
    {
      body: errorBody("overloaded_error", "Overloaded"),
      status: 529,
      expected: {
        kind: "server",
        retryable: true,
        code: "overloaded_error",
        message: "Overloaded",
      },
    },
    { body: "not json", status: 500, expected: { kind: "server", message: "not json" } },
  ])("reads message, code and kind from a $status body", async ({ body, status, expected }) => {
    const failed = eventsOf(() => new Response(body, { status }));

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({ ...expected, status, body });
  });

  it("throws like an http error when the stream opens with an error event", async () => {
    const data = errorBody("overloaded_error", "Overloaded");
    const failed = eventsOf(streamOf([PING, `event: error\ndata: ${data}\n\n`]));

    await expect(failed).rejects.toMatchObject({
      kind: "server",
      status: 529,
      retryable: true,
      code: "overloaded_error",
      message: "Overloaded",
      body: data,
    });
  });

  it("ends with an error finish and the usage so far on an error event mid-stream", async () => {
    const events = await eventsOf(
      streamOf([START, sse([errorEvent("overloaded_error", "Overloaded")])]),
    );

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "error", usage: USAGE, raw: RAW },
      failedFinish("Overloaded", { code: "overloaded_error" }),
    ]);
  });

  it("keeps reading past data that is not JSON and ends with an error finish", async () => {
    const events = await eventsOf(streamOf([START, "data: {not json\n\n", STOP]));

    expect(events.map((event) => event.type)).toEqual([
      "text-start",
      "text",
      "text-end",
      "step-finish",
      "finish",
    ]);
    expect(events.at(-2)).toMatchObject({ type: "step-finish", reason: "stop" });
    expect(events.at(-1)).toEqual(
      failedFinish(expect.stringMatching(/^JSON parsing failed: Text: \{not json\./)),
    );
  });

  it("sends abort and ends when the request is aborted mid-stream", async () => {
    const controller = new AbortController();
    const { signal } = controller;

    const hanging = new ReadableStream<Uint8Array>({
      start(stream) {
        stream.enqueue(encoder.encode(START));
        signal.addEventListener("abort", () => stream.error(signal.reason));
      },
    });

    const events: StreamEvent[] = [];
    const adapter = anthropic({ key: "k", fetch: async () => new Response(hanging) });

    for await (const event of adapter.stream({ ...badRequest, signal })) {
      events.push(event);

      if (event.type === "text") controller.abort();
    }

    expect(events).toEqual([
      { type: "text-start", id: "0" },
      { type: "text", id: "0", delta: "hi" },
      { type: "abort" },
    ]);
  });
});
