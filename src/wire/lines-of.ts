const LINE_BREAK = /\r\n|\r|\n/;

export async function* linesOf(body: ReadableStream<Uint8Array>): AsyncIterable<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let rest = "";

  try {
    let chunk = await reader.read();

    while (!chunk.done) {
      rest += decoder.decode(chunk.value, { stream: true });

      const end = rest.endsWith("\r") ? rest.length - 1 : rest.length;
      const lines = rest.slice(0, end).split(LINE_BREAK);

      rest = `${lines.pop() ?? ""}${rest.slice(end)}`;
      yield* lines;
      chunk = await reader.read();
    }

    yield* `${rest}${decoder.decode()}`.split(LINE_BREAK);
  } finally {
    await reader.cancel();
  }
}
