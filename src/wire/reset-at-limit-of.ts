import { instantOf } from "./reset-at-instant-of";

type Window = { at: number; spent: boolean };

// Anthropic API key windows: `anthropic-ratelimit-<window>-reset` (RFC 3339) next to
// `anthropic-ratelimit-<window>-remaining`. The `unified` windows are a subscription's; they are
// read from `anthropic-ratelimit-unified-status` instead, since they are sent on every 429.
// OpenAI: `x-ratelimit-reset-<window>` (a duration such as `6m0s`) next to
// `x-ratelimit-remaining-<window>`.
const FAMILIES = [
  {
    reset: /^anthropic-ratelimit-(?!unified)(.+)-reset$/,
    remaining: (window: string) => `anthropic-ratelimit-${window}-remaining`,
  },
  {
    reset: /^x-ratelimit-reset-(.+)$/,
    remaining: (window: string) => `x-ratelimit-remaining-${window}`,
  },
];

const windowsOf = (headers: Headers, now: number): Window[] =>
  [...headers].flatMap(([name, value]) =>
    FAMILIES.flatMap(({ reset, remaining }) => {
      const window = reset.exec(name)?.[1];
      const at = window === undefined ? undefined : instantOf(value, now);

      if (window === undefined || at === undefined) return [];

      return [{ at, spent: headers.get(remaining(window))?.trim() === "0" }];
    }),
  );

/** The latest reset of the rate-limit windows with nothing left, or of all of them if none is at 0. */
export function limitResetOf(headers: Headers, now: number): number | undefined {
  const windows = windowsOf(headers, now);
  const spent = windows.filter((window) => window.spent);
  const times = (spent.length > 0 ? spent : windows).map((window) => window.at);

  return times.length > 0 ? Math.max(...times) : undefined;
}
