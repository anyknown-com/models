export const PROVIDER = "anthropic";

export const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";

export const ANTHROPIC_VERSION = "2023-06-01";

export const DEFAULT_THINKING_BUDGET = 1024;

export const UNKNOWN_MODEL_MAX_OUTPUT_TOKENS = 4096;

export const NEWER_CLAUDE_MAX_OUTPUT_TOKENS = 128_000;

export const LEGACY_CLAUDE = /claude-(?:instant(?:-|$)|v?2(?=$|[-.:])|3(?=$|[-.]))/;

// https://docs.claude.com/en/docs/about-claude/models/overview#model-comparison-table
export const KNOWN_MAX_OUTPUT_TOKENS: readonly (readonly [readonly string[], number])[] = [
  [
    [
      "claude-opus-5",
      "claude-opus-4-8",
      "claude-opus-4-7",
      "claude-fable-5",
      "claude-sonnet-5",
      "claude-sonnet-4-6",
      "claude-opus-4-6",
    ],
    128_000,
  ],
  [["claude-sonnet-4-5", "claude-opus-4-5", "claude-haiku-4-5"], 64_000],
  [["claude-opus-4-1"], 32_000],
  [["claude-sonnet-4-"], 64_000],
  [["claude-opus-4-"], 32_000],
  [["claude-3-haiku"], 4096],
];
