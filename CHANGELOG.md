# Changelog

All notable changes to `@anyknown/models` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The package is pre-1.0, so a minor
release can break the API; every break is listed under **Breaking**.

## 0.1.0 — Unreleased

### Added

- **Calls:** `streamText`, `generateText`, `transcribe`, `synthesize`, `embed`, `rerank`, `generateImage`, `submitVideo`, `readVideoStatus` and `readVideoResult`, from `@anyknown/models`.
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
