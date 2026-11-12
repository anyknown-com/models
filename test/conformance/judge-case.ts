import type { CaseRunner, Check, JudgedCase, ProviderDir, Verdict } from "./types";

type Judged<Case, F, Run> = {
  judged: Case;
  provider: ProviderDir<F>;
  check: Check<Run>;
  run: CaseRunner<Case, F, Run>;
};

const fixtureOf = <F>(judged: JudgedCase, fixtures: Map<string, F>) =>
  judged.source === "synthetic" ? undefined : fixtures.get(judged.fixtureOf ?? judged.id);

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function judgeCase<Case extends JudgedCase, F extends { unverified?: true }, Run>({
  judged,
  provider,
  check,
  run,
}: Judged<Case, F, Run>): Promise<Verdict> {
  const { id } = judged;
  const { manifest, fixtures } = provider;
  const declared = Object.hasOwn(manifest.unsupported, id);
  const fixture = fixtureOf(judged, fixtures);
  const unverified = manifest.unverified === true || fixture?.unverified === true;

  if (declared && fixtures.has(id)) {
    return { id, result: "fail", reason: "declared unsupported but has a fixture" };
  }

  if (declared) return { id, result: "declared" };

  if (judged.source !== "synthetic" && !fixture) {
    return { id, result: "fail", reason: "no fixture and not declared unsupported" };
  }

  try {
    const { mismatch, ...ran } = await run(judged, provider, fixture);

    if (mismatch) return { id, result: "fail", reason: reasonOf(mismatch) };
    if (!(unverified && judged.source !== "synthetic")) await check(ran as Run);

    return { id, result: "pass" };
  } catch (error) {
    return { id, result: "fail", reason: reasonOf(error) };
  }
}
