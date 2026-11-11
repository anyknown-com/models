import { describe, expect, it } from "vitest";
import { google } from "../../../src/google";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import type { TextRequest } from "../../../src/types/text-request";
import { file, image, reasoning, text, tools } from "../cases";
import type { Fixture } from "../fixture";
import fileFixture from "../fixtures/google/file.json";
import imageFixture from "../fixtures/google/image.json";
import reasoningFixture from "../fixtures/google/reasoning.json";
import textFixture from "../fixtures/google/text.json";
import toolsFixture from "../fixtures/google/tools.json";
import { replayFetch } from "../replay-fetch";

type Part = { text?: string; thought?: boolean };

type Chunk = {
  candidates?: { content?: { parts?: Part[] }; finishReason?: string }[];
  usageMetadata?: Record<string, number>;
};

const MODEL = "gemini-2.5-flash";

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

const unverified = CASES.filter(({ fixture }) => fixture.unverified).map(({ name }) => name);

const chunksOf = ({ response }: Fixture): Chunk[] =>
  ("chunks" in response ? response.chunks : []).map((chunk) =>
    JSON.parse(chunk.slice(chunk.indexOf("data: ") + 6)),
  );

const lastUsageOf = (chunks: Chunk[]) =>
  chunks.reduce<Record<string, number>>((last, { usageMetadata }) => usageMetadata ?? last, {});

const sse = (chunks: JsonObject[]): string =>
  chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\r\n\r\n`).join("");

const chunk = (parts: JsonObject[], finishReason?: string, usageMetadata?: JsonObject) => ({
  candidates: [
    { content: { parts, role: "model" }, index: 0, ...(finishReason ? { finishReason } : {}) },
  ],
  ...(usageMetadata ? { usageMetadata } : {}),
});

const eventsOf = async (request: TextRequest, fetch: typeof globalThis.fetch) => {
  const events: StreamEvent[] = [];

  for await (const event of google({ key: "k", fetch }).stream(request)) events.push(event);

  return events;
};

const streamOf = (body: string) =>
  eventsOf({ ...text, model: MODEL }, async () =>
    Promise.resolve(new Response(body, { headers: { "content-type": "text/event-stream" } })),
  );

const partsOf = (chunks: Chunk[], thought: boolean) =>
  chunks.flatMap(({ candidates }) =>
    (candidates?.[0]?.content?.parts ?? []).flatMap((part) =>
      part.text && (part.thought === true) === thought ? [part.text] : [],
    ),
  );

const deltasOf = (events: StreamEvent[], type: "text" | "reasoning") =>
  events.flatMap((event) => (event.type === type ? [event.delta] : []));

describe.skipIf(unverified.length > 0)(
  `google fixture stream${unverified.length > 0 ? ` (skipped: ${unverified.join(", ")} unverified)` : ""}`,
  () => {
    it.each(CASES)(
      "reads the $name stream into text, reasoning, finish and usage",
      async ({ request, fixture }) => {
        const chunks = chunksOf(fixture);
        const raw = lastUsageOf(chunks);
        const thoughts = raw["thoughtsTokenCount"] ?? 0;
        const events = await eventsOf({ ...request, model: MODEL }, replayFetch(fixture));

        const finished = {
          reason: "stop",
          usage: {
            input: raw["promptTokenCount"],
            output: (raw["candidatesTokenCount"] ?? 0) + thoughts,
            reasoning: thoughts,
            cacheRead: raw["cachedContentTokenCount"] ?? 0,
            cacheWrite: 0,
          },
          raw,
        };

        expect(deltasOf(events, "text")).toEqual(partsOf(chunks, false));
        expect(deltasOf(events, "reasoning")).toEqual(partsOf(chunks, true));
        expect(events.slice(-2)).toEqual([
          { type: "step-finish", ...finished },
          { type: "finish", ...finished },
        ]);
      },
    );
  },
);

describe("google stream", () => {
  it("reads thought parts, text blocks, cached and thoughts tokens the way the bridge does", async () => {
    const usage = {
      promptTokenCount: 2000,
      candidatesTokenCount: 120,
      thoughtsTokenCount: 64,
      cachedContentTokenCount: 1536,
      totalTokenCount: 2184,
    };

    const body = sse([
      chunk([{ text: "a" }]),
      chunk([
        { text: "Thinking ", thought: true },
        { text: "more.", thought: true },
      ]),
      chunk([{ text: "Hi", thoughtSignature: "sig" }]),
      chunk([{ text: "", thoughtSignature: "sig" }]),
      chunk([{ text: " there" }], "STOP", usage),
    ]);

    const finished = {
      reason: "stop",
      usage: { input: 2000, output: 184, reasoning: 64, cacheRead: 1536, cacheWrite: 0 },
      raw: usage,
    };

    expect(await streamOf(body)).toEqual([
      { type: "text-start", id: "0" },
      { type: "text", id: "0", delta: "a" },
      { type: "text-end", id: "0" },
      { type: "reasoning", delta: "Thinking " },
      { type: "reasoning", delta: "more." },
      { type: "text-start", id: "2" },
      { type: "text", id: "2", delta: "Hi" },
      { type: "text", id: "2", delta: "" },
      { type: "text", id: "2", delta: " there" },
      { type: "text-end", id: "2" },
      { type: "step-finish", ...finished },
      { type: "finish", ...finished },
    ]);
  });

  it.each([
    ["STOP", "stop"],
    ["MAX_TOKENS", "length"],
    ["SAFETY", "content-filter"],
    ["RECITATION", "content-filter"],
    ["BLOCKLIST", "content-filter"],
    ["PROHIBITED_CONTENT", "content-filter"],
    ["SPII", "content-filter"],
    ["IMAGE_SAFETY", "content-filter"],
    ["MALFORMED_FUNCTION_CALL", "error"],
    ["OTHER", "other"],
    ["FINISH_REASON_UNSPECIFIED", "other"],
  ])("reads finish reason %s as %s", async (finishReason, reason) => {
    const usage = { promptTokenCount: 5, candidatesTokenCount: 1, totalTokenCount: 6 };
    const events = await streamOf(sse([chunk([{ text: "a" }], finishReason, usage)]));

    const finished = {
      reason,
      usage: { input: 5, output: 1, reasoning: 0, cacheRead: 0, cacheWrite: 0 },
      raw: usage,
    };

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", ...finished },
      { type: "finish", ...finished },
    ]);
  });

  it("ends a stream without a finish reason as a network error with the usage it got", async () => {
    const usage = { promptTokenCount: 5, candidatesTokenCount: 1, totalTokenCount: 6 };
    const events = await streamOf(sse([chunk([{ text: "a" }], undefined, usage)]));
    const counted = { input: 5, output: 1, reasoning: 0, cacheRead: 0, cacheWrite: 0 };

    expect(events.slice(-2)).toEqual([
      { type: "step-finish", reason: "error", usage: counted, raw: usage },
      {
        type: "finish",
        reason: "error",
        usage: counted,
        raw: usage,
        error: expect.objectContaining({ kind: "network", provider: "google" }),
      },
    ]);
  });
});
