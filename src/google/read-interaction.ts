import { readJson } from "../speech/read-json";
import type { ReadOptions } from "../types/read-options";
import type { VideoJob } from "../types/video-job";
import { get } from "../wire/get";
import { PROVIDER } from "./constants";
import { modelErrorOf } from "./model-error-of";
import type { GoogleCall } from "./types";

export async function readInteraction(
  call: GoogleCall,
  job: VideoJob,
  options?: ReadOptions,
): Promise<unknown> {
  const response = await get({
    provider: PROVIDER,
    url: `${call.baseUrl}/interactions/${encodeURIComponent(job.id)}`,
    headers: { "x-goog-api-key": call.key },
    fetch: call.fetch,
    signal: options?.signal,
    errorOf: modelErrorOf,
  });

  return readJson(PROVIDER, response);
}
