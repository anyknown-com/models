import type { EmbedCase } from "../cases";
import type { CaseRunner } from "../types";
import { bindingOf } from "./binding-of";
import type { EmbedFixture, EmbedKind, EmbedRun } from "./types";

const unranOf = (fixture: EmbedFixture | undefined, ran: number) =>
  fixture && ran < fixture.calls.length
    ? new Error(`the fixture has ${fixture.calls.length} runs, the adapter ran ${ran}`)
    : undefined;

export const runCase =
  <Input, Request, Result>(
    kind: EmbedKind<Input, Request, Result>,
  ): CaseRunner<EmbedCase<Input>, EmbedFixture, EmbedRun<Request, Result>> =>
  async (embedCase, { manifest }, fixture) => {
    const controller = new AbortController();
    const mismatches: unknown[] = [];
    const { binding, ran } = bindingOf({ embedCase, fixture, controller, mismatches });
    const name = manifest.adapters[kind.kind];
    const adapter = name === undefined ? undefined : kind.adapters[name];
    const model = manifest.models[kind.kind];

    if (!adapter) throw new Error(`no ${kind.kind} adapter named ${name}`);
    if (model === undefined) throw new Error(`manifest has no ${kind.kind} model`);

    const request = kind.requestOf(embedCase.request, model);
    const call = adapter(binding);

    try {
      const result = await call({ ...request, signal: controller.signal });

      return { request, result, mismatch: mismatches[0] ?? unranOf(fixture, ran()) };
    } catch (error) {
      return { request, error, mismatch: mismatches[0] ?? unranOf(fixture, ran()) };
    }
  };
