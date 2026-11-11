import { toModelError } from "./to-model-error";
import type { SynthesizeAdapter } from "./types/synthesize-adapter";
import type { SynthesizeRequest, SynthesizeResult } from "./types/synthesize-request";

export async function synthesize(
  adapter: SynthesizeAdapter,
  request: SynthesizeRequest,
): Promise<SynthesizeResult> {
  try {
    return await adapter.synthesize(request);
  } catch (error) {
    throw toModelError(error, adapter.provider, request.signal);
  }
}
