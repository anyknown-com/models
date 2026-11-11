import { defaultFetch } from "../default-fetch";
import { toModelError } from "../to-model-error";
import { httpErrorOf } from "./http-error-of";
import type { ErrorOf } from "./types";

type GetInit = {
  provider: string;
  url: string;
  headers: Record<string, string>;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  errorOf: ErrorOf;
};

export async function get(init: GetInit): Promise<Response> {
  const { fetch: fetcher = defaultFetch, provider, signal } = init;

  let response: Response;

  try {
    response = await fetcher(init.url, { method: "GET", headers: init.headers, signal });
  } catch (error) {
    throw toModelError(error, provider, signal);
  }

  if (response.ok) return response;

  const body = await response.text().catch(() => "");

  throw httpErrorOf(provider, response.status, body, init.errorOf);
}
