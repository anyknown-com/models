import { parsedOf } from "../wire/parsed-of";
import type { ProviderError } from "../wire/types";
import { withOverflow } from "../wire/with-overflow";
import { errorOf } from "./error-of";

export function modelErrorOf(body: string, status: number): ProviderError {
  return withOverflow(errorOf(parsedOf(body)) ?? { message: body }, body, status);
}
