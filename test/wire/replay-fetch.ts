import { expandRepeats } from "./expand-repeats";
import type { Fixture } from "./fixture";
import { requestDiffs } from "./request-diffs";
import { responseOf } from "./response-of";

export const replayFetch =
  (fixture: Fixture): typeof fetch =>
  async (input, init) => {
    const expected = expandRepeats(fixture);
    const request = new Request(input, init);
    const text = await request.text();
    const diffs = requestDiffs(expected.request, request, text ? JSON.parse(text) : undefined);

    if (diffs.length > 0) throw new Error(`request differs from the fixture\n${diffs.join("\n")}`);

    return responseOf(expected.response);
  };
