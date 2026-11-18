import type { ResponsesCall } from "../openai/types";
import type { AdapterConfig } from "../types/adapter-config";

export type ChatgptConfig = AdapterConfig & { accountId: string };

export type ChatgptCall = ResponsesCall & { accountId: string };
