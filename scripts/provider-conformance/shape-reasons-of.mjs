import { MANIFEST_FIELDS, STRING_MAPS } from "./constants.mjs";

export const isObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringMap = (value) =>
  isObject(value) && Object.values(value).every((each) => typeof each === "string");

const adapterReasonsOf = ([kind, name], known) => {
  if (!known[kind]) return [`manifest adapters.${kind} is not a model call kind`];

  return known[kind].adapterNames.includes(name)
    ? []
    : [`manifest adapters.${kind} names no ${kind} adapter`];
};

const modelReasonsOf = (manifest, known) =>
  Object.keys(manifest.adapters ?? {})
    .filter((kind) => known[kind] && typeof manifest.models?.[kind] !== "string")
    .map((kind) => `manifest has no models.${kind}`);

export function shapeReasonsOf(id, manifest, known) {
  const adapters = isStringMap(manifest.adapters) ? Object.entries(manifest.adapters) : [];

  const unknown = Object.keys(manifest)
    .filter((field) => !MANIFEST_FIELDS.includes(field))
    .map((field) => `manifest has an unknown field ${field}`);

  const maps = STRING_MAPS.filter((field) => !isStringMap(manifest[field])).map(
    (field) => `manifest ${field} is not a map of strings`,
  );

  return [
    ...unknown,
    ...(manifest.provider === id ? [] : [`manifest provider is not ${id}`]),
    ...maps,
    ...(adapters.length > 0 ? [] : ["manifest has no adapters"]),
    ...adapters.flatMap((entry) => adapterReasonsOf(entry, known)),
    ...modelReasonsOf(manifest, known),
    ...(manifest.unverified === undefined || manifest.unverified === true
      ? []
      : ["manifest unverified is not true"]),
  ];
}
