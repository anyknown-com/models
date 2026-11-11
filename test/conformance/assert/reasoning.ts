import { expect } from "vitest";
import type { CaseRun } from "../types";

export function reasoning({ events }: CaseRun) {
  const deltas = events.flatMap((event) => (event.type === "reasoning" ? [event.delta] : []));

  expect(deltas.join("").trim()).not.toBe("");
  expect(events.find((event) => event.type === "finish")?.usage.reasoning).toBeGreaterThan(0);
}
