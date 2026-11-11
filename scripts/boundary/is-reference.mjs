const NAME_KEYS = new Set([
  "Property",
  "PropertyDefinition",
  "MethodDefinition",
  "AccessorProperty",
]);

const LABEL_PARENTS = new Set(["LabeledStatement", "BreakStatement", "ContinueStatement"]);

export function isReference(parent, key) {
  if (!parent) return true;
  if (parent.type === "MemberExpression" && key === "property") return parent.computed;
  if (NAME_KEYS.has(parent.type) && key === "key") return parent.computed;
  if (LABEL_PARENTS.has(parent.type)) return false;
  if (parent.type === "ImportSpecifier" && key === "imported") return false;
  if (parent.type === "ExportSpecifier" && key === "exported") return false;

  return parent.type !== "MetaProperty";
}
