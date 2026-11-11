import type { JsonObject } from "../types/json";

export type GoogleCall = { key: string; fetch: typeof fetch; baseUrl: string };

export type GoogleRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type GoogleContent = { role: "user" | "model"; parts: JsonObject[] };

export type GoogleContents = {
  contents: GoogleContent[];
  systemInstruction?: { parts: JsonObject[] };
};
