import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";
import { FIXTURES } from "./provider-conformance/constants.mjs";
import { providerIdsIn } from "./provider-conformance/provider-ids-in.mjs";
import { reasonsOf } from "./provider-conformance/reasons-of.mjs";

const load = (path) => tsImport(new URL(path, import.meta.url).href, import.meta.url);

const { TEXT_CASES } = await load("../test/conformance/cases/index.ts");
const { TEXT_ADAPTERS } = await load("../test/conformance/constants.ts");
const { SYNTHESIZE, TRANSCRIBE } = await load("../test/conformance/speech/constants.ts");
const { EMBED, RERANK } = await load("../test/conformance/embed/constants.ts");
const root = process.argv[2] ? pathToFileURL(`${resolve(process.argv[2])}/`) : FIXTURES;

const known = {
  text: { cases: TEXT_CASES, adapterNames: Object.keys(TEXT_ADAPTERS) },
  transcribe: { cases: TRANSCRIBE.cases, adapterNames: Object.keys(TRANSCRIBE.adapters) },
  synthesize: { cases: SYNTHESIZE.cases, adapterNames: Object.keys(SYNTHESIZE.adapters) },
  embed: { cases: EMBED.cases, adapterNames: Object.keys(EMBED.adapters) },
  rerank: { cases: RERANK.cases, adapterNames: Object.keys(RERANK.adapters) },
};

let failed = false;

for (const id of providerIdsIn(root)) {
  for (const reason of reasonsOf(root, id, known)) {
    console.log(`${id} ${reason}`);
    failed = true;
  }
}

process.exitCode = failed ? 1 : 0;
