import type { JsonObject } from "../types/json";
import type { ModelMessage } from "../types/model-message";
import type { TextPart } from "../types/parts";
import type { TextRequest } from "../types/text-request";
import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

type WireMessage = { role: "system" | "user" | "assistant"; content: string };

const joined = (parts: TextPart[]): string => parts.map(({ text }) => text).join("\n\n");

const contentOf = (content: ModelMessage["content"]): string => {
  if (typeof content === "string") return content;

  const texts = content.flatMap((part) => (part.type === "text" ? [part] : []));

  if (texts.length !== content.length)
    throw unsupported(PROVIDER, "workers ai text takes only text parts");

  return joined(texts);
};

const wireOf = ({ role, content }: ModelMessage): WireMessage => {
  if (role === "tool") throw unsupported(PROVIDER, "workers ai text does not take tool messages");

  return { role, content: contentOf(content) };
};

export function textInput({ system, messages, tools, maxOutputTokens }: TextRequest): JsonObject {
  if (tools && tools.length > 0) throw unsupported(PROVIDER, "workers ai text does not take tools");

  const head: WireMessage[] =
    system && system.length > 0 ? [{ role: "system", content: joined(system) }] : [];

  const wire = [...head, ...messages.map(wireOf)];

  return maxOutputTokens === undefined
    ? { messages: wire }
    : { messages: wire, max_tokens: maxOutputTokens };
}
