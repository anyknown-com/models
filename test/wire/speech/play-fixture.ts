import { responseOf } from "../response-of";
import { requestFields } from "./request-fields";
import type { RequestFields, SpeechFixture } from "./types";

export function playFixture<Input>(fixture: SpeechFixture<Input>) {
  const requests: RequestFields[] = [];

  const replay: typeof fetch = async (input, init) => {
    requests.push(await requestFields(new Request(input, init)));

    return responseOf(fixture.response);
  };

  return { fetch: replay, requests };
}
