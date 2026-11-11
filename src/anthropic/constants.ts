import type { KnownModel, ReadField } from "./types";

export const PROVIDER = "anthropic";

export const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";

export const ANTHROPIC_VERSION = "2023-06-01";

export const STRUCTURED_OUTPUTS_BETA = "structured-outputs-2025-11-13";

export const PDFS_BETA = "pdfs-2024-09-25";

export const PDF_MEDIA_TYPE = "application/pdf";

export const TEXT_MEDIA_TYPE = "text/plain";

export const STREAM_ERROR_STATUS: Readonly<Record<string, number>> = {
  api_error: 500,
  overloaded_error: 529,
  rate_limit_error: 429,
  request_too_large: 413,
  authentication_error: 401,
  permission_error: 403,
  not_found_error: 404,
  billing_error: 400,
  invalid_request_error: 400,
};

export const UNKNOWN_STREAM_ERROR_STATUS = 500;

export const DEFAULT_THINKING_BUDGET = 1024;

export const UNKNOWN_MODEL_MAX_OUTPUT_TOKENS = 4096;

export const NEWER_CLAUDE_MAX_OUTPUT_TOKENS = 128_000;

export const LEGACY_CLAUDE = /claude-(?:instant(?:-|$)|v?2(?=$|[-.:])|3(?=$|[-.]))/;

// https://docs.claude.com/en/docs/about-claude/models/overview#model-comparison-table
export const KNOWN_MODELS: readonly KnownModel[] = [
  {
    ids: [
      "claude-opus-5",
      "claude-opus-4-8",
      "claude-opus-4-7",
      "claude-fable-5",
      "claude-sonnet-5",
    ],
    maxOutputTokens: 128_000,
    structuredOutput: true,
    adaptiveThinking: true,
    xhighEffort: true,
  },
  {
    ids: ["claude-sonnet-4-6", "claude-opus-4-6"],
    maxOutputTokens: 128_000,
    structuredOutput: true,
    adaptiveThinking: true,
    xhighEffort: false,
  },
  {
    ids: ["claude-sonnet-4-5", "claude-opus-4-5", "claude-haiku-4-5"],
    maxOutputTokens: 64_000,
    structuredOutput: true,
    adaptiveThinking: false,
    xhighEffort: false,
  },
  {
    ids: ["claude-opus-4-1"],
    maxOutputTokens: 32_000,
    structuredOutput: true,
    adaptiveThinking: false,
    xhighEffort: false,
  },
  {
    ids: ["claude-sonnet-4-"],
    maxOutputTokens: 64_000,
    structuredOutput: false,
    adaptiveThinking: false,
    xhighEffort: false,
  },
  {
    ids: ["claude-opus-4-"],
    maxOutputTokens: 32_000,
    structuredOutput: false,
    adaptiveThinking: false,
    xhighEffort: false,
  },
  {
    ids: ["claude-3-haiku"],
    maxOutputTokens: 4096,
    structuredOutput: false,
    adaptiveThinking: false,
    xhighEffort: false,
  },
];

export const EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"];

const USAGE_COUNTS = [
  "input_tokens",
  "output_tokens",
  "cache_read_input_tokens",
  "cache_creation_input_tokens",
];

const usageFieldsAt = (path: string[]): ReadField[] => [
  { path, type: "object" },
  ...USAGE_COUNTS.map((key): ReadField => ({ path: [...path, key], type: "number" })),
  { path: [...path, "output_tokens_details"], type: "object" },
  { path: [...path, "output_tokens_details", "thinking_tokens"], type: "number" },
];

export const READ_FIELDS: readonly ReadField[] = [
  { path: ["type"], type: "string" },
  { path: ["index"], type: "number" },
  { path: ["message"], type: "object" },
  ...usageFieldsAt(["message", "usage"]),
  { path: ["content_block"], type: "object" },
  { path: ["content_block", "type"], type: "string" },
  { path: ["content_block", "id"], type: "string" },
  { path: ["content_block", "name"], type: "string" },
  { path: ["delta"], type: "object" },
  { path: ["delta", "type"], type: "string" },
  { path: ["delta", "text"], type: "string" },
  { path: ["delta", "thinking"], type: "string" },
  { path: ["delta", "partial_json"], type: "string" },
  { path: ["delta", "stop_reason"], type: "string" },
  ...usageFieldsAt(["usage"]),
  { path: ["error"], type: "object" },
  { path: ["error", "type"], type: "string" },
];
