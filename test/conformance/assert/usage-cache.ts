import { expect } from "vitest";
import type { CaseRun } from "../types";

export function usageCache({ events }: CaseRun) {
  const finish = events.find((event) => event.type === "finish");

  expect(finish?.usage.cacheRead).toBeGreaterThan(0);
}
