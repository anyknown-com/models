import { groupBy } from "es-toolkit";

const KINDS = new Intl.ListFormat("en", { type: "conjunction" });

export function duplicateCaseReasonsOf(known) {
  const owners = Object.entries(known).flatMap(([kind, { cases }]) =>
    cases.map(({ id }) => ({ id, kind })),
  );

  return Object.entries(groupBy(owners, ({ id }) => id))
    .filter(([, shared]) => shared.length > 1)
    .map(([id, shared]) => `case ${id} is in ${KINDS.format(shared.map(({ kind }) => kind))}`);
}
