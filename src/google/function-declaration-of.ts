import type { JsonObject } from "../types/json";
import type { ToolDeclaration } from "../types/tool";
import { RecursiveReference, toOpenapiSchema } from "./openapi-schema";

const parametersOf = (inputSchema: JsonObject): JsonObject => {
  try {
    const parameters = toOpenapiSchema(inputSchema);

    return parameters === undefined ? {} : { parameters };
  } catch (error) {
    if (!(error instanceof RecursiveReference)) throw error;

    return { parametersJsonSchema: inputSchema };
  }
};

export function functionDeclarationOf({
  name,
  description,
  inputSchema,
}: ToolDeclaration): JsonObject {
  return { name, description, ...parametersOf(inputSchema) };
}
