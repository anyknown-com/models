import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { recordToken, viaFetch } from "./via.mjs";

const TOKEN = "rf-test-token-0123456789abcdef";
const BASE = "https://api.openai.com/v1";
const VIA = join(import.meta.dirname, "via.mjs");

let received = [];
let reply = () => ({ status: 200, headers: {}, body: "" });
let server;
let origin;

const readBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) chunks.push(chunk);

  return Buffer.concat(chunks).toString();
};

before(async () => {
  server = createServer(async (request, response) => {
    received.push({
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: await readBody(request),
    });

    const { status, headers, body } = reply();

    response.writeHead(status, headers);
    response.end(body);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

beforeEach(() => {
  received = [];
});

function runCheck(env) {
  const child = spawn(process.execPath, [VIA, "--check", origin], {
    env: { ...process.env, ...env },
  });

  let output = "";

  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));

  return new Promise((resolve) => child.on("close", (code) => resolve({ code, output })));
}

describe("viaFetch", () => {
  it("posts the provider, method, path, headers and base64 body to the route", async () => {
    reply = () => ({ status: 200, headers: { "x-record-status": "200" }, body: "{}" });

    const fetchVia = viaFetch({ origin, provider: "openai", base: BASE, token: TOKEN });

    await fetchVia(`${BASE}/chat/completions?stream=true`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: '{"model":"gpt"}',
    });

    assert.equal(received.length, 1);

    const [sent] = received;

    assert.equal(sent.method, "POST");
    assert.equal(sent.url, "/v1/record-forward");
    assert.equal(sent.headers.authorization, `Bearer ${TOKEN}`);
    assert.deepEqual(JSON.parse(sent.body), {
      provider: "openai",
      method: "POST",
      path: "/chat/completions?stream=true",
      headers: { "content-type": "application/json", accept: "text/event-stream" },
      body: Buffer.from('{"model":"gpt"}').toString("base64"),
    });
  });

  it("refuses a URL outside the base without sending it", async () => {
    const fetchVia = viaFetch({ origin, provider: "openai", base: BASE, token: TOKEN });

    await assert.rejects(fetchVia("https://evil.example/v1/chat/completions", { method: "POST" }));
    assert.equal(received.length, 0);
  });

  it("gives the provider status and the body as it came", async () => {
    reply = () => ({
      status: 200,
      headers: { "x-record-status": "429", "content-type": "application/json" },
      body: '{"error":{"code":"rate_limit"}}',
    });

    const fetchVia = viaFetch({ origin, provider: "openai", base: BASE, token: TOKEN });
    const response = await fetchVia(`${BASE}/chat/completions`, { method: "POST", body: "{}" });

    assert.equal(response.status, 429);
    assert.equal(await response.text(), '{"error":{"code":"rate_limit"}}');
  });

  it("throws on a refusal by the route itself and keeps the token out of the message", async () => {
    reply = () => ({ status: 400, headers: {}, body: '{"error":"bad_path"}' });

    const fetchVia = viaFetch({ origin, provider: "openai", base: BASE, token: TOKEN });

    await assert.rejects(fetchVia(`${BASE}/chat/completions`, { method: "POST" }), (error) => {
      assert.match(error.message, /400 bad_path/);
      assert.doesNotMatch(error.message, new RegExp(TOKEN));

      return true;
    });
  });
});

describe("recordToken", () => {
  const saved = { token: process.env.RECORD_FORWARD_TOKEN, home: process.env.HOME };

  after(() => {
    process.env.HOME = saved.home;

    if (saved.token === undefined) delete process.env.RECORD_FORWARD_TOKEN;
    else process.env.RECORD_FORWARD_TOKEN = saved.token;
  });

  it("reads the env first, then the file, else tells how to set one", async () => {
    const home = await mkdtemp(join(tmpdir(), "via-home-"));

    process.env.HOME = home;
    process.env.RECORD_FORWARD_TOKEN = TOKEN;
    assert.equal(await recordToken(), TOKEN);

    delete process.env.RECORD_FORWARD_TOKEN;
    await assert.rejects(recordToken(), (error) => {
      assert.equal(error.message, "跑 `node apps/api/scripts/record-forward-token/cli.mjs set`");

      return true;
    });

    await mkdir(join(home, ".anyknown-secrets"));
    await writeFile(join(home, ".anyknown-secrets", "record-forward-token"), `${TOKEN}-file\n`);
    assert.equal(await recordToken(), `${TOKEN}-file`);
  });
});

describe("via.mjs --check", () => {
  it("exits 0 on 400 unknown_provider and prints no token", async () => {
    reply = () => ({ status: 400, headers: {}, body: '{"error":"unknown_provider"}' });

    const { code, output } = await runCheck({ RECORD_FORWARD_TOKEN: TOKEN });

    assert.equal(code, 0);
    assert.match(output, /400 unknown_provider/);
    assert.doesNotMatch(output, new RegExp(TOKEN));
    assert.deepEqual(JSON.parse(received[0].body), {
      provider: "none",
      method: "POST",
      path: "/",
      headers: {},
      body: "",
    });
  });

  it("exits 1 on anything else and prints no token", async () => {
    reply = () => ({ status: 401, headers: {}, body: '{"error":"unauthorized"}' });

    const { code, output } = await runCheck({ RECORD_FORWARD_TOKEN: TOKEN });

    assert.equal(code, 1);
    assert.match(output, /401 unauthorized/);
    assert.doesNotMatch(output, new RegExp(TOKEN));
  });
});
