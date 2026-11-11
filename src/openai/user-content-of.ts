import type { JsonObject } from "../types/json";
import type { UserModelMessage } from "../types/model-message";
import { toContentPart } from "./to-content-part";
import { userMediaOf } from "./user-media-of";

export function userContentOf(
  provider: string,
  content: UserModelMessage["content"],
  passThrough: boolean,
): JsonObject[] {
  if (typeof content === "string") return [{ type: "input_text", text: content }];

  return content
    .filter((part) => part.type !== "text" || part.text !== "")
    .map((part, index) =>
      toContentPart(provider, part, (media) =>
        userMediaOf(provider, media, { index, passThrough }),
      ),
    );
}
