import { assertSameProvider } from "./assert-same-provider";
import { toModelError } from "./to-model-error";
import type { ReadOptions } from "./types/read-options";
import type { VideoAdapter } from "./types/video-adapter";
import type { VideoJob } from "./types/video-job";
import type { VideoJobStatus } from "./types/video-job-status";

export async function readVideoStatus(
  adapter: VideoAdapter,
  job: VideoJob,
  options?: ReadOptions,
): Promise<VideoJobStatus> {
  try {
    options?.signal?.throwIfAborted();
    assertSameProvider(adapter.provider, job.provider);

    return await adapter.readVideoStatus(job, options);
  } catch (error) {
    throw toModelError(error, adapter.provider, options?.signal);
  }
}
