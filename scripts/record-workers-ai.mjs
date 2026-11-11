import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

process.env.CI = "1";

const require = createRequire(new URL("../../../apps/api/package.json", import.meta.url));
const wranglerBin = join(dirname(require.resolve("wrangler/package.json")), "bin/wrangler.js");
const whoami = spawnSync(process.execPath, [wranglerBin, "whoami", "--json"], { stdio: "ignore" });

if (whoami.status !== 0) {
  console.error("wrangler 沒登入");
  process.exit(1);
}

const { getPlatformProxy } = require("wrangler");
const configPath = fileURLToPath(new URL("workers-ai.wrangler.jsonc", import.meta.url));
const fixturesDir = new URL("../test/wire/fixtures/workers-ai/", import.meta.url);
const proxy = await getPlatformProxy({ configPath, persist: false });

const record = async (name, model, input) => {
  const output = await proxy.env.AI.run(model, input);
  const recorded = `${JSON.stringify({ model, input, output }, null, 2)}\n`;

  writeFileSync(new URL(`recorded-${name}.json`, fixturesDir), recorded);
};

try {
  await record("embed", "@cf/qwen/qwen3-embedding-0.6b", {
    text: ["segment 1", "segment 2", "segment 3"],
  });
} finally {
  await proxy.dispose();
}
