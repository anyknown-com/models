import type { JsonObject } from "../types/json";

export type EventFrame = { headers: Record<string, string>; payload: Uint8Array };

export type BedrockConfig = { key: string; fetch?: typeof fetch; baseUrl: string };

export type BedrockCall = { key: string; fetch: typeof fetch; baseUrl: string };

export type BedrockRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type BedrockMessage = { role: "user" | "assistant"; content: JsonObject[] };
