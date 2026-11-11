import type { ToolCall } from "../types/tool";
import { isJsonObject } from "../wire/is-json-object";
import { parsedOf } from "../wire/parsed-of";
import { parallelCallOf } from "./parallel-call-of";

export function parallelCallsOf(
  callId: string,
  args: string,
  declared: ReadonlySet<string>,
): ToolCall[] | undefined {
  const parsed = parsedOf(args);
  const uses = parsed !== undefined && isJsonObject(parsed) ? parsed.tool_uses : undefined;

  if (!Array.isArray(uses) || uses.length === 0) return undefined;

  const calls = uses.map((use, index) => parallelCallOf(callId, use, index, declared));

  return calls.every((call) => call !== undefined) ? calls : undefined;
}
