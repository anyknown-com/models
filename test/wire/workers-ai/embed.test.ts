import { describe, expect, it } from "vitest";
import { embed } from "../../../src/embed";
import { ModelError } from "../../../src/model-error";
import type { EmbedRequest } from "../../../src/types/embed-request";
import type { EmbedResult } from "../../../src/types/embed-result";
import { workersAi } from "../../../src/workers-ai";
import fixture from "../fixtures/workers-ai/embed.json";
import { type FixtureCall, recordingBinding } from "./recording-binding";

type EmbedCase = { request: EmbedRequest; calls: FixtureCall[]; result: EmbedResult };

const cases: Record<string, EmbedCase> = fixture.cases;
const unverified: boolean = fixture.unverified;

describe("workers ai embed", () => {
  it.each([
    { name: "one-batch", title: "sends three values in one run" },
    { name: "two-batches", title: "splits 27 values into runs of 25 and 2 in order" },
    {
      name: "second-batch-without-data",
      title: "keeps the first batch when the second has no data",
    },
    { name: "no-values", title: "does not run when there are no values" },
  ])("$title", async ({ name }) => {
    const { request, calls, result } = cases[name];
    const { binding, received } = recordingBinding(calls.map(({ output }) => output));
    const embedded = await embed(workersAi({ binding }), request);

    expect(received).toEqual(calls.map(({ model, input }) => ({ model, input })));

    expect(unverified ? result : embedded).toEqual(result);
  });

  it("rejects with an abort model error when the signal aborts", async () => {
    const controller = new AbortController();
    const binding = { run: () => new Promise<never>(() => {}) };

    const embedding = embed(workersAi({ binding }), {
      model: "m",
      values: ["a"],
      signal: controller.signal,
    });

    controller.abort();

    const error = await embedding.catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ModelError);
    expect(error).toMatchObject({ kind: "abort", provider: "workers-ai" });
  });
});
