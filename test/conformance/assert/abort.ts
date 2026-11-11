import { expect } from "vitest";
import type { CaseRun } from "../types";

export function abort({ events }: CaseRun) {
  expect(events.filter((event) => event.type === "abort")).toHaveLength(1);
  expect(events.at(-2)?.type).toBe("abort");
  expect(events.at(-1)?.type).toBe("finish");
}
