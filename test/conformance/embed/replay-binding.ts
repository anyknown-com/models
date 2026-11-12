import { isEqual } from "es-toolkit";
import type { WorkersAiBinding } from "../../../src/workers-ai";
import type { BindingCall } from "./types";

const runOf = ({ model, input }: BindingCall) => ({ model, input });

export function replayBinding(calls: BindingCall[], mismatches: unknown[]) {
  let ran = 0;

  const binding: WorkersAiBinding = {
    run: async (model, input) => {
      const call = calls[ran];

      ran += 1;

      if (!call || !isEqual(runOf(call), { model, input })) {
        const mismatch = new Error(
          `run ${ran} differs from the fixture\nexpected ${JSON.stringify(call && runOf(call))}\ngot ${JSON.stringify({ model, input })}`,
        );

        mismatches.push(mismatch);
        throw mismatch;
      }

      if ("error" in call) throw new Error(call.error);

      return call.output;
    },
  };

  return { binding, ran: () => ran };
}
