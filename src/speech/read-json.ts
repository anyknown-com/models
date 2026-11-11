import { ModelError } from "../model-error";

export async function readJson(provider: string, response: Response): Promise<unknown> {
  const body = await response.text();

  try {
    return JSON.parse(body);
  } catch (error) {
    throw new ModelError({
      kind: "server",
      provider,
      retryable: false,
      message: error instanceof Error ? error.message : String(error),
      body,
      cause: error,
    });
  }
}
