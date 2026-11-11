import { describe, expect, it } from "vitest";
import { ModelError } from "../../../src/model-error";
import { openaiCompatible } from "../../../src/openai-compatible";
import type { StreamEvent } from "../../../src/types/stream-event";
import { badRequest } from "../cases";
import type { Fixture } from "../fixture";
import badRequestFixture from "../fixtures/openai-compatible/bad-request.json";
import { replayFetch } from "../replay-fetch";
import { responseOf } from "../response-of";

const encoder = new TextEncoder();
const DONE = "data: [DONE]\n\n";
const NO_USAGE = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

const dataOf = (value: unknown) => `data: ${JSON.stringify(value)}\n\n`;

const textChunk = (content: string, finish: string | null = null) =>
  dataOf({ choices: [{ delta: { content }, finish_reason: finish }] });

const toolChunk = (call: unknown) =>
  dataOf({ choices: [{ delta: { tool_calls: [call] }, finish_reason: "tool_calls" }] });

const streamOf = (chunks: string[]) => responseOf({ status: 200, headers: {}, chunks });

const adapterOf = (response: () => Response) =>
  openaiCompatible({
    name: "p",
    key: "k",
    baseUrl: "https://api.example.test/v1",
    fetch: async () => response(),
  });

const eventsOf = async (response: () => Response) => {
  const events: StreamEvent[] = [];

  for await (const event of adapterOf(response).stream(badRequest)) events.push(event);

  return events;
};

const failedFinish = (message: string, extra: Partial<ModelError> = {}) => ({
  type: "finish",
  reason: "error",
  usage: NO_USAGE,
  error: expect.objectContaining({
    kind: "network",
    provider: "p",
    retryable: false,
    message,
    ...extra,
  }),
});

describe("openai-compatible errors", () => {
  it("reads the recorded bad-request response into a ModelError", async () => {
    const fixture = badRequestFixture as Fixture;
    const { model } = fixture.request.body as { model: string };

    const { error } = (fixture.response as unknown as { body: { error: { message: string } } })
      .body;

    const adapter = openaiCompatible({
      name: "openrouter",
      key: "",
      baseUrl: fixture.request.url.replace(/\/chat\/completions$/, ""),
      fetch: replayFetch(fixture),
    });

    const stream = adapter.stream({ ...badRequest, model });
    const failed = stream[Symbol.asyncIterator]().next();

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({
      kind: "bad-request",
      status: 400,
      message: error.message,
      provider: "openrouter",
      retryable: false,
    });
  });

  it.each([
    {
      body: '{"error":{"message":"bad","code":"invalid_x","type":"t"}}',
      status: 400,
      expected: { kind: "bad-request", message: "bad", code: "invalid_x" },
    },
    {
      body: '{"error":{"message":"bad","code":400,"type":"t"}}',
      status: 400,
      expected: { kind: "bad-request", message: "bad", code: "t" },
    },
    { body: '{"error":"plain"}', status: 429, expected: { kind: "rate-limit", message: "plain" } },
    { body: "not json", status: 500, expected: { kind: "server", message: "not json" } },
    {
      body: '{"error":{"message":"maximum context length is 8192 tokens"}}',
      status: 400,
      expected: { kind: "overflow", message: "maximum context length is 8192 tokens" },
    },
  ])(
    "reads message, code and kind from a $status body: $body",
    async ({ body, status, expected }) => {
      const failed = eventsOf(() => new Response(body, { status }));

      await expect(failed).rejects.toBeInstanceOf(ModelError);
      await expect(failed).rejects.toMatchObject({ ...expected, status, body, provider: "p" });
    },
  );

  it("ends with an error finish when the stream sends an error object", async () => {
    const events = await eventsOf(() =>
      streamOf([textChunk("hi"), dataOf({ error: { message: "boom", type: "upstream" } }), DONE]),
    );

    expect(events.slice(-3)).toEqual([
      { type: "text-end", id: "txt-0" },
      { type: "step-finish", reason: "error", usage: NO_USAGE },
      failedFinish("boom", { code: "upstream" }),
    ]);
  });

  it("keeps reading past a chunk that is not JSON and ends with an error finish", async () => {
    const events = await eventsOf(() =>
      streamOf([textChunk("hi"), "data: {not json\n\n", textChunk(" there", "stop"), DONE]),
    );

    expect(events.filter((event) => event.type === "text").map((event) => event.delta)).toEqual([
      "hi",
      " there",
    ]);
    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "stop", usage: NO_USAGE },
      failedFinish(expect.stringMatching(/^JSON parsing failed: Text: \{not json\./)),
    ]);
  });

  it("sends abort and ends when the request is aborted mid-stream", async () => {
    const controller = new AbortController();
    const { signal } = controller;

    const hanging = new ReadableStream<Uint8Array>({
      start(stream) {
        stream.enqueue(encoder.encode(textChunk("hi")));
        signal.addEventListener("abort", () => stream.error(signal.reason));
      },
    });

    const events: StreamEvent[] = [];

    for await (const event of adapterOf(() => new Response(hanging)).stream({
      ...badRequest,
      signal,
    })) {
      events.push(event);

      if (event.type === "text") controller.abort();
    }

    expect(events).toEqual([
      { type: "text-start", id: "txt-0" },
      { type: "text", id: "txt-0", delta: "hi" },
      { type: "abort" },
    ]);
  });

  it.each([
    {
      call: { index: 0, function: { name: "known", arguments: "{}" } },
      message: "Expected 'id' to be a string.",
    },
    {
      call: { index: 0, id: "c0", function: { arguments: "{}" } },
      message: "Expected 'function.name' to be a string.",
    },
  ])("ends with an error finish on a tool call stream: $message", async ({ call, message }) => {
    const events = await eventsOf(() => streamOf([toolChunk(call), DONE]));

    expect(events).toEqual([
      { type: "step-finish", reason: "tool-calls", usage: NO_USAGE },
      failedFinish(message),
    ]);
  });
});
