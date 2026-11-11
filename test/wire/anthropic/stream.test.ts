import { describe, expect, it } from "vitest";
import { anthropic } from "../../../src/anthropic";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import type { TextRequest } from "../../../src/types/text-request";
import { file, image, reasoning, text, tools } from "../cases";
import type { Fixture } from "../fixture";
import fileFixture from "../fixtures/anthropic/file.json";
import imageFixture from "../fixtures/anthropic/image.json";
import reasoningFixture from "../fixtures/anthropic/reasoning.json";
import textFixture from "../fixtures/anthropic/text.json";
import toolsFixture from "../fixtures/anthropic/tools.json";
import { replayFetch } from "../replay-fetch";

type EventData = {
  type: string;
  message?: { usage: Record<string, number> };
  delta?: { type: string; text?: string };
  usage?: Record<string, number>;
};

const caseOf = (name: string, request: TextRequest, json: unknown) => ({
  name,
  request,
  fixture: json as Fixture,
});

const CASES = [
  caseOf("text", text, textFixture),
  caseOf("tools", tools, toolsFixture),
  caseOf("reasoning", reasoning, reasoningFixture),
  caseOf("image", image, imageFixture),
  caseOf("file", file, fileFixture),
];

const dataOf = ({ response }: Fixture): EventData[] =>
  ("chunks" in response ? response.chunks : []).map((chunk) =>
    JSON.parse(chunk.slice(chunk.indexOf("data: ") + 6)),
  );

const sse = (events: JsonObject[]): string =>
  events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join("");

const eventsOf = async (request: TextRequest, fetch: typeof globalThis.fetch) => {
  const events: StreamEvent[] = [];

  for await (const event of anthropic({ key: "k", fetch }).stream(request)) events.push(event);

  return events;
};

describe("anthropic stream", () => {
  it.each(CASES)(
    "reads the $name stream into text, finish and usage",
    async ({ request, fixture }) => {
      const { model } = fixture.request.body as { model: string };
      const data = dataOf(fixture);
      const opened = data.find(({ type }) => type === "message_start")?.message?.usage ?? {};
      const closed = data.find(({ type }) => type === "message_delta")?.usage ?? {};
      const raw = { ...opened, ...closed };
      const events = await eventsOf({ ...request, model }, replayFetch(fixture));

      const finished = {
        reason: "stop",
        usage: {
          input: raw.input_tokens + raw.cache_read_input_tokens + raw.cache_creation_input_tokens,
          output: raw.output_tokens,
          reasoning: 0,
          cacheRead: raw.cache_read_input_tokens,
          cacheWrite: raw.cache_creation_input_tokens,
        },
        raw,
      };

      expect(events.flatMap((event) => (event.type === "text" ? [event.delta] : []))).toEqual(
        data.flatMap(({ delta }) => (delta?.type === "text_delta" ? [delta.text] : [])),
      );
      expect(events[0]).toEqual({ type: "text-start", id: "0" });
      expect(events.slice(-3)).toEqual([
        { type: "text-end", id: "0" },
        { type: "step-finish", ...finished },
        { type: "finish", ...finished },
      ]);
    },
  );

  it("reads thinking, cache tokens and the one-hour cache write the way the bridge does", async () => {
    const start = {
      input_tokens: 10,
      cache_creation_input_tokens: 2000,
      cache_read_input_tokens: 300,
      cache_creation: { ephemeral_5m_input_tokens: 500, ephemeral_1h_input_tokens: 1500 },
      output_tokens: 1,
    };

    const delta = {
      cache_creation_input_tokens: null,
      output_tokens: 42,
      output_tokens_details: { thinking_tokens: 30 },
    };

    const body = sse([
      { type: "message_start", message: { id: "m", usage: start } },
      { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "" } },
      { type: "ping" },
      { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Hm." } },
      { type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "s" } },
      { type: "content_block_stop", index: 0 },
      { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
      { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Hi" } },
      { type: "content_block_stop", index: 1 },
      { type: "message_delta", delta: { stop_reason: "max_tokens" }, usage: delta },
      { type: "message_stop" },
    ]);

    const finished = {
      reason: "length",
      usage: { input: 2310, output: 42, reasoning: 30, cacheRead: 300, cacheWrite: 2000 },
      raw: { ...start, ...delta },
    };

    const events = await eventsOf({ ...text, model: "claude-sonnet-4-5" }, async () => {
      return new Response(body, { headers: { "content-type": "text/event-stream" } });
    });

    expect(events).toEqual([
      { type: "reasoning", delta: "Hm." },
      { type: "reasoning", delta: "" },
      { type: "text-start", id: "1" },
      { type: "text", id: "1", delta: "Hi" },
      { type: "text-end", id: "1" },
      { type: "step-finish", ...finished },
      { type: "finish", ...finished },
    ]);
  });
});
