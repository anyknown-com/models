import type { TextRequest } from "../../../src/types/text-request";
import { bytesOfBase64 } from "../../../src/wire/base64";

const RED_SQUARE_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAF0lEQVR4nGP4z8BAEiJN9aiGUQ1DSgMAkPn/Afnh+ngAAAAASUVORK5CYII=";

export const image: TextRequest = {
  model: "model",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What color is this image? Answer in one word." },
        { type: "image", image: bytesOfBase64(RED_SQUARE_PNG), mediaType: "image/png" },
      ],
    },
  ],
};
