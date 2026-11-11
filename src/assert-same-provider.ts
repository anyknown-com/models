import { ModelError } from "./model-error";

export function assertSameProvider(adapterProvider: string, jobProvider: string): void {
  if (jobProvider === adapterProvider) return;

  throw new ModelError({
    kind: "unsupported",
    provider: adapterProvider,
    retryable: false,
    message: `video job of provider ${jobProvider} cannot be used with ${adapterProvider}`,
  });
}
