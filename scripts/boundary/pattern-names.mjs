const NAMES_OF = {
  Identifier: (pattern) => [pattern.name],
  ObjectPattern: (pattern) => pattern.properties.flatMap((p) => patternNames(p.value ?? p)),
  ArrayPattern: (pattern) => pattern.elements.flatMap(patternNames),
  AssignmentPattern: (pattern) => patternNames(pattern.left),
  RestElement: (pattern) => patternNames(pattern.argument),
  TSParameterProperty: (pattern) => patternNames(pattern.parameter),
};

export function patternNames(pattern) {
  return pattern ? (NAMES_OF[pattern.type]?.(pattern) ?? []) : [];
}
