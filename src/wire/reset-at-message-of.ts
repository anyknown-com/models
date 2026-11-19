import { fieldOf } from "../speech/field-of";
import { parsedOf } from "./parsed-of";
import { instantOf } from "./reset-at-instant-of";

// A Claude subscription's limit text: `Claude AI usage limit reached|1793390439` (epoch seconds).
const CLAUDE_LIMIT = /limit reached\|(\d+)/i;

const numberOf = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

/**
 * The epoch ms of the reset a subscription limit message names: the Claude limit text, or a
 * ChatGPT subscription's `usage_limit_reached` error with `resets_at` (epoch seconds) or
 * `resets_in_seconds`.
 */
export function messageResetOf(body: string, now: number): number | undefined {
  const claude = CLAUDE_LIMIT.exec(body)?.[1];

  if (claude !== undefined) return instantOf(claude, now);

  const error = fieldOf(parsedOf(body), "error");
  const resetsAt = numberOf(fieldOf(error, "resets_at"));
  const resetsIn = numberOf(fieldOf(error, "resets_in_seconds"));

  if (resetsAt !== undefined) return resetsAt * 1000;

  return resetsIn === undefined ? undefined : now + resetsIn * 1000;
}
