import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { recordFixture } from "./record-text/record-fixture.mjs";

const USAGE =
  "node packages/models/scripts/record.mjs <家> <case> --model <id> --key-env <env 名> [--base-url <url>] [--via <origin> --provider <id>]";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    model: { type: "string" },
    "key-env": { type: "string" },
    "base-url": { type: "string" },
    via: { type: "string" },
    provider: { type: "string" },
  },
});

const [family, caseName] = positionals;

try {
  if (!family || !caseName || !values.model) throw new Error(USAGE);

  const file = await recordFixture({
    family,
    caseName,
    model: values.model,
    keyEnv: values["key-env"],
    baseUrl: values["base-url"],
    via: values.via,
    provider: values.provider,
  });

  console.log(fileURLToPath(file));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
