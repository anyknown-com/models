/// <reference types="node" />
import { readdirSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import { TEXT_ASSERTS } from "./assert";
import { runProvider } from "./run-provider";

const FIXTURES = new URL("./fixtures/", import.meta.url);

const providers = readdirSync(FIXTURES).filter((name) => name !== "_sample");

const runs = await Promise.all(
  providers.map((name) => runProvider(new URL(`${name}/`, FIXTURES), TEXT_ASSERTS)),
);

const verdicts = runs.flatMap((run) =>
  run.verdicts.map((verdict) => ({ provider: run.provider, ...verdict })),
);

const unverified = runs.flatMap((run) => (run.unverified ? [run.provider] : []));

afterAll(() => {
  if (unverified.length > 0) process.stdout.write(`unverified: ${unverified.join(", ")}\n`);
});

it.skipIf(verdicts.length > 0)("has no case to judge yet", () => {
  expect(verdicts).toHaveLength(0);
});

it.each(verdicts)("$provider $id is $result", ({ result, reason }) => {
  expect({ result, reason }).not.toMatchObject({ result: "fail" });
});
