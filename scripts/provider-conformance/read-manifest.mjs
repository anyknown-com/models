import { existsSync, readFileSync } from "node:fs";
import { MANIFEST } from "./constants.mjs";

export function readManifest(dir) {
  const file = new URL(MANIFEST, dir);

  if (!existsSync(file)) return { missing: true };

  try {
    return { manifest: JSON.parse(readFileSync(file, "utf8")) };
  } catch {
    return { invalid: true };
  }
}
