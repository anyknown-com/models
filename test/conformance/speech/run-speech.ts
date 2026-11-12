import { judgeProvider } from "../judge-provider";
import { readProviderDir } from "../read-provider-dir";
import type { ProviderRun } from "../types";
import { runCase } from "./run-case";
import type { SpeechAsserts, SpeechFixture, SpeechKind } from "./types";

export const runSpeech = <Input, Request, Result>(
  dir: URL,
  kind: SpeechKind<Input, Request, Result>,
  asserts: SpeechAsserts<Request, Result>,
): Promise<ProviderRun> =>
  judgeProvider({
    provider: readProviderDir<SpeechFixture>(dir),
    kind: kind.kind,
    cases: kind.cases,
    asserts,
    run: runCase(kind),
  });
