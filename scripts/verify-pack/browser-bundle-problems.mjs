import { join } from "node:path";
import { build } from "esbuild";

export async function browserBundleProblems(installed, entry) {
  try {
    await build({
      entryPoints: [join(installed, entry)],
      bundle: true,
      platform: "browser",
      format: "esm",
      write: false,
      logLevel: "silent",
    });

    return [];
  } catch (error) {
    return error.errors.map(({ text }) => `browser bundle of ${entry} fails: ${text}`);
  }
}
