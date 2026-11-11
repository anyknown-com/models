import type { JsonObject } from "../types/json";

export type ResponsesCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

export type ResponsesRequest = { url: string; headers: Record<string, string>; body: JsonObject };
