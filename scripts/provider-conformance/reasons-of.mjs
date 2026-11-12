import { readdirSync } from "node:fs";
import { caseReasonsOf } from "./case-reasons-of.mjs";
import { MANIFEST } from "./constants.mjs";
import { readManifest } from "./read-manifest.mjs";
import { isObject, shapeReasonsOf } from "./shape-reasons-of.mjs";

const fixtureNamesIn = (dir) =>
  readdirSync(dir)
    .filter((name) => name.endsWith(".json") && name !== MANIFEST)
    .map((name) => name.slice(0, -".json".length));

export function reasonsOf(root, id, { textCases, adapterNames }) {
  const dir = new URL(`${id}/`, root);
  const { manifest, missing, invalid } = readManifest(dir);

  if (missing) return [`no ${MANIFEST}`];
  if (invalid) return [`${MANIFEST} is not valid JSON`];
  if (!isObject(manifest)) return [`${MANIFEST} is not an object`];

  return [
    ...shapeReasonsOf(id, manifest, adapterNames),
    ...caseReasonsOf(manifest, fixtureNamesIn(dir), textCases),
  ];
}
