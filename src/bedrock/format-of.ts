import { unsupported } from "../wire/unsupported";
import { PROVIDER } from "./constants";

export function formatOf(formats: Readonly<Record<string, string>>, mediaType: string): string {
  const format = formats[mediaType];

  if (format === undefined) throw unsupported(PROVIDER, `bedrock does not send ${mediaType}`);

  return format;
}
