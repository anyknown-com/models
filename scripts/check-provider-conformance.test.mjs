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

const speech = (fields) =>
  JSON.stringify({ provider: "d", models: {}, unsupported: {}, ...fields });

test("checks a speech-only manifest against the speech cases of its kinds", () => {
  const root = tree({
    d: {
      manifest: speech({
        adapters: { transcribe: "deepgram", synthesize: "nope", image: "x" },
        models: { transcribe: "nova-3" },
      }),
      fixtures: ["transcribe", "text"],
    },
  });

  const result = run(root);

  assert.equal(result.status, 1);
  assert.deepEqual(result.stdout.trim().split("\n"), [
    "d manifest adapters.synthesize names no synthesize adapter",
    "d manifest adapters.image is not a model call kind",
    "d manifest has no models.synthesize",
    "d text.json is not a case",
    "d transcribe-terms has no fixture and is not declared unsupported",
    "d transcribe-languages has no fixture and is not declared unsupported",
    "d transcribe-error-auth has no fixture and is not declared unsupported",
    "d transcribe-error-bad-request has no fixture and is not declared unsupported",
    "d transcribe-error-rate-limit has no fixture and is not declared unsupported",
    "d transcribe-error-server has no fixture and is not declared unsupported",
    "d synthesize has no fixture and is not declared unsupported",
    "d synthesize-voice has no fixture and is not declared unsupported",
    "d synthesize-error-auth has no fixture and is not declared unsupported",
    "d synthesize-error-bad-request has no fixture and is not declared unsupported",
    "d synthesize-error-rate-limit has no fixture and is not declared unsupported",
    "d synthesize-error-server has no fixture and is not declared unsupported",
  ]);
});

test("checks an embed and rerank manifest against their cases", () => {
  const root = tree({
    e: {
      manifest: speech({
        provider: "e",
        adapters: { embed: "workers-ai", rerank: "nope" },
        models: { embed: "m", rerank: "m" },
      }),
      fixtures: ["embed", "embed-batch", "embed-error-not-found"],
    },
  });

  const result = run(root);

  assert.equal(result.status, 1);
  assert.deepEqual(result.stdout.trim().split("\n"), [
    "e manifest adapters.rerank names no rerank adapter",
    "e rerank has no fixture and is not declared unsupported",
    "e rerank-error-not-found has no fixture and is not declared unsupported",
  ]);
});
