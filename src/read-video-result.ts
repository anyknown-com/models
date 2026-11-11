import { assertSameProvider } from "./assert-same-provider";
import { toModelError } from "./to-model-error";
import type { ReadOptions } from "./types/read-options";
import type { VideoAdapter } from "./types/video-adapter";
import type { VideoJob } from "./types/video-job";
import type { VideoResult } from "./types/video-result";

export async function readVideoResult(
  adapter: VideoAdapter,
  job: VideoJob,
  options?: ReadOptions,
): Promise<VideoResult> {
  try {
    options?.signal?.throwIfAborted();
    assertSameProvider(adapter.provider, job.provider);

    return await adapter.readVideoResult(job, options);
  } catch (error) {
    throw toModelError(error, adapter.provider, options?.signal);
  }
}
