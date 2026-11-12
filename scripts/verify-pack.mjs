import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { browserBundleProblems } from "./verify-pack/browser-bundle-problems.mjs";

const MANIFEST_FILES = ["CHANGELOG.md", "LICENSE", "README.md", "package.json"];
const DEPENDENCY_FIELDS = ["dependencies", "peerDependencies", "optionalDependencies"];

const toDist = (path, extension) =>
  path.replace(/^\.\/src\//, "./dist/").replace(/\.ts$/, extension);

const stemOf = (entry) =>
  String(entry?.default)
    .replace(/^\.\/dist\//, "")
    .replace(/\.js$/, "");

const contractProblems = (key, entry) => {
  const stem = stemOf(entry);
  const shape = { types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` };

  if (!isDeepStrictEqual(entry, shape)) return [`export ${key} is not { types, default } in dist`];

  return existsSync(join("src", `${stem}.ts`)) ? [] : [`export ${key} has no src/${stem}.ts`];
};

const workspace = JSON.parse(readFileSync("package.json", "utf8"));
const scratch = mkdtempSync(join(tmpdir(), "anyknown-models-pack-"));
const consumer = join(scratch, "consumer");
const installed = join(consumer, "node_modules", workspace.name);
const require = createRequire(join(consumer, "index.js"));

const exportedNames = async (specifier) => {
  try {
    return Object.keys(await import(pathToFileURL(require.resolve(specifier)).href));
  } catch {
    return [];
  }
};

try {
  const pack = execFileSync("npm", ["pack", "--pack-destination", scratch, "--json"], {
    encoding: "utf8",
  });

  const tarball = join(scratch, Object.values(JSON.parse(pack))[0].filename);

  mkdirSync(installed, { recursive: true });
  execFileSync("tar", ["-xzf", tarball, "-C", installed, "--strip-components=1"]);

  const packedText = readFileSync(join(installed, "package.json"), "utf8");
  const packed = JSON.parse(packedText);

  const packedFiles = readdirSync(installed, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(installed.length + 1));

  const expectedFiles = [
    ...MANIFEST_FILES,
    ...readdirSync("src", { recursive: true })
      .filter((name) => name.endsWith(".ts"))
      .flatMap((name) => [toDist(`./src/${name}`, ".js"), toDist(`./src/${name}`, ".d.ts")])
      .map((path) => path.slice(2)),
  ];

  const entryFiles = Object.values(packed.exports ?? {}).flatMap(Object.values);

  const subpaths = await Promise.all(
    Object.keys(workspace.exports).map(async (key) => {
      const specifier = `${workspace.name}${key.slice(1)}`;

      return { specifier, names: await exportedNames(specifier) };
    }),
  );

  const browserProblems = await Promise.all(
    Object.values(packed.exports ?? {}).map((entry) =>
      browserBundleProblems(installed, entry.default),
    ),
  );

  const problems = [
    ...packedFiles
      .filter((file) => !expectedFiles.includes(file))
      .map((file) => `unexpected file in tarball: ${file}`),
    ...expectedFiles
      .filter((file) => !packedFiles.includes(file))
      .map((file) => `missing file in tarball: ${file}`),
    ...Object.entries(workspace.exports).flatMap(([key, entry]) => contractProblems(key, entry)),
    ...(isDeepStrictEqual(packed.exports, workspace.exports)
      ? []
      : ["packed exports do not match the repo exports"]),
    ...entryFiles
      .filter((file) => !existsSync(join(installed, file)))
      .map((file) => `export entry points to a missing file: ${file}`),
    ...DEPENDENCY_FIELDS.filter((field) => field in packed).map(
      (field) => `packed package.json has ${field}`,
    ),
    ...(packedText.includes("workspace:") ? ['packed package.json has a "workspace:" string'] : []),
    ...subpaths
      .filter(({ names }) => names.length === 0)
      .map(({ specifier }) => `import("${specifier}") exports nothing`),
    ...browserProblems.flat(),
  ];

  for (const { specifier, names } of subpaths) console.log(`${specifier}: ${names.join(", ")}`);
  for (const problem of problems) console.log(problem);

  console.log(`${packedFiles.length} files in tarball, ${problems.length} problems`);
  process.exitCode = problems.length > 0 ? 1 : 0;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
