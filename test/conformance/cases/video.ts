import type { VideoCase } from "./types";

const film = {
  prompt: "A red ball rolls slowly across a white table.",
  providerOptions: { google: { aspect_ratio: "16:9", resolution: "720p", duration: "3s" } },
};

const SUBMIT = ["submit"] as const;

export const VIDEO_CASES = [
  { id: "video", source: "recorded", request: film, steps: ["submit", "status", "result"] },
  { id: "video-status-queued", source: "derived", from: "video", jobStatus: "queued" },
  { id: "video-status-running", source: "derived", from: "video", jobStatus: "running" },
  { id: "video-status-failed", source: "derived", from: "video", jobStatus: "failed" },
  { id: "video-error-auth", source: "recorded", request: film, steps: SUBMIT, record: "wrong-key" },
  {
    id: "video-error-bad-request",
    source: "recorded",
    request: { ...film, prompt: "" },
    steps: SUBMIT,
  },
  { id: "video-error-rate-limit", source: "derived", from: "video-error-auth", status: 429 },
  { id: "video-error-server", source: "derived", from: "video-error-auth", status: 500 },
  { id: "video-error-network", source: "synthetic", request: film, fetch: "throws" },
  { id: "video-abort", source: "synthetic", request: film, fetch: "aborts" },
] as const satisfies readonly VideoCase[];

export type VideoCaseId = (typeof VIDEO_CASES)[number]["id"];
