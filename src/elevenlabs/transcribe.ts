import { readJson } from "../speech/read-json";
import { readTranscription } from "../speech/read-transcription";
import { send } from "../speech/send";
import type { SpeechCall } from "../speech/types";
import type { TranscribeRequest, TranscribeResult } from "../types/transcribe-request";
import { elevenlabsKeyterms } from "./keyterms";
import { languageCode } from "./language-code";
import { transcriptionSeconds } from "./transcription-seconds";

export async function transcribe(
  call: SpeechCall,
  request: TranscribeRequest,
): Promise<TranscribeResult> {
  const form = new FormData();

  form.set("file", request.audio, request.filename);
  form.set("model_id", request.model);

  if (request.language) form.set("language_code", languageCode(request.language));

  for (const term of elevenlabsKeyterms(request.terms ?? [])) form.append("keyterms", term);

  const upstream = new Request(`${call.baseUrl}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": call.key },
    body: form,
  });

  const body = await readJson(call.provider, await send(call, upstream, request.signal));

  return {
    text: readTranscription(body),
    usage: { amount: transcriptionSeconds(body), unit: "seconds" },
    raw: body,
  };
}
