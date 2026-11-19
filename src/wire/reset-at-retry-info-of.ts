import { fieldOf } from "../speech/field-of";
import { parsedOf } from "./parsed-of";
import { instantOf } from "./reset-at-instant-of";

const RETRY_INFO = "type.googleapis.com/google.rpc.RetryInfo";

/**
 * The epoch ms of the reset a Google error names in its `google.rpc.RetryInfo` detail:
 * `retryDelay` as a duration from now (`36s`, `1.5s`).
 */
export function retryInfoResetOf(body: string, now: number): number | undefined {
  const details = fieldOf(fieldOf(parsedOf(body), "error"), "details");

  const retryInfo = Array.isArray(details)
    ? details.find((detail) => fieldOf(detail, "@type") === RETRY_INFO)
    : undefined;

  const delay = fieldOf(retryInfo, "retryDelay");

  return typeof delay === "string" ? instantOf(delay, now) : undefined;
}
