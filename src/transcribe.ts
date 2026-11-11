import { toModelError } from "./to-model-error";
import type { TranscribeAdapter } from "./types/transcribe-adapter";
import type { TranscribeRequest, TranscribeResult } from "./types/transcribe-request";

export async function transcribe(
  adapter: TranscribeAdapter,
  request: TranscribeRequest,
): Promise<TranscribeResult> {
  try {
    return await adapter.transcribe(request);
  } catch (error) {
    throw toModelError(error, adapter.provider, request.signal);
  }
}
