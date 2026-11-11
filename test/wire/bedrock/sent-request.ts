import { bedrock } from "../../../src/bedrock";
import type { JsonObject } from "../../../src/types/json";
import type { TextRequest } from "../../../src/types/text-request";

type SentRequest = { request: Request; body: JsonObject };

export const BASE_URL = "https://bedrock-runtime.us-east-1.amazonaws.com";

export async function sentRequest(request: TextRequest, baseUrl = BASE_URL): Promise<SentRequest> {
  const sent: SentRequest[] = [];

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const recorded = new Request(input, init);

    sent.push({ request: recorded, body: JSON.parse(await recorded.clone().text()) });

    return new Response("{}", { status: 400 });
  };

  try {
    for await (const event of bedrock({ key: "test-key", fetch, baseUrl }).stream(request)) {
      void event;
    }
  } catch {}

  const [first] = sent;

  if (!first) throw new Error("bedrock sent no request");

  return first;
}
