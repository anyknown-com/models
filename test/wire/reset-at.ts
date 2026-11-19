import { afterEach, beforeEach, vi } from "vitest";
import { generateText } from "../../src";
import { ModelError } from "../../src/model-error";
import type { TextAdapter } from "../../src/types/text-adapter";
import { badRequest } from "./cases";

export const NOW = Date.parse("2026-11-19T00:00:00.000Z");
// 2026-11-25T00:00:00.000Z in epoch seconds.
export const RESETS = 1_795_564_800;
export const RESETS_ISO = "2026-11-25T00:00:00.000Z";

export const after = (seconds: number): string => new Date(NOW + seconds * 1000).toISOString();

export const respond =
  (status: number, body: unknown, headers: Record<string, string> = {}): typeof fetch =>
  async () =>
    new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers });

/** Fakes only `Date`, so `Date.now()` is NOW while fetch and streams run for real. */
export function atNow(): void {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

export async function failureOf(run: Promise<unknown>): Promise<ModelError> {
  const error = await run.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  if (!(error instanceof ModelError)) throw new Error("expected a ModelError");

  return error;
}

export const textFailureOf = (adapter: TextAdapter): Promise<ModelError> =>
  failureOf(generateText(adapter, badRequest));
