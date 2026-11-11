import type { JsonObject } from "../types/json";

export type OpenaiCompatibleConfig = {
  key: string;
  fetch?: typeof fetch;
  baseUrl: string;
  authHeader?: string;
  name: string;
};

export type ChatRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type ChatDelta = { content?: unknown; reasoning_content?: unknown; reasoning?: unknown };

export type ChatChunk = {
  usage?: JsonObject | null;
  choices?: { delta?: ChatDelta | null; finish_reason?: string | null }[];
};

export type ContentDelta = { type: "text" | "reasoning"; text: string };
