import { patternNames } from "./pattern-names.mjs";
import { walk } from "./walk.mjs";

const bindingsOf = (node) => {
  if (node.type === "VariableDeclarator") return patternNames(node.id);
  if (node.type === "CatchClause") return patternNames(node.param);
  if (node.type.startsWith("Import") && node.type.endsWith("Specifier")) return [node.local.name];

  if (node.type.startsWith("Function") || node.type === "ArrowFunctionExpression") {
    return [...patternNames(node.id), ...node.params.flatMap(patternNames)];
  }

  if (node.type.startsWith("Class")) return patternNames(node.id);

  return [];
};

export function declaredNames(program) {
  const names = new Set();

  walk(program, (node) => {
    for (const name of bindingsOf(node)) names.add(name);
  });

  return names;
}
