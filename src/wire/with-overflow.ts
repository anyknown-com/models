import { isOverflow } from "../is-overflow";
import type { ProviderError } from "./types";

export function withOverflow(fields: ProviderError, body: string, status: number): ProviderError {
  return isOverflow(status, `${fields.message} ${body}`) ? { ...fields, kind: "overflow" } : fields;
}
