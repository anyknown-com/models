import type { TranscribeRequest } from "../types/transcribe-request";
import { PROMPT_TERMS_MAX_BYTES, PROMPT_TERMS_SEPARATOR } from "./constants";
import { fitTerms } from "./fit-terms";
import type { FormField } from "./types";

export function transcriptionForm(
  request: TranscribeRequest,
  responseFormat: string,
  languageFields: readonly FormField[],
): FormData {
  const form = new FormData();

  form.set("file", request.audio, request.filename);
  form.set("model", request.model);
  form.set("response_format", responseFormat);

  for (const [name, value] of languageFields) form.append(name, value);

  const prompt = fitTerms(request.terms ?? [], PROMPT_TERMS_MAX_BYTES, PROMPT_TERMS_SEPARATOR);

  if (prompt.length > 0) form.set("prompt", prompt.join(PROMPT_TERMS_SEPARATOR));

  return form;
}
