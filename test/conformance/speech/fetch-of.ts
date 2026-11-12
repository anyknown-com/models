import type { SpeechCase } from "../cases";
import { throwingFetch } from "../throwing-fetch";
import { replayFetch } from "./replay-fetch";
import type { SpeechFixture } from "./types";

type Replay = {
  speechCase: SpeechCase<unknown>;
  fixture: SpeechFixture | undefined;
  controller: AbortController;
  mismatches: unknown[];
};

const aborting =
  (controller: AbortController): typeof fetch =>
  () => {
    controller.abort();

    return Promise.reject(controller.signal.reason);
  };

const noFixtureFetch: typeof fetch = () => Promise.reject(new Error("no fixture to replay"));

export function fetchOf({ speechCase, fixture, controller, mismatches }: Replay): typeof fetch {
  if (speechCase.source !== "synthetic") {
    return fixture ? replayFetch(fixture, mismatches) : noFixtureFetch;
  }

  return speechCase.fetch === "aborts" ? aborting(controller) : throwingFetch;
}
