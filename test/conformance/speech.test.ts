/// <reference types="node" />
import { readdirSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import { SYNTHESIZE_ASSERTS, TRANSCRIBE_ASSERTS } from "./assert/speech";
import { SYNTHESIZE, TRANSCRIBE } from "./speech/constants";
import { runSpeech } from "./speech/run-speech";

const FIXTURES = new URL("./fixtures/", import.meta.url);

const dirs = readdirSync(FIXTURES)
  .filter((name) => name !== "_sample")
  .map((name) => new URL(`${name}/`, FIXTURES));

const runs = await Promise.all([
  ...dirs.map((dir) => runSpeech(dir, TRANSCRIBE, TRANSCRIBE_ASSERTS)),
  ...dirs.map((dir) => runSpeech(dir, SYNTHESIZE, SYNTHESIZE_ASSERTS)),
]);

const verdicts = runs.flatMap((run) =>
  run.verdicts.map((verdict) => ({ provider: run.provider, ...verdict })),
);

const unverified = runs.flatMap((run) => (run.unverified ? [`${run.provider} ${run.kind}`] : []));

afterAll(() => {
  if (unverified.length > 0) process.stdout.write(`unverified: ${unverified.join(", ")}\n`);
});

it.each(verdicts)("$provider $id is $result", ({ result, reason }) => {
  expect({ result, reason }).not.toMatchObject({ result: "fail" });
});
