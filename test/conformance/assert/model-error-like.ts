import { expect } from "vitest";
import type { CaseAssert } from "../types";

export const modelErrorLike =
  (expected: Record<string, unknown>): CaseAssert =>
  ({ events }) => {
    expect(events.find((event) => event.type === "finish")?.error).toMatchObject(expected);
  };
