import { FREE_GLOBALS, RUNTIME_TS_NODES } from "./constants.mjs";
import { declaredNames } from "./declared-names.mjs";
import { isReference } from "./is-reference.mjs";
import { walk } from "./walk.mjs";

const isTypeOnly = (node) => node.type.startsWith("TS") && !RUNTIME_TS_NODES.has(node.type);

const isImportMetaEnv = (node) =>
  node.type === "MemberExpression" &&
  node.object.type === "MetaProperty" &&
  node.object.meta.name === "import" &&
  node.property.name === "env";

export function globalViolations(program) {
  const declared = declaredNames(program);
  const found = [];

  walk(program, (node, parent, key) => {
    if (isTypeOnly(node)) return false;

    if (isImportMetaEnv(node)) {
      found.push({ offset: node.start, rule: "free global: import.meta.env" });
    }

    const free =
      node.type === "Identifier" &&
      FREE_GLOBALS.includes(node.name) &&
      !declared.has(node.name) &&
      isReference(parent, key);

    if (free) found.push({ offset: node.start, rule: `free global: ${node.name}` });
  });

  return found;
}
