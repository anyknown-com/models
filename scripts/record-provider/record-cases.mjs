import { derive } from "../../test/conformance/derive.ts";

const recordable = (recorded, declared) =>
  !Object.hasOwn(declared, recorded.id) &&
  recorded.source !== "synthetic" &&
  !("fixtureOf" in recorded);

const derivedFrom = (from, derived) =>
  from && {
    ...(from.unverified ? { unverified: true } : {}),
    ...derive(from, derived.from, derived.status),
  };

export async function recordCases(options) {
  const { cases, recordOne, declared } = options;
  const fixtures = new Map();
  const failures = [];
  const unsupported = {};

  for (const recorded of cases.filter((each) => recordable(each, declared))) {
    const verdict =
      recorded.source === "derived"
        ? { fixture: derivedFrom(fixtures.get(recorded.from), recorded) }
        : await recordOne(recorded, options);

    if (verdict.fixture) fixtures.set(recorded.id, verdict.fixture);
    if (verdict.failure) failures.push(verdict.failure);
    if (verdict.unsupported) unsupported[recorded.id] = verdict.unsupported;
  }

  return { fixtures, failures, unsupported };
}
