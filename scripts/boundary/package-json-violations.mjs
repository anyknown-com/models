import { readFileSync } from "node:fs";
import { ALLOWED_PACKAGES, DEPENDENCY_FIELDS } from "./constants.mjs";
import { lineOf } from "./line-of.mjs";

const ruleOf = (field, name, version) => {
  if (version.startsWith("workspace:")) return `workspace dependency: ${name}`;

  if (field === "dependencies" && !ALLOWED_PACKAGES.includes(name)) {
    return `dependency not on the allow list: ${name}`;
  }

  return null;
};

export function packageJsonViolations(file) {
  const text = readFileSync(file, "utf8");
  const manifest = JSON.parse(text);

  return DEPENDENCY_FIELDS.flatMap((field) =>
    Object.entries(manifest[field] ?? {}).flatMap(([name, version]) => {
      const rule = ruleOf(field, name, version);
      const offset = text.indexOf(`"${name}"`, text.indexOf(`"${field}"`));

      return rule ? [{ line: lineOf(text, offset), rule }] : [];
    }),
  );
}
