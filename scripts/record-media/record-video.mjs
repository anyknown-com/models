import { setTimeout as sleep } from "node:timers/promises";
import { importExport } from "../record-text/import-export.mjs";
import { recordingFetch } from "../record-text/recording-fetch.mjs";
import { transportOf } from "../record-text/transport-of.mjs";
import { writeFixture } from "./write-fixture.mjs";

const CASES = new URL("../../test/wire/cases/index.ts", import.meta.url);
const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta";
const POLL_MS = 10_000;
const POLL_MAX = 60;

const factoryOf = (family) =>
  importExport(new URL(`../../src/${family}/index.ts`, import.meta.url), family);

const lastOf = (calls) => calls[calls.length - 1];

async function untilDone(adapter, job) {
  for (let poll = 0; poll < POLL_MAX; poll += 1) {
    const status = await adapter.readVideoStatus(job);

    if (status.status !== "queued" && status.status !== "running") return status;

    await sleep(POLL_MS);
  }

  throw new Error(`${job.id} 問了 ${POLL_MAX} 次還沒好`);
}

export async function recordVideo({ family, model, keyEnv, via, edit }) {
  const transport = await transportOf({ via, provider: family, baseUrl: GOOGLE_BASE, keyEnv });
  const recording = recordingFetch(transport);
  const adapter = (await factoryOf(family))({ key: transport.key, fetch: recording.fetch });
  const job = await adapter.submitVideo({ ...(await importExport(CASES, "film")), model });
  const submitted = lastOf(recording.calls);
  const status = await untilDone(adapter, job);
  const polled = lastOf(recording.calls);

  console.error(`submit usage ${JSON.stringify(submitted.response.body?.usage)}`);
  console.error(`status ${status.status} usage ${JSON.stringify(status.raw?.usage)}`);

  if (status.status === "failed") throw status.error;

  const result = await adapter.readVideoResult(job);

  console.error(`video ${result.video.byteLength} bytes ${result.mediaType}`);

  const files = [
    await writeFixture(`${family}/video-submit.json`, submitted, transport.key),
    await writeFixture(`${family}/video-status.json`, polled, transport.key),
  ];

  if (!edit) return files;

  const request = { ...(await importExport(CASES, "recut")), model, source: job };

  await adapter.submitVideo(request);

  const edited = lastOf(recording.calls);

  console.error(`edit usage ${JSON.stringify(edited.response.body?.usage)}`);

  return [...files, await writeFixture(`${family}/video-edit.json`, edited, transport.key)];
}
