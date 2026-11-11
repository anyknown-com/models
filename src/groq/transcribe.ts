import { bearerHeaders } from "../speech/bearer-headers";
import { firstSubtag } from "../speech/first-subtag";
import { readJson } from "../speech/read-json";
import { readTranscription } from "../speech/read-transcription";
import { segmentsSeconds } from "../speech/segments-seconds";
import { send } from "../speech/send";
import { transcriptionForm } from "../speech/transcription-form";
import type { FormField, SpeechCall } from "../speech/types";
import type { TranscribeRequest, TranscribeResult } from "../types/transcribe-request";

export async function transcribe(
  call: SpeechCall,
  request: TranscribeRequest,
): Promise<TranscribeResult> {
  const languageFields: FormField[] = request.language
    ? [["language", firstSubtag(request.language)]]
    : [];

  const upstream = new Request(`${call.baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: bearerHeaders(call.key),
    body: transcriptionForm(request, "verbose_json", languageFields),
  });

  const body = await readJson(call.provider, await send(call, upstream, request.signal));

  return {
    text: readTranscription(body),
    usage: { amount: segmentsSeconds(body), unit: "seconds" },
    raw: body,
  };
}
