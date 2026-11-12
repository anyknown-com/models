import { recordingFetch } from "../record-text/recording-fetch.mjs";
import { WRONG_KEY } from "./constants.mjs";
import { judgeCall } from "./judge-call.mjs";
import { messageOf } from "./message-of.mjs";

const consume = (events) =>
  Array.fromAsync(events).then(
    () => undefined,
    (error) => error,
  );

const wrongKey = { key: WRONG_KEY, fetch: (input, init) => fetch(input, init), viaApiHost: false };

const transportFor = (textCase, { transport, requestOnly }) =>
  textCase.record === "wrong-key" && !requestOnly ? wrongKey : transport;

const requestOf = (textCase, { model, provider }) => {
  if (textCase.record === "request-model") return textCase.request;

  const providerOptions = textCase.providerOptionsBy?.[provider];

  return { ...textCase.request, model, ...(providerOptions ? { providerOptions } : {}) };
};

export async function recordCase(textCase, options) {
  const transport = transportFor(textCase, options);
  const recording = recordingFetch(transport);
  const adapter = options.adapterOf(transport.key, recording.fetch);
  const stream = () => adapter.stream(requestOf(textCase, options));

  if (textCase.record === "twice") await consume(stream());

  const error = await consume(stream());
  const call = recording.calls.at(-1);

  if (call) return judgeCall(textCase, call, options);

  const message = messageOf({ body: { message: error?.message ?? "" } }, options.secrets);

  return { failure: `${textCase.id} no response: ${message}` };
}
