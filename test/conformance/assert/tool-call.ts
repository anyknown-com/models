import { isPlainObject } from "es-toolkit";
import { expect } from "vitest";
import type { CaseRun } from "../types";

export function toolCall({ events, request }: CaseRun) {
  const declared = request.tools?.map((tool) => tool.name) ?? [];
  const calls = events.flatMap((event) => (event.type === "tool-call" ? [event] : []));

  expect(calls.length).toBeGreaterThan(0);

  for (const call of calls) {
    const start = events.findIndex(
      (event) => event.type === "tool-input-start" && event.callId === call.callId,
    );

    expect(start).toBeGreaterThanOrEqual(0);
    expect(start).toBeLessThan(events.indexOf(call));
    expect(events[start]).toMatchObject({ name: call.name });
    expect(declared).toContain(call.name);
    expect(isPlainObject(call.input)).toBe(true);
  }

  expect(events.find((event) => event.type === "finish")).toMatchObject({ reason: "tool-calls" });
}
