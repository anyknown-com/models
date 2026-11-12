import { transportOf } from "../record-text/transport-of.mjs";
import { bindingTransport } from "./binding-transport.mjs";
import { KINDS } from "./kinds.mjs";
import { REQUEST_ONLY_TRANSPORT } from "./request-only-transport.mjs";

export async function openTransport(provider, { kind, via, requestOnly, keyEnv, baseUrl }) {
  if (KINDS[kind].binding) return bindingTransport(requestOnly);
  if (requestOnly) return KINDS[kind].requestOnlyTransport ?? REQUEST_ONLY_TRANSPORT;

  return transportOf({ via, provider, baseUrl, keyEnv });
}
