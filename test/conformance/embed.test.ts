/// <reference types="node" />
import { readdirSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import { EMBED_ASSERTS, RERANK_ASSERTS } from "./assert/embed";
import { EMBED, RERANK } from "./embed/constants";
import { runEmbed } from "./embed/run-embed";

const FIXTURES = new URL("./fixtures/", import.meta.url);

const dirs = readdirSync(FIXTURES)
  .filter((name) => name !== "_sample")
  .map((name) => new URL(`${name}/`, FIXTURES));

const runs = await Promise.all([
  ...dirs.map((dir) => runEmbed(dir, EMBED, EMBED_ASSERTS)),
  ...dirs.map((dir) => runEmbed(dir, RERANK, RERANK_ASSERTS)),
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
