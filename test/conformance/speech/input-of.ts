import type { SpeechCase } from "../cases";

export function inputOf<Input>(speechCase: SpeechCase<Input>, cases: readonly SpeechCase<Input>[]) {
  const source =
    speechCase.source === "derived"
      ? cases.find((each) => each.id === speechCase.from)
      : speechCase;

  if (!source || !("request" in source)) throw new Error(`${speechCase.id} has no request`);

  return source.request;
}
