import { firstSubtag } from "../speech/first-subtag";
import { LANGUAGE_CODES } from "./constants";

export function languageCode(language: string): string {
  const primary = firstSubtag(language);

  return LANGUAGE_CODES[primary] ?? primary;
}
