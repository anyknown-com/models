import { writeJson } from "./write-json.mjs";

export async function writeManifest(
  dir,
  { spec, kind, model, existing, unsupported, unverified, secrets },
) {
  const file = new URL("manifest.json", dir);

  const manifest = {
    provider: spec.id,
    adapters: spec.adapters,
    models: { ...existing?.models, [kind]: model },
    unsupported: { ...existing?.unsupported, ...unsupported },
    ...(unverified ? { unverified: true } : {}),
  };

  await writeJson(file, manifest, secrets);

  return file;
}
