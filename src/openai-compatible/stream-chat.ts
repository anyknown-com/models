import type { StreamEvent } from "../types/stream-event";
import type { TextRequest } from "../types/text-request";
import { post } from "../wire/post";
import { buildRequest } from "./build-request";
import { readStream } from "./read-stream";
import type { OpenaiCompatibleConfig } from "./types";

export async function* streamChat(
  config: OpenaiCompatibleConfig,
  request: TextRequest,
): AsyncIterable<StreamEvent> {
  const { name, fetch } = config;

  const response = await post({
    provider: name,
    ...buildRequest(config, request),
    fetch,
    signal: request.signal,
    errorOf: (body) => ({ message: body }),
  });

  const declared = new Set(request.tools?.map((tool) => tool.name));

  yield* readStream(name, response.body ?? new Blob().stream(), declared);
}
