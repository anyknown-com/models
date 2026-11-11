import { expect } from "vitest";
import type { CaseRun } from "../types";

export function text({ events }: CaseRun) {
  const deltas = events.flatMap((event) => (event.type === "text" ? [event.delta] : []));

  expect(deltas.join("").trim()).not.toBe("");
  expect(events.find((event) => event.type === "finish")).toMatchObject({ reason: "stop" });
}
