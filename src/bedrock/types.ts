import type { JsonObject } from "../types/json";
import type {
  AssistantModelMessage,
  ToolModelMessage,
  UserModelMessage,
} from "../types/model-message";

export type EventFrame = { headers: Record<string, string>; payload: Uint8Array };

export type BedrockConfig = { key: string; fetch?: typeof fetch; baseUrl: string };

export type BedrockCall = { key: string; fetch: typeof fetch; baseUrl: string };

export type BedrockRequest = { url: string; headers: Record<string, string>; body: JsonObject };

export type BedrockMessage = { role: "user" | "assistant"; content: JsonObject[] };

export type UserPart = Exclude<UserModelMessage["content"], string>[number];

export type AssistantPart = Exclude<AssistantModelMessage["content"], string>[number];

export type RoleGroup =
  | { role: "user"; messages: (UserModelMessage | ToolModelMessage)[] }
  | { role: "assistant"; messages: AssistantModelMessage[] };
