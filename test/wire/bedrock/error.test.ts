import { describe, expect, it } from "vitest";
import { bedrock } from "../../../src/bedrock";
import { ModelError } from "../../../src/model-error";
import type { StreamEvent } from "../../../src/types/stream-event";
import { badRequest } from "../cases";
import type { Fixture } from "../fixture";
import badRequestFixture from "../fixtures/bedrock/bad-request.json";
import { replayFetch } from "../replay-fetch";
import { BASE_URL } from "./sent-request";
import { eventFrame, frame, stringHeader } from "./frames";

const model = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
const NONE = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 };
const OVERFLOW = "Input is too long for requested model.";

const errorType = (name: string) => `${name}:http://internal.amazon.com/coral/com.amazon.bedrock/`;

const exceptionFrame = (type: string, payload: string) =>
  frame(
    [
      ...stringHeader(":exception-type", type),
      ...stringHeader(":content-type", "application/json"),
      ...stringHeader(":message-type", "exception"),
    ],
    payload,
  );

const START = [
  eventFrame("messageStart", { role: "assistant" }),
  eventFrame("contentBlockDelta", { contentBlockIndex: 0, delta: { text: "hi" } }),
];

const bytesOf = (frames: number[][]) => Uint8Array.from(frames.flat());

const eventsOf = async (response: () => Response, signal?: AbortSignal) => {
  const events: StreamEvent[] = [];
  const adapter = bedrock({ key: "k", fetch: async () => response(), baseUrl: BASE_URL });

  for await (const event of adapter.stream({ ...badRequest, model, signal })) events.push(event);

  return events;
};

const streamOf = (frames: number[][]) => () => new Response(bytesOf(frames));

describe("bedrock errors", () => {
  it("reads the bad-request response into a ModelError", async () => {
    const fixture = badRequestFixture as Fixture;
    const response = fixture.response as unknown as { body: { message: string } };
    const adapter = bedrock({ key: "", fetch: replayFetch(fixture), baseUrl: BASE_URL });
    const stream = adapter.stream({ ...badRequest, model });
    const failed = stream[Symbol.asyncIterator]().next();

    await expect(failed).rejects.toBeInstanceOf(ModelError);
    await expect(failed).rejects.toMatchObject({
      kind: "bad-request",
      status: 400,
      code: "ValidationException",
      message: response.body.message,
      provider: "bedrock",
      retryable: false,
    });
  });

  it.each([
    {
      status: 400,
      body: JSON.stringify({ message: OVERFLOW }),
      type: errorType("ValidationException"),
      expected: {
        kind: "overflow",
        retryable: false,
        code: "ValidationException",
        message: OVERFLOW,
      },
    },
    {
      status: 429,
      body: JSON.stringify({ message: "Too many requests." }),
      type: errorType("ThrottlingException"),
      expected: {
        kind: "rate-limit",
        retryable: true,
        code: "ThrottlingException",
        message: "Too many requests.",
      },
    },
    {
      status: 503,
      body: "upstream error",
      type: undefined,
      expected: { kind: "server", retryable: true, code: undefined, message: "upstream error" },
    },
  ])(
    "reads message, code and kind from a $status body",
    async ({ status, body, type, expected }) => {
      const headers: Record<string, string> = type ? { "x-amzn-errortype": type } : {};
      const failed = eventsOf(() => new Response(body, { status, headers }));

      await expect(failed).rejects.toBeInstanceOf(ModelError);
      await expect(failed).rejects.toMatchObject({ ...expected, status, body });
    },
  );

  it.each([
    ["throttlingException", '{"message":"slow down"}', "rate-limit", true, "slow down"],
    ["modelStreamErrorException", '{"message":"model failed"}', "server", true, "model failed"],
    ["validationException", JSON.stringify({ message: OVERFLOW }), "overflow", false, OVERFLOW],
    ["somethingNewException", "{}", "server", false, "{}"],
  ])("ends with an error finish on a %s frame", async (type, payload, kind, retryable, message) => {
    const events = await eventsOf(streamOf([...START, exceptionFrame(type, payload)]));

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "error", usage: NONE },
      {
        type: "finish",
        reason: "error",
        usage: NONE,
        error: expect.objectContaining({ kind, retryable, code: type, message }),
      },
    ]);
  });

  it("sends abort and ends when the request is aborted mid-stream", async () => {
    const controller = new AbortController();
    const { signal } = controller;

    const hanging = new ReadableStream<Uint8Array>({
      start(stream) {
        stream.enqueue(bytesOf(START));
        signal.addEventListener("abort", () => stream.error(signal.reason));
      },
    });

    const events: StreamEvent[] = [];

    const adapter = bedrock({
      key: "k",
      fetch: async () => new Response(hanging),
      baseUrl: BASE_URL,
    });

    for await (const event of adapter.stream({ ...badRequest, model, signal })) {
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
