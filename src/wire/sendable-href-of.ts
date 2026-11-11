import { unsupported } from "./unsupported";

const SENDABLE_PROTOCOLS = new Set(["http:", "https:", "data:"]);

export function sendableHrefOf(provider: string, url: URL): string {
  if (!SENDABLE_PROTOCOLS.has(url.protocol)) {
    throw unsupported(provider, `${provider} does not send ${url.protocol} urls`);
  }

  return url.href;
}
