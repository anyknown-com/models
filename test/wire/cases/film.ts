import type { VideoRequest } from "../../../src/types/video-request";

export const film: VideoRequest = {
  model: "model",
  prompt: "A red ball rolls slowly across a white table.",
  providerOptions: { google: { aspect_ratio: "16:9", resolution: "720p", duration: "3s" } },
};
