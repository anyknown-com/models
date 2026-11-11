import { bearerHeaders } from "../speech/bearer-headers";
import { send } from "../speech/send";
import type { SpeechCall } from "../speech/types";
import type { SynthesizeRequest, SynthesizeResult } from "../types/synthesize-request";

export async function synthesize(
  call: SpeechCall,
  request: SynthesizeRequest,
): Promise<SynthesizeResult> {
  const upstream = new Request(`${call.baseUrl}/audio/speech`, {
    method: "POST",
    headers: {
      ...bearerHeaders(call.key),
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      model: request.model,
      input: request.text,
      voice: request.voice,
      response_format: "mp3",
    }),
  });

  return {
    audio: await send(call, upstream, request.signal),
    usage: { amount: request.text.length, unit: "characters" },
  };
}
