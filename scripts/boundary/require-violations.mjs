import { walk } from "./walk.mjs";

const isRequireCall = (node) =>
  node.type === "CallExpression" &&
  node.callee.type === "Identifier" &&
  node.callee.name === "require";

export function requireViolations(program, comments) {
  const found = comments
    .filter((comment) => comment.type === "Line" && /^\/\s*<reference/.test(comment.value))
    .map((comment) => ({ offset: comment.start, rule: "/// <reference" }));

  walk(program, (node) => {
    if (isRequireCall(node)) found.push({ offset: node.start, rule: "require(" });
  });

  return found;
}
