import { responseFields } from "../record/response-fields.mjs";
import { withoutAuth } from "./without-auth.mjs";

const bodyOf = (bytes) => {
  const text = new TextDecoder().decode(bytes);

  return text ? { body: JSON.parse(text) } : {};
};

export function recordingFetch({ key, fetch, viaApiHost }) {
  const calls = [];

  const record = async (input, init) => {
    const request = new Request(input, init);
    const bytes = new Uint8Array(await request.arrayBuffer());
    const headers = withoutAuth(request.headers, key);

    const sent = new Request(request.url, {
      method: request.method,
      headers: viaApiHost ? headers : request.headers,
      body: bytes.length > 0 ? bytes : undefined,
      signal: request.signal,
    });

    const response = await fetch(sent);

    calls.push({
      request: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(headers),
        ...bodyOf(bytes),
      },
      response: await responseFields(response.clone()),
    });

    return response;
  };

  return { fetch: record, calls };
}
