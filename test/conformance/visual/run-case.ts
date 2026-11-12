import type { VideoCase } from "../cases";
import type { CaseRunner } from "../types";
import { adapterOf } from "./adapter-of";
import { fetchOf } from "./fetch-of";
import type { VideoFixture, VideoKind, VideoRun } from "./types";
import { videoInputOf } from "./video-input-of";
import { videoSteps } from "./video-steps";

const unmadeOf = (fixture: VideoFixture | undefined, left: number) =>
  fixture && left > 0
    ? new Error(`the fixture has ${fixture.calls.length} calls, ${left} were not made`)
    : undefined;

export const runCase =
  (kind: VideoKind): CaseRunner<VideoCase, VideoFixture, VideoRun> =>
  async (videoCase, { manifest, fixtures }, fixture) => {
    const controller = new AbortController();
    const mismatches: unknown[] = [];
    const { fetch, left } = fetchOf({ videoCase, fixture, controller, mismatches });
    const url = (fixture ?? fixtures.get(kind.kind))?.calls[0]?.request.url;
    const adapter = adapterOf(kind, manifest, fetch, url);
    const model = manifest.models[kind.kind];

    if (model === undefined) throw new Error(`manifest has no ${kind.kind} model`);

    const input = videoInputOf(videoCase, kind.cases);
    const request = { ...kind.requestOf(input, model), signal: controller.signal };
    const ran = await videoSteps(adapter, request, left);

    return { request, ...ran, mismatch: mismatches[0] ?? unmadeOf(fixture, left()) };
  };
