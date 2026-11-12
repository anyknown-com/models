import { TEXT_CASES } from "../../test/conformance/cases/index.ts";
import { derive } from "../../test/conformance/derive.ts";
import { recordCase } from "./record-case.mjs";

const recordable = (textCase, declared) =>
  !Object.hasOwn(declared, textCase.id) &&
  textCase.source !== "synthetic" &&
  !("fixtureOf" in textCase);

const derivedFrom = (from, textCase) =>
  from && {
    ...(from.unverified ? { unverified: true } : {}),
    ...derive(from, textCase.from, textCase.status),
  };

export async function recordCases(options) {
  const fixtures = new Map();
  const failures = [];
  const unsupported = {};

  for (const textCase of TEXT_CASES.filter((each) => recordable(each, options.declared))) {
    const verdict =
      textCase.source === "derived"
        ? { fixture: derivedFrom(fixtures.get(textCase.from), textCase) }
        : await recordCase(textCase, options);

    if (verdict.fixture) fixtures.set(textCase.id, verdict.fixture);
    if (verdict.failure) failures.push(verdict.failure);
    if (verdict.unsupported) unsupported[textCase.id] = verdict.unsupported;
  }

  return { fixtures, failures, unsupported };
}
