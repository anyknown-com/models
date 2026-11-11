# @anyknown/models

One small API for calling AI models: stream or generate text, transcribe speech, synthesize speech, embed, rerank, generate images and generate video. Each provider is an adapter on its own subpath, so you import only the providers you use. The package has no runtime dependencies and talks to providers with `fetch` only.

## Install

```sh
npm install @anyknown/models
```

## Stream text

`streamText` yields events as they arrive. It never throws: the last event is always `finish`, and a failed call carries a `ModelError` in its `error`.

```ts examples/stream-text.ts
import { streamText } from "@anyknown/models";
import { anthropic } from "@anyknown/models/anthropic";

export async function streamAnswer(
  key: string,
  question: string,
  onText: (delta: string) => void,
): Promise<number | null> {
  const events = streamText(anthropic({ key }), {
    model: "claude-sonnet-4-5",
    messages: [{ role: "user", content: question }],
    maxOutputTokens: 1024,
  });

  for await (const event of events) {
    if (event.type === "text") onText(event.delta);
    if (event.type !== "finish") continue;
    if (event.error?.retryable) return null;
    if (event.error) throw event.error;

    return event.usage.output;
  }

  return null;
}
```

## Generate text

`generateText` waits for the whole answer and returns `text`, `toolCalls`, `reason` and `usage`. It throws a `ModelError` when the call fails.

```ts examples/generate-text.ts
import { ModelError, generateText } from "@anyknown/models";
import { openai } from "@anyknown/models/openai";

export async function answer(key: string, question: string): Promise<string | null> {
  try {
    const { text } = await generateText(openai({ key }), {
      model: "gpt-5-mini",
      messages: [{ role: "user", content: question }],
    });

    return text;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Transcribe

```ts examples/transcribe.ts
import { ModelError, transcribe } from "@anyknown/models";
import { groq } from "@anyknown/models/groq";

export async function transcribeClip(key: string, audio: Blob): Promise<string | null> {
  try {
    const { text } = await transcribe(groq({ key }), {
      model: "whisper-large-v3-turbo",
      audio,
      filename: "clip.webm",
      language: "en",
    });

    return text;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Synthesize

`audio` is the provider's `Response`, so you can stream it or read it whole.

```ts examples/synthesize.ts
import { ModelError, synthesize } from "@anyknown/models";
import { elevenlabs } from "@anyknown/models/elevenlabs";

export async function speak(key: string, voice: string, text: string): Promise<Blob | null> {
  try {
    const { audio } = await synthesize(elevenlabs({ key }), {
      model: "eleven_flash_v2_5",
      text,
      voice,
    });

    return await audio.blob();
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Embed

```ts examples/embed.ts
import { ModelError, embed } from "@anyknown/models";
import { type WorkersAiBinding, workersAi } from "@anyknown/models/workers-ai";

export async function embedNotes(
  binding: WorkersAiBinding,
  notes: string[],
): Promise<number[][] | null> {
  try {
    const { embeddings } = await embed(workersAi({ binding }), {
      model: "@cf/qwen/qwen3-embedding-0.6b",
      values: notes,
    });

    return embeddings;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Rerank

Each entry in `ranking` has an `index` into `documents` and a `score`; a higher score is a better match.

```ts examples/rerank.ts
import { ModelError, rerank } from "@anyknown/models";
import { type WorkersAiBinding, workersAi } from "@anyknown/models/workers-ai";

export async function rankDocuments(
  binding: WorkersAiBinding,
  query: string,
  documents: string[],
): Promise<{ document: string; score: number }[] | null> {
  try {
    const { ranking } = await rerank(workersAi({ binding }), {
      model: "@cf/baai/bge-reranker-base",
      query,
      documents,
    });

    return ranking.map(({ index, score }) => ({ document: documents[index], score }));
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Generate an image

`image` is the image bytes, or a `URL` when the provider returns a link.

```ts examples/generate-image.ts
import { ModelError, generateImage } from "@anyknown/models";
import { openai } from "@anyknown/models/openai";

export async function draw(key: string, prompt: string): Promise<Uint8Array | URL | null> {
  try {
    const { image } = await generateImage(openai({ key }), {
      model: "gpt-image-2.5-sunburst",
      prompt,
    });

    return image;
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Generate video

Video is a job: `submitVideo` starts it and returns a `VideoJob`, `readVideoStatus` tells you whether it is done, and `readVideoResult` reads the video once the status is `succeeded`. You decide when to read the status again.

```ts examples/submit-video.ts
import { ModelError, type VideoJob, submitVideo } from "@anyknown/models";
import { google } from "@anyknown/models/google";

export async function startFilm(key: string, prompt: string): Promise<VideoJob | null> {
  try {
    return await submitVideo(google({ key }), {
      model: "gemini-omni-1.2-flash",
      prompt,
    });
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

```ts examples/read-video-status.ts
import { ModelError, type VideoJob, readVideoStatus } from "@anyknown/models";
import { google } from "@anyknown/models/google";

export async function filmReady(key: string, job: VideoJob): Promise<boolean> {
  try {
    const status = await readVideoStatus(google({ key }), job);

    if (status.status === "failed") throw status.error;

    return status.status === "succeeded";
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return false;

    throw error;
  }
}
```

```ts examples/read-video-result.ts
import { ModelError, type VideoJob, readVideoResult } from "@anyknown/models";
import { google } from "@anyknown/models/google";

export async function downloadFilm(key: string, job: VideoJob): Promise<Uint8Array | null> {
  try {
    const { video } = await readVideoResult(google({ key }), job);

    if (video instanceof Uint8Array) return video;

    const response = video instanceof URL ? await fetch(video) : video;

    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    if (error instanceof ModelError && error.retryable) return null;

    throw error;
  }
}
```

## Subpaths

Every adapter takes `{ key, fetch?, baseUrl? }` unless the table says otherwise.

| Import                               | Adapter                                                                                  | Calls                                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `@anyknown/models/openai`            | `openai`                                                                                 | `streamText`, `generateText`, `transcribe`, `synthesize`, `generateImage`                      |
| `@anyknown/models/anthropic`         | `anthropic`                                                                              | `streamText`, `generateText`                                                                   |
| `@anyknown/models/google`            | `google`                                                                                 | `streamText`, `generateText`, `submitVideo`, `readVideoStatus`, `readVideoResult`              |
| `@anyknown/models/bedrock`           | `bedrock` (`baseUrl` is required)                                                        | `streamText`, `generateText`                                                                   |
| `@anyknown/models/openai-compatible` | `openaiCompatible` (`{ name, key, baseUrl, fetch?, authHeader? }`)                       | `streamText`, `generateText`                                                                   |
| `@anyknown/models/workers-ai`        | `workersAi` (`{ binding }`, a Workers AI binding)                                        | `streamText`, `generateText`, `embed`, `rerank`                                                |
| `@anyknown/models/groq`              | `groq`                                                                                   | `transcribe`                                                                                   |
| `@anyknown/models/deepgram`          | `deepgram`                                                                               | `transcribe`                                                                                   |
| `@anyknown/models/elevenlabs`        | `elevenlabs` (and `elevenlabsKeyterms(terms)`, which keeps the terms ElevenLabs accepts) | `transcribe`, `synthesize`                                                                     |
| `@anyknown/models/fish-audio`        | `fishAudio`                                                                              | `transcribe`, `synthesize`                                                                     |
| `@anyknown/models/is-overflow`       | `isOverflow(status, text)`                                                               | none: tells you whether an HTTP error says the input is longer than the model's context window |

The root import `@anyknown/models` has the calls, `ModelError` and the types.

## Errors

Every failed call ends in a `ModelError` (thrown, or in the `finish` event of `streamText`). It has these fields:

- `kind`: `"auth"`, `"rate-limit"`, `"overflow"`, `"bad-request"`, `"not-found"`, `"server"`, `"network"`, `"abort"` or `"unsupported"`.
- `provider`: the adapter's provider name, for example `"openai"`.
- `retryable`: `true` when the same call can succeed later.
- `status`: the HTTP status, when the provider answered.
- `code`: the provider's error code, when it sent one.
- `body`: the provider's response body, when it sent one.
- `message` and `cause`, as on every `Error`.

## Rules

- Only `fetch`: every request goes through `fetch` (Workers AI through its binding), and you can pass your own `fetch` to an adapter.
- No retries: a call is sent once, and `retryable` tells you whether to call again.
- Usage has no cost: results report usage in tokens, seconds, characters, bytes or images, never in money.
- The caller brings the key: each adapter gets its key from your code and the package never reads environment variables.

## Runtimes

Node.js 20 or later, Cloudflare Workers (without `nodejs_compat`) and browsers. The package is ESM only.
