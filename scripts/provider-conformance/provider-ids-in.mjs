import { readdirSync } from "node:fs";

export const providerIdsIn = (root) =>
  readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .toSorted();
