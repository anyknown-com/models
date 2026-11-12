import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(new URL("../package.json", import.meta.url));
const configPath = fileURLToPath(new URL("workers-ai.wrangler.jsonc", import.meta.url));

export async function workersAiProxy() {
  process.env.CI = "1";

  const wranglerBin = join(dirname(require.resolve("wrangler/package.json")), "bin/wrangler.js");

  const whoami = spawnSync(process.execPath, [wranglerBin, "whoami", "--json"], {
    stdio: "ignore",
  });

  if (whoami.status !== 0) throw new Error("wrangler 沒登入");

  const { getPlatformProxy } = require("wrangler");

  return getPlatformProxy({ configPath, persist: false });
}
