import { anthropic } from "../../../src/anthropic";
import type { JsonObject } from "../../../src/types/json";
import type { TextRequest } from "../../../src/types/text-request";

type SentRequest = { request: Request; body: JsonObject };

export async function sentRequest(request: TextRequest, baseUrl?: string): Promise<SentRequest> {
  const sent: SentRequest[] = [];

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const recorded = new Request(input, init);

    sent.push({ request: recorded, body: JSON.parse(await recorded.clone().text()) });

    return new Response("{}", { status: 400 });
  };

  const events: unknown[] = [];

  try {
    for await (const event of anthropic({ key: "test-key", fetch, baseUrl }).stream(request)) {
      events.push(event);
    }
  } catch {}

  const [first] = sent;

  if (!first) throw new Error("anthropic sent no request");

  return first;
}
