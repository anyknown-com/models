import { GPT_TRANSCRIBE_LANGUAGES } from "./constants";

export function gptTranscribeLanguages(
  language: string | undefined,
  languages: readonly string[] | undefined,
): string[] {
  const codes = (languages ?? (language ? [language] : [])).map(
    (tag) => GPT_TRANSCRIBE_LANGUAGES[tag],
  );

  return codes.every((code): code is string => code !== undefined) ? codes : [];
}
