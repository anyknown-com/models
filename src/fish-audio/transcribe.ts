import { bearerHeaders } from "../speech/bearer-headers";
import { firstSubtag } from "../speech/first-subtag";
import { readJson } from "../speech/read-json";
import { readTranscription } from "../speech/read-transcription";
import { segmentsSeconds } from "../speech/segments-seconds";
import { send } from "../speech/send";
import type { SpeechCall } from "../speech/types";
import type { TranscribeRequest, TranscribeResult } from "../types/transcribe-request";

export async function transcribe(
  call: SpeechCall,
  request: TranscribeRequest,
): Promise<TranscribeResult> {
  const form = new FormData();

  form.set("audio", request.audio, request.filename);

  if (request.language) form.set("language", firstSubtag(request.language));

  const upstream = new Request(`${call.baseUrl}/v1/asr`, {
    method: "POST",
    headers: { ...bearerHeaders(call.key), model: request.model },
    body: form,
  });

  const body = await readJson(call.provider, await send(call, upstream, request.signal));

  return {
    text: readTranscription(body),
    usage: { amount: segmentsSeconds(body), unit: "seconds" },
    raw: body,
  };
}
