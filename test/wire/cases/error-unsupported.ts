import type { TextRequest } from "../../../src/types/text-request";

export const errorUnsupported: TextRequest = {
  model: "model",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What does this document say?" },
        {
          type: "file",
          data: new URL("ftp://example.com/hello.pdf"),
          mediaType: "application/pdf",
          filename: "hello.pdf",
        },
      ],
    },
  ],
};
