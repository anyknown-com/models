import { fieldsOf } from "./fields-of.mjs";

const valueOf = (name, value, key) =>
  name === "content-type" ? value.split(";")[0].trim() : value.replaceAll(key, "<key>");

export async function requestFields(request, key) {
  const headers = Object.fromEntries(
    [...request.headers].map(([name, value]) => [name, valueOf(name, value, key)]),
  );

  const fields = await fieldsOf(request, headers["content-type"] ?? "");

  return {
    method: request.method,
    url: request.url,
    headers,
    ...(fields === undefined ? {} : { fields }),
  };
}
