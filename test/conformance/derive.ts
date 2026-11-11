import type { ConformanceFixture } from "./types";

export const derive = (
  source: ConformanceFixture,
  from: string,
  status: number,
): ConformanceFixture => ({
  derivedFrom: from,
  request: source.request,
  response: { ...source.response, status },
});
