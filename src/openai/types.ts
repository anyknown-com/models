import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";

export type ResponsesCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

export type ResponsesRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type AssistantPart = Exclude<AssistantModelMessage["content"], string>[number];

export type Media = { data: Uint8Array | URL; mediaType: string; filename: string };
