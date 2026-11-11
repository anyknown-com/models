import type { TextRequest } from "../../../src/types/text-request";
import { bytesOfBase64 } from "../../../src/wire/base64";

const ONE_LINE_DOCX =
  "UEsDBBQAAAAIAAAAIQB5bjPX6AAAAK0BAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbH1QyU7DMBD9FWuuKHHggBCK0wPLETiUDxjZk8SqN3nc0v49Tlt6QIXjzFv1+tXeO7GjzDYGBbdtB4KCjsaGScHn+rV5AMEFg0EXAyk4EMNq6NeHRCyqNrCCuZT0KCXrmTxyGxOFiowxeyz1zJNMqDc4kbzrunupYygUSlMWDxj6Zxpx64p42df3qUcmxyCeTsQlSwGm5KzGUnG5C+ZXSnNOaKvyyOHZJr6pBJBXExbk74Cz7r0Ok60h8YG5vKGvLPkVs5Em6q2vyvZ/mys94zhaTRf94pZy1MRcF/euvSAebfjpL49zD99QSwMEFAAAAAgAAAAhAJv9N+qtAAAAKQEAAAsAAABfcmVscy8ucmVsc43POw7CMAwG4KtE3mlaBoRQ0y4IqSsqB7ASN61oHkrCo7cnAwNFDIy2f3+W6/ZpZnanECdnBVRFCYysdGqyWsClP232wGJCq3B2lgQsFKFt6jPNmPJKHCcfWTZsFDCm5A+cRzmSwVg4TzZPBhcMplwGzT3KK2ri27Lc8fBpwNpknRIQOlUB6xdP/9huGCZJRydvhmz6ceIrkWUMmpKAhwuKq3e7yCzwpuarF5sXUEsDBBQAAAAIAAAAIQBA4uCZpQAAAN0AAAARAAAAd29yZC9kb2N1bWVudC54bWxFjksOAiEQRK9C2DuMLoyZzCdujAfQAyD0fCJ0E0Bxbi+MCzev0qnUS7fDxxr2Bh8Wwo7vq5ozQEV6wanj99tld+IsRIlaGkLo+AqBD32bGk3qZQEjywIMTer4HKNrhAhqBitDRQ4wdyN5K2M+/SQSee08KQgh+60Rh7o+CisX5EX5IL2WdAW+IPZXMIbY6MmyM65PpIRVK0pT6De6jb+1+H/WfwFQSwECFAMUAAAACAAAACEAeW4z1+gAAACtAQAAEwAAAAAAAAAAAAAAgAEAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQIUAxQAAAAIAAAAIQCb/TfqrQAAACkBAAALAAAAAAAAAAAAAACAARkBAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIAAAAIQBA4uCZpQAAAN0AAAARAAAAAAAAAAAAAACAAe8BAAB3b3JkL2RvY3VtZW50LnhtbFBLBQYAAAAAAwADALkAAADDAgAAAAA=";

export const fileDocx: TextRequest = {
  model: "model",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What does this document say? Answer in one sentence." },
        {
          type: "file",
          data: bytesOfBase64(ONE_LINE_DOCX),
          mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          filename: "hello.docx",
        },
      ],
    },
  ],
  providerOptions: { openai: { passThroughUnsupportedFiles: true } },
};
