const DURATION = /^(?:\d+(?:\.\d+)?(?:ms|h|m|s))+$/;
const DURATION_PART = /(\d+(?:\.\d+)?)(ms|h|m|s)/g;
const NUMBER = /^\d+(?:\.\d+)?$/;
const UNIT_MS: Record<string, number> = { h: 3_600_000, m: 60_000, s: 1000, ms: 1 };
// A bare number this large is an epoch time, not a wait: 1e9 seconds is 2001-09-09.
const EPOCH_SECONDS = 1e9;
const EPOCH_MS = 1e12;

const durationMsOf = (text: string): number =>
  [...text.matchAll(DURATION_PART)].reduce(
    (total, [, amount, unit]) => total + Number(amount) * (UNIT_MS[unit ?? ""] ?? 0),
    0,
  );

/**
 * The epoch ms a reset header value names: seconds from now (`120`), a duration from now
 * (`6m0s`, `20ms`), epoch seconds or ms, or a date (RFC 3339 or an HTTP date).
 */
export function instantOf(value: string | null | undefined, now: number): number | undefined {
  const text = value?.trim() ?? "";

  if (text === "") return undefined;

  if (DURATION.test(text)) return now + durationMsOf(text);

  if (NUMBER.test(text)) {
    const amount = Number(text);

    if (amount >= EPOCH_MS) return amount;

    return amount >= EPOCH_SECONDS ? amount * 1000 : now + amount * 1000;
  }

  const date = Date.parse(text);

  return Number.isNaN(date) ? undefined : date;
}
