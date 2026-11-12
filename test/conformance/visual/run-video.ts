import { judgeProvider } from "../judge-provider";
import { readProviderDir } from "../read-provider-dir";
import type { ProviderRun } from "../types";
import { runCase } from "./run-case";
import type { VideoAsserts, VideoFixture, VideoKind } from "./types";

export const runVideo = (dir: URL, kind: VideoKind, asserts: VideoAsserts): Promise<ProviderRun> =>
  judgeProvider({
    provider: readProviderDir<VideoFixture>(dir),
    kind: kind.kind,
    cases: kind.cases,
    asserts,
    run: runCase(kind),
  });
