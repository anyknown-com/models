import { replayFetch } from "../wire/replay-fetch";
import { abortingFetch } from "./aborting-fetch";
import type { TextCase } from "./cases";
import { throwingFetch } from "./throwing-fetch";
import type { ConformanceFixture, ProviderDir } from "./types";

type Replay = {
  textCase: TextCase;
  fixtures: ProviderDir["fixtures"];
  fixture: ConformanceFixture | undefined;
  controller: AbortController;
  mismatches: unknown[];
};

const noFixtureFetch: typeof fetch = () => Promise.reject(new Error("no fixture to replay"));

const recording =
  (fixture: ConformanceFixture, mismatches: unknown[]): typeof fetch =>
  (input, init) =>
    replayFetch(fixture)(input, init).catch((error: unknown) => {
      mismatches.push(error);
      throw error;
    });

export function fetchOf({ textCase, fixtures, fixture, controller, mismatches }: Replay) {
  if (textCase.source !== "synthetic") {
    return fixture ? recording(fixture, mismatches) : noFixtureFetch;
  }

  if (textCase.fetch !== "aborts") return throwingFetch;

  const text = fixtures.get("text");

  if (!text) throw new Error("abort replays half of the text fixture, and there is none");

  return abortingFetch(text, controller);
}
