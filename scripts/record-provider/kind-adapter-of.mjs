import { KINDS } from "./kinds.mjs";

export function kindAdapterOf({ id, kind, adapter, model, baseUrl }) {
  const entry = KINDS[kind]?.adapters[adapter];

  if (!entry) throw new Error(`${id}: no ${kind} adapter named ${adapter}, pass --adapter`);
  if (!model) throw new Error(`${id}: no ${kind} model, pass --model`);

  return (config) => entry.create(id, { ...config, baseUrl });
}
