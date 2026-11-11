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

export type Signatures = readonly (readonly [string, readonly (number | null)[]])[];

export type MessageContext = { model: string; documentName: (filename?: string) => string };

export type Media = { bytes: Uint8Array; mediaType: string; filename?: string };

export type BlockKind = "text" | "reasoning";

export type ReasoningDelta = {
  text?: string;
  signature?: string;
  data?: string;
  redactedContent?: string;
};

export type BlockDelta = { text?: string; reasoningContent?: ReasoningDelta | null };

export type ConverseEvent = {
  contentBlockStart?: { contentBlockIndex: number; start?: { toolUse?: JsonObject | null } | null };
  contentBlockDelta?: { contentBlockIndex: number; delta?: BlockDelta | null };
  contentBlockStop?: { contentBlockIndex: number };
  messageStop?: { stopReason: string };
  metadata?: { usage?: JsonObject | null };
};
