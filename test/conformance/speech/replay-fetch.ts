import { responseOf } from "../../wire/response-of";
import { requestFields } from "../../wire/speech/request-fields";
import { requestDiffs } from "./request-diffs";
import type { SpeechFixture } from "./types";

export const replayFetch =
  (fixture: SpeechFixture, mismatches: unknown[]): typeof fetch =>
  async (input, init) => {
    const diffs = requestDiffs(fixture.request, await requestFields(new Request(input, init)));

    if (diffs.length > 0) {
      const mismatch = new Error(`request differs from the fixture\n${diffs.join("\n")}`);

      mismatches.push(mismatch);
      throw mismatch;
    }

    return responseOf(fixture.response);
  };
