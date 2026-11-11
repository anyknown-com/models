import { streamText } from "../../src/stream-text";
import type { StreamEvent } from "../../src/types/stream-event";
import { replayFetch } from "../wire/replay-fetch";
import { adapterOf } from "./adapter-of";
import { caseRequest } from "./case-request";
import type { TextCase } from "./cases";
import type { CaseRun, ConformanceFixture, ProviderDir } from "./types";

const noFixtureFetch: typeof fetch = () => Promise.reject(new Error("no fixture to replay"));

export async function runCase(
  textCase: TextCase,
  { manifest, fixtures }: ProviderDir,
  fixture: ConformanceFixture | undefined,
): Promise<CaseRun & { mismatch?: unknown }> {
  const mismatches: unknown[] = [];

  const fetch: typeof globalThis.fetch = fixture
    ? (input, init) =>
        replayFetch(fixture)(input, init).catch((error: unknown) => {
          mismatches.push(error);
          throw error;
        })
    : noFixtureFetch;

  const adapter = adapterOf(manifest, fetch, (fixture ?? fixtures.get("text"))?.request.url);
  const request = caseRequest(textCase, manifest);
  const events: StreamEvent[] = [];

  for await (const event of streamText(adapter, request)) events.push(event);

  return { events, request, fixture, mismatch: mismatches[0] };
}
