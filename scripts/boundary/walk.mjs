export function walk(node, visit, parent = null, key = null) {
  if (visit(node, parent, key) === false) return;

  for (const [childKey, child] of Object.entries(node)) {
    const children = Array.isArray(child) ? child : [child];

    for (const item of children) {
      if (item && typeof item.type === "string") walk(item, visit, node, childKey);
    }
  }
}
