import { fieldOf } from "../speech/field-of";
import type { VideoJobStatus } from "../types/video-job-status";
import { videoFailureOf } from "./video-failure-of";

export function videoStatusOf(body: unknown): VideoJobStatus {
  const status = fieldOf(body, "status");

  if (status === "completed") return { status: "succeeded", raw: body };
  if (status === "in_progress") return { status: "running", raw: body };

  return { status: "failed", error: videoFailureOf(body, status), raw: body };
}
