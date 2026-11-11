import type { JsonValue } from "../types/json";
import type { ToolCall } from "../types/tool";
import { isJsonObject } from "../wire/is-json-object";

const RECIPIENT_PREFIX = "functions.";

export function parallelCallOf(
  callId: string,
  use: JsonValue,
  index: number,
  declared: ReadonlySet<string>,
): ToolCall | undefined {
  if (!isJsonObject(use)) return undefined;

  const { recipient_name: recipient, parameters } = use;

  if (typeof recipient !== "string" || !recipient.startsWith(RECIPIENT_PREFIX)) return undefined;
  if (typeof parameters !== "object" || parameters === null) return undefined;

  const name = recipient.slice(RECIPIENT_PREFIX.length);

  if (!declared.has(name)) return undefined;

  return { callId: `${callId}_${index}`, name, input: parameters };
}
