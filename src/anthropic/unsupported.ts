import { ModelError } from "../model-error";
import { PROVIDER } from "./constants";

export const unsupported = (what: string): ModelError =>
  new ModelError({
    kind: "unsupported",
    provider: PROVIDER,
    retryable: false,
    message: `anthropic does not send ${what}`,
  });
