import { REPLAY_KEY } from "../constants";
import type { Manifest } from "../types";
import type { SpeechKind } from "./types";

export function callOf<Input, Request, Result>(
  { kind, adapters }: SpeechKind<Input, Request, Result>,
  manifest: Manifest,
  fetch: typeof globalThis.fetch,
  url: string | undefined,
) {
  const name = manifest.adapters[kind];
  const entry = name === undefined ? undefined : adapters[name];

  if (!entry) throw new Error(`no ${kind} adapter named ${name}`);
  if (url === undefined) throw new Error("no fixture to read the base URL from");

  return entry.create({ key: REPLAY_KEY, fetch, baseUrl: url.replace(entry.endpoint, "") });
}
