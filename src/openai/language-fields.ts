import { firstSubtag } from "../speech/first-subtag";
import type { FormField } from "../speech/types";
import type { TranscribeRequest } from "../types/transcribe-request";
import { gptTranscribeLanguages } from "./gpt-transcribe-languages";

export function languageFields(request: TranscribeRequest): FormField[] {
  if (request.model === "gpt-transcribe") {
    return gptTranscribeLanguages(request.language, request.languages).map((code) => [
      "languages[]",
      code,
    ]);
  }

  return request.language ? [["language", firstSubtag(request.language)]] : [];
}
