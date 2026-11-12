# anyknown/models

`@anyknown/models`：用一個小 API、只靠 `fetch` 呼叫多家 provider 的 text、speech、embedding、image、video model。發到 npm（MIT、public）；anyknown 的 monorepo（`../anyknown`）吃發出去的版本。

## Commits

- Commit messages are written in English.
- The title follows Conventional Commits: `<type>(<optional scope>): <summary>`, imperative mood, lower case, no trailing period, ≤ 72 characters.
- Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.
- One topic per commit.

## 驗證

`pnpm check`（typecheck、oxlint、oxfmt、`scripts/check-boundary.mjs`、`scripts/check-readme.mjs`、`scripts/check-provider-conformance.mjs`：每個 `test/conformance/fixtures/<id>/manifest.json` 的格式、宣告與 fixture 都是真的 case、該錄的 case 有 fixture 或宣告 unsupported、unsupported 帶 provider 文件網址）、`pnpm test`（wire 測試與 `scripts/*.test.mjs`）、`pnpm test:worker`（同一批 wire 測試在 workerd，不開 `nodejs_compat`）、`pnpm verify:pack`（`npm pack` 出的 tarball：檔案、`exports`、沒有 dependency、Node 的 `import()`、browser 的 bundle）。

## 層的邊界

`scripts/check-boundary.mjs` 用 `oxc-parser` parse `src` 的每個檔，下面任何一條成立就 exit 1、印檔名與行號：

- `src` 裡任何一個 import（含 `export … from`、動態 `import()`）解析到 package 以外，或解析到 workspace package。bare specifier 只准是 script 裡寫死的 allow list 上的套件；allow list 今天是空的，所以 `ai`、`@ai-sdk/*`、`@anyknown/*`、`cloudflare:`、`node:` 與任何第三方套件都擋。
- `package.json` 的任何一個 dependency 欄位有 `workspace:`，或 `dependencies` 有 allow list 以外的套件。
- `src/default-fetch.ts` 以外的檔把 `fetch`、`globalThis`、`self`、`process`、`import.meta.env`、`XMLHttpRequest`、`WebSocket`、`Buffer` 當成自由的識別字用（屬性名與物件 key，例如 `config.fetch`、`{ fetch }` 的 key，不算）。
- 有 `require(` 或 `/// <reference`。

## wire fixture 的錄音

- 測試放 `test/`，不在 `src/` 裡；每種呼叫同一個擺法：測試在 `test/wire/<provider>/`，fixture 在 `test/wire/fixtures/<provider>/`。
- wire fixture 從真的呼叫錄，不照型別手寫。每個 adapter 的每種呼叫（text、transcribe、synthesize、embed、rerank）錄一份真的 request 與 response（key 拿掉），由 `scripts/` 裡的一支錄音 script 做；script 由人或 smoke job 帶真的 credentials 跑，測試只重播 fixture、不連網路。同一個 adapter 其他的 case 是這份錄音的變化（改輸入、改回應的欄位）。寫 adapter 的 agent 沒有 provider 的 key：那一步 commit 錄音 script 與手查過的 fixture，fixture 標 `"unverified": true`；之後另一個 step「record real fixtures」換成真的錄音、拿掉標記。沒有任何測試靠 `unverified` 的 fixture 對 provider 說對了什麼：fixture 是 `unverified` 時，測試只斷言 request 的組法（adapter 送出的 method、url、header、body 跟 fixture 一樣）；拿掉標記之後才也斷言讀回來的結果。
- key 從哪裡來：monorepo 的 `apps/api/.dev.vars`（`node --env-file=../anyknown/apps/api/.dev.vars scripts/<錄音 script> …`，script 只從 `process.env` 讀）；不在那裡的平台 key 走 `--via https://api.anyknown.com --provider <provider id>`（token 讀 env `RECORD_FORWARD_TOKEN`，沒有就讀 `~/.anyknown-secrets/record-forward-token`）；Workers AI 由 `scripts/record-workers-ai.mjs` 用 wrangler 的 `getPlatformProxy` 拿本機登入的 `AI` binding。
- 整家 provider 的 conformance fixture 一次錄：`node scripts/record-provider.mjs <provider id> --base-url <url> (--key-env <env> | --via <origin> | --request-only) [--kind <text | transcribe | synthesize>] [--adapter <adapter>] [--model <id>]`；一次錄一種 model call kind（`--kind` 沒帶是 `text`；`embed`、`rerank` 錄的是 Workers AI binding 的 `run`：不帶 `--base-url` 與 key，用 `scripts/workers-ai-proxy.mjs` 拿本機 wrangler 登入的 `AI` binding，fixture 是每次 `run` 的 model、input 與 output 或 error），adapter 與 model 沒帶就讀既有的 `manifest.json`，`--request-only` 不連網路、每份標 `unverified`；manifest 只在目錄裡每份 fixture 都是 `unverified` 時標 `unverified`，所以同一家可以一種真錄、另一種 `unverified`（測試照 fixture 自己的標記只比 request）。
- 規則：key 的值不印、不寫進 repo 裡的任何檔、不向 CEO 要；fixture 裡帶 key 的 header 換成 `"<key>"`；一次錄音一個 case 只打一次（花費有硬的小上限），不重試、不 loop。
