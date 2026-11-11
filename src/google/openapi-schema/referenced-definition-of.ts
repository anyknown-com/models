import type { JsonValue } from "../../types/json";
import { unsupported } from "../unsupported";
import type { SchemaContext } from "./types";

const SOURCES = [
  { prefix: "#/$defs/", cell: "dollarDefinitions" },
  { prefix: "#/definitions/", cell: "definitions" },
] as const;

const decodedOf = (encoded: string): string | undefined => {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return undefined;
  }
};

export function referencedDefinitionOf(
  reference: string,
  context: SchemaContext,
): { definition: JsonValue; key: string } {
  const source = SOURCES.find(({ prefix }) => reference.startsWith(prefix));
  const encoded = source ? reference.slice(source.prefix.length) : "";
  const decoded = decodedOf(encoded) ?? "/";
  const definitions = source && context[source.cell];
  const name = decoded.replace(/~[01]/g, (escape) => (escape === "~1" ? "/" : "~"));
  const malformed = encoded === "" || encoded.includes("/") || decoded.includes("/");

  const definition =
    definitions && Object.hasOwn(definitions, name) ? definitions[name] : undefined;

  if (!source || malformed || /~(?![01])/u.test(decoded) || definition === undefined) {
    throw unsupported(
      `google only converts references to direct children of root-level $defs or definitions, not ${reference}`,
    );
  }

  return { definition, key: `${source.prefix}${name}` };
}
