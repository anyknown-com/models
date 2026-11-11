import { describe, expect, it } from "vitest";
import { rerank } from "../../../src/rerank";
import type { RerankRequest } from "../../../src/types/rerank-request";
import type { RerankResult } from "../../../src/types/rerank-result";
import { workersAi } from "../../../src/workers-ai";
import fixture from "../fixtures/workers-ai/rerank.json";
import { type FixtureCall, recordingBinding } from "./recording-binding";

type RerankCase = { request: RerankRequest; calls: FixtureCall[]; result: RerankResult };

const cases: Record<string, RerankCase> = fixture.cases;

describe("workers ai rerank", () => {
  it.each([
    { name: "response-order", title: "ranks in the order of the response" },
    {
      name: "missing-id-and-score",
      title: "drops an entry without id and scores a missing score 0",
    },
    { name: "no-response", title: "returns an empty ranking without a response" },
    { name: "no-top-k", title: "leaves top_k out when topK is not given" },
  ])("$title", async ({ name }) => {
    const { request, calls, result } = cases[name];
    const { binding, received } = recordingBinding(calls.map(({ output }) => output));
    const reranked = await rerank(workersAi({ binding }), request);

    expect(received).toStrictEqual(
      calls.map(({ model, input }) => ({ model, input, options: undefined })),
    );

    expect(reranked).toEqual(result);
  });
});
