import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const SET_HINT = "跑 `node apps/api/scripts/record-forward-token/cli.mjs set`";

const errorCode = (response) =>
  response.json().then(
    (body) => body?.error,
    () => undefined,
  );

const postForward = (origin, token, call) =>
  fetch(`${origin}/v1/record-forward`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(call),
  });

export function viaFetch({ origin, provider, base, token }) {
  return async (input, init) => {
    const request = new Request(input, init);

    if (!request.url.startsWith(base)) throw new Error(`via: ${request.url} is not under ${base}`);

    const forwarded = await postForward(origin, token, {
      provider,
      method: request.method,
      path: request.url.slice(base.length),
      headers: Object.fromEntries(request.headers),
      body: Buffer.from(await request.arrayBuffer()).toString("base64"),
    });

    const status = forwarded.headers.get("x-record-status");

    if (!status) {
      throw new Error(
        `via: record-forward refused ${forwarded.status} ${await errorCode(forwarded)}`,
      );
    }

    return new Response(await forwarded.arrayBuffer(), {
      status: Number(status),
      headers: forwarded.headers,
    });
  };
}

export async function recordToken() {
  const fromEnv = process.env.RECORD_FORWARD_TOKEN?.trim();

  if (fromEnv) return fromEnv;

  const file = join(homedir(), ".anyknown-secrets", "record-forward-token");

  const fromFile = await readFile(file, "utf8").then(
    (text) => text.trim(),
    () => "",
  );

  if (fromFile) return fromFile;

  throw new Error(SET_HINT);
}

async function check(origin) {
  const call = { provider: "none", method: "POST", path: "/", headers: {}, body: "" };
  const response = await postForward(origin, await recordToken(), call);
  const code = await errorCode(response);

  console.log(`${response.status} ${code}`);
  process.exitCode = response.status === 400 && code === "unknown_provider" ? 0 : 1;
}

if (import.meta.main && process.argv[2] === "--check") await check(process.argv[3]);
