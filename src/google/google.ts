import { defaultFetch } from "../default-fetch";
import type { AdapterConfig } from "../types/adapter-config";
import type { TextAdapter } from "../types/text-adapter";
import type { VideoAdapter } from "../types/video-adapter";
import { GOOGLE_BASE_URL, PROVIDER } from "./constants";
import { readInteraction } from "./read-interaction";
import { streamGenerateContent } from "./stream-generate-content";
import { submitVideo } from "./submit-video";
import type { GoogleCall } from "./types";
import { videoResultOf } from "./video-result-of";
import { videoStatusOf } from "./video-status-of";

export function google(config: AdapterConfig): TextAdapter & VideoAdapter {
  const call: GoogleCall = {
    key: config.key,
    fetch: config.fetch ?? defaultFetch,
    baseUrl: (config.baseUrl ?? GOOGLE_BASE_URL).replace(/\/$/, ""),
  };

  return {
    provider: PROVIDER,
    capabilities: () => ({ thinking: "none", effortLevels: [] }),
    stream: (request) => streamGenerateContent(call, request),
    submitVideo: (request) => submitVideo(call, request),
    readVideoStatus: async (job, options) =>
      videoStatusOf(await readInteraction(call, job, options)),
    readVideoResult: async (job, options) =>
      videoResultOf(await readInteraction(call, job, options)),
  };
}
