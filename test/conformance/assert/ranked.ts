import { expect } from "vitest";
import type { RerankRequest } from "../../../src/types/rerank-request";
import type { RerankResult } from "../../../src/types/rerank-result";
import type { EmbedRun } from "../embed/types";

export function ranked({ request, result, error }: EmbedRun<RerankRequest, RerankResult>) {
  const ranking = result?.ranking ?? [];
  const indexes = ranking.map(({ index }) => index);
  const scores = ranking.map(({ score }) => score);

  expect(error).toBeUndefined();
  expect(ranking.length).toBeGreaterThan(0);
  expect(new Set(indexes).size).toBe(indexes.length);
  expect(indexes.every((index) => index >= 0 && index < request.documents.length)).toBe(true);
  expect(scores.every((score, at) => at === 0 || scores[at - 1]! >= score)).toBe(true);
}
