import type { VideoCase } from "../cases";

const sourceOf = (videoCase: VideoCase, cases: readonly VideoCase[]) =>
  videoCase.source === "derived" ? cases.find((each) => each.id === videoCase.from) : videoCase;

export function videoInputOf(videoCase: VideoCase, cases: readonly VideoCase[]) {
  const source = sourceOf(videoCase, cases);

  if (!source || !("request" in source)) throw new Error(`${videoCase.id} has no request`);

  return source.request;
}
