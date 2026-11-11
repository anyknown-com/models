import type { ReadField } from "./types";

export const PROVIDER = "google";

export const GOOGLE_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const GENERATION_OPTIONS = [
  "audioTimestamp",
  "responseModalities",
  "thinkingConfig",
  "mediaResolution",
  "imageConfig",
];

export const SKIP_THOUGHT_SIGNATURE = "skip_thought_signature_validator";

export const TOOL_SUCCEEDED = "Tool executed successfully.";

export const PARTS_PATH = ["candidates", "0", "content", "parts"];

const USAGE_COUNTS = [
  "promptTokenCount",
  "candidatesTokenCount",
  "thoughtsTokenCount",
  "cachedContentTokenCount",
];

export const CHUNK_FIELDS: readonly ReadField[] = [
  { path: ["candidates"], type: "array" },
  { path: ["candidates", "0"], type: "object" },
  { path: ["candidates", "0", "content"], type: "object" },
  { path: PARTS_PATH, type: "array" },
  { path: ["candidates", "0", "finishReason"], type: "string" },
  { path: ["usageMetadata"], type: "object" },
  ...USAGE_COUNTS.map((key): ReadField => ({ path: ["usageMetadata", key], type: "number" })),
  { path: ["promptFeedback"], type: "object" },
  { path: ["promptFeedback", "blockReason"], type: "string" },
];

export const PART_FIELDS: readonly ReadField[] = [
  { path: [], type: "object", required: true },
  { path: ["text"], type: "string" },
  { path: ["thought"], type: "boolean" },
  { path: ["thoughtSignature"], type: "string" },
  { path: ["functionCall"], type: "object" },
  { path: ["functionCall", "id"], type: "string" },
  { path: ["functionCall", "name"], type: "string" },
];

// https://aistudio.google.com/docs/omni
export const VIDEO_FORMAT = {
  type: "video",
  aspect_ratio: "16:9",
  resolution: "720p",
  duration: "10s",
};

export const VIDEO_FORMAT_OPTIONS = ["aspect_ratio", "resolution", "duration"];
