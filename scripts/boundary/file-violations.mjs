import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { parseSync } from "oxc-parser";
import { DEFAULT_FETCH_FILE } from "./constants.mjs";
import { globalViolations } from "./global-violations.mjs";
import { importViolations } from "./import-violations.mjs";
import { lineOf } from "./line-of.mjs";
import { requireViolations } from "./require-violations.mjs";

export function fileViolations(file, packageDir) {
  const text = readFileSync(file, "utf8");
  const { program, comments, errors } = parseSync(file, text);

  if (errors.length > 0) return [{ line: 1, rule: `parse error: ${errors[0].message}` }];

  const readsGlobals = relative(packageDir, file) === DEFAULT_FETCH_FILE;

  const found = [
    ...importViolations(program, file, packageDir),
    ...(readsGlobals ? [] : globalViolations(program)),
    ...requireViolations(program, comments),
  ];

  return found
    .map(({ offset, rule }) => ({ line: lineOf(text, offset), rule }))
    .toSorted((a, b) => a.line - b.line);
}
