import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-boundary.mjs");
const MANIFEST = JSON.stringify({ name: "@anyknown/models", type: "module" }, null, 2);

const tree = (files) => {
  const root = mkdtempSync(join(tmpdir(), "models-boundary-"));

  for (const [path, text] of Object.entries({ "package.json": MANIFEST, ...files })) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }

  return root;
};

const check = (root) => spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: "utf8" });

const assertViolations = (files, expected) => {
  const run = check(tree(files));

  assert.equal(run.status, 1, run.stderr);
  assert.deepEqual(run.stdout.trim().split("\n"), expected);
};

test("imports may not leave the package or name any package", () => {
  assertViolations(
    {
      "src/a.ts": [
        'import { ok } from "./b";',
        'import { up } from "../../durable/src/x";',
        'import { streamText } from "ai";',
        'import type { Tokens } from "@anyknown/contract";',
        'import { readFileSync } from "node:fs";',
        'import { env } from "cloudflare:workers";',
        'export { z } from "zod";',
        'const later = await import("@ai-sdk/openai");',
      ].join("\n"),
      "src/b.ts": "export const ok = 1;",
    },
    [
      "src/a.ts:2 import outside the package: ../../durable/src/x",
      "src/a.ts:3 bare import not on the allow list: ai",
      "src/a.ts:4 bare import not on the allow list: @anyknown/contract",
      "src/a.ts:5 bare import not on the allow list: node:fs",
      "src/a.ts:6 bare import not on the allow list: cloudflare:workers",
      "src/a.ts:7 bare import not on the allow list: zod",
      "src/a.ts:8 bare import not on the allow list: @ai-sdk/openai",
    ],
  );
});

test("package.json may not depend on a workspace package or an unlisted package", () => {
  const manifest = {
    name: "@anyknown/models",
    dependencies: { zod: "^4.0.0" },
    devDependencies: { "@anyknown/contract": "workspace:*" },
  };

  assertViolations(
    { "package.json": JSON.stringify(manifest, null, 2), "src/a.ts": "export const a = 1;" },
    [
      "package.json:4 dependency not on the allow list: zod",
      "package.json:7 workspace dependency: @anyknown/contract",
    ],
  );
});

test("only default-fetch.ts reads free globals", () => {
  assertViolations(
    {
      "src/x.ts": [
        "export const send = (url: string) => fetch(url);",
        "export const root = globalThis;",
        "export const env = import.meta.env;",
      ].join("\n"),
    },
    [
      "src/x.ts:1 free global: fetch",
      "src/x.ts:2 free global: globalThis",
      "src/x.ts:3 free global: import.meta.env",
    ],
  );
});

test("require and triple-slash references are not allowed", () => {
  assertViolations(
    {
      "src/a.ts": ['/// <reference types="node" />', 'export const fs = require("fs");'].join("\n"),
    },
    ["src/a.ts:1 /// <reference", "src/a.ts:2 require("],
  );
});

test("a clean package passes", () => {
  const run = check(
    tree({
      "src/config.ts": [
        "type Config = { fetch?: typeof fetch };",
        "export const pick = (config: Config) => config.fetch;",
        "export const wrap = (f: typeof fetch) => ({ fetch: f });",
        "export const local = (config: Config) => {",
        "  const { fetch } = config;",
        "",
        "  return fetch;",
        "};",
      ].join("\n"),
      "src/default-fetch.ts":
        "export const defaultFetch: typeof fetch = (input, init) => fetch(input, init);",
    }),
  );

  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(run.stdout, "");
});
