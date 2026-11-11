import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { recordImage } from "./record-media/record-image.mjs";
import { recordVideo } from "./record-media/record-video.mjs";

const USAGE = [
  "node packages/models/scripts/record-media.mjs image <家> --model <id> --key-env <env 名> [--edit <png 檔>]",
  "node packages/models/scripts/record-media.mjs video <家> --model <id> (--key-env <env 名> | --via <origin>) [--edit]",
].join("\n");

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    model: { type: "string" },
    "key-env": { type: "string" },
    via: { type: "string" },
    edit: { type: process.argv[2] === "video" ? "boolean" : "string" },
  },
});

const [kind, family] = positionals;

const recordOf = {
  image: () =>
    recordImage({ family, model: values.model, keyEnv: values["key-env"], edit: values.edit }),
  video: () =>
    recordVideo({
      family,
      model: values.model,
      keyEnv: values["key-env"],
      via: values.via,
      edit: values.edit === true,
    }),
};

try {
  if (!recordOf[kind] || !family || !values.model) throw new Error(USAGE);

  const files = [await recordOf[kind]()].flat();

  for (const file of files) console.log(fileURLToPath(file));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
