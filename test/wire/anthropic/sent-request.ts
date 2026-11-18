import { anthropic } from "../../../src/anthropic";
import type { AnthropicAuth } from "../../../src/anthropic/types";
import type { JsonObject } from "../../../src/types/json";
import type { TextRequest } from "../../../src/types/text-request";

type SentRequest = { request: Request; body: JsonObject };

export async function sentRequest(
  request: TextRequest,
  config: AnthropicAuth & { baseUrl?: string } = { key: "test-key" },
): Promise<SentRequest> {
  const sent: SentRequest[] = [];

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const recorded = new Request(input, init);

    sent.push({ request: recorded, body: JSON.parse(await recorded.clone().text()) });

    return new Response("{}", { status: 400 });
  };

  const events: unknown[] = [];

  try {
    for await (const event of anthropic({ ...config, fetch }).stream(request)) {
      events.push(event);
    }
  } catch {}

  const [first] = sent;

  if (!first) throw new Error("anthropic sent no request");

  return first;
}
