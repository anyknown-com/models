import { anthropic } from "../../src/anthropic";
import { google } from "../../src/google";
import { openai } from "../../src/openai";
import { openaiCompatible } from "../../src/openai-compatible";
import type { TextAdapterEntry } from "./types";

export const REPLAY_KEY = "key";

export const TEXT_ADAPTERS: Partial<Record<string, TextAdapterEntry>> = {
  openai: { endpoint: /\/responses$/, create: (_, config) => openai(config) },
  anthropic: { endpoint: /\/messages$/, create: (_, config) => anthropic(config) },
  google: {
    endpoint: /\/models\/[^/]+:streamGenerateContent\?alt=sse$/,
    create: (_, config) => google(config),
  },
  "openai-compatible": {
    endpoint: /\/chat\/completions$/,
    create: (name, config) => openaiCompatible({ ...config, name }),
  },
};
