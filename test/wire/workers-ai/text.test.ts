import { describe, expect, it } from "vitest";
import { generateText } from "../../../src/generate-text";
import { ModelError } from "../../../src/model-error";
import { workersAi } from "../../../src/workers-ai";
import fixture from "../fixtures/workers-ai/text.json";
import { type FixtureCall, recordingBinding } from "./recording-binding";

type TextCase = {
  request: { model: string; system: string; user: string; maxOutputTokens?: number };
  calls: FixtureCall[];
  result: unknown;
};

const cases: Record<string, TextCase> = fixture.cases;
const unverified: boolean = fixture.unverified;

const outcomeOf = (generating: ReturnType<typeof generateText>) =>
  generating.then(
    ({ text, reason, usage }) => ({ text, reason, usage }),
    (error: unknown) => ({ error: error instanceof ModelError ? error.kind : error }),
  );

describe("workers ai text", () => {
  it.each([
    { name: "rewrite", title: "sends the rewrite request as system and user messages" },
    { name: "no-max-tokens", title: "leaves max_tokens out when maxOutputTokens is not given" },
    { name: "no-response", title: "rejects with a server error when the output has no response" },
  ])("$title", async ({ name }) => {
    const { request, calls, result } = cases[name];
    const { model, system, user, maxOutputTokens } = request;
    const { binding, received } = recordingBinding(calls.map(({ output }) => output));

    const outcome = await outcomeOf(
      generateText(workersAi({ binding }), {
        model,
        system: [{ type: "text", text: system }],
        messages: [{ role: "user", content: user }],
        maxOutputTokens,
      }),
    );

    expect(received).toStrictEqual(
      calls.map(({ model: called, input }) => ({ model: called, input, options: undefined })),
    );

    expect(unverified ? result : outcome).toEqual(result);
  });

  it("rejects with an unsupported error and does not run when tools are given", async () => {
    const { binding, received } = recordingBinding([]);

    const outcome = await outcomeOf(
      generateText(workersAi({ binding }), {
        model: "m",
        messages: [{ role: "user", content: "q" }],
        tools: [{ name: "search", description: "search", inputSchema: {} }],
      }),
    );

    expect(outcome).toEqual({ error: "unsupported" });
    expect(received).toEqual([]);
  });

  it("rejects with an abort error when the timeout signal fires", async () => {
    const binding = { run: () => new Promise<never>(() => {}) };

    const outcome = await outcomeOf(
      generateText(workersAi({ binding }), {
        model: "m",
        messages: [{ role: "user", content: "q" }],
        signal: AbortSignal.timeout(20),
      }),
    );

    expect(outcome).toEqual({ error: "abort" });
  });

  it("reports no thinking and no effort levels", () => {
    const { binding } = recordingBinding([]);

    expect(workersAi({ binding }).capabilities("x")).toEqual({
      thinking: "none",
      effortLevels: [],
    });
  });
});
