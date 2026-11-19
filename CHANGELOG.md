# Changelog

All notable changes to `@anyknown/models` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The package is pre-1.0, so a minor
release can break the API; every break is listed under **Breaking**.

## 0.3.0 — 2026-11-19

### Added

- **`ModelError.resetAt`:** when the call can succeed again, as an ISO time, or `null` when the provider did not say. It is read from a subscription limit message (Claude's `usage limit reached|<time>`, ChatGPT's `resets_at` or `resets_in_seconds`), then `retry-after` (seconds or an HTTP date), then a Claude subscription's `anthropic-ratelimit-unified-reset` while `anthropic-ratelimit-unified-status` is `rejected`, then on a 429 the `anthropic-ratelimit-*-reset` and `x-ratelimit-reset-*` headers: the window with nothing left, else the latest. Errors that are not an HTTP response, such as a stream that breaks, have `null`.

## 0.2.0 — 2026-11-18

### Breaking

- **`TextCapabilities`:** has a new required field `contextWindow: number | null`. An adapter you write yourself must now return it from `capabilities(model)`. Known Claude, OpenAI and Gemini models report their context window from the provider's model docs; every other model reports `null`.

### Added

- **`@anyknown/models/chatgpt`:** `chatgpt`, for text through a ChatGPT subscription (the Codex Responses API at `chatgpt.com/backend-api/codex`). It takes `{ key, accountId, fetch?, baseUrl? }`: `key` is the subscription access token, sent as a bearer with `chatgpt-account-id`. System text goes out as a developer input item, as Codex sends it. The wire fixture is not yet recorded live.
- **`@anyknown/models/anthropic`:** `anthropic({ token })` sends a subscription token as `Authorization: Bearer` and adds `oauth-2025-04-20` to `anthropic-beta`, in place of `x-api-key`. `anthropic({ key })` is unchanged.
- **Capabilities:** OpenAI reasoning models report their `reasoning.effort` values in `effortLevels`; an unknown reasoning model reports `low`, `medium` and `high`. Gemini models report the thinking levels Google lists for each model. Claude Haiku 5.5 and Mythos 5.x are known models, with adaptive thinking and all five effort levels.
- **`@anyknown/models/google`:** `providerOptions.google.thinkingConfig.thinkingLevel` of `low`, `medium` or `high` sent to a Gemini 2.5 model goes out as Google's matching `thinkingBudget`.

## 0.1.2 — 2026-11-12

### Added

- **`@anyknown/models/bedrock`:** prompt caching. `providerOptions: { bedrock: { cachePoint: { type: "default" } } }` on a system part, a message part or a message sends a Converse `cachePoint` block after it; on the request it ends the last message with one.

### Fixed

- **`@anyknown/models/google`:** `readVideoStatus` reads an interaction that has ended as `incomplete`, `cancelled` or `failed`, or that waits on `requires_action` or `requires_continuation`, as `failed`, with a readable message and the status as `code`. Before, every status other than `completed`, `failed` and `cancelled` read as `running`, so an `incomplete` job was polled forever. A status the API reference does not list also reads as `failed`, with the raw status in the message and `code`.

## 0.1.1 — 2026-11-12

### Fixed

- The release check reads the `npm pack --json` output of npm 11 and later. The published files are the same as 0.1.0.

## 0.1.0 — 2026-11-12

### Added

- **Functions:** `streamText`, `generateText`, `transcribe`, `synthesize`, `embed`, `rerank`, `generateImage`, `submitVideo`, `readVideoStatus` and `readVideoResult`, from `@anyknown/models`.
- **Errors:** `ModelError`, with `kind`, `provider`, `retryable`, `status`, `code` and `body`.
- **`@anyknown/models/openai`:** `openai`, for text, transcription, speech and images.
- **`@anyknown/models/anthropic`:** `anthropic`, for text.
- **`@anyknown/models/google`:** `google`, for text and video.
- **`@anyknown/models/bedrock`:** `bedrock`, for text.
- **`@anyknown/models/openai-compatible`:** `openaiCompatible`, for text from any OpenAI-compatible chat API.
- **`@anyknown/models/workers-ai`:** `workersAi`, for text, embeddings and reranking through a Workers AI binding.
- **`@anyknown/models/groq`:** `groq`, for transcription.
- **`@anyknown/models/deepgram`:** `deepgram`, for transcription.
- **`@anyknown/models/elevenlabs`:** `elevenlabs`, for transcription and speech, and `elevenlabsKeyterms`.
- **`@anyknown/models/fish-audio`:** `fishAudio`, for transcription and speech.
- **`@anyknown/models/is-overflow`:** `isOverflow`, which tells whether an HTTP error says the input is longer than the model's context window.
