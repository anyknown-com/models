import type { TextAdapter } from "../../src/types/text-adapter";
import { REPLAY_KEY, TEXT_ADAPTERS } from "./constants";
import type { Manifest } from "./types";

export function adapterOf(
  manifest: Manifest,
  fetch: typeof globalThis.fetch,
  url: string | undefined,
): TextAdapter {
  const name = manifest.adapters["text"];
  const entry = name === undefined ? undefined : TEXT_ADAPTERS[name];

  if (!entry) throw new Error(`no text adapter named ${name}`);
  if (url === undefined) throw new Error("no fixture to read the base URL from");

  return entry.create(manifest.provider, {
    key: REPLAY_KEY,
    fetch,
    baseUrl: url.replace(entry.endpoint, ""),
  });
}
