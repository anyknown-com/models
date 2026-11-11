import { describe, expect, it } from "vitest";
import { openai } from "../../../src/openai";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import type { TextRequest } from "../../../src/types/text-request";
import { file, fileDocx, image, reasoning, text, tools } from "../cases";
import type { Fixture } from "../fixture";
import fileDocxFixture from "../fixtures/openai/file-docx.json";
import fileFixture from "../fixtures/openai/file.json";
import imageFixture from "../fixtures/openai/image.json";
import reasoningFixture from "../fixtures/openai/reasoning.json";
import textFixture from "../fixtures/openai/text.json";
import toolsFixture from "../fixtures/openai/tools.json";
import { replayFetch } from "../replay-fetch";

type EventData = {
  type: string;
  delta?: string;
  response?: { usage?: Record<string, number> };
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
  caseOf("file-docx", fileDocx, fileDocxFixture),
];

const unverified = CASES.filter(({ fixture }) => fixture.unverified).map(({ name }) => name);

const dataOf = ({ response }: Fixture): EventData[] =>
  ("chunks" in response ? response.chunks : []).map((chunk) =>
    JSON.parse(chunk.slice(chunk.indexOf("data: ") + 6)),
  );

const sse = (events: JsonObject[]): string =>
  events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join("");

const eventsOf = async (request: TextRequest, fetch: typeof globalThis.fetch) => {
  const events: StreamEvent[] = [];

  for await (const event of openai({ key: "k", fetch }).stream(request)) events.push(event);

  return events;
};

const replyOf = (body: string) => async () =>
  new Response(body, { headers: { "content-type": "text/event-stream" } });

const deltasOf = (data: EventData[], type: string) =>
  data.flatMap((each) => (each.type === type ? [each.delta] : []));

const message = { id: "msg_1", type: "message", role: "assistant", content: [] };
const summary = { id: "rs_1", type: "reasoning", summary: [] };

const summaryDelta = (summary_index: number, delta: string) => ({
  type: "response.reasoning_summary_text.delta",
  item_id: "rs_1",
  output_index: 0,
  summary_index,
  delta,
});

describe.skipIf(unverified.length > 0)(
  `openai fixture stream${unverified.length > 0 ? ` (skipped: ${unverified.join(", ")} unverified)` : ""}`,
  () => {
    it.each(CASES)(
      "reads the $name stream into text, reasoning, finish and usage",
      async ({ request, fixture }) => {
        const { model } = fixture.request.body as { model: string };
        const data = dataOf(fixture);
        const raw = data.find(({ type }) => type === "response.completed")?.response?.usage ?? {};

        const details = (key: string, field: string) =>
          (raw[key] as unknown as Record<string, number> | undefined)?.[field] ?? 0;

        const events = await eventsOf({ ...request, model }, replayFetch(fixture));

        const finished = {
          reason: "stop",
          usage: {
            input: raw.input_tokens,
            output: raw.output_tokens,
            reasoning: details("output_tokens_details", "reasoning_tokens"),
            cacheRead: details("input_tokens_details", "cached_tokens"),
            cacheWrite: details("input_tokens_details", "cache_write_tokens"),
          },
          raw,
        };

        expect(events.flatMap((event) => (event.type === "text" ? [event.delta] : []))).toEqual(
          deltasOf(data, "response.output_text.delta"),
        );
        expect(
          events.flatMap((event) => (event.type === "reasoning" ? [event.delta] : [])),
        ).toEqual(deltasOf(data, "response.reasoning_summary_text.delta"));
        expect(events.slice(-2)).toEqual([
          { type: "step-finish", ...finished },
          { type: "finish", ...finished },
        ]);
      },
    );
  },
);

describe("openai stream", () => {
  it("reads reasoning summaries, text by item id, cached and reasoning tokens the way the bridge does", async () => {
    const usage = {
      input_tokens: 2000,
      input_tokens_details: { cached_tokens: 1536 },
      output_tokens: 120,
      output_tokens_details: { reasoning_tokens: 64 },
      total_tokens: 2120,
    };

    const body = sse([
      { type: "response.created", response: { id: "resp_1", usage: null } },
      { type: "response.output_item.added", output_index: 0, item: summary },
      summaryDelta(0, "First "),
      summaryDelta(0, "part."),
      summaryDelta(1, "Second."),
      { type: "response.output_item.done", output_index: 0, item: summary },
      { type: "response.output_item.added", output_index: 1, item: message },
      { type: "response.output_text.delta", item_id: "msg_1", output_index: 1, delta: "Hi" },
      { type: "response.output_text.done", item_id: "msg_1", output_index: 1, text: "Hi" },
      { type: "response.output_item.done", output_index: 1, item: message },
      {
        type: "response.incomplete",
        response: { incomplete_details: { reason: "max_output_tokens" }, usage },
      },
    ]);

    const finished = {
      reason: "length",
      usage: { input: 2000, output: 120, reasoning: 64, cacheRead: 1536, cacheWrite: 0 },
      raw: usage,
    };

    const events = await eventsOf({ ...text, model: "gpt-6-luna" }, replyOf(body));

    expect(events).toEqual([
      { type: "reasoning", delta: "First " },
      { type: "reasoning", delta: "part." },
      { type: "reasoning", delta: "Second." },
      { type: "text-start", id: "msg_1" },
      { type: "text", id: "msg_1", delta: "Hi" },
      { type: "text-end", id: "msg_1" },
      { type: "step-finish", ...finished },
      { type: "finish", ...finished },
    ]);
  });

  it("ends a stream without a completed response as a network error", async () => {
    const body = sse([
      { type: "response.output_item.added", output_index: 0, item: message },
      { type: "response.output_text.delta", item_id: "msg_1", output_index: 0, delta: "Hi" },
    ]);

    const events = await eventsOf({ ...text, model: "gpt-6-luna" }, replyOf(body));
    const empty = { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "error", usage: empty },
      {
        type: "finish",
        reason: "error",
        usage: empty,
        error: expect.objectContaining({ kind: "network" }),
      },
    ]);
  });
});
