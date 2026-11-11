import type { ReadOptions } from "./read-options";
import type { VideoJob } from "./video-job";
import type { VideoJobStatus } from "./video-job-status";
import type { VideoRequest } from "./video-request";
import type { VideoResult } from "./video-result";

export interface VideoAdapter {
  readonly provider: string;
  submitVideo(request: VideoRequest): Promise<VideoJob>;
  readVideoStatus(job: VideoJob, options?: ReadOptions): Promise<VideoJobStatus>;
  readVideoResult(job: VideoJob, options?: ReadOptions): Promise<VideoResult>;
}
