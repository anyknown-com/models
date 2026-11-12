import { generateImage } from "../../../src/generate-image";
import { google } from "../../../src/google";
import { openai } from "../../../src/openai";
import type { ImageRequest } from "../../../src/types/image-request";
import type { ImageResult } from "../../../src/types/image-result";
import { IMAGE_CASES, VIDEO_CASES } from "../cases";
import type { VisualInput } from "../cases";
import type { SpeechKind } from "../speech/types";
import type { VideoKind } from "./types";
import { visualRequestOf } from "./visual-request-of";

export const IMAGE: SpeechKind<VisualInput, ImageRequest, ImageResult> = {
  kind: "image",
  cases: IMAGE_CASES,
  requestOf: visualRequestOf,
  adapters: {
    openai: {
      endpoint: /\/images\/(generations|edits)$/,
      create: (config) => (request) => generateImage(openai(config), request),
    },
  },
};

export const VIDEO: VideoKind = {
  kind: "video",
  cases: VIDEO_CASES,
  requestOf: visualRequestOf,
  adapters: {
    google: {
      endpoint: /\/interactions$/,
      create: (config) => google(config),
      statusBodies: {
        running: { status: "in_progress" },
        failed: {
          status: "failed",
          errors: [{ code: "INTERNAL", message: "The video could not be generated." }],
        },
      },
    },
  },
};
