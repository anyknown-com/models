import { dirname, relative, resolve } from "node:path";
import { ALLOWED_PACKAGES } from "./constants.mjs";
import { walk } from "./walk.mjs";

const SOURCE_NODES = new Set([
  "ImportDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
  "ImportExpression",
  "TSImportType",
]);

const ruleOf = (specifier, file, packageDir) => {
  if (typeof specifier !== "string") return "import with a non-literal specifier";

  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    const target = relative(packageDir, resolve(dirname(file), specifier));

    return target.startsWith("..") ? `import outside the package: ${specifier}` : null;
  }

  const allowed = ALLOWED_PACKAGES.some(
    (name) => specifier === name || specifier.startsWith(`${name}/`),
  );

  return allowed ? null : `bare import not on the allow list: ${specifier}`;
};

export function importViolations(program, file, packageDir) {
  const found = [];

  walk(program, (node) => {
    if (!SOURCE_NODES.has(node.type)) return;

    if (!node.source) return;

    const rule = ruleOf(
      node.source.type === "Literal" ? node.source.value : null,
      file,
      packageDir,
    );

    if (rule) found.push({ offset: node.start, rule });
  });

  return found;
}
