import type { JsonObject } from "../types/json";
import type { ProviderOptions } from "../types/provider-options";

export type GoogleCall = { key: string; fetch: typeof fetch; baseUrl: string };

export type GoogleRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type GoogleContent = { role: "user" | "model"; parts: JsonObject[] };

export type GoogleContents = {
  contents: GoogleContent[];
  systemInstruction?: { parts: JsonObject[] };
};

export type ToolMedia = {
  data: Uint8Array | URL;
  mediaType: string;
  providerOptions?: ProviderOptions;
};

export type GooglePartChunk = { text?: string; thought?: boolean; thoughtSignature?: string };

export type GenerateContentChunk = {
  candidates?: { content?: { parts?: GooglePartChunk[] }; finishReason?: string }[];
  usageMetadata?: JsonObject;
};
