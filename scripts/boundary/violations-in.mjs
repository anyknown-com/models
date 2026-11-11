import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileViolations } from "./file-violations.mjs";
import { packageJsonViolations } from "./package-json-violations.mjs";

export function violationsIn(packageDir) {
  const manifest = join(packageDir, "package.json");

  const sources = readdirSync(join(packageDir, "src"), { recursive: true })
    .filter((path) => path.endsWith(".ts"))
    .toSorted()
    .map((path) => join(packageDir, "src", path));

  return [
    ...packageJsonViolations(manifest).map((v) => ({ file: manifest, ...v })),
    ...sources.flatMap((file) => fileViolations(file, packageDir).map((v) => ({ file, ...v }))),
  ];
}
