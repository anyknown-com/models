import { fieldsOf } from "./fields-of";
import type { RequestFields } from "./types";

const withoutParameters = (value: string) => value.split(";")[0]!.trim();

export async function requestFields(request: Request): Promise<RequestFields> {
  const headers = Object.fromEntries(
    [...request.headers].map(([name, value]) => [
      name,
      name === "content-type" ? withoutParameters(value) : value,
    ]),
  );

  const fields = await fieldsOf(request, headers["content-type"] ?? "");

  return {
    method: request.method,
    url: request.url,
    headers,
    ...(fields === undefined ? {} : { fields }),
  };
}
