import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";
import { ModelError } from "../../../src/model-error";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import { badRequest } from "../cases";
import type { Fixture } from "../fixture";
import badRequestFixture from "../fixtures/google/bad-request.json";
import { replayFetch } from "../replay-fetch";
import { responseOf } from "../response-of";

const encoder = new TextEncoder();
const RAW = { promptTokenCount: 4, candidatesTokenCount: 3, totalTokenCount: 7 };
const USAGE = { input: 4, output: 3, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

const sse = (chunks: unknown[]): string =>
  chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\r\n\r\n`).join("");

const chunk = (parts: unknown[], extra: JsonObject = {}) => ({
  candidates: [{ content: { parts, role: "model" }, index: 0, ...extra }],
});

const errorBody = (code: number, status: string, message: string) =>
  JSON.stringify({ error: { code, message, status } });

const START = sse([chunk([{ text: "hi" }])]);
const STOP = sse([{ ...chunk([{ text: "!" }], { finishReason: "STOP" }), usageMetadata: RAW }]);

const streamOf = (chunks: string[]) => () => responseOf({ status: 200, headers: {}, chunks });

const eventsOf = async (response: () => Response, signal?: AbortSignal) => {
  const events: StreamEvent[] = [];
  const adapter = google({ key: "k", fetch: async () => response() });

  for await (const event of adapter.stream({ ...badRequest, signal })) events.push(event);

  return events;
};

const failedFinish = (message: unknown, extra: Partial<ModelError> = {}) =>
  expect.objectContaining({
    type: "finish",
    reason: "error",
    error: expect.objectContaining({
      kind: "network",
      provider: "google",
      retryable: false,
      message,
      ...extra,
    }),
  });

const typesOf = (events: StreamEvent[]) => events.map((event) => event.type);

describe("google errors", () => {
  it("reads the recorded bad-request response into a ModelError", async () => {
    const fixture = badRequestFixture as Fixture;
    const response = fixture.response as unknown as { body: { error: { message: string } } };
    const adapter = google({ key: "", fetch: replayFetch(fixture) });
    const stream = adapter.stream({ ...badRequest, model: "gemini-2.5-flash" });
    const failed = stream[Symbol.asyncIterator]().next();

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({
      kind: "bad-request",
      status: 400,
      code: "INVALID_ARGUMENT",
      message: response.body.error.message,
      provider: "google",
      retryable: false,
    });
  });

  it.each([
    {
      body: errorBody(400, "INVALID_ARGUMENT", "contents is not specified"),
      status: 400,
      expected: {
        kind: "bad-request",
        code: "INVALID_ARGUMENT",
        message: "contents is not specified",
      },
    },
    {
      body: errorBody(
        400,
        "INVALID_ARGUMENT",
        "The input token count (1200000) exceeds the maximum number of tokens allowed (1048576).",
      ),
      status: 400,
      expected: { kind: "overflow", code: "INVALID_ARGUMENT" },
    },
    {
      body: errorBody(429, "RESOURCE_EXHAUSTED", "Resource has been exhausted"),
      status: 429,
      expected: { kind: "rate-limit", retryable: true, code: "RESOURCE_EXHAUSTED" },
    },
    {
      body: errorBody(503, "UNAVAILABLE", "The model is overloaded."),
      status: 503,
      expected: { kind: "server", retryable: true, code: "UNAVAILABLE" },
    },
    { body: "not json", status: 500, expected: { kind: "server", message: "not json" } },
  ])("reads message, code and kind from a $status body", async ({ body, status, expected }) => {
    const failed = eventsOf(() => new Response(body, { status }));

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({ ...expected, status, body });
  });

  it.each([
    { name: "no candidates", blocked: { promptFeedback: { blockReason: "SAFETY" } } },
    {
      name: "a candidate without a finish reason",
      blocked: { ...chunk([]), promptFeedback: { blockReason: "PROHIBITED_CONTENT" } },
    },
  ])("finishes with content-filter when the prompt is blocked with $name", async ({ blocked }) => {
    const events = await eventsOf(streamOf([sse([{ ...blocked, usageMetadata: RAW }])]));

    expect(events).toEqual([
      { type: "step-finish", reason: "content-filter", usage: USAGE, raw: RAW },
      { type: "finish", reason: "content-filter", usage: USAGE, raw: RAW },
    ]);
  });

  it("ends with an error finish on an error object mid-stream", async () => {
    const data = errorBody(503, "UNAVAILABLE", "The model is overloaded.");
    const events = await eventsOf(streamOf([START, `data: ${data}\r\n\r\n`]));

    expect(events.at(-1)).toEqual(
      failedFinish("The model is overloaded.", { code: "UNAVAILABLE" }),
    );
  });

  it("keeps reading past data that is not JSON and ends with an error finish", async () => {
    const events = await eventsOf(streamOf([START, "data: {not json\r\n\r\n", STOP]));

    expect(typesOf(events)).toEqual([
      "text-start",
      "text",
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

  it.each([
    { field: "candidates.0.content.parts.0.text", mistyped: chunk([{ text: 5 }]) },
    { field: "candidates.0.content.parts.0", mistyped: chunk([null]) },
    {
      field: "candidates.0.content.parts.1.functionCall.name",
      mistyped: chunk([{}, { functionCall: { name: 1 } }]),
    },
    { field: "candidates.0.finishReason", mistyped: chunk([], { finishReason: 1 }) },
    {
      field: "usageMetadata.promptTokenCount",
      mistyped: { usageMetadata: { promptTokenCount: "4" } },
    },
    { field: "promptFeedback.blockReason", mistyped: { promptFeedback: { blockReason: true } } },
  ])(
    "skips a chunk whose $field has the wrong type and ends with an error finish",
    async ({ field, mistyped }) => {
      const events = await eventsOf(streamOf([START, sse([mistyped]), STOP]));

      expect(typesOf(events)).toEqual([
        "text-start",
        "text",
        "text",
        "text-end",
        "step-finish",
        "finish",
      ]);
      expect(events.at(-2)).toEqual({
        type: "step-finish",
        reason: "stop",
        usage: USAGE,
        raw: RAW,
      });
      expect(events.at(-1)).toEqual(
        failedFinish(
          expect.stringMatching(new RegExp(`^Type validation failed: .*${field} is not a`, "s")),
        ),
      );
    },
  );

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
    const adapter = google({ key: "k", fetch: async () => new Response(hanging) });

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
