import { mkdir, writeFile } from "node:fs/promises";
import { FIXTURES } from "./constants.mjs";
import { drain } from "./drain.mjs";
import { importExport } from "./import-export.mjs";
import { recordingFetch } from "./recording-fetch.mjs";
import { transportOf } from "./transport-of.mjs";

const CASES = new URL("../../test/wire/cases/index.ts", import.meta.url);

const factoryOf = (family) =>
  importExport(new URL(`../../src/${family}/index.ts`, import.meta.url), family);

export async function recordFixture(options) {
  const { family, caseName, model, baseUrl, provider, fixtures = FIXTURES } = options;
  const transport = await transportOf(options);
  const request = await importExport(CASES, caseName);
  const factory = options.factory ?? (await factoryOf(family));
  const recording = recordingFetch(transport);

  const adapter = factory({
    key: transport.key,
    fetch: recording.fetch,
    baseUrl,
    name: provider ?? family,
  });

  await drain(adapter.stream({ ...request, model }));

  if (recording.calls.length === 0) throw new Error(`${family} 沒有送出 request`);

  const json = `${JSON.stringify(recording.calls[0], null, 2)}\n`;

  if (json.includes(transport.key)) throw new Error("fixture 裡有 key，不寫");

  const file = new URL(`${family}/${caseName}.json`, fixtures);

  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(file, json);

  return file;
}
