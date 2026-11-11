import { send } from "../speech/send";
import type { SpeechCall } from "../speech/types";
import type { SynthesizeRequest, SynthesizeResult } from "../types/synthesize-request";

export async function synthesize(
  call: SpeechCall,
  request: SynthesizeRequest,
): Promise<SynthesizeResult> {
  const voice = encodeURIComponent(request.voice ?? "");

  const upstream = new Request(
    `${call.baseUrl}/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": call.key,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({ text: request.text, model_id: request.model }),
    },
  );

  return {
    audio: await send(call, upstream, request.signal),
    usage: { amount: request.text.length, unit: "characters" },
  };
}
