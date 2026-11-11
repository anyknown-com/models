import { streamText } from "./stream-text";
import { toModelError } from "./to-model-error";
import type { FinishReason } from "./types/finish-reason";
import type { TextAdapter } from "./types/text-adapter";
import type { TextRequest } from "./types/text-request";
import type { TokenUsage } from "./types/token-usage";
import type { ToolCall } from "./types/tool";

export async function generateText(
  adapter: TextAdapter,
  request: TextRequest,
): Promise<{
  text: string;
  toolCalls: ToolCall[];
  reason: Exclude<FinishReason, "error">;
  usage: TokenUsage;
  raw?: unknown;
}> {
  let text = "";
  const toolCalls: ToolCall[] = [];

  for await (const event of streamText(adapter, request)) {
    if (event.type === "text") text += event.delta;

    if (event.type === "tool-call") {
      toolCalls.push({ callId: event.callId, name: event.name, input: event.input });
    }

    if (event.type !== "finish") continue;

    if (event.reason === "error") {
      throw event.error ?? toModelError("finish reason: error", adapter.provider, request.signal);
    }

    return { text, toolCalls, reason: event.reason, usage: event.usage, raw: event.raw };
  }

  throw toModelError("stream ended without finish", adapter.provider, request.signal);
}
