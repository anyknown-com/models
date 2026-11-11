import { ModelError } from "../model-error";
import { errorKindOf } from "../wire/error-kind-of";
import { parseJson } from "./parse-json";
import { providerCode } from "./provider-code";
import { providerMessage } from "./provider-message";

export async function responseFailure(provider: string, response: Response): Promise<ModelError> {
  const body = await response.text().catch(() => "");
  const parsed = parseJson(body);
  const { status } = response;

  return new ModelError({
    ...errorKindOf(status),
    provider,
    status,
    code: providerCode(parsed),
    message: providerMessage(parsed) ?? "",
    body,
  });
}
