import { sampleAudio } from "../record/sample.mjs";
import { judgeCall } from "./judge-call.mjs";
import { messageOf } from "./message-of.mjs";
import { speechRecordingFetch } from "./speech-recording-fetch.mjs";
import { transportFor } from "./transport-for.mjs";

const failureOf = (error) => error;

export async function recordSpeechCase(speechCase, speech, options) {
  const { model, provider, secrets } = options;
  const transport = transportFor(speechCase, options);
  const recording = speechRecordingFetch(transport);
  const call = options.adapterOf({ key: transport.key, fetch: recording.fetch });
  const request = speech.requestOf(speechCase.request, model, provider, sampleAudio);
  const error = await call(request).then(() => undefined, failureOf);
  const recorded = recording.calls.at(-1);

  if (recorded) return judgeCall(speechCase, recorded, options);

  const message = messageOf({ body: { message: error?.message ?? "" } }, secrets);

  return { failure: `${speechCase.id} no response: ${message}` };
}
