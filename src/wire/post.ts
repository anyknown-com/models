import { defaultFetch } from "../default-fetch";
import { ModelError } from "../model-error";
import { toModelError } from "../to-model-error";
import type { JsonValue } from "../types/json";
import { errorKindOf } from "./error-kind-of";

type ProviderError = { kind?: ModelError["kind"]; code?: string; message: string };

type PostInit = {
  provider: string;
  url: string;
  headers: Record<string, string>;
  body: JsonValue;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  errorOf: (body: string, status: number) => ProviderError;
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

  const { status } = response;
  const body = await response.text().catch(() => "");
  const { kind, code, message } = init.errorOf(body, status);

  throw new ModelError({
    ...errorKindOf(status),
    ...(kind === undefined ? {} : { kind }),
    provider,
    status,
    message,
    body,
    ...(code === undefined ? {} : { code }),
  });
}
