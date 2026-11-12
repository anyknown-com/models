import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { tsImport } from "tsx/esm/api";

const SCRIPT = join(import.meta.dirname, "check-provider-conformance.mjs");
const CASES = new URL("../test/conformance/cases/index.ts", import.meta.url).href;
const { TEXT_CASES } = await tsImport(CASES, import.meta.url);

const RECORDED = TEXT_CASES.filter(
  (textCase) => textCase.source !== "synthetic" && !("fixtureOf" in textCase),
).map(({ id }) => id);

const manifest = (id, fields = {}) =>
  JSON.stringify({
    provider: id,
    adapters: { text: "openai-compatible" },
    models: { text: "m" },
    unsupported: {},
    ...fields,
  });

const tree = (providers) => {
  const root = mkdtempSync(join(tmpdir(), "provider-conformance-"));

  for (const [id, { manifest: text, fixtures = RECORDED }] of Object.entries(providers)) {
    const files = [
      ...(text === undefined ? [] : [["manifest.json", text]]),
      ...fixtures.map((name) => [`${name}.json`, "{}"]),
    ];

    mkdirSync(join(root, id), { recursive: true });

    for (const [name, content] of files) writeFileSync(join(root, id, name), content);
  }

  return root;
};

const run = (root) => spawnSync(process.execPath, [SCRIPT, root], { encoding: "utf8" });

test("passes the repo fixtures", () => {
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("passes complete manifests and skips _ directories", () => {
  const root = tree({
    a: { manifest: manifest("a") },
    b: {
      manifest: manifest("b", { unsupported: { image: "no images: https://example.com/docs" } }),
      fixtures: RECORDED.filter((id) => id !== "image"),
    },
    _sample: { manifest: "{" },
  });

  const result = run(root);

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.stdout, "");
});

test("reports a bad manifest, an unknown or missing case and a reason without a URL", () => {
  const root = tree({
    a: { manifest: undefined },
    b: { manifest: "{" },
    c: {
      manifest: manifest("x", {
        adapters: { text: "nope" },
        unverified: false,
        extra: 1,
        unsupported: { image: "answers 400", vision: "https://example.com/docs" },
      }),
      fixtures: [...RECORDED.filter((id) => id !== "image" && id !== "file"), "speech"],
    },
  });

  const result = run(root);

  assert.equal(result.status, 1);
  assert.deepEqual(result.stdout.trim().split("\n"), [
    "a no manifest.json",
    "b manifest.json is not valid JSON",
    "c manifest has an unknown field extra",
    "c manifest provider is not c",
    "c manifest adapters.text names no text adapter",
    "c manifest unverified is not true",
    "c unsupported vision is not a case",
    "c speech.json is not a case",
    "c file has no fixture and is not declared unsupported",
    "c unsupported image has no provider doc URL",
  ]);
});
