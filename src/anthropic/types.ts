import type { JsonObject } from "../types/json";

export type AnthropicCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

export type AnthropicMessage = { role: "user" | "assistant"; content: JsonObject[] };

export type AnthropicRequest = {
  url: string;
  headers: Record<string, string>;
  body: JsonObject;
};
