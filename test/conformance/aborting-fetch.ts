import { bytesOfBase64 } from "../../src/wire/base64";
import type { Fixture } from "../wire/fixture";

const encoder = new TextEncoder();

const bytesOf = ({ response }: Fixture): Uint8Array => {
  if (!("chunks" in response)) return encoder.encode(JSON.stringify(response.body));
  if (response.encoding !== "base64") return encoder.encode(response.chunks.join(""));

  return Uint8Array.from(response.chunks.flatMap((chunk) => [...bytesOfBase64(chunk)]));
};

export const abortingFetch =
  (fixture: Fixture, controller: AbortController): typeof fetch =>
  async () => {
    const bytes = bytesOf(fixture);
    const half = bytes.slice(0, Math.floor(bytes.length / 2));

    const body = new ReadableStream<Uint8Array>({
      start: (stream) => stream.enqueue(half),
      pull: (stream) => {
        controller.abort();
        stream.error(controller.signal.reason);
      },
    });

    return new Response(body, {
      status: fixture.response.status,
      headers: fixture.response.headers,
    });
  };
