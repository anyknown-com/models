import type { ReadField } from "../wire/types";

export const OPENAI_BASE_URL = "https://api.openai.com/v1";

export const IMAGE_QUALITY = "high";

export const IMAGE_SIZE = "1024x1024";

// https://developers.openai.com/api/docs/guides/speech-to-text (gpt-transcribe `languages`: ISO 639-1 codes and the regional zh codes, lowercase as in the examples)
export const GPT_TRANSCRIBE_LANGUAGES: Partial<Record<string, string>> = {
  "zh-TW": "zh-tw",
  "zh-CN": "zh-cn",
  en: "en",
  ja: "ja",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
};

export const NOT_OUTPUT = new Set([
  "response.created",
  "response.in_progress",
  "response.failed",
  "error",
]);

export const FINISHED = new Set(["response.completed", "response.incomplete"]);

export const QUOTA = "insufficient_quota";

export const STREAM_STATUS_TERMS: readonly [RegExp, number][] = [
  [/insufficient_quota|rate_limit/, 429],
  [/authentication/, 401],
  [/permission/, 403],
  [/not_found/, 404],
  [/invalid|bad_request|context_length/, 400],
  [/overload/, 503],
  [/timeout/, 504],
];

export const UNKNOWN_STREAM_STATUS = 500;

const fieldsOf = (type: ReadField["type"], ...paths: string[][]): ReadField[] =>
  paths.map((path) => ({ path, type }));

const usage = (...path: string[]) => ["response", "usage", ...path];

const ITEM_FIELDS = [
  ...fieldsOf("number", ["output_index"]),
  ...fieldsOf("object", ["item"]),
  ...fieldsOf("string", ["item", "id"], ["item", "type"], ["item", "call_id"], ["item", "name"]),
  ...fieldsOf("string", ["item", "arguments"]),
];

const RESPONSE_FIELDS = [
  ...fieldsOf("object", ["response"], ["response", "incomplete_details"], usage()),
  ...fieldsOf("string", ["response", "incomplete_details", "reason"]),
  ...fieldsOf("number", usage("input_tokens"), usage("output_tokens")),
  ...fieldsOf("object", usage("input_tokens_details"), usage("output_tokens_details")),
  ...fieldsOf("number", usage("input_tokens_details", "cached_tokens")),
  ...fieldsOf("number", usage("input_tokens_details", "cache_write_tokens")),
  ...fieldsOf("number", usage("output_tokens_details", "reasoning_tokens")),
];

export const TYPE_FIELDS: readonly ReadField[] = [
  { path: ["type"], type: "string", required: true },
];

export const READ_FIELDS: Partial<Record<string, readonly ReadField[]>> = {
  "response.output_text.delta": [
    ...fieldsOf("number", ["output_index"]),
    ...fieldsOf("string", ["item_id"], ["delta"]),
  ],
  "response.reasoning_summary_text.delta": fieldsOf("string", ["delta"]),
  "response.output_item.added": ITEM_FIELDS,
  "response.output_item.done": ITEM_FIELDS,
  "response.completed": RESPONSE_FIELDS,
  "response.incomplete": RESPONSE_FIELDS,
  "response.failed": [
    ...RESPONSE_FIELDS,
    ...fieldsOf("object", ["response", "error"]),
    ...fieldsOf("string", ["response", "error", "message"], ["response", "error", "code"]),
  ],
  error: [
    ...fieldsOf("string", ["message"], ["code"]),
    ...fieldsOf("object", ["error"]),
    ...fieldsOf("string", ["error", "message"], ["error", "code"], ["error", "type"]),
  ],
};
