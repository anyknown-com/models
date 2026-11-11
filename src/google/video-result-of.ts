import { ModelError } from "../model-error";
import { fieldOf } from "../speech/field-of";
import type { VideoResult } from "../types/video-result";
import { bytesOfBase64 } from "../wire/base64";
import { PROVIDER } from "./constants";
import { videoContentOf } from "./video-content-of";
import { withoutVideoData } from "./without-video-data";

const secondsOf = (duration: unknown): number | null => {
  const match = typeof duration === "string" ? /^(\d+)s$/.exec(duration) : null;

  return match ? Number(match[1]) : null;
};

export function videoResultOf(body: unknown): VideoResult {
  const content = videoContentOf(body);
  const data = fieldOf(content, "data");
  const mediaType = fieldOf(content, "mime_type");

  if (typeof data !== "string") {
    throw new ModelError({
      kind: "server",
      provider: PROVIDER,
      retryable: false,
      message: "google returned no video",
      body: JSON.stringify(body),
    });
  }

  return {
    video: bytesOfBase64(data),
    ...(typeof mediaType === "string" ? { mediaType } : {}),
    usage: {
      amount: secondsOf(fieldOf(fieldOf(body, "response_format"), "duration")),
      unit: "seconds",
    },
    raw: withoutVideoData(body),
  };
}
