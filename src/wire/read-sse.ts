import { linesOf } from "./lines-of";

type SseEvent = { event?: string; data: string };

const fieldOf = (line: string): [string, string] => {
  const colon = line.indexOf(":");

  if (colon === -1) return [line, ""];

  return [line.slice(0, colon), line.slice(colon + 1).replace(/^ /, "")];
};

const eventOf = (event: string | undefined, data: string[]): SseEvent =>
  event === undefined ? { data: data.join("\n") } : { event, data: data.join("\n") };

export async function* readSse(body: ReadableStream<Uint8Array>): AsyncIterable<SseEvent> {
  let event: string | undefined;
  let data: string[] = [];

  for await (const line of linesOf(body)) {
    if (line === "") {
      if (data.length > 0) yield eventOf(event, data);

      event = undefined;
      data = [];
      continue;
    }

    const [field, value] = fieldOf(line);

    if (field === "event") event = value === "" ? undefined : value;
    if (field === "data") data.push(value);
  }

  if (data.length > 0) yield eventOf(event, data);
}
