import type { ImageRequest } from "../../../src/types/image-request";
import type { ImageResult } from "../../../src/types/image-result";
import type { SpeechAsserts } from "../speech/types";
import type { VideoAsserts } from "../visual/types";
import { imaged } from "./imaged";
import { speechErrorAsserts } from "./speech-error-asserts";
import { videoMade } from "./video-made";
import { videoStatusIs } from "./video-status-is";

export const IMAGE_ASSERTS: SpeechAsserts<ImageRequest, ImageResult> = {
  "image-generate": imaged,
  ...speechErrorAsserts("image"),
};

export const VIDEO_ASSERTS: VideoAsserts = {
  video: videoMade,
  "video-status-queued": videoStatusIs("queued"),
  "video-status-running": videoStatusIs("running"),
  "video-status-failed": videoStatusIs("failed"),
  ...speechErrorAsserts("video"),
};
