import { defaultFetch } from "../default-fetch";
import { toModelError } from "../to-model-error";
import type { JsonValue } from "../types/json";
import { httpErrorOf } from "./http-error-of";
import type { ErrorOf } from "./types";

type PostInit = {
  provider: string;
  url: string;
  headers: Record<string, string>;
  body: JsonValue;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  errorOf: ErrorOf;
};

export async function post(init: PostInit): Promise<Response> {
  const { fetch: fetcher = defaultFetch, provider, signal } = init;

  let response: Response;

  try {
    response = await fetcher(init.url, {
      method: "POST",
      headers: { "content-type": "application/json", ...init.headers },
      body: JSON.stringify(init.body),
      signal,
    });
  } catch (error) {
    throw toModelError(error, provider, signal);
  }

  if (response.ok) return response;

  const body = await response.text().catch(() => "");

  throw httpErrorOf(provider, response.status, body, init.errorOf);
}
