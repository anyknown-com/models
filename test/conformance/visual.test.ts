/// <reference types="node" />
import { readdirSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import { IMAGE_ASSERTS, VIDEO_ASSERTS } from "./assert/visual";
import { runSpeech } from "./speech/run-speech";
import { IMAGE, VIDEO } from "./visual/constants";
import { runVideo } from "./visual/run-video";

const FIXTURES = new URL("./fixtures/", import.meta.url);

const dirs = readdirSync(FIXTURES)
  .filter((name) => name !== "_sample")
  .map((name) => new URL(`${name}/`, FIXTURES));

const runs = await Promise.all([
  ...dirs.map((dir) => runSpeech(dir, IMAGE, IMAGE_ASSERTS)),
  ...dirs.map((dir) => runVideo(dir, VIDEO, VIDEO_ASSERTS)),
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
