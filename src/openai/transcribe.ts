import { bearerHeaders } from "../speech/bearer-headers";
import { readJson } from "../speech/read-json";
import { send } from "../speech/send";
import { transcriptionForm } from "../speech/transcription-form";
import type { SpeechCall } from "../speech/types";
import type { TranscribeRequest, TranscribeResult } from "../types/transcribe-request";
import { languageFields } from "./language-fields";
import { readTranscription } from "./read-transcription";
import { transcriptionSeconds } from "./transcription-seconds";

export async function transcribe(
  call: SpeechCall,
  request: TranscribeRequest,
): Promise<TranscribeResult> {
  const responseFormat = request.model === "whisper-1" ? "verbose_json" : "json";

  const upstream = new Request(`${call.baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: bearerHeaders(call.key),
    body: transcriptionForm(request, responseFormat, languageFields(request)),
  });

  const body = await readJson(call.provider, await send(call, upstream, request.signal));

  return {
    text: readTranscription(body),
    usage: { amount: transcriptionSeconds(body), unit: "seconds" },
    raw: body,
  };
}
