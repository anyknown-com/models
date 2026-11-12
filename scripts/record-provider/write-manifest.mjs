import { writeJson } from "./write-json.mjs";

export async function writeManifest(
  dir,
  { spec, model, existing, unsupported, requestOnly, secrets },
) {
  const file = new URL("manifest.json", dir);

  const manifest = {
    provider: spec.id,
    adapters: spec.adapters,
    models: { text: model },
    unsupported: { ...existing?.unsupported, ...unsupported },
    ...(requestOnly ? { unverified: true } : {}),
  };

  await writeJson(file, manifest, secrets);

  return file;
}
