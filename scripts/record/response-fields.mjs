const EVENT_STREAM = "application/vnd.amazon.eventstream";

export async function responseFields(response) {
  const headers = { "content-type": response.headers.get("content-type") ?? "" };
  const status = response.status;

  if (headers["content-type"].startsWith("application/json")) {
    return { status, headers, body: await response.json() };
  }

  if (headers["content-type"].startsWith("text/")) {
    return { status, headers, chunks: [await response.text()] };
  }

  if (headers["content-type"].startsWith(EVENT_STREAM)) {
    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");

    return { status, headers, chunks: [base64], encoding: "base64" };
  }

  const size = (await response.arrayBuffer()).byteLength;

  return { status, headers, chunks: [`<${size} bytes of ${headers["content-type"]}>`] };
}
