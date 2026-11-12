import { BINDING_ERRORS } from "./constants.mjs";

export function judgeBindingCalls({ id }, calls, { requestOnly }) {
  if (requestOnly) return { fixture: { unverified: true, calls } };

  const failed = calls.find((call) => "error" in call);

  if (Boolean(failed) === BINDING_ERRORS.includes(id)) return { fixture: { calls } };

  return { failure: `${id}: ${failed ? failed.error : "ran without an error"}` };
}
