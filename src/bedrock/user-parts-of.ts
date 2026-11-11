import type { UserModelMessage } from "../types/model-message";
import type { UserPart } from "./types";

export const userPartsOf = (content: UserModelMessage["content"]): UserPart[] =>
  typeof content === "string"
    ? [{ type: "text", text: content }]
    : content.filter((part) => part.type !== "text" || part.text !== "");
