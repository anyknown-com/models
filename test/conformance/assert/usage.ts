import { isPlainObject, sumBy } from "es-toolkit";
import { expect } from "vitest";
import type { TokenUsage } from "../../../src/types/token-usage";
import type { CaseRun } from "../types";

const COUNTS = ["input", "output", "reasoning", "cacheRead", "cacheWrite"] as const;

const totalOf = (usages: TokenUsage[]) =>
  Object.fromEntries(COUNTS.map((count) => [count, sumBy(usages, (counts) => counts[count])]));

export function usage({ events }: CaseRun) {
  const steps = events.flatMap((event) => (event.type === "step-finish" ? [event] : []));
  const finishes = events.flatMap((event) => (event.type === "finish" ? [event] : []));

  expect(steps.length).toBeGreaterThan(0);
  expect(finishes).toHaveLength(1);

  for (const event of [...steps, ...finishes]) {
    expect(event.usage.input).toBeGreaterThan(0);
    expect(event.usage.output).toBeGreaterThan(0);
    expect(COUNTS.every((count) => Number.isInteger(event.usage[count]))).toBe(true);
    expect(COUNTS.every((count) => event.usage[count] >= 0)).toBe(true);
    expect(isPlainObject(event.raw)).toBe(true);
  }

  expect(finishes[0]?.usage).toEqual(totalOf(steps.map((step) => step.usage)));
}
