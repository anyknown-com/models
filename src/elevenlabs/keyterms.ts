import {
  KEYTERM_MAX_LENGTH,
  KEYTERM_MAX_WORDS,
  KEYTERM_UNSUPPORTED,
  KEYTERMS_MAX,
} from "./constants";

export function elevenlabsKeyterms(terms: readonly string[]): string[] {
  return terms
    .filter(
      (term) =>
        term.length <= KEYTERM_MAX_LENGTH &&
        term.split(/\s+/).length <= KEYTERM_MAX_WORDS &&
        !KEYTERM_UNSUPPORTED.test(term),
    )
    .slice(0, KEYTERMS_MAX);
}
