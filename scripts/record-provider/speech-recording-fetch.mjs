import { requestFields } from "../record/request-fields.mjs";
import { responseFields } from "../record/response-fields.mjs";
import { withoutAuth } from "../record-text/without-auth.mjs";

const MASK = "<key>";

const sentOf = (request, key, viaApiHost) =>
  viaApiHost ? new Request(request, { headers: withoutAuth(request.headers, key) }) : request;

export function speechRecordingFetch({ key, fetch, viaApiHost }) {
  const calls = [];

  const record = async (input, init) => {
    const request = new Request(input, init);
    const fields = await requestFields(request.clone(), key);
    const response = await fetch(sentOf(request, key, viaApiHost));
    const headers = withoutAuth(new Headers(fields.headers), MASK);

    calls.push({
      request: { ...fields, headers: Object.fromEntries(headers) },
      response: await responseFields(response.clone()),
    });

    return response;
  };

  return { fetch: record, calls };
}
