import { TEXT_CASES } from "./cases";
import { judgeCase } from "./judge-case";
import { readProviderDir } from "./read-provider-dir";
import type { ProviderRun, TextAsserts } from "./types";

export async function runProvider(dir: URL, asserts: TextAsserts): Promise<ProviderRun> {
  const provider = readProviderDir(dir);

  const verdicts = await Promise.all(
    TEXT_CASES.flatMap((textCase) => {
      const check = asserts[textCase.id];

      return check ? [judgeCase(textCase, provider, check)] : [];
    }),
  );

  return {
    provider: provider.manifest.provider,
    unverified: provider.manifest.unverified === true,
    verdicts,
  };
}
