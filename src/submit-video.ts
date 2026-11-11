import { assertSameProvider } from "./assert-same-provider";
import { toModelError } from "./to-model-error";
import type { VideoAdapter } from "./types/video-adapter";
import type { VideoJob } from "./types/video-job";
import type { VideoRequest } from "./types/video-request";

export async function submitVideo(adapter: VideoAdapter, request: VideoRequest): Promise<VideoJob> {
  try {
    request.signal?.throwIfAborted();

    if (request.source) assertSameProvider(adapter.provider, request.source.provider);

    return await adapter.submitVideo(request);
  } catch (error) {
    throw toModelError(error, adapter.provider, request.signal);
  }
}
