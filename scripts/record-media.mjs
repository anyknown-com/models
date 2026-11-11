import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { recordImage } from "./record-media/record-image.mjs";

const USAGE =
  "node packages/models/scripts/record-media.mjs image <家> --model <id> --key-env <env 名> [--edit <png 檔>]";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    model: { type: "string" },
    "key-env": { type: "string" },
    edit: { type: "string" },
  },
});

const [kind, family] = positionals;

try {
  if (kind !== "image" || !family || !values.model) throw new Error(USAGE);

  const file = await recordImage({
    family,
    model: values.model,
    keyEnv: values["key-env"],
    edit: values.edit,
  });

  console.log(fileURLToPath(file));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
