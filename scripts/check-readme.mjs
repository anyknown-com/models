import { readdirSync, readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const readme = readFileSync(new URL("README.md", root), "utf8");
const fences = [...readme.matchAll(/^```ts(?: (\S+))?\n([\s\S]*?)^```$/gm)];
const examples = readdirSync(new URL("examples/", root)).map((name) => `examples/${name}`);

const differs = ([, path, body]) =>
  !examples.includes(path) || readFileSync(new URL(path, root), "utf8") !== body;

const problems = [
  ...fences
    .filter(differs)
    .map(([, path]) => `README fence ${path ?? "(no path)"} is not that example file`),
  ...examples
    .filter((path) => !fences.some(([, used]) => used === path))
    .map((path) => `${path} is not in README`),
];

for (const problem of problems) console.log(problem);

process.exitCode = problems.length > 0 ? 1 : 0;
