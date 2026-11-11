import type { JsonValue } from "../../../src/types/json";

const entryOf = (value: FormDataEntryValue): JsonValue =>
  typeof value === "string" ? value : { name: value.name, size: value.size };

const valueOf = (values: JsonValue[]): JsonValue => (values.length === 1 ? values[0]! : values);

export async function fieldsOf(request: Request, type: string): Promise<JsonValue | undefined> {
  if (request.body === null) return undefined;

  if (type === "multipart/form-data") {
    const form = await request.formData();

    return Object.fromEntries(
      [...new Set(form.keys())].map((name) => [name, valueOf(form.getAll(name).map(entryOf))]),
    );
  }

  if (type === "application/json") return JSON.parse(await request.text());

  return { type, size: (await request.arrayBuffer()).byteLength };
}
