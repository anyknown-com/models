import { bearerHeaders } from "../speech/bearer-headers";
import { send } from "../speech/send";
import type { SpeechCall } from "../speech/types";
import type { SynthesizeRequest, SynthesizeResult } from "../types/synthesize-request";

export async function synthesize(
  call: SpeechCall,
  request: SynthesizeRequest,
): Promise<SynthesizeResult> {
  const upstream = new Request(`${call.baseUrl}/v1/tts`, {
    method: "POST",
    headers: {
      ...bearerHeaders(call.key),
      model: request.model,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({ text: request.text, reference_id: request.voice ?? "", format: "mp3" }),
  });

  return {
    audio: await send(call, upstream, request.signal),
    usage: { amount: new TextEncoder().encode(request.text).length, unit: "bytes" },
  };
}
