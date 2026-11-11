import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";

export type AnthropicCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

export type Media = { data: Uint8Array | URL; mediaType: string };

export type AnthropicMessage = { role: "user" | "assistant"; content: JsonObject[] };

export type AnthropicRequest = {
  url: string;
  headers: Record<string, string>;
  body: JsonObject;
};

export type KnownModel = {
  ids: readonly string[];
  maxOutputTokens: number;
  structuredOutput: boolean;
};

export type ClaudeModel = { maxOutputTokens: number; known: boolean; structuredOutput: boolean };

export type AssistantPart = Exclude<AssistantModelMessage["content"], string>[number];

export type MessagesEvent = {
  type: string;
  index?: number;
  message?: { usage?: JsonObject };
  content_block?: { type: string };
  delta?: { type?: string; text?: string; thinking?: string; stop_reason?: string | null };
  usage?: JsonObject;
};
