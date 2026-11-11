import { expect } from "vitest";
import type { CaseRun } from "../types";

export function acceptedWithText({ events }: CaseRun) {
  const deltas = events.flatMap((event) => (event.type === "text" ? [event.delta] : []));
  const finish = events.find((event) => event.type === "finish");

  expect(finish?.error).toBeUndefined();
  expect(finish?.reason).not.toBe("error");
  expect(deltas.join("").trim()).not.toBe("");
}
