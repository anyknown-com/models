import { TEXT_CASES } from "../../test/conformance/cases/index.ts";
import { TEXT_ADAPTERS } from "../../test/conformance/constants.ts";
import { EMBED, RERANK } from "../../test/conformance/embed/constants.ts";
import { SYNTHESIZE, TRANSCRIBE } from "../../test/conformance/speech/constants.ts";
import { deriveVideo } from "../../test/conformance/visual/derive-video.ts";
import { IMAGE, VIDEO } from "../../test/conformance/visual/constants.ts";
import { recordBindingCase } from "./record-binding-case.mjs";
import { recordCase } from "./record-case.mjs";
import { recordSpeechCase } from "./record-speech-case.mjs";
import { recordVideoCase } from "./record-video-case.mjs";
import { REQUEST_ONLY_JOB_TRANSPORT } from "./request-only-transport.mjs";
import { shortMedia } from "./short-media.mjs";

const speechAdapters = (adapters) =>
  Object.fromEntries(
    Object.entries(adapters).map(([name, entry]) => [
      name,
      { create: (_, config) => entry.create(config) },
    ]),
  );

const speechKind = (speech) => ({
  cases: speech.cases,
  adapters: speechAdapters(speech.adapters),
  recordOne: (speechCase, options) => recordSpeechCase(speechCase, speech, options),
});

const bindingAdapters = (adapters) =>
  Object.fromEntries(
    Object.entries(adapters).map(([name, entry]) => [
      name,
      { create: (_, { binding }) => entry(binding) },
    ]),
  );

const bindingKind = (embed) => ({
  cases: embed.cases,
  adapters: bindingAdapters(embed.adapters),
  binding: true,
  recordOne: (embedCase, options) => recordBindingCase(embedCase, embed, options),
});

const withShortMedia = ({ fixture, ...verdict }) =>
  fixture ? { fixture: { ...fixture, response: shortMedia(fixture.response) } } : verdict;

const imageKind = {
  ...speechKind(IMAGE),
  recordOne: (imageCase, options) =>
    recordSpeechCase(imageCase, IMAGE, options).then(withShortMedia),
};

const videoKind = {
  cases: VIDEO.cases,
  adapters: speechAdapters(VIDEO.adapters),
  requestOnlyTransport: REQUEST_ONLY_JOB_TRANSPORT,
  recordOne: (videoCase, options) => recordVideoCase(videoCase, VIDEO, options),
  derive: (source, derived, { adapter }) =>
    deriveVideo(source, derived, VIDEO.adapters[adapter]?.statusBodies ?? {}),
};

export const KINDS = {
  text: { cases: TEXT_CASES, adapters: TEXT_ADAPTERS, recordOne: recordCase },
  transcribe: speechKind(TRANSCRIBE),
  synthesize: speechKind(SYNTHESIZE),
  embed: bindingKind(EMBED),
  rerank: bindingKind(RERANK),
  image: imageKind,
  video: videoKind,
};
