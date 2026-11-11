import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importExport } from "../record-text/import-export.mjs";
import { recordingFetch } from "../record-text/recording-fetch.mjs";
import { transportOf } from "../record-text/transport-of.mjs";
import { imageRequestOf } from "./image-request-of.mjs";
import { writeFixture } from "./write-fixture.mjs";

const factoryOf = (family) =>
  importExport(new URL(`../../src/${family}/index.ts`, import.meta.url), family);

export async function recordImage({ family, model, keyEnv, edit }) {
  const transport = await transportOf({ keyEnv });
  const recording = recordingFetch(transport);
  const adapter = (await factoryOf(family))({ key: transport.key, fetch: recording.fetch });
  const request = await imageRequestOf(model, edit);

  try {
    const result = await adapter.generateImage(request);
    const saved = join(tmpdir(), `record-media-${family}.png`);

    if (result.image instanceof Uint8Array) await writeFile(saved, result.image);

    console.error(`usage ${JSON.stringify(result.raw?.usage)}; image ${saved}`);
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
  }

  const [call] = recording.calls;

  if (!call) throw new Error(`${family} 沒有送出 request`);

  return writeFixture(
    `${family}/${edit ? "image-edit" : "image-generation"}.json`,
    call,
    transport.key,
  );
}
