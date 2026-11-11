import { streamText } from "../../src/stream-text";
import type { StreamEvent } from "../../src/types/stream-event";
import { adapterOf } from "./adapter-of";
import { caseRequest } from "./case-request";
import type { TextCase } from "./cases";
import { fetchOf } from "./fetch-of";
import type { CaseRun, ConformanceFixture, ProviderDir } from "./types";

export async function runCase(
  textCase: TextCase,
  { manifest, fixtures }: ProviderDir,
  fixture: ConformanceFixture | undefined,
): Promise<CaseRun & { mismatch?: unknown }> {
  const controller = new AbortController();
  const mismatches: unknown[] = [];
  const fetch = fetchOf({ textCase, fixtures, fixture, controller, mismatches });
  const adapter = adapterOf(manifest, fetch, (fixture ?? fixtures.get("text"))?.request.url);
  const request = { ...caseRequest(textCase, manifest), signal: controller.signal };
  const events: StreamEvent[] = [];

  for await (const event of streamText(adapter, request)) events.push(event);

  return { events, request, fixture, mismatch: mismatches[0] };
}
