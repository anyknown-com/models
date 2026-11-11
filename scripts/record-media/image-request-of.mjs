import { readFile } from "node:fs/promises";
import { importExport } from "../record-text/import-export.mjs";

const CASES = new URL("../../test/wire/cases/index.ts", import.meta.url);

export async function imageRequestOf(model, edit) {
  if (!edit) return { ...(await importExport(CASES, "draw")), model };

  const image = new Uint8Array(await readFile(edit));

  return { ...(await importExport(CASES, "redraw")), model, images: [{ type: "image", image }] };
}
