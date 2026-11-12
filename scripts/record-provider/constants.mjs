export const FIXTURES = new URL("../../test/conformance/fixtures/", import.meta.url);

export const REPEAT_MIN = 10_000;

export const REPEAT_UNIT_MAX = 64;

export const ACCOUNT_KEYS = ["user_id", "organization", "org_id"];

export const ACCOUNT_REDACTED = "org_redacted";

export const WRONG_KEY = "anyknown-record-wrong-key-0000000000";

export const REQUEST_ONLY_KEY = "anyknown-record-request-only-key";

export const ERROR_STATUSES = {
  "error-auth": [401, 403],
  "error-bad-request": [400, 422],
  "error-not-found": [404],
  "error-overflow": [200, 400, 413],
  "transcribe-error-auth": [401, 403],
  "transcribe-error-bad-request": [400, 422],
  "synthesize-error-auth": [401, 403],
  "synthesize-error-bad-request": [400, 422],
  "image-error-auth": [401, 403],
  "image-error-bad-request": [400, 422],
  "video-error-auth": [401, 403],
  "video-error-bad-request": [400, 422],
};

export const VIDEO_POLL_MS = 10_000;

export const VIDEO_WAIT_SECONDS = 600;

export const MEDIA_MIN = 4096;

export const MEDIA_KEPT = 64;

export const BINDING_ERRORS = ["embed-error-not-found", "rerank-error-not-found"];

export const USAGE =
  "node scripts/record-provider.mjs <provider id> --base-url <url> (--key-env <env> | --via <origin> | --request-only) [--kind <text | transcribe | synthesize | image | video>] [--adapter <adapter>] [--model <id>] [--wait <seconds>] [--fixtures <dir>]\nnode scripts/record-provider.mjs <provider id> --kind <embed | rerank> [--request-only] [--adapter <adapter>] [--model <id>] [--fixtures <dir>]";
