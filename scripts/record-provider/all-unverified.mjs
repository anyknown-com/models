import { readdir, readFile } from "node:fs/promises";

const isFixture = (name) => name.endsWith(".json") && name !== "manifest.json";

export async function allUnverified(dir) {
  const names = (await readdir(dir).catch(() => [])).filter(isFixture);
  const fixtures = await Promise.all(names.map((name) => readFile(new URL(name, dir), "utf8")));

  return fixtures.every((text) => JSON.parse(text).unverified === true);
}
