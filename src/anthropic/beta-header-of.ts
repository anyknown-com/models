import type { ToolDeclaration } from "../types/tool";
import { claudeModelOf } from "./claude-model-of";
import { OAUTH_BETA, PDFS_BETA, STRUCTURED_OUTPUTS_BETA } from "./constants";
import { sendsPdf } from "./sends-pdf";
import type { AnthropicAuth, AnthropicMessage } from "./types";

export function betaHeaderOf(
  auth: AnthropicAuth,
  model: string,
  tools: ToolDeclaration[],
  messages: AnthropicMessage[],
): Record<string, string> {
  const structured = tools.length > 0 && claudeModelOf(model).structuredOutput;

  const betas = [
    ...("token" in auth ? [OAUTH_BETA] : []),
    ...(sendsPdf(messages) ? [PDFS_BETA] : []),
    ...(structured ? [STRUCTURED_OUTPUTS_BETA] : []),
  ];

  return betas.length > 0 ? { "anthropic-beta": betas.join(",") } : {};
}
