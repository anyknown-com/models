import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";

const KEY = "sk-or-record-provider-test-0123456789";
const KEY_ENV = "RECORD_PROVIDER_TEST_KEY";
const CLI = join(import.meta.dirname, "record-provider.mjs");
const MANIFEST_KEYS = ["adapters", "models", "provider", "unsupported"];

const SSE = [
  'data: {"choices":[{"index":0,"delta":{"role":"assistant","content":"Mars"},"finish_reason":null}]}',
  'data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":1,"total_tokens":4}}',
  "data: [DONE]",
  "",
].join("\n\n");

const json = (status, body) => ({
  status,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

const fail = (status, message, extra = {}) => json(status, { error: { message }, ...extra });

let provider = {};
let received = 0;
let server;
let base;

function reply(authorization, body) {
  if (authorization !== `Bearer ${KEY}`) return fail(401, "invalid key");
  if (body.model === "anyknown-no-such-model") return fail(provider.notFound, "no such model");
  if (body.messages.length === 0) return fail(400, "messages required", { user_id: "user_2abc" });
  if (JSON.stringify(body).length > 1_000_000) return fail(400, "context length exceeded");
  if (provider.toolsDown && body.tools) return fail(503, `upstream down for ${authorization}`);

  return { status: 200, headers: { "content-type": "text/event-stream" }, body: SSE };
}

const readBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) chunks.push(chunk);

  return JSON.parse(Buffer.concat(chunks).toString());
};

before(async () => {
  server = createServer(async (request, response) => {
    received += 1;

    const { status, headers, body } = reply(request.headers.authorization, await readBody(request));

    response.writeHead(status, headers);
    response.end(body);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(() => server.close());

beforeEach(() => {
  provider = { notFound: 404 };
  received = 0;
});

const tempDir = () => mkdtemp(join(tmpdir(), "record-provider-"));

const outputOf = (stream) => {
  let text = "";

  stream.on("data", (chunk) => (text += chunk));

  return () => text;
};

async function record(args, { key, fixtures } = {}) {
  const root = fixtures ?? (await tempDir());
  const { [KEY_ENV]: _, ...env } = process.env;
  const command = ["openrouter", "--adapter", "openai-compatible", "--base-url", base];
  const flags = ["--model", "m", "--key-env", KEY_ENV, ...args, "--fixtures", root];

  const child = spawn(process.execPath, [CLI, ...command, ...flags], {
    env: key ? { ...env, [KEY_ENV]: key } : env,
  });

  const stdout = outputOf(child.stdout);
  const stderr = outputOf(child.stderr);
  const code = await new Promise((resolve) => child.on("close", resolve));

  return { dir: join(root, "openrouter"), output: stdout() + stderr(), code };
}

const readJson = async (dir, name) => JSON.parse(await readFile(join(dir, name), "utf8"));

const filesOf = async (dir) => {
  const names = await readdir(dir);

  return Promise.all(names.map(async (name) => [name, await readFile(join(dir, name), "utf8")]));
};

const assertManifest = (manifest, unverified = false) => {
  const keys = unverified ? [...MANIFEST_KEYS, "unverified"] : MANIFEST_KEYS;

  assert.deepEqual(Object.keys(manifest).toSorted(), keys);

  for (const field of ["adapters", "models", "unsupported"]) {
    assert.ok(Object.values(manifest[field]).every((value) => typeof value === "string"));
  }
};

describe("record-provider.mjs", () => {
  it("records every case without the key and writes a typed manifest", async () => {
    const { dir, output, code } = await record([], { key: KEY });
    const files = await filesOf(dir);
    const manifest = await readJson(dir, "manifest.json");

    assert.equal(code, 0, output);
    assert.doesNotMatch(output, new RegExp(KEY));
    assert.ok(files.some(([name]) => name === "error-rate-limit.json"));
    assert.deepEqual(
      files.filter(([, text]) => text.includes(KEY)),
      [],
    );
    assertManifest(manifest);
    assert.equal(manifest.provider, "openrouter");
    assert.deepEqual(manifest.adapters, { text: "openai-compatible" });
    assert.deepEqual(manifest.models, { text: "m" });
  });

  it("folds a long repeated string into a $repeat marker", async () => {
    const { dir } = await record([], { key: KEY });
    const overflow = await readJson(dir, "error-overflow.json");

    assert.deepEqual(overflow.request.body.messages[0].content, {
      $repeat: " a",
      times: 2_100_000,
    });
    assert.ok(JSON.stringify(overflow).length < 10_000);
  });

  it("redacts the account id and keeps the expected 4xx of error cases", async () => {
    const { dir } = await record([], { key: KEY });
    const badRequest = await readJson(dir, "error-bad-request.json");

    assert.equal(badRequest.response.status, 400);
    assert.equal(badRequest.response.body.user_id, "org_redacted");
    assert.equal((await readJson(dir, "error-auth.json")).response.status, 401);
    assert.equal((await readJson(dir, "error-not-found.json")).response.status, 404);
  });

  it("declares error-not-found unsupported when the provider does not answer 404", async () => {
    provider.notFound = 400;

    const { dir, output, code } = await record([], { key: KEY });
    const manifest = await readJson(dir, "manifest.json");

    assert.equal(code, 0, output);
    assert.ok(!(await readdir(dir)).includes("error-not-found.json"));
    assert.match(manifest.unsupported["error-not-found"], /400 "no such model"/);
    assert.match(output, /error-not-found: declared unsupported/);
  });

  it("does not write a case that answers an unexpected status and exits 1", async () => {
    provider.toolsDown = true;

    const { dir, output, code } = await record([], { key: KEY });

    assert.equal(code, 1);
    assert.ok(!(await readdir(dir)).includes("tool-call.json"));
    assert.match(output, /tool-call 503: upstream down for Bearer <key>/);
    assert.doesNotMatch(output, new RegExp(KEY));
  });

  it("exits 2 and prints only the env name when the key env is missing", async () => {
    const { output, code } = await record([]);

    assert.equal(code, 2);
    assert.equal(output.trim(), KEY_ENV);
    assert.equal(received, 0);
  });

  it("--request-only sends nothing, marks every file unverified and keeps declared cases", async () => {
    const fixtures = await tempDir();
    const dir = join(fixtures, "openrouter");
    const declared = { image: "no images: https://example.com/docs" };
    const manifest = { provider: "openrouter", adapters: {}, models: {}, unsupported: declared };

    await mkdir(dir);
    await writeFile(join(dir, "manifest.json"), JSON.stringify(manifest));

    const run = await record(["--request-only"], { fixtures });
    const files = await filesOf(dir);
    const written = await readJson(dir, "manifest.json");

    assert.equal(run.code, 0, run.output);
    assert.equal(received, 0);
    assert.ok(!files.some(([name]) => name === "image.json"));
    assert.deepEqual(
      files.filter(([, text]) => !JSON.parse(text).unverified),
      [],
    );
    assertManifest(written, true);
    assert.deepEqual(written.unsupported, declared);
  });
  it("--kind transcribe --request-only records the transcribe cases of a speech-only provider", async () => {
    const fixtures = await tempDir();
    const dir = join(fixtures, "deepgram");
    const flags = ["--kind", "transcribe", "--adapter", "deepgram", "--model", "nova-3"];

    const child = spawn(process.execPath, [
      CLI,
      "deepgram",
      "--base-url",
      "https://api.deepgram.com/v1",
      "--request-only",
      ...flags,
      "--fixtures",
      fixtures,
    ]);

    const output = outputOf(child.stderr);
    const code = await new Promise((resolve) => child.on("close", resolve));
    const manifest = await readJson(dir, "manifest.json");
    const transcribe = await readJson(dir, "transcribe.json");

    assert.equal(code, 0, output());
    assert.deepEqual(manifest.adapters, { transcribe: "deepgram" });
    assert.deepEqual(manifest.models, { transcribe: "nova-3" });
    assert.equal(manifest.unverified, true);
    assert.equal(transcribe.unverified, true);
    assert.deepEqual(transcribe.request.fields, { type: "audio/wav", size: 55990 });
    assert.equal(transcribe.request.headers.authorization, undefined);
    assert.ok((await readdir(dir)).includes("transcribe-error-server.json"));
  });
});
