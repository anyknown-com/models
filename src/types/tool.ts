import type { JsonObject, JsonValue } from "./json";

export type ToolDeclaration = { name: string; description: string; inputSchema: JsonObject };

export type ToolCall = { callId: string; name: string; input: JsonValue | string };
