import type { JsonObject } from "../types/json";
import type { VideoRequest } from "../types/video-request";
import { VIDEO_FORMAT, VIDEO_FORMAT_OPTIONS } from "./constants";
import type { GoogleCall, GoogleRequest } from "./types";

const formatOf = (options: JsonObject = {}): JsonObject => ({
  ...VIDEO_FORMAT,
  ...Object.fromEntries(
    VIDEO_FORMAT_OPTIONS.filter((key) => key in options).map((key) => [key, options[key]]),
  ),
});

export function videoSubmitRequestOf(call: GoogleCall, request: VideoRequest): GoogleRequest {
  const { model, prompt, source, providerOptions } = request;

  const edit = source && {
    previous_interaction_id: source.id,
    generation_config: { video_config: { task: "edit" } },
  };

  return {
    url: `${call.baseUrl}/interactions`,
    headers: { "x-goog-api-key": call.key },
    body: {
      model,
      input: prompt,
      background: true,
      response_format: formatOf(providerOptions?.google),
      ...edit,
    },
  };
}
