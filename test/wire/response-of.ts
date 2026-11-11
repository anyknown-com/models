import type { FixtureResponse } from "./fixture";

const encoder = new TextEncoder();

const streamOf = (chunks: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });

export const responseOf = (response: FixtureResponse): Response =>
  new Response("chunks" in response ? streamOf(response.chunks) : JSON.stringify(response.body), {
    status: response.status,
    headers: response.headers,
  });
