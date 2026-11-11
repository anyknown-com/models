import { describe, expect, it } from "vitest";
import { ModelError } from "../../../src/model-error";
import { openai } from "../../../src/openai";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import { badRequest } from "../cases";
import type { Fixture } from "../fixture";
import badRequestFixture from "../fixtures/openai/bad-request.json";
import { replayFetch } from "../replay-fetch";
import { responseOf } from "../response-of";

const encoder = new TextEncoder();
const NO_USAGE = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 };
const RAW = { input_tokens: 7, output_tokens: 2 };
const USAGE = { ...NO_USAGE, input: 7, output: 2 };

const sse = (events: JsonObject[]): string =>
  events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join("");

const message = { id: "msg_1", type: "message", role: "assistant", content: [] };
const created = { type: "response.created", response: { id: "resp_1", usage: null } };
const added = { type: "response.output_item.added", output_index: 0, item: message };
const done = { type: "response.output_item.done", output_index: 0, item: message };
const completed = { type: "response.completed", response: { usage: RAW } };

const delta = (text: string) => ({
  type: "response.output_text.delta",
  item_id: "msg_1",
  output_index: 0,
  delta: text,
});

const START = sse([created, added, delta("hi")]);
const STOP = sse([done, completed]);

const streamOf = (chunks: string[]) => () => responseOf({ status: 200, headers: {}, chunks });

const eventsOf = async (response: () => Response) => {
  const events: StreamEvent[] = [];
  const adapter = openai({ key: "k", fetch: async () => response() });

  for await (const event of adapter.stream(badRequest)) events.push(event);

  return events;
};

const failedFinish = (text: unknown, extra: Partial<ModelError> = {}) =>
  expect.objectContaining({
    type: "finish",
    reason: "error",
    error: expect.objectContaining({
      kind: "network",
      provider: "openai",
      retryable: false,
      message: text,
      ...extra,
    }),
  });

describe("openai errors", () => {
  it("reads the bad-request response into a ModelError", async () => {
    const fixture = badRequestFixture as Fixture;
    const { model } = fixture.request.body as { model: string };
    const { body } = fixture.response as unknown as { body: { error: JsonObject } };
    const adapter = openai({ key: "", fetch: replayFetch(fixture) });
    const stream = adapter.stream({ ...badRequest, model });
    const failed = stream[Symbol.asyncIterator]().next();

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({
      kind: "bad-request",
      status: 400,
      code: body.error.code,
      message: body.error.message,
      provider: "openai",
      retryable: false,
    });
  });

  it.each([
    {
      body: '{"error":{"message":"bad","type":"invalid_request_error","code":"invalid_x"}}',
      status: 400,
      expected: { kind: "bad-request", message: "bad", code: "invalid_x" },
    },
    {
      body: '{"error":{"message":"bad","type":"invalid_request_error","code":null}}',
      status: 400,
      expected: { kind: "bad-request", message: "bad", code: "invalid_request_error" },
    },
    {
      body: '{"error":{"message":"slow down","type":"requests","code":"rate_limit_exceeded"}}',
      status: 429,
      expected: { kind: "rate-limit", retryable: true, code: "rate_limit_exceeded" },
    },
    {
      body: '{"error":{"message":"Your input exceeds the context window of this model.","type":"invalid_request_error","code":"context_length_exceeded"}}',
      status: 400,
      expected: { kind: "overflow", code: "context_length_exceeded" },
    },
    { body: "not json", status: 500, expected: { kind: "server", message: "not json" } },
  ])(
    "reads message, code and kind from a $status body: $body",
    async ({ body, status, expected }) => {
      const failed = eventsOf(() => new Response(body, { status }));

      await expect(failed).rejects.toBeInstanceOf(ModelError);
      await expect(failed).rejects.toMatchObject({ ...expected, status, body, provider: "openai" });
    },
  );

  it.each([
    {
      name: "a nested error event",
      event: {
        type: "error",
        error: { type: "insufficient_quota", code: "insufficient_quota", message: "No quota." },
      },
      expected: { kind: "rate-limit", status: 429, retryable: false, code: "insufficient_quota" },
    },
    {
      name: "a flat error event",
      event: { type: "error", code: "server_error", message: "No quota." },
      expected: { kind: "server", status: 500, retryable: true, code: "server_error" },
    },
    {
      name: "a failed response",
      event: {
        type: "response.failed",
        response: { error: { code: "context_length_exceeded", message: "No quota." } },
      },
      expected: {
        kind: "overflow",
        status: 400,
        retryable: false,
        code: "context_length_exceeded",
      },
    },
  ])("throws like an http error when the stream opens with $name", async ({ event, expected }) => {
    const data = JSON.stringify(event);
    const failed = eventsOf(streamOf([sse([created]), `event: x\ndata: ${data}\n\n`]));

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({ ...expected, message: "No quota.", body: data });
  });

  it("ends with an error finish on an error event mid-stream", async () => {
    const error = { type: "error", code: "server_error", message: "boom" };
    const events = await eventsOf(streamOf([START, sse([error])]));

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "error", usage: NO_USAGE },
      failedFinish("boom", { code: "server_error" }),
    ]);
  });

  it("ends with an error finish and the usage of a failed response mid-stream", async () => {
    const failed = {
      type: "response.failed",
      response: { error: { code: "server_error", message: "boom" }, usage: RAW },
    };

    const events = await eventsOf(streamOf([START, sse([failed])]));

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "error", usage: USAGE, raw: RAW },
      failedFinish("boom", { code: "server_error" }),
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
    expect(events.at(-2)).toEqual({ type: "step-finish", reason: "error", usage: USAGE, raw: RAW });
    expect(events.at(-1)).toEqual(
      failedFinish(expect.stringMatching(/^JSON parsing failed: Text: \{not json\./)),
    );
  });

  it.each<{ name: string; event: JsonObject; field: string }>([
    {
      name: "a text delta that is not a string",
      event: { ...delta("x"), delta: 5 },
      field: "delta",
    },
    { name: "an item without an object", event: { ...added, item: "msg_1" }, field: "item" },
    {
      name: "usage that is not a number",
      event: { ...completed, response: { usage: { input_tokens: "7" } } },
      field: "response.usage.input_tokens",
    },
    { name: "a type that is not a string", event: { type: 5, delta: "x" }, field: "type" },
  ])("ends with an error finish on $name", async ({ event, field }) => {
    const events = await eventsOf(streamOf([START, sse([event]), STOP]));

    expect(events.at(-1)).toEqual(
      failedFinish(
        expect.stringMatching(new RegExp(`^Type validation failed: .*${field} is not`, "s")),
      ),
    );
  });

  it("ends with an error finish on data that is not an object", async () => {
    const events = await eventsOf(streamOf([START, "data: 5\n\n", STOP]));

    expect(events.at(-1)).toEqual(failedFinish(expect.stringMatching(/the event is number/)));
  });

  it("skips an event of a type it does not read, whatever its fields", async () => {
    const unknown = { type: "response.content_part.added", delta: 5, item: "x" };
    const events = await eventsOf(streamOf([START, sse([unknown]), STOP]));

    expect(events.at(-1)).toEqual({ type: "finish", reason: "stop", usage: USAGE, raw: RAW });
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
    const adapter = openai({ key: "k", fetch: async () => new Response(hanging) });

    for await (const event of adapter.stream({ ...badRequest, signal })) {
      events.push(event);

      if (event.type === "text") controller.abort();
    }

    expect(events).toEqual([
      { type: "text-start", id: "msg_1" },
      { type: "text", id: "msg_1", delta: "hi" },
      { type: "abort" },
    ]);
  });
});
