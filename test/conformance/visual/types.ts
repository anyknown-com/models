import type { AdapterConfig } from "../../../src/types/adapter-config";
import type { JsonObject } from "../../../src/types/json";
import type { VideoAdapter } from "../../../src/types/video-adapter";
import type { VideoJob } from "../../../src/types/video-job";
import type { VideoJobStatus } from "../../../src/types/video-job-status";
import type { VideoRequest } from "../../../src/types/video-request";
import type { VideoResult } from "../../../src/types/video-result";
import type { FixtureResponse } from "../../wire/fixture";
import type { RequestFields } from "../../wire/speech/types";
import type { VideoCase, VideoJobState, VisualInput } from "../cases";
import type { Check } from "../types";

export type VideoCall = { request: RequestFields; response: FixtureResponse };

export type VideoFixture = { unverified?: true; derivedFrom?: string; calls: VideoCall[] };

export type VideoAdapterEntry = {
  endpoint: RegExp;
  create: (config: Required<AdapterConfig>) => VideoAdapter;
  statusBodies: Partial<Record<VideoJobState, JsonObject>>;
};

export type VideoKind = {
  kind: "video";
  cases: readonly VideoCase[];
  adapters: Partial<Record<string, VideoAdapterEntry>>;
  requestOf: (input: VisualInput, model: string) => VideoRequest;
};

export type VideoRun = {
  request: VideoRequest;
  job?: VideoJob;
  status?: VideoJobStatus;
  result?: VideoResult;
  error?: unknown;
};

export type VideoAsserts = Partial<Record<string, Check<VideoRun>>>;
