import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { repeatOf } from "./repeat-of.mjs";

export async function writeJson(file, value, secrets) {
  const json = `${JSON.stringify(value, (_, field) => repeatOf(field) ?? field, 2)}\n`;

  if (secrets.some((secret) => json.includes(secret))) {
    throw new Error(`${fileURLToPath(file)} would hold a key, not written`);
  }

  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(file, json);
}
