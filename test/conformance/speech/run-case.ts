import { sampleAudio } from "../../wire/speech/sample-audio";
import type { SpeechCase } from "../cases";
import type { CaseRunner } from "../types";
import { callOf } from "./call-of";
import { fetchOf } from "./fetch-of";
import { inputOf } from "./input-of";
import type { SpeechFixture, SpeechKind, SpeechRun } from "./types";

export const runCase =
  <Input, Request, Result>(
    kind: SpeechKind<Input, Request, Result>,
  ): CaseRunner<SpeechCase<Input>, SpeechFixture, SpeechRun<Request, Result>> =>
  async (speechCase, { manifest, fixtures }, fixture) => {
    const controller = new AbortController();
    const mismatches: unknown[] = [];
    const fetch = fetchOf({ speechCase, fixture, controller, mismatches });
    const call = callOf(kind, manifest, fetch, (fixture ?? fixtures.get(kind.kind))?.request.url);
    const model = manifest.models[kind.kind];

    if (model === undefined) throw new Error(`manifest has no ${kind.kind} model`);

    const input = inputOf(speechCase, kind.cases);
    const request = kind.requestOf(input, model, manifest.provider, sampleAudio);

    try {
      const result = await call({ ...request, signal: controller.signal });

      return { request, result, mismatch: mismatches[0] };
    } catch (error) {
      return { request, error, mismatch: mismatches[0] };
    }
  };
