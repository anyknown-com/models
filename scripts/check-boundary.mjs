import { relative, resolve } from "node:path";
import { violationsIn } from "./boundary/violations-in.mjs";

const packageDir = resolve(process.argv[2] ?? ".");
const violations = violationsIn(packageDir);

for (const { file, line, rule } of violations) {
  console.log(`${relative(process.cwd(), file)}:${line} ${rule}`);
}

process.exitCode = violations.length > 0 ? 1 : 0;
