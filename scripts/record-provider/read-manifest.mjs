import { readFile } from "node:fs/promises";

export const readManifest = (dir) =>
  readFile(new URL("manifest.json", dir), "utf8").then(JSON.parse, () => undefined);
