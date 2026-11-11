import type { ProviderError } from "./types";

const OVERFLOW = /context|tokens/i;

export function withOverflow(fields: ProviderError, body: string, status: number): ProviderError {
  const overflow = status === 400 && OVERFLOW.test(`${fields.message} ${body}`);

  return overflow ? { ...fields, kind: "overflow" } : fields;
}
