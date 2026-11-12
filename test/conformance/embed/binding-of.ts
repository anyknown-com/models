import type { WorkersAiBinding } from "../../../src/workers-ai";
import type { EmbedCase } from "../cases";
import { replayBinding } from "./replay-binding";
import type { EmbedFixture } from "./types";

type Replay = {
  embedCase: EmbedCase<unknown>;
  fixture: EmbedFixture | undefined;
  controller: AbortController;
  mismatches: unknown[];
};

const aborting = (controller: AbortController): WorkersAiBinding => ({
  run: () => {
    controller.abort();

    return Promise.reject(controller.signal.reason);
  },
});

export function bindingOf({ embedCase, fixture, controller, mismatches }: Replay) {
  if (embedCase.source === "synthetic") return { binding: aborting(controller), ran: () => 0 };

  return replayBinding(fixture?.calls ?? [], mismatches);
}
