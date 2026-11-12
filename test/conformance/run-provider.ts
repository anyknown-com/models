import { TEXT_CASES } from "./cases";
import { judgeProvider } from "./judge-provider";
import { readProviderDir } from "./read-provider-dir";
import { runCase } from "./run-case";
import type { ConformanceFixture, ProviderRun, TextAsserts } from "./types";

export const runProvider = (dir: URL, asserts: TextAsserts): Promise<ProviderRun> =>
  judgeProvider({
    provider: readProviderDir<ConformanceFixture>(dir),
    kind: "text",
    cases: TEXT_CASES,
    asserts,
    run: runCase,
  });
