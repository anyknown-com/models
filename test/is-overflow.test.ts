import { describe, expect, it } from "vitest";
import { isOverflow } from "../src/is-overflow";

const PI_OVERFLOW =
  "https://github.com/badlogic/pi-mono/blob/main/packages/ai/src/utils/overflow.ts";

const OPENAI_OVERFLOW =
  "https://community.openai.com/t/help-needed-tackling-context-length-limits-in-openai-models/617543";

const overflows = [
  {
    provider: "anthropic",
    source: "https://github.com/langchain-ai/langchain-aws/issues/1346",
    text: '{"type":"error","error":{"type":"invalid_request_error","message":"prompt is too long: 213462 tokens > 200000 maximum"}}',
  },
  {
    provider: "anthropic via model proxy",
    source: "packages/runtime/src/model-proxy/wire.fixture.ndjson",
    text: "prompt is too long",
  },
  {
    provider: "openai chat completions",
    source: OPENAI_OVERFLOW,
    text: `{"error":{"message":"This model's maximum context length is 4097 tokens. However, you requested 4927 tokens (3927 in the messages, 1000 in the completion). Please reduce the length of the messages or completion.","type":"invalid_request_error","param":"messages","code":"context_length_exceeded"}}`,
  },
  {
    provider: "openai code only",
    source: OPENAI_OVERFLOW,
    text: '{"error":{"message":"Request rejected","type":"invalid_request_error","code":"context_length_exceeded"}}',
  },
  {
    provider: "openai responses",
    source: PI_OVERFLOW,
    text: "Your input exceeds the context window of this model. Please adjust your input and try again.",
  },
  {
    provider: "google gemini",
    source: PI_OVERFLOW,
    text: '{"error":{"code":400,"message":"The input token count (1196265) exceeds the maximum number of tokens allowed (1048575).","status":"INVALID_ARGUMENT"}}',
  },
  {
    provider: "openrouter",
    source: PI_OVERFLOW,
    text: `{"error":{"message":"This endpoint's maximum context length is 200000 tokens. However, you requested about 250000 tokens (250000 of text input). Please reduce the length of either one, or use the \\"middle-out\\" transform to compress your prompt automatically.","code":400}}`,
  },
  {
    provider: "bedrock invoke model",
    source:
      "https://repost.aws/questions/QUshd0uzCZRAy1TbudkUKhww/claude-on-bedrock-giving-input-is-too-long-for-requested-model-for-10k-token-inputs-edit-broken-in-eu-central-1-working-in-other-regions",
    text: "An error occurred (ValidationException) when calling the InvokeModel operation: Input is too long for requested model.",
  },
  {
    provider: "bedrock converse",
    source: "https://qiita.com/kazuneet/items/9b0dc3c37cc33f7b61d6",
    text: "An error occurred (ValidationException) when calling the Converse operation: The model returned the following errors: 400 Bad Request: Too many input tokens",
  },
  {
    provider: "bedrock text bytes",
    source: "https://github.com/strands-agents/harness-sdk/issues/1712",
    text: "ValidationException: too many total text bytes",
  },
  {
    provider: "groq",
    source: PI_OVERFLOW,
    text: '{"error":{"message":"Please reduce the length of the messages or completion.","type":"invalid_request_error","param":"messages","code":"context_length_exceeded"}}',
  },
  {
    provider: "xai",
    source: PI_OVERFLOW,
    text: "This model's maximum prompt length is 131072 but the request contains 537812 tokens.",
  },
  {
    provider: "deepseek (openai wording)",
    source: OPENAI_OVERFLOW,
    text: "This model's maximum context length is 65536 tokens. However, you requested 70000 tokens (70000 in the messages, 0 in the completion). Please reduce the length of the messages or completion.",
  },
  {
    provider: "mistral",
    source: PI_OVERFLOW,
    text: "Prompt contains 40000 tokens and 0 draft tokens, too large for model with 32768 maximum context length",
  },
];

const plainBadRequests = [
  "max_tokens: Input should be greater than or equal to 1",
  "max_tokens must be ≤ 8192",
  '{"error":{"message":"max_tokens is too large: 50000. This model supports at most 16384 completion tokens, whereas you provided 50000.","type":"invalid_request_error","param":"max_tokens","code":"invalid_value"}}',
  "messages.3.content: text content blocks must contain non-whitespace text",
];

describe("isOverflow", () => {
  it.each(overflows)("a 400 from $provider is overflow ($source)", ({ text }) => {
    expect(isOverflow(400, text)).toBe(true);
  });

  it.each(plainBadRequests)("a plain 400 is not overflow: %s", (text) => {
    expect(isOverflow(400, text)).toBe(false);
  });

  it("only a 400 is overflow", () => {
    expect(isOverflow(429, "prompt is too long: 213462 tokens > 200000 maximum")).toBe(false);
  });
});
