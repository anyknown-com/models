import { describe, expect, it } from "vitest";
import { bedrock } from "../../../src/bedrock";
import { readEventStream } from "../../../src/bedrock/read-event-stream";
import type { JsonObject, JsonValue } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import type { TextRequest } from "../../../src/types/text-request";
import { file, fileDocx, image, reasoning, text } from "../cases";
import type { Fixture } from "../fixture";
import fileDocxJson from "../fixtures/bedrock/file-docx.json";
import fileJson from "../fixtures/bedrock/file.json";
import imageJson from "../fixtures/bedrock/image.json";
import reasoningJson from "../fixtures/bedrock/reasoning.json";
import textJson from "../fixtures/bedrock/text.json";
import { replayFetch } from "../replay-fetch";
import { responseOf } from "../response-of";
import { BASE_URL } from "./sent-request";
import { eventFrame } from "./frames";

const model = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const USAGE = { inputTokens: 12, outputTokens: 7, totalTokens: 19 };
const COUNTED = { input: 12, output: 7, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

const delta = (index: number, value: JsonObject) =>
  eventFrame("contentBlockDelta", { contentBlockIndex: index, delta: value, p: "abc" });

const textDelta = (index: number, value: string) => delta(index, { text: value });

const reasoningDelta = (index: number, value: JsonObject) =>
  delta(index, { reasoningContent: value });

const blockStop = (index: number) => eventFrame("contentBlockStop", { contentBlockIndex: index });

const messageStop = (stopReason: JsonValue) =>
  eventFrame("messageStop", { stopReason, p: "abcdef" });

const metadata = (usage: JsonValue = USAGE) =>
  eventFrame("metadata", { usage, metrics: { latencyMs: 300 }, p: "ab" });

const START = eventFrame("messageStart", { role: "assistant" });
const HELLO = [START, textDelta(0, "Hel"), textDelta(0, "lo"), blockStop(0)];
const END = [messageStop("end_turn"), metadata()];

const responseWith = (frames: number[][]) =>
  new Response(Uint8Array.from(frames.flat()), {
    headers: { "content-type": "application/vnd.amazon.eventstream" },
  });

const eventsOf = async (fetch: typeof globalThis.fetch, request: TextRequest = text) => {
  const events: StreamEvent[] = [];
  const adapter = bedrock({ key: "k", fetch, baseUrl: BASE_URL });

  for await (const event of adapter.stream({ ...request, model })) events.push(event);

  return events;
};

const streamOf = (frames: number[][]) => eventsOf(async () => responseWith(frames));

const finishOf = (reason: string, usage = COUNTED, raw: JsonObject = USAGE) => [
  { type: "step-finish", reason, usage, raw },
  { type: "finish", reason, usage, raw },
];

const failedFinish = (message: unknown) =>
  expect.objectContaining({
    type: "finish",
    reason: "error",
    error: expect.objectContaining({
      kind: "network",
      provider: "bedrock",
      retryable: false,
      message,
    }),
  });

const typesOf = (events: StreamEvent[]) => events.map((event) => event.type);

const payloadsOf = async (fixture: Fixture) => {
  const decoder = new TextDecoder();
  const payloads: { type: string; data: JsonObject }[] = [];
  const body = responseOf(fixture.response).body ?? new Blob().stream();

  for await (const { headers, payload } of readEventStream(body)) {
    payloads.push({
      type: headers[":event-type"] ?? "",
      data: JSON.parse(decoder.decode(payload)),
    });
  }

  return payloads;
};

const FIXTURE_CASES = [
  { name: "text", request: text, json: textJson },
  { name: "reasoning", request: reasoning, json: reasoningJson },
  { name: "image", request: image, json: imageJson },
  { name: "file", request: file, json: fileJson },
  { name: "file-docx", request: fileDocx, json: fileDocxJson },
];

const unverified = FIXTURE_CASES.filter(({ json }) => json.unverified).map(({ name }) => name);

describe.skipIf(unverified.length > 0)(
  `bedrock fixture stream (skipped while unverified: ${unverified.join(", ")})`,
  () => {
    it.each(FIXTURE_CASES)("reads the $name stream into text, finish and usage", async (each) => {
      const fixture = each.json as unknown as Fixture;
      const payloads = await payloadsOf(fixture);
      const usage = payloads.find(({ type }) => type === "metadata")?.data.usage as JsonObject;
      const events = await eventsOf(replayFetch(fixture), each.request);

      expect(events.flatMap((event) => (event.type === "text" ? [event.delta] : []))).toEqual(
        payloads.flatMap(({ type, data }) =>
          type === "contentBlockDelta" && typeof (data.delta as JsonObject).text === "string"
            ? [(data.delta as JsonObject).text]
            : [],
        ),
      );
      expect(events.at(-1)).toMatchObject({ type: "finish", reason: "stop", raw: usage });
    });
  },
);

describe("bedrock stream", () => {
  it("reads text deltas into one text block, the stop reason and the usage", async () => {
    expect(await streamOf([...HELLO, ...END])).toEqual([
      { type: "text-start", id: "0" },
      { type: "text", id: "0", delta: "Hel" },
      { type: "text", id: "0", delta: "lo" },
      { type: "text-end", id: "0" },
      ...finishOf("stop"),
    ]);
  });

  it("reads reasoning text, signature and redacted data the way the bridge does", async () => {
    const events = await streamOf([
      START,
      reasoningDelta(0, { text: "Think" }),
      reasoningDelta(0, { text: "ing." }),
      reasoningDelta(0, { signature: "sig" }),
      blockStop(0),
      reasoningDelta(1, { data: "encrypted" }),
      reasoningDelta(1, { redactedContent: "hidden" }),
      blockStop(1),
      textDelta(2, "Answer"),
      blockStop(2),
      ...END,
    ]);

    expect(events).toEqual([
      { type: "reasoning", delta: "Think" },
      { type: "reasoning", delta: "ing." },
      { type: "reasoning", delta: "" },
      { type: "reasoning", delta: "" },
      { type: "text-start", id: "2" },
      { type: "text", id: "2", delta: "Answer" },
      { type: "text-end", id: "2" },
      ...finishOf("stop"),
    ]);
  });

  it("opens a text block on a block start and skips empty text", async () => {
    const events = await streamOf([
      START,
      eventFrame("contentBlockStart", { contentBlockIndex: 0, start: {} }),
      textDelta(0, ""),
      textDelta(0, "Hi"),
      blockStop(0),
      ...END,
    ]);

    expect(typesOf(events)).toEqual(["text-start", "text", "text-end", "step-finish", "finish"]);
  });

  it("adds cache reads and writes to the input and keeps the whole usage as raw", async () => {
    const usage = {
      inputTokens: 3,
      outputTokens: 5,
      totalTokens: 2008,
      cacheReadInputTokens: 1500,
      cacheWriteInputTokens: 500,
      cacheDetails: [{ inputTokens: 500, ttl: "5m" }],
    };

    const events = await streamOf([...HELLO, messageStop("end_turn"), metadata(usage)]);
    const counted = { input: 2003, output: 5, reasoning: 0, cacheRead: 1500, cacheWrite: 500 };

    expect(events.slice(-2)).toEqual(finishOf("stop", counted, usage));
  });

  it.each([
    ["end_turn", "stop"],
    ["stop_sequence", "stop"],
    ["max_tokens", "length"],
    ["content_filtered", "content-filter"],
    ["guardrail_intervened", "content-filter"],
    ["tool_use", "tool-calls"],
    ["model_context_window_exceeded", "other"],
  ])("reads the stop reason %s as %s", async (stopReason, reason) => {
    const events = await streamOf([...HELLO, messageStop(stopReason), metadata()]);

    expect(events.slice(-2)).toEqual(finishOf(reason));
  });

  it("ends a stream without a message stop as a network error with the usage it got", async () => {
    const events = await streamOf([...HELLO, metadata()]);

    expect(events.at(-2)).toEqual({
      type: "step-finish",
      reason: "error",
      usage: COUNTED,
      raw: USAGE,
    });
    expect(events.at(-1)).toEqual(failedFinish("Response stream ended without a finish reason."));
  });

  it("keeps reading past a payload that is not JSON and ends with an error finish", async () => {
    const events = await streamOf([...HELLO, eventFrame("contentBlockDelta", "{nope"), ...END]);

    expect(events.at(-2)).toEqual(finishOf("stop")[0]);
    expect(events.at(-1)).toEqual(
      failedFinish(expect.stringMatching(/^JSON parsing failed: Text: \{nope\./)),
    );
  });

  it.each([
    { field: "contentBlockDelta.delta.text", frame: textDelta(0, 5 as unknown as string) },
    { field: "contentBlockDelta.contentBlockIndex", frame: delta("0" as unknown as number, {}) },
    { field: "contentBlockStop.contentBlockIndex", frame: blockStop("0" as unknown as number) },
    {
      field: "contentBlockDelta.delta.reasoningContent.signature",
      frame: reasoningDelta(0, { signature: 1 }),
    },
  ])(
    "skips a frame whose $field has the wrong type and ends with an error finish",
    async ({ field, frame }) => {
      const events = await streamOf([...HELLO, frame, ...END]);

      expect(events.at(-2)).toEqual(finishOf("stop")[0]);
      expect(events.at(-1)).toEqual(
        failedFinish(
          expect.stringMatching(
            new RegExp(`^Type validation failed: Value: \\{.*${field} is not a`, "s"),
          ),
        ),
      );
    },
  );

  it.each([
    { field: "messageStop.stopReason", frames: [messageStop(5), metadata()] },
    {
      field: "metadata.usage.inputTokens",
      frames: [messageStop("end_turn"), metadata({ inputTokens: "1", outputTokens: 2 })],
    },
    {
      field: "metadata.usage.outputTokens",
      frames: [messageStop("end_turn"), metadata({ inputTokens: 1 })],
    },
  ])("fails the step when $field has the wrong type", async ({ field, frames }) => {
    const events = await streamOf([...HELLO, ...frames]);

    expect(events.at(-2)).toMatchObject({ type: "step-finish", reason: "error" });
    expect(events.at(-1)).toEqual(
      failedFinish(expect.stringMatching(new RegExp(`${field} is not a`))),
    );
  });

  it("sends abort and ends when the request is aborted mid-stream", async () => {
    const controller = new AbortController();
    const { signal } = controller;

    const hanging = new ReadableStream<Uint8Array>({
      start(stream) {
        stream.enqueue(Uint8Array.from(HELLO.slice(0, 2).flat()));
        signal.addEventListener("abort", () => stream.error(signal.reason));
      },
    });

    const events: StreamEvent[] = [];

    const adapter = bedrock({
      key: "k",
      fetch: async () => new Response(hanging),
      baseUrl: BASE_URL,
    });

    for await (const event of adapter.stream({ ...text, model, signal })) {
      events.push(event);

      if (event.type === "text") controller.abort();
    }

    expect(events).toEqual([
      { type: "text-start", id: "0" },
      { type: "text", id: "0", delta: "Hel" },
      { type: "abort" },
    ]);
  });
});
