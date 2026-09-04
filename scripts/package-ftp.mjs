import {
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectories = ["css", "js", "images", "en", "Final report", "report_22"];

function countFiles(directory) {
  if (!existsSync(directory)) return 0;
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
    const path = resolve(directory, entry.name);
    return total + (entry.isDirectory() ? countFiles(path) : 1);
  }, 0);
}

function isWithinOrEqual(parent, target) {
  const pathFromParent = relative(parent, target);
  return pathFromParent === ""
    || (pathFromParent !== ".."
      && !pathFromParent.startsWith(`..${sep}`)
      && !isAbsolute(pathFromParent));
}

function entryExists(path) {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function validateOutputPath(root, output) {
  const canonicalRoot = realpathSync(root);
  const pathFromRoot = relative(root, output);
  let current = root;

  for (const component of pathFromRoot.split(sep).filter(Boolean)) {
    current = resolve(current, component);
    if (!entryExists(current)) continue;
    if (lstatSync(current).isSymbolicLink()) {
      throw new Error(`FTP package path must not contain symbolic links: ${current}`);
    }
    if (!isWithinOrEqual(canonicalRoot, realpathSync(current))) {
      throw new Error("FTP package output must stay inside the project root");
    }
  }
}

function validatePublicSource(source) {
  const visit = (path) => {
    const entry = lstatSync(path);
    if (entry.isSymbolicLink()) {
      throw new Error(`Public source must not contain symbolic links: ${path}`);
    }
    if (!entry.isDirectory()) return;
    for (const child of readdirSync(path)) visit(resolve(path, child));
  };

  visit(source);
}

export function packageSite({ root = projectRoot, output = resolve(root, "dist/ftp") } = {}) {
  const resolvedRoot = resolve(root);
  const safeDist = resolve(resolvedRoot, "dist");
  const resolvedOutput = resolve(output);
  if (resolvedOutput !== safeDist && !resolvedOutput.startsWith(`${safeDist}${sep}`)) {
    throw new Error("FTP package output must stay inside the project dist directory");
  }
  validateOutputPath(resolvedRoot, resolvedOutput);

  const sourceDirectories = publicDirectories
    .map((directory) => resolve(resolvedRoot, directory))
    .filter((source) => entryExists(source));
  for (const source of sourceDirectories) validatePublicSource(source);

  rmSync(resolvedOutput, { recursive: true, force: true });
  mkdirSync(resolvedOutput, { recursive: true });

  for (const entry of readdirSync(resolvedRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const extension = extname(entry.name).toLowerCase();
    if (entry.name !== ".htaccess" && extension !== ".html" && extension !== ".pdf") continue;
    copyFileSync(resolve(resolvedRoot, entry.name), resolve(resolvedOutput, entry.name));
  }

  for (const source of sourceDirectories) {
    if (!statSync(source).isDirectory()) continue;
    const directory = relative(resolvedRoot, source);
    cpSync(source, resolve(resolvedOutput, directory), { recursive: true });
  }

  return { files: countFiles(resolvedOutput), output: resolvedOutput };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = packageSite();
  console.log(`FTP package ready: ${result.output} (${result.files} files).`);
}
