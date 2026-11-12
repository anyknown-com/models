import { expect } from "vitest";
import type { EmbedRun } from "../embed/types";

const errorLike =
  (expected: Record<string, unknown>) =>
  ({ error }: EmbedRun<unknown, unknown>) => {
    expect(error).toMatchObject(expected);
  };

export const embedErrorAsserts = (kind: "embed" | "rerank") => ({
  [`${kind}-error-not-found`]: errorLike({ kind: "not-found", retryable: false }),
  [`${kind}-abort`]: errorLike({ kind: "abort", retryable: false }),
});
