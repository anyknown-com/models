import { readJson } from "../speech/read-json";
import type { VideoJob } from "../types/video-job";
import type { VideoRequest } from "../types/video-request";
import { post } from "../wire/post";
import { PROVIDER } from "./constants";
import type { GoogleCall } from "./types";
import { videoJobOf } from "./video-job-of";
import { videoSubmitRequestOf } from "./video-submit-request-of";

export async function submitVideo(call: GoogleCall, request: VideoRequest): Promise<VideoJob> {
  const response = await post({
    provider: PROVIDER,
    ...videoSubmitRequestOf(call, request),
    fetch: call.fetch,
    signal: request.signal,
    errorOf: (text) => ({ message: text }),
  });

  return videoJobOf(await readJson(PROVIDER, response));
}
