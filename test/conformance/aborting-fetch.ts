import type { Fixture } from "../wire/fixture";

const textOf = ({ response }: Fixture) =>
  "chunks" in response ? response.chunks.join("") : JSON.stringify(response.body);

export const abortingFetch =
  (fixture: Fixture, controller: AbortController): typeof fetch =>
  async () => {
    const text = textOf(fixture);
    const half = new TextEncoder().encode(text.slice(0, Math.floor(text.length / 2)));

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
