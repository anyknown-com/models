import { mkdir, writeFile } from "node:fs/promises";
import { FIXTURES } from "../record-text/constants.mjs";

export async function writeFixture(path, call, key) {
  const { status } = call.response;
  const json = `${JSON.stringify(call, null, 2)}\n`;

  if (status < 200 || status >= 300) {
    throw new Error(`${status}: ${JSON.stringify(call.response).replaceAll(key, "<key>")}`);
  }

  if (json.includes(key)) throw new Error("fixture 裡有 key，不寫");

  const file = new URL(path, FIXTURES);

  await mkdir(new URL(".", file), { recursive: true });
  await writeFile(file, json);

  return file;
}
