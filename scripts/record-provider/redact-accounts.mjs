import { ACCOUNT_KEYS, ACCOUNT_REDACTED } from "./constants.mjs";

const ACCOUNT_FIELD = new RegExp(`"(${ACCOUNT_KEYS.join("|")})"(\\s*):(\\s*)("[^"]*"|\\d+)`, "g");

const redactText = (text) => text.replaceAll(ACCOUNT_FIELD, `"$1"$2:$3"${ACCOUNT_REDACTED}"`);

const redactValue = (key, value) =>
  ACCOUNT_KEYS.includes(key) && ["string", "number"].includes(typeof value)
    ? ACCOUNT_REDACTED
    : value;

export function redactAccounts(response) {
  const redacted = JSON.parse(JSON.stringify(response), redactValue);

  return "chunks" in redacted ? { ...redacted, chunks: redacted.chunks.map(redactText) } : redacted;
}
