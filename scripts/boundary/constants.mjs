export const ALLOWED_PACKAGES = [];

export const FREE_GLOBALS = [
  "fetch",
  "globalThis",
  "self",
  "process",
  "XMLHttpRequest",
  "WebSocket",
  "Buffer",
];

export const DEFAULT_FETCH_FILE = "src/default-fetch.ts";

export const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

export const RUNTIME_TS_NODES = new Set([
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "TSTypeAssertion",
  "TSInstantiationExpression",
  "TSParameterProperty",
  "TSEnumDeclaration",
  "TSEnumBody",
  "TSEnumMember",
  "TSExportAssignment",
  "TSModuleDeclaration",
  "TSModuleBlock",
]);
