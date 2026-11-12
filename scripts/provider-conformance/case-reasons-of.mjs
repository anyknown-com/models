import { URL_PATTERN } from "./constants.mjs";

const needsFixture = (each) => each.source !== "synthetic" && !("fixtureOf" in each);

const casesOf = (manifest, known) =>
  Object.keys(manifest.adapters ?? {}).flatMap((kind) => known[kind]?.cases ?? []);

export function caseReasonsOf(manifest, fixtureNames, known) {
  const cases = casesOf(manifest, known);
  const ids = new Set(cases.map((each) => each.id));
  const unsupported = manifest.unsupported ?? {};

  const unknownDeclared = Object.keys(unsupported)
    .filter((id) => !ids.has(id))
    .map((id) => `unsupported ${id} is not a case`);

  const unknownFixtures = fixtureNames
    .filter((name) => !ids.has(name))
    .map((name) => `${name}.json is not a case`);

  const missing = cases
    .filter(needsFixture)
    .filter(({ id }) => !fixtureNames.includes(id) && !Object.hasOwn(unsupported, id))
    .map(({ id }) => `${id} has no fixture and is not declared unsupported`);

  const noUrl = Object.entries(unsupported)
    .filter(([, why]) => !URL_PATTERN.test(String(why)))
    .map(([id]) => `unsupported ${id} has no provider doc URL`);

  return [...unknownDeclared, ...unknownFixtures, ...missing, ...noUrl];
}
