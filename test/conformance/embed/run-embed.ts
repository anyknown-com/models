import { judgeProvider } from "../judge-provider";
import { readProviderDir } from "../read-provider-dir";
import type { ProviderRun } from "../types";
import { runCase } from "./run-case";
import type { EmbedAsserts, EmbedFixture, EmbedKind } from "./types";

export const runEmbed = <Input, Request, Result>(
  dir: URL,
  kind: EmbedKind<Input, Request, Result>,
  asserts: EmbedAsserts<Request, Result>,
): Promise<ProviderRun> =>
  judgeProvider({
    provider: readProviderDir<EmbedFixture>(dir),
    kind: kind.kind,
    cases: kind.cases,
    asserts,
    run: runCase(kind),
  });
