import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*)(["'])(\.\.?\/[^"']*)\2/g;
const RESOLVED = /\.(js|mjs|cjs|json)$/;

const withExtension = (file, specifier) =>
  existsSync(join(dirname(file), `${specifier}.js`)) ? `${specifier}.js` : `${specifier}/index.js`;

const files = readdirSync("dist", { recursive: true })
  .map((name) => join("dist", name))
  .filter((file) => file.endsWith(".js") || file.endsWith(".d.ts"));

for (const file of files) {
  const source = readFileSync(file, "utf8");

  const next = source.replace(SPECIFIER, (match, keyword, quote, specifier) =>
    RESOLVED.test(specifier)
      ? match
      : `${keyword}${quote}${withExtension(file, specifier)}${quote}`,
  );

  if (next !== source) writeFileSync(file, next);
}
