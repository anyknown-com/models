import { judgeBindingCalls } from "./judge-binding-calls.mjs";
import { recordingBinding } from "./recording-binding.mjs";

export async function recordBindingCase(embedCase, kind, options) {
  const recording = recordingBinding(options.transport.binding);
  const call = options.adapterOf({ binding: recording.binding });
  const request = kind.requestOf(embedCase.request, options.model);

  const error = await call(request).then(
    () => undefined,
    (caught) => caught,
  );

  if (recording.calls.length > 0) return judgeBindingCalls(embedCase, recording.calls, options);

  return { failure: `${embedCase.id} ran nothing: ${error?.message ?? ""}` };
}
