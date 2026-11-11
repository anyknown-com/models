import { ModelError } from "../model-error";
import { kindOfStatus } from "./kind-of-status";
import { parseJson } from "./parse-json";
import { providerCode } from "./provider-code";
import { providerMessage } from "./provider-message";

export async function responseFailure(provider: string, response: Response): Promise<ModelError> {
  const body = await response.text().catch(() => "");
  const parsed = parseJson(body);
  const { status } = response;

  return new ModelError({
    kind: kindOfStatus(status),
    provider,
    retryable: status === 429 || status >= 500,
    status,
    code: providerCode(parsed),
    message: providerMessage(parsed) ?? "",
    body,
  });
}
