import { judgeCase } from "./judge-case";
import type { CaseRunner, Check, JudgedCase, ProviderDir, ProviderRun } from "./types";

type Judging<Case, F, Run> = {
  provider: ProviderDir<F>;
  kind: string;
  cases: readonly Case[];
  asserts: Partial<Record<string, Check<Run>>>;
  run: CaseRunner<Case, F, Run>;
};

export async function judgeProvider<Case extends JudgedCase, F extends { unverified?: true }, Run>({
  provider,
  kind,
  cases,
  asserts,
  run,
}: Judging<Case, F, Run>): Promise<ProviderRun> {
  const { manifest, fixtures } = provider;
  const judged = manifest.adapters[kind] === undefined ? [] : cases;

  const verdicts = await Promise.all(
    judged.flatMap((each) => {
      const check = asserts[each.id];

      return check ? [judgeCase({ judged: each, provider, check, run })] : [];
    }),
  );

  const unverified =
    manifest.unverified === true ||
    judged.some((each) => fixtures.get(each.id)?.unverified === true);

  return {
    provider: manifest.provider,
    kind,
    unverified: verdicts.length > 0 && unverified,
    verdicts,
  };
}
