import { responseOf } from "../../wire/response-of";
import { requestFields } from "../../wire/speech/request-fields";
import { requestDiffs } from "../speech/request-diffs";
import type { VideoFixture } from "./types";

export function replayCalls(fixture: VideoFixture, mismatches: unknown[]) {
  let made = 0;

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const call = fixture.calls[made];
    const sent = await requestFields(new Request(input, init));
    const diffs = call ? requestDiffs(call.request, sent) : [`no call ${made + 1} in the fixture`];

    made += 1;

    if (!call || diffs.length > 0) {
      const mismatch = new Error(`request differs from the fixture\n${diffs.join("\n")}`);

      mismatches.push(mismatch);
      throw mismatch;
    }

    return responseOf(call.response);
  };

  return { fetch, left: () => fixture.calls.length - made };
}
