import { describe, expect, it } from "vitest";
import { runProvider } from "./run-provider";
import type { CaseRun, ProviderRun, TextAsserts } from "./types";

const SAMPLE = new URL("./fixtures/_sample/", import.meta.url);

const stops = ({ events }: CaseRun) => {
  expect(events.at(-1)).toMatchObject({ type: "finish", reason: "stop" });
};

const ignores = () => {};

const ASSERTS: TextAsserts = {
  text: stops,
  "stream-order": ignores,
  "tool-call": ignores,
  image: ignores,
  file: ignores,
  reasoning: ignores,
  usage: () => {
    throw new Error("usage is wrong");
  },
  "error-unsupported": ignores,
};

const resultsOf = ({ verdicts }: ProviderRun) =>
  Object.fromEntries(verdicts.map(({ id, result }) => [id, result]));

const reasonOf = ({ verdicts }: ProviderRun, id: string) =>
  verdicts.find((verdict) => verdict.id === id)?.reason;

describe("runProvider", () => {
  it("judges each asserted case as pass, fail or declared", async () => {
    const run = await runProvider(SAMPLE, ASSERTS);

    expect(run).toMatchObject({ provider: "_sample", unverified: false });
    expect(resultsOf(run)).toEqual({
      text: "pass",
      "stream-order": "pass",
      "tool-call": "fail",
      image: "fail",
      file: "declared",
      reasoning: "fail",
      usage: "fail",
      "error-unsupported": "pass",
    });
    expect(reasonOf(run, "tool-call")).toBe("no fixture and not declared unsupported");
    expect(reasonOf(run, "image")).toBe("declared unsupported but has a fixture");
    expect(reasonOf(run, "reasoning")).toMatch(/request differs from the fixture/);
    expect(reasonOf(run, "usage")).toBe("usage is wrong");
  });

  it("only compares the request when the manifest is unverified", async () => {
    const run = await runProvider(new URL("unverified/", SAMPLE), {
      text: stops,
      reasoning: stops,
    });

    expect(run).toMatchObject({ provider: "_sample-unverified", unverified: true });
    expect(resultsOf(run)).toEqual({ text: "pass", reasoning: "fail" });
    expect(reasonOf(run, "reasoning")).toMatch(/request differs from the fixture/);
  });
});
