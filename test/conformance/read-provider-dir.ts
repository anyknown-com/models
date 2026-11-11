/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import type { ProviderDir } from "./types";

const MANIFEST = "manifest.json";

const jsonOf = (url: URL) => JSON.parse(readFileSync(url, "utf8"));

export function readProviderDir(dir: URL): ProviderDir {
  const names = readdirSync(dir).filter((name) => name.endsWith(".json") && name !== MANIFEST);

  return {
    manifest: jsonOf(new URL(MANIFEST, dir)),
    fixtures: new Map(
      names.map((name) => [name.slice(0, -".json".length), jsonOf(new URL(name, dir))]),
    ),
  };
}
