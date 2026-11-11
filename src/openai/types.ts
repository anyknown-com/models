import type { JsonObject } from "../types/json";
import type { AssistantModelMessage } from "../types/model-message";

export type ResponsesCall = { provider: string; key: string; fetch: typeof fetch; baseUrl: string };

export type ResponsesRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type AssistantPart = Exclude<AssistantModelMessage["content"], string>[number];

export type Media = { data: Uint8Array | URL; mediaType: string; filename: string };

export type ErrorFields = { message?: string; code?: string | null; type?: string | null };

export type ResponsesEvent = {
  type: string;
  output_index?: number | null;
  item_id?: string;
  item?: { id?: string; type?: string; call_id?: string; name?: string; arguments?: string };
  delta?: string;
  message?: string;
  code?: string | null;
  error?: ErrorFields | null;
  response?: {
    incomplete_details?: { reason?: string } | null;
    usage?: JsonObject | null;
    error?: ErrorFields | null;
  };
};

export type StreamFailure = { message: string; code?: string; type?: string };
