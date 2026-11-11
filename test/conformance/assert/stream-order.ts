import { expect } from "vitest";
import type { StreamEvent } from "../../../src/types/stream-event";
import type { CaseRun } from "../types";

const ONE_TEXT_IN_A_STEP = /^(step-finish )*text-start( text)+ text-end( step-finish)+$/;

const typesAround = (events: StreamEvent[], id: string) =>
  events
    .filter((event) => event.type === "step-finish" || ("id" in event && event.id === id))
    .map((event) => event.type)
    .join(" ");

export function streamOrder({ events }: CaseRun) {
  const ids = new Set(events.flatMap((event) => ("id" in event ? [event.id] : [])));

  expect(ids.size).toBeGreaterThan(0);
  expect(events.filter((event) => event.type === "finish")).toHaveLength(1);
  expect(events.at(-1)?.type).toBe("finish");
  expect(events.at(-2)?.type).toBe("step-finish");

  for (const id of ids) expect(typesAround(events, id)).toMatch(ONE_TEXT_IN_A_STEP);
}
