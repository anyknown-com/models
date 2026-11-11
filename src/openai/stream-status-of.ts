import { STREAM_STATUS_TERMS, UNKNOWN_STREAM_STATUS } from "./constants";
import type { StreamFailure } from "./types";

const HTTP_STATUS = /^[45]\d\d$/;

export function streamStatusOf({ code, type }: StreamFailure): number {
  if (code && HTTP_STATUS.test(code)) return Number(code);

  const named = [code, type].filter(Boolean).join(" ").toLowerCase();

  return STREAM_STATUS_TERMS.find(([term]) => term.test(named))?.[1] ?? UNKNOWN_STREAM_STATUS;
}
