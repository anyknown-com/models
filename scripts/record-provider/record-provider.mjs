import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { recordToken } from "../via.mjs";
import { kindAdapterOf } from "./kind-adapter-of.mjs";
import { allUnverified } from "./all-unverified.mjs";
import { FIXTURES, WRONG_KEY } from "./constants.mjs";
import { KINDS } from "./kinds.mjs";
import { openTransport } from "./open-transport.mjs";
import { readManifest } from "./read-manifest.mjs";
import { recordCases } from "./record-cases.mjs";
import { writeJson } from "./write-json.mjs";
import { writeManifest } from "./write-manifest.mjs";

const run = promisify(execFile);

const OXFMT = fileURLToPath(new URL("../../node_modules/.bin/oxfmt", import.meta.url));

const fixturesRoot = (path) => (path ? pathToFileURL(`${resolve(path)}/`) : FIXTURES);

const targetOf = (provider, existing, { kind, baseUrl, ...options }) => {
  const model = options.model ?? existing?.models?.[kind];
  const adapter = options.adapter ?? existing?.adapters?.[kind];

  return {
    model,
    spec: { id: provider, adapters: { ...existing?.adapters, [kind]: adapter } },
    adapterOf: kindAdapterOf({ id: provider, kind, adapter, model, baseUrl }),
  };
};

export async function recordProvider(provider, options) {
  const { kind, via, requestOnly } = options;

  if (!KINDS[kind]) throw new Error(`no model call kind named ${kind}`);

  const dir = new URL(`${provider}/`, fixturesRoot(options.fixtures));
  const existing = await readManifest(dir);
  const { model, spec, adapterOf } = targetOf(provider, existing, options);

  const transport = await openTransport(spec.id, options);
  const tokens = via ? [await recordToken()] : [];
  const secrets = [transport.key, WRONG_KEY, ...tokens].filter(Boolean);
  const declared = existing?.unsupported ?? {};

  const { fixtures, failures, unsupported } = await recordCases({
    ...KINDS[kind],
    adapterOf,
    adapter: spec.adapters[kind],
    model,
    waitSeconds: options.waitSeconds,
    provider: spec.id,
    transport,
    requestOnly,
    secrets,
    declared,
  }).finally(() => transport.dispose?.());

  for (const [id, fixture] of fixtures) {
    await writeJson(new URL(`${id}.json`, dir), fixture, secrets);
    console.log(`wrote ${id}`);
  }

  const manifest = await writeManifest(dir, {
    spec,
    kind,
    model,
    existing,
    unsupported,
    unverified: await allUnverified(dir),
    secrets,
  });

  await run(OXFMT, [
    ...[...fixtures.keys()].map((id) => fileURLToPath(new URL(`${id}.json`, dir))),
    fileURLToPath(manifest),
  ]);

  for (const id of Object.keys(unsupported)) {
    console.error(
      `${id}: declared unsupported in ${fileURLToPath(manifest)}, add the provider doc URL`,
    );
  }

  for (const failure of failures) console.error(failure);

  return failures.length > 0 ? 1 : 0;
}
