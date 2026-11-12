import { TEXT_ADAPTERS } from "../../test/conformance/constants.ts";

export function textAdapterOf({ id, adapter, model, baseUrl }) {
  const entry = TEXT_ADAPTERS[adapter];

  if (!entry) throw new Error(`${id}: no text adapter named ${adapter}, pass --adapter`);
  if (!model) throw new Error(`${id}: no text model, pass --model`);

  return (key, fetch) => entry.create(id, { key, fetch, baseUrl });
}
