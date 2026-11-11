import type { VideoRequest } from "../../../src/types/video-request";

export const recut: VideoRequest = {
  model: "model",
  prompt: "Make the ball blue.",
  providerOptions: { google: { aspect_ratio: "16:9", resolution: "720p", duration: "3s" } },
};
