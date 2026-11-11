export async function responseFields(response) {
  const headers = { "content-type": response.headers.get("content-type") ?? "" };
  const status = response.status;

  if (headers["content-type"].startsWith("application/json")) {
    return { status, headers, body: await response.json() };
  }

  if (headers["content-type"].startsWith("text/")) {
    return { status, headers, chunks: [await response.text()] };
  }

  const size = (await response.arrayBuffer()).byteLength;

  return { status, headers, chunks: [`<${size} bytes of ${headers["content-type"]}>`] };
}
