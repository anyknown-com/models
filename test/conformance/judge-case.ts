import type { TextCase } from "./cases";
import { runCase } from "./run-case";
import type { CaseAssert, ConformanceFixture, ProviderDir, Verdict } from "./types";

const fixtureOf = (textCase: TextCase, fixtures: Map<string, ConformanceFixture>) =>
  textCase.source === "synthetic"
    ? undefined
    : fixtures.get("fixtureOf" in textCase ? textCase.fixtureOf : textCase.id);

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function judgeCase(
  textCase: TextCase,
  provider: ProviderDir,
  check: CaseAssert,
): Promise<Verdict> {
  const { id } = textCase;
  const { manifest, fixtures } = provider;
  const declared = Object.hasOwn(manifest.unsupported, id);
  const fixture = fixtureOf(textCase, fixtures);

  if (declared && fixtures.has(id)) {
    return { id, result: "fail", reason: "declared unsupported but has a fixture" };
  }

  if (declared) return { id, result: "declared" };

  if (textCase.source !== "synthetic" && !fixture) {
    return { id, result: "fail", reason: "no fixture and not declared unsupported" };
  }

  try {
    const { mismatch, ...run } = await runCase(textCase, provider, fixture);

    if (mismatch) return { id, result: "fail", reason: reasonOf(mismatch) };
    if (!(manifest.unverified && textCase.source !== "synthetic")) check(run);

    return { id, result: "pass" };
  } catch (error) {
    return { id, result: "fail", reason: reasonOf(error) };
  }
}
