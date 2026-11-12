import type { JsonObject } from "../../../src/types/json";
import type { VideoJobState } from "../cases";
import type { VideoCall, VideoFixture } from "./types";

type Derived = { from: string } & ({ status: number } | { jobStatus: VideoJobState });

const withStatus = (call: VideoCall, status: number): VideoCall => ({
  ...call,
  response: { ...call.response, status },
});

const withBody = (call: VideoCall, patch: JsonObject): VideoCall | undefined =>
  "body" in call.response
    ? {
        ...call,
        response: { ...call.response, body: { ...(call.response.body as JsonObject), ...patch } },
      }
    : undefined;

const callsOf = (
  calls: VideoCall[],
  derived: Derived,
  statusBodies: Partial<Record<VideoJobState, JsonObject>>,
): VideoCall[] | undefined => {
  const last = calls.at(-1);

  if ("status" in derived) return last && [...calls.slice(0, -1), withStatus(last, derived.status)];

  const [submit, status] = calls;
  const patch = statusBodies[derived.jobStatus];
  const patched = status && patch && withBody(status, patch);

  return submit && patched && [submit, patched];
};

export function deriveVideo(
  source: VideoFixture,
  derived: Derived,
  statusBodies: Partial<Record<VideoJobState, JsonObject>>,
): VideoFixture | undefined {
  const calls = callsOf(source.calls, derived, statusBodies);

  return calls && { derivedFrom: derived.from, calls };
}
