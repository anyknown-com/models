import { bytesOfBase64 } from "../../src/wire/base64";
import type { FixtureResponse } from "./fixture";

const encoder = new TextEncoder();

const streamOf = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

const bodyOf = (response: FixtureResponse) => {
  if (!("chunks" in response)) return JSON.stringify(response.body);

  const bytesOf = response.encoding === "base64" ? bytesOfBase64 : encoder.encode.bind(encoder);

  return streamOf(response.chunks.map(bytesOf));
};

export const responseOf = (response: FixtureResponse): Response =>
  new Response(bodyOf(response), { status: response.status, headers: response.headers });
