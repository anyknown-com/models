import { camelCase } from "es-toolkit";
import { tsImport } from "tsx/esm/api";

export async function importExport(url, name) {
  const value = (await tsImport(url.href, import.meta.url))[camelCase(name)];

  if (!value) throw new Error(`${url.pathname} 沒有 ${name}`);

  return value;
}
