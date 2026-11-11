const entryOf = (value) =>
  typeof value === "string" ? value : { name: value.name, size: value.size };

const valueOf = (values) => (values.length === 1 ? values[0] : values);

export async function fieldsOf(request, type) {
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
