import type { VideoCase } from "../cases";
import { throwingFetch } from "../throwing-fetch";
import { replayCalls } from "./replay-calls";
import type { VideoFixture } from "./types";

type Replay = {
  videoCase: VideoCase;
  fixture: VideoFixture | undefined;
  controller: AbortController;
  mismatches: unknown[];
};

const aborting =
  (controller: AbortController): typeof fetch =>
  () => {
    controller.abort();

    return Promise.reject(controller.signal.reason);
  };

const none = () => 0;

export function fetchOf({ videoCase, fixture, controller, mismatches }: Replay) {
  if (fixture) return replayCalls(fixture, mismatches);

  if (videoCase.source !== "synthetic") {
    return { fetch: () => Promise.reject(new Error("no fixture to replay")), left: none };
  }

  return { fetch: videoCase.fetch === "aborts" ? aborting(controller) : throwingFetch, left: none };
}
