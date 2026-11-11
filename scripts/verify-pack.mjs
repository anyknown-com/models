import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const MANIFEST_FILES = ["CHANGELOG.md", "README.md", "package.json"];
const DEPENDENCY_FIELDS = ["dependencies", "peerDependencies", "optionalDependencies"];

const toDist = (path, extension) =>
  path.replace(/^\.\/src\//, "./dist/").replace(/\.ts$/, extension);

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
  const pack = execFileSync("pnpm", ["pack", "--pack-destination", scratch, "--json"], {
    encoding: "utf8",
  });

  mkdirSync(installed, { recursive: true });
  execFileSync("tar", ["-xzf", JSON.parse(pack).filename, "-C", installed, "--strip-components=1"]);

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

  const expectedExports = Object.fromEntries(
    Object.entries(workspace.exports).map(([key, path]) => [
      key,
      { types: toDist(path, ".d.ts"), default: toDist(path, ".js") },
    ]),
  );

  const entryFiles = Object.values(packed.exports ?? {}).flatMap(Object.values);

  const subpaths = await Promise.all(
    Object.keys(workspace.exports).map(async (key) => {
      const specifier = `${workspace.name}${key.slice(1)}`;

      return { specifier, names: await exportedNames(specifier) };
    }),
  );

  const problems = [
    ...packedFiles
      .filter((file) => !expectedFiles.includes(file))
      .map((file) => `unexpected file in tarball: ${file}`),
    ...expectedFiles
      .filter((file) => !packedFiles.includes(file))
      .map((file) => `missing file in tarball: ${file}`),
    ...(isDeepStrictEqual(packed.exports, expectedExports)
      ? []
      : ["packed exports do not match the workspace exports"]),
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
  ];

  for (const { specifier, names } of subpaths) console.log(`${specifier}: ${names.join(", ")}`);
  for (const problem of problems) console.log(problem);

  console.log(`${packedFiles.length} files in tarball, ${problems.length} problems`);
  process.exitCode = problems.length > 0 ? 1 : 0;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
