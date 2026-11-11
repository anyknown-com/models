import { writeFileSync } from "node:fs";
import { requestFields } from "./request-fields.mjs";
import { responseFields } from "./response-fields.mjs";

export async function recordCall({ file, key, input, request }) {
  const fields = await requestFields(request.clone(), key);
  const response = await fetch(request);
  const fixture = { input, request: fields, response: await responseFields(response) };

  writeFileSync(file, `${JSON.stringify(fixture, null, 2)}\n`);
  process.stdout.write(`${file}: ${response.status}
`);
}
