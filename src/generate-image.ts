import { toModelError } from "./to-model-error";
import type { ImageAdapter } from "./types/image-adapter";
import type { ImageRequest } from "./types/image-request";
import type { ImageResult } from "./types/image-result";

export async function generateImage(
  adapter: ImageAdapter,
  request: ImageRequest,
): Promise<ImageResult> {
  try {
    request.signal?.throwIfAborted();

    return await adapter.generateImage(request);
  } catch (error) {
    throw toModelError(error, adapter.provider, request.signal);
  }
}
