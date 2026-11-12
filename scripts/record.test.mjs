import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, beforeEach, describe, it } from "node:test";
import { tsImport } from "tsx/esm/api";
import { recordFixture } from "./record-text/record-fixture.mjs";

const KEY = "sk-record-test-secret-0123456789";
const TOKEN = "rf-record-test-token-0123456789";
const OPENAI_BASE = "https://api.openai.com/v1";

const ROUTE_HEADERS = new Set([
  "content-type",
  "accept",
  "anthropic-version",
  "anthropic-beta",
  "openai-beta",
]);

const SSE = 'data: {"text":"Mars"}\n\ndata: [DONE]\n\n';
const RECORD = join(import.meta.dirname, "record.mjs");
const RESPONSE_OF = new URL("../test/wire/response-of.ts", import.meta.url).href;
const { responseOf } = await tsImport(RESPONSE_OF, import.meta.url);

let received = [];
let servers = [];

const readBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) chunks.push(chunk);

  return Buffer.concat(chunks).toString();
};

async function serve(reply) {
  const server = createServer(async (request, response) => {
    const sent = { url: request.url, headers: request.headers, body: await readBody(request) };

    received.push(sent);

    const { status, headers, body } = reply(sent);

    response.writeHead(status, headers);
    response.end(body);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);

  return `http://127.0.0.1:${server.address().port}`;
}

const fakeFactory = ({ key, fetch, baseUrl }) => ({
  provider: "fake",
  capabilities: () => ({ thinking: "none", effortLevels: [] }),
  async *stream(request) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "x-api-key": key,
        "content-type": "application/json",
        accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: request.model,
        system: request.system,
        messages: request.messages,
      }),
    });

    yield { type: "text-delta", text: await response.text() };
  },
});

const fixtureAt = async (file) => {
  const text = await readFile(file, "utf8");

  return { text, fixture: JSON.parse(text) };
};

const assertFixtureShape = (fixture) => {
  assert.deepEqual(Object.keys(fixture).toSorted(), ["request", "response"]);
  assert.deepEqual(Object.keys(fixture.request).toSorted(), ["body", "headers", "method", "url"]);
  assert.deepEqual(Object.keys(fixture.response).toSorted(), ["chunks", "headers", "status"]);
  assert.ok(fixture.response.chunks.every((chunk) => typeof chunk === "string"));
};

before(() => {
  process.env.RECORD_TEST_KEY = KEY;
  process.env.RECORD_FORWARD_TOKEN = TOKEN;
});

after(() => {
  delete process.env.RECORD_TEST_KEY;
  delete process.env.RECORD_FORWARD_TOKEN;

  for (const server of servers) server.close();
});

beforeEach(() => {
  received = [];
});

describe("record.mjs", () => {
  it("records the case against the provider and keeps the key out of the fixture", async () => {
    const provider = await serve(() => ({
      status: 200,
      headers: { "content-type": "text/event-stream" },
      body: SSE,
    }));

    const fixtures = pathToFileURL(`${await mkdtemp(join(tmpdir(), "record-"))}/`);

    const file = await recordFixture({
      family: "fake",
      caseName: "text",
      model: "m-1",
      keyEnv: "RECORD_TEST_KEY",
      baseUrl: provider,
      factory: fakeFactory,
      fixtures,
    });

    const { text, fixture } = await fixtureAt(file);

    assert.equal(file.href, new URL("fake/text.json", fixtures).href);
    assert.equal(received[0].headers.authorization, `Bearer ${KEY}`);
    assert.doesNotMatch(text, new RegExp(KEY));
    assertFixtureShape(fixture);
    assert.equal(fixture.unverified, undefined);
    assert.equal(fixture.request.url, `${provider}/chat/completions`);
    assert.deepEqual(fixture.request.headers, {
      "content-type": "application/json",
      accept: "text/event-stream",
    });
    assert.equal(fixture.request.body.model, "m-1");
    assert.equal(fixture.request.body.system[1].text, "Answer in one short sentence.");
    assert.deepEqual(fixture.response, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
      chunks: [SSE],
    });
  });

  it("with --via strips the auth headers and records the provider url", async () => {
    const apiHost = await serve(({ body }) => {
      const headers = Object.keys(JSON.parse(body).headers);

      if (headers.some((name) => !ROUTE_HEADERS.has(name))) {
        return { status: 400, headers: {}, body: '{"error":"header_not_allowed"}' };
      }

      return {
        status: 200,
        headers: { "x-record-status": "200", "content-type": "text/event-stream" },
        body: SSE,
      };
    });

    const fixtures = pathToFileURL(`${await mkdtemp(join(tmpdir(), "record-via-"))}/`);

    const file = await recordFixture({
      family: "fake",
      caseName: "tools",
      model: "m-2",
      baseUrl: OPENAI_BASE,
      via: apiHost,
      provider: "openai",
      factory: fakeFactory,
      fixtures,
    });

    const sent = JSON.parse(received[0].body);
    const { text, fixture } = await fixtureAt(file);

    assert.equal(received[0].url, "/v1/record-forward");
    assert.equal(received[0].headers.authorization, `Bearer ${TOKEN}`);
    assert.deepEqual(Object.keys(sent).toSorted(), [
      "body",
      "headers",
      "method",
      "path",
      "provider",
    ]);
    assert.equal(sent.provider, "openai");
    assert.equal(sent.path, "/chat/completions");
    assert.deepEqual(sent.headers, {
      "content-type": "application/json",
      accept: "text/event-stream",
    });
    assertFixtureShape(fixture);
    assert.equal(fixture.request.url, `${OPENAI_BASE}/chat/completions`);
    assert.equal(fixture.request.body.messages[1].content[0].toolName, "get_weather");
    assert.doesNotMatch(text, new RegExp(TOKEN));
    assert.doesNotMatch(text, new RegExp(apiHost));
  });

  it("records an eventstream body as base64 chunks that replay as the same bytes", async () => {
    const frames = Buffer.from([0, 0, 0, 16, 0, 0, 0, 0, 0xc4, 0x8b, 0xff, 0xfe, 0x80, 0x01]);
    const contentType = "application/vnd.amazon.eventstream";

    const provider = await serve(() => ({
      status: 200,
      headers: { "content-type": contentType },
      body: frames,
    }));

    const file = await recordFixture({
      family: "fake",
      caseName: "text",
      model: "m-5",
      keyEnv: "RECORD_TEST_KEY",
      baseUrl: provider,
      factory: fakeFactory,
      fixtures: pathToFileURL(`${await mkdtemp(join(tmpdir(), "record-eventstream-"))}/`),
    });

    const { fixture } = await fixtureAt(file);
    const replayed = await responseOf(fixture.response).arrayBuffer();

    assert.deepEqual(fixture.response, {
      status: 200,
      headers: { "content-type": contentType },
      chunks: [frames.toString("base64")],
      encoding: "base64",
    });
    assert.deepEqual(Buffer.from(replayed), frames);
  });

  it("writes no fixture and names the status and provider message when the status is unexpected", async () => {
    const provider = await serve(() => ({
      status: 401,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: { message: `invalid x-api-key ${KEY}` } }),
    }));

    const dir = await mkdtemp(join(tmpdir(), "record-401-"));

    await assert.rejects(
      recordFixture({
        family: "fake",
        caseName: "text",
        model: "m-4",
        keyEnv: "RECORD_TEST_KEY",
        baseUrl: provider,
        factory: fakeFactory,
        fixtures: pathToFileURL(`${dir}/`),
      }),
      (error) =>
        error.message.startsWith("text 401: invalid x-api-key") && !error.message.includes(KEY),
    );

    assert.deepEqual(await readdir(dir), []);
  });

  it("prints the missing env and exits 1", async () => {
    const child = spawn(process.execPath, [
      RECORD,
      "openai-compatible",
      "text",
      "--model",
      "m-3",
      "--key-env",
      "RECORD_TEST_MISSING_KEY",
    ]);

    let output = "";

    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));

    const code = await new Promise((resolve) => child.on("close", resolve));

    assert.equal(code, 1);
    assert.match(output, /RECORD_TEST_MISSING_KEY/);
  });
});
