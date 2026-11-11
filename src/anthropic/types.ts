import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";

export type AnthropicCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

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
