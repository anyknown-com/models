import { fitTerms } from "../speech/fit-terms";
import { readJson } from "../speech/read-json";
import { send } from "../speech/send";
import type { SpeechCall } from "../speech/types";
import type { TranscribeRequest, TranscribeResult } from "../types/transcribe-request";
import { KEYTERMS_MAX_BYTES } from "./constants";
import { readTranscription } from "./read-transcription";

export async function transcribe(
  call: SpeechCall,
  request: TranscribeRequest,
): Promise<TranscribeResult> {
  const query = new URLSearchParams({ model: request.model, smart_format: "true" });

  if (request.language) query.set("language", request.language);
  else query.set("detect_language", "true");

  for (const term of fitTerms(request.terms ?? [], KEYTERMS_MAX_BYTES)) {
    query.append("keyterm", term);
  }

  const upstream = new Request(`${call.baseUrl}/listen?${query}`, {
    method: "POST",
    headers: {
      authorization: `Token ${call.key}`,
      "content-type": request.audio.type || "application/octet-stream",
    },
    body: request.audio,
  });

  const body = await readJson(call.provider, await send(call, upstream, request.signal));

  return { ...readTranscription(body), raw: body };
}
