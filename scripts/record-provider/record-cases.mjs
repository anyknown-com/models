import { derive } from "../../test/conformance/derive.ts";

const recordable = (recorded, declared) =>
  !Object.hasOwn(declared, recorded.id) &&
  recorded.source !== "synthetic" &&
  !("fixtureOf" in recorded);

const deriveHttp = (from, derived) => derive(from, derived.from, derived.status);

const derivedFrom = (from, derived, options) => {
  const fixture = from && (options.derive ?? deriveHttp)(from, derived, options);

  return fixture && { ...(from.unverified ? { unverified: true } : {}), ...fixture };
};

export async function recordCases(options) {
  const { cases, recordOne, declared } = options;
  const fixtures = new Map();
  const failures = [];
  const unsupported = {};

  for (const recorded of cases.filter((each) => recordable(each, declared))) {
    const verdict =
      recorded.source === "derived"
        ? { fixture: derivedFrom(fixtures.get(recorded.from), recorded, options) }
        : await recordOne(recorded, options);

    if (verdict.fixture) fixtures.set(recorded.id, verdict.fixture);
    if (verdict.failure) failures.push(verdict.failure);
    if (verdict.unsupported) unsupported[recorded.id] = verdict.unsupported;
  }

  return { fixtures, failures, unsupported };
}
