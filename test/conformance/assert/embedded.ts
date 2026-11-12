import { expect } from "vitest";
import type { EmbedRequest } from "../../../src/types/embed-request";
import type { EmbedResult } from "../../../src/types/embed-result";
import type { EmbedRun } from "../embed/types";

export function embedded({ request, result, error }: EmbedRun<EmbedRequest, EmbedResult>) {
  const lengths = new Set(result?.embeddings.map((vector) => vector.length));

  expect(error).toBeUndefined();
  expect(result?.embeddings).toHaveLength(request.values.length);
  expect(lengths.size).toBe(1);
  expect([...lengths][0]).toBeGreaterThan(0);
}
