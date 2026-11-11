import { describe, expect, it } from "vitest";
import { openaiCompatible } from "../../../src/openai-compatible";
import type { JsonObject } from "../../../src/types/json";
import type { StreamEvent } from "../../../src/types/stream-event";
import type { TextRequest } from "../../../src/types/text-request";
import { file, image, reasoning, text, toolCall, tools } from "../cases";
import type { Fixture } from "../fixture";
import fileFixture from "../fixtures/openai-compatible/file.json";
import imageFixture from "../fixtures/openai-compatible/image.json";
import reasoningFixture from "../fixtures/openai-compatible/reasoning.json";
import textFixture from "../fixtures/openai-compatible/text.json";
import toolCallFixture from "../fixtures/openai-compatible/tool-call.json";
import toolsFixture from "../fixtures/openai-compatible/tools.json";
import { replayFetch } from "../replay-fetch";

type ChunkData = {
  usage?: JsonObject;
  choices: { delta: { content?: string; reasoning_content?: string }; finish_reason: string }[];
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

const TOOL_CALL = caseOf("tool-call", toolCall, toolCallFixture);

const unverified = [...CASES, TOOL_CALL]
  .filter(({ fixture }) => fixture.unverified)
  .map(({ name }) => name);

const chunksOf = ({ response }: Fixture): ChunkData[] =>
  ("chunks" in response ? response.chunks : [])
    .map((chunk) => chunk.replace(/^data: /, "").trim())
    .filter((data) => data !== "[DONE]")
    .map((data) => JSON.parse(data) as ChunkData);

const eventsOf = async ({ request, fixture }: typeof TOOL_CALL) => {
  const { model } = fixture.request.body as { model: string };
  const baseUrl = fixture.request.url.replace(/\/chat\/completions$/, "");

  const adapter = openaiCompatible({
    name: "openrouter",
    key: "k",
    baseUrl,
    fetch: replayFetch(fixture),
  });

  const events: StreamEvent[] = [];

  for await (const event of adapter.stream({ ...request, model })) events.push(event);

  return events;
};

const joined = (events: StreamEvent[], type: "text" | "reasoning") =>
  events.flatMap((event) => (event.type === type ? [event.delta] : [])).join("");

describe.skipIf(unverified.length > 0)(
  `openai-compatible stream${unverified.length > 0 ? ` (skipped: ${unverified.join(", ")} unverified)` : ""}`,
  () => {
    it.each(CASES)(
      "reads the $name stream into text, reasoning, finish and usage",
      async (each) => {
        const chunks = chunksOf(each.fixture);
        const usage = chunks.reduce<JsonObject>((last, chunk) => chunk.usage ?? last, {});

        const details = (key: string, field: string) =>
          (usage[key] as Record<string, number> | undefined)?.[field] ?? 0;

        const events = await eventsOf(each);

        const finished = {
          reason: "stop",
          usage: {
            input: usage["prompt_tokens"],
            output: usage["completion_tokens"],
            reasoning: details("completion_tokens_details", "reasoning_tokens"),
            cacheRead: details("prompt_tokens_details", "cached_tokens"),
            cacheWrite: 0,
          },
          raw: usage,
        };

        expect(joined(events, "text")).toBe(
          chunks.map((c) => c.choices[0]?.delta.content ?? "").join(""),
        );
        expect(joined(events, "reasoning")).toBe(
          chunks.map((c) => c.choices[0]?.delta.reasoning_content ?? "").join(""),
        );
        expect(events.filter((event) => event.type === "text-start")).toEqual([
          { type: "text-start", id: "txt-0" },
        ]);
        expect(events.slice(-3)).toEqual([
          { type: "text-end", id: "txt-0" },
          { type: "step-finish", ...finished },
          { type: "finish", ...finished },
        ]);
      },
    );

    it("reads the tool-call stream into input starts and tool calls with parsed input", async () => {
      const events = await eventsOf(TOOL_CALL);
      const [usage] = chunksOf(TOOL_CALL.fixture).flatMap((chunk) => chunk.usage ?? []);

      const toolEvents = events.flatMap((event) =>
        event.type === "tool-input-start" || event.type === "tool-call" ? [event] : [],
      );

      expect(toolEvents).toEqual([
        { type: "tool-input-start", callId: expect.any(String), name: "get_weather" },
        { type: "tool-input-start", callId: expect.any(String), name: "get_time" },
        {
          type: "tool-call",
          callId: toolEvents[0]?.callId,
          name: "get_weather",
          input: { city: expect.any(String) },
        },
        {
          type: "tool-call",
          callId: toolEvents[1]?.callId,
          name: "get_time",
          input: { timezone: expect.any(String) },
        },
      ]);
      expect(events.slice(-2)).toMatchObject([
        { type: "step-finish", reason: "tool-calls", raw: usage },
        { type: "finish", reason: "tool-calls", raw: usage },
      ]);
    });
  },
);
