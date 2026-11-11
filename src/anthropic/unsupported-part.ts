import { ModelError } from "../model-error";
import { PROVIDER } from "./constants";

export const unsupportedPart = (type: string): ModelError =>
  new ModelError({
    kind: "unsupported",
    provider: PROVIDER,
    retryable: false,
    message: `anthropic does not send ${type} parts yet`,
  });
