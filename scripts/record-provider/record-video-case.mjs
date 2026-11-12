import { setTimeout as sleep } from "node:timers/promises";
import { readVideoResult, readVideoStatus, submitVideo } from "../../src/index.ts";
import { ERROR_STATUSES, VIDEO_POLL_MS } from "./constants.mjs";
import { judgeCall } from "./judge-call.mjs";
import { messageOf } from "./message-of.mjs";
import { redactAccounts } from "./redact-accounts.mjs";
import { shortMedia } from "./short-media.mjs";
import { speechRecordingFetch } from "./speech-recording-fetch.mjs";
import { transportFor } from "./transport-for.mjs";

const PENDING = new Set(["queued", "running"]);

async function settledStatus(adapter, job, polls) {
  let status = await readVideoStatus(adapter, job);

  for (let poll = 1; poll < polls && PENDING.has(status.status); poll += 1) {
    await sleep(VIDEO_POLL_MS);
    status = await readVideoStatus(adapter, job);
  }

  return status;
}

async function makeVideo(adapter, request, { steps, polls, requestOnly }) {
  const job = await submitVideo(adapter, request);

  if (steps.length === 1) return;

  const status = await settledStatus(adapter, job, polls);

  if (!requestOnly && status.status !== "succeeded") {
    throw status.error ?? new Error(`still ${status.status} after ${polls} polls`);
  }

  await readVideoResult(adapter, job);
}

const keptOf = (calls, steps) =>
  steps.length === 1 ? calls.slice(0, 1) : [calls[0], ...calls.slice(1).slice(1 - steps.length)];

const fixtureOf = (calls, requestOnly) => ({
  ...(requestOnly ? { unverified: true } : {}),
  calls: calls.map(({ request, response }) => ({
    request,
    response: shortMedia(redactAccounts(response)),
  })),
});

const failureOf = (id, reason, error, secrets) =>
  `${id} ${reason}: ${messageOf({ body: { message: error?.message ?? "" } }, secrets)}`;

export async function recordVideoCase(videoCase, video, options) {
  const { id, steps } = videoCase;
  const { model, secrets, requestOnly, waitSeconds } = options;
  const transport = transportFor(videoCase, options);
  const recording = speechRecordingFetch(transport);
  const adapter = options.adapterOf({ key: transport.key, fetch: recording.fetch });
  const request = video.requestOf(videoCase.request, model);
  const polls = requestOnly ? 1 : Math.max(1, Math.ceil((waitSeconds * 1000) / VIDEO_POLL_MS));

  const error = await makeVideo(adapter, request, { steps, polls, requestOnly }).then(
    () => undefined,
    (caught) => caught,
  );

  const calls = keptOf(recording.calls, steps).filter(Boolean);

  if (calls.length === 0) return { failure: failureOf(id, "no response", error, secrets) };

  if (error && !requestOnly && !ERROR_STATUSES[id]) {
    return { failure: failureOf(id, "did not make a video", error, secrets) };
  }

  const verdict = judgeCall(videoCase, calls.at(-1), options);

  return verdict.fixture ? { fixture: fixtureOf(calls, requestOnly) } : verdict;
}
