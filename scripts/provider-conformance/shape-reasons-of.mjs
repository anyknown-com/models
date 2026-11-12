import { MANIFEST_FIELDS, STRING_MAPS } from "./constants.mjs";

export const isObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringMap = (value) =>
  isObject(value) && Object.values(value).every((each) => typeof each === "string");

export function shapeReasonsOf(id, manifest, adapterNames) {
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
    ...(adapterNames.includes(manifest.adapters?.text)
      ? []
      : ["manifest adapters.text names no text adapter"]),
    ...(typeof manifest.models?.text === "string" ? [] : ["manifest has no models.text"]),
    ...(manifest.unverified === undefined || manifest.unverified === true
      ? []
      : ["manifest unverified is not true"]),
  ];
}
