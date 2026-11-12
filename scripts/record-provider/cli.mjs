import { parseArgs } from "node:util";
import { USAGE } from "./constants.mjs";
import { recordProvider } from "./record-provider.mjs";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    kind: { type: "string", default: "text" },
    adapter: { type: "string" },
    model: { type: "string" },
    "key-env": { type: "string" },
    "base-url": { type: "string" },
    via: { type: "string" },
    "request-only": { type: "boolean", default: false },
    fixtures: { type: "string" },
  },
});

const [id] = positionals;
const keyEnv = values["key-env"];
const needsKey = !values["request-only"] && !values.via;

if (!id || !values["base-url"] || (needsKey && !keyEnv)) {
  console.error(USAGE);
  process.exitCode = 1;
} else if (needsKey && !process.env[keyEnv]) {
  console.error(keyEnv);
  process.exitCode = 2;
} else {
  const options = {
    kind: values.kind,
    adapter: values.adapter,
    model: values.model,
    keyEnv,
    baseUrl: values["base-url"],
    via: values.via,
    requestOnly: values["request-only"],
    fixtures: values.fixtures,
  };

  process.exitCode = await recordProvider(id, options).catch((error) => {
    console.error(error.message);

    return 1;
  });
}
