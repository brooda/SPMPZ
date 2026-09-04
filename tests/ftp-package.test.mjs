import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { packageSite } from "../scripts/package-ftp.mjs";

function add(root, path, contents = path) {
  const target = resolve(root, path);
  mkdirSync(resolve(target, ".."), { recursive: true });
  writeFileSync(target, contents);
}

test("FTP package contains the public site but excludes local gallery sources and development files", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "spmpz-ftp-"));
  const output = resolve(root, "dist/ftp");
  t.after(() => rmSync(root, { recursive: true, force: true }));

  for (const path of [
    "index.html",
    "english.html",
    "migration.pdf",
    ".htaccess",
    "css/modern.css",
    "js/modern-site.mjs",
    "images/meetings/demo/photo.webp",
    "en/index.html",
    "Final report/index.html",
    "report_22/report.pdf",
  ]) add(root, path);
  for (const path of [
    "gallery-sources/demo/originals/photo.jpg",
    "tests/example.test.mjs",
    "docs/notes.md",
    "node_modules/sharp/index.js",
    "scripts/build-galleries.mjs",
    "package.json",
  ]) add(root, path);

  add(root, "dist/ftp/obsolete.txt", "obsolete");
  const result = packageSite({ root, output });

  assert.equal(result.files, 10);
  for (const path of [
    "index.html",
    "english.html",
    "migration.pdf",
    ".htaccess",
    "css/modern.css",
    "js/modern-site.mjs",
    "images/meetings/demo/photo.webp",
    "en/index.html",
    "Final report/index.html",
    "report_22/report.pdf",
  ]) {
    assert.equal(existsSync(resolve(output, path)), true, `FTP package is missing ${path}`);
    assert.equal(readFileSync(resolve(output, path), "utf8"), path);
  }

  for (const path of [
    "obsolete.txt",
    "gallery-sources",
    "tests",
    "docs",
    "node_modules",
    "scripts",
    "package.json",
  ]) assert.equal(existsSync(resolve(output, path)), false, `FTP package leaked ${path}`);
});

test("FTP packaging refuses a dist symlink and preserves external data", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "spmpz-ftp-root-"));
  const external = mkdtempSync(resolve(tmpdir(), "spmpz-ftp-external-"));
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(external, { recursive: true, force: true });
  });
  add(root, "index.html", "homepage");
  add(external, "ftp/KEEP.txt", "must survive");
  symlinkSync(external, resolve(root, "dist"), "dir");

  assert.throws(
    () => packageSite({ root }),
    /FTP package path must not contain symbolic links/,
  );
  assert.equal(readFileSync(resolve(external, "ftp/KEEP.txt"), "utf8"), "must survive");
  assert.equal(existsSync(resolve(external, "ftp/index.html")), false);
});

test("FTP packaging rejects symlinked public sources before replacing the package", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "spmpz-ftp-root-"));
  const external = mkdtempSync(resolve(tmpdir(), "spmpz-ftp-source-"));
  const output = resolve(root, "dist/ftp");
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(external, { recursive: true, force: true });
  });

  add(root, "index.html", "homepage");
  add(root, "dist/ftp/KEEP.txt", "existing package");
  add(external, "private.txt", "must not be packaged");
  symlinkSync(external, resolve(root, "images"), "dir");

  assert.throws(
    () => packageSite({ root, output }),
    /Public source must not contain symbolic links/,
  );
  assert.equal(readFileSync(resolve(output, "KEEP.txt"), "utf8"), "existing package");
  assert.equal(existsSync(resolve(output, "images/private.txt")), false);
});

test("FTP packaging also rejects a dangling public source symlink", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "spmpz-ftp-root-"));
  const output = resolve(root, "dist/ftp");
  const missing = `${root}-missing-images`;
  t.after(() => rmSync(root, { recursive: true, force: true }));

  add(root, "index.html", "homepage");
  add(root, "dist/ftp/KEEP.txt", "existing package");
  symlinkSync(missing, resolve(root, "images"), "dir");

  assert.throws(
    () => packageSite({ root, output }),
    /Public source must not contain symbolic links/,
  );
  assert.equal(readFileSync(resolve(output, "KEEP.txt"), "utf8"), "existing package");
  assert.equal(existsSync(missing), false);
});
