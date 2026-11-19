import { instantOf } from "./reset-at-instant-of";
import { limitResetOf } from "./reset-at-limit-of";
import { messageResetOf } from "./reset-at-message-of";
import { retryInfoResetOf } from "./reset-at-retry-info-of";

// Date's range: ±8.64e15 ms from the epoch.
const MAX_MS = 8.64e15;

// A Claude subscription sends `anthropic-ratelimit-unified-reset` (epoch seconds) on every
// response; it is the reset only while `anthropic-ratelimit-unified-status` is `rejected`.
const subscriptionResetOf = (headers: Headers, now: number): number | undefined =>
  headers.get("anthropic-ratelimit-unified-status") === "rejected"
    ? instantOf(headers.get("anthropic-ratelimit-unified-reset"), now)
    : undefined;

/**
 * When the failed call can succeed again, as an ISO time, or null when the response does not
 * say. Read in order: the reset in a subscription limit message, a Google `RetryInfo` delay,
 * `retry-after`, a Claude subscription's rejected unified window, and on a 429 the
 * `anthropic-ratelimit-*-reset` and `x-ratelimit-reset-*` headers.
 */
export function resetAtOf(
  status: number,
  headers: Headers,
  body: string,
  now: number,
): string | null {
  const at =
    messageResetOf(body, now) ??
    retryInfoResetOf(body, now) ??
    instantOf(headers.get("retry-after"), now) ??
    subscriptionResetOf(headers, now) ??
    (status === 429 ? limitResetOf(headers, now) : undefined);

  return at === undefined || !(Math.abs(at) <= MAX_MS) ? null : new Date(at).toISOString();
}
