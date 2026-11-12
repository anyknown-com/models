import { readVideoResult } from "../../../src/read-video-result";
import { readVideoStatus } from "../../../src/read-video-status";
import { submitVideo } from "../../../src/submit-video";
import type { VideoAdapter } from "../../../src/types/video-adapter";
import type { VideoRequest } from "../../../src/types/video-request";
import type { VideoRun } from "./types";

type Ran = Omit<VideoRun, "request">;

export async function videoSteps(
  adapter: VideoAdapter,
  request: VideoRequest,
  left: () => number,
): Promise<Ran> {
  const ran: Ran = {};
  const options = { signal: request.signal };

  try {
    ran.job = await submitVideo(adapter, request);

    if (left() > 0) ran.status = await readVideoStatus(adapter, ran.job, options);

    if (left() > 0) ran.result = await readVideoResult(adapter, ran.job, options);
  } catch (error) {
    ran.error = error;
  }

  return ran;
}
