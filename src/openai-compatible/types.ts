import type { JsonObject } from "../types/json";

export type OpenaiCompatibleConfig = {
  key: string;
  fetch?: typeof fetch;
  baseUrl: string;
  authHeader?: string;
  name: string;
};

export type ChatRequest = { url: string; headers: Record<string, string>; body: JsonObject };
