import { expect } from "vitest";
import { NETWORK_FAILURE } from "../constants";
import type { CaseRun } from "../types";

export function errorNetwork({ events }: CaseRun) {
  const error = events.find((event) => event.type === "finish")?.error;

  expect(error?.kind).toBe("network");
  expect(error?.status).toBeUndefined();
  expect(error?.cause).toBe(NETWORK_FAILURE);
}
