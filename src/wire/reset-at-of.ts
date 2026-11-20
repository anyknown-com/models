import { instantOf } from "./reset-at-instant-of";
import { limitResetOf } from "./reset-at-limit-of";
import { messageResetOf } from "./reset-at-message-of";
import { retryInfoResetOf } from "./reset-at-retry-info-of";

// Date's range: ±8.64e15 ms from the epoch.
const MAX_MS = 8.64e15;

// A Claude subscription sends `anthropic-ratelimit-unified[-<window>]-reset` (epoch seconds) next
// to `anthropic-ratelimit-unified[-<window>]-status` on every response; a reset counts only while
// its status is `rejected`. With several rejected windows, the latest reset is when calls work again.
const UNIFIED_STATUS = /^anthropic-ratelimit-unified(-.+)?-status$/;

const subscriptionResetOf = (headers: Headers, now: number): number | undefined => {
  const times = [...headers].flatMap(([name, value]) => {
    const match = UNIFIED_STATUS.exec(name);

    if (!match || value.trim() !== "rejected") return [];

    const at = instantOf(headers.get(`anthropic-ratelimit-unified${match[1] ?? ""}-reset`), now);

    return at === undefined ? [] : [at];
  });

  return times.length > 0 ? Math.max(...times) : undefined;
};

/**
 * When the failed call can succeed again, as an ISO time, or null when the response does not
 * say. Read in order: the reset in a subscription limit message, a Google `RetryInfo` delay,
 * the latest of a Claude subscription's rejected unified windows, `retry-after`, and on a 429 the
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
    subscriptionResetOf(headers, now) ??
    instantOf(headers.get("retry-after"), now) ??
    (status === 429 ? limitResetOf(headers, now) : undefined);

  return at === undefined || !(Math.abs(at) <= MAX_MS) ? null : new Date(at).toISOString();
}
