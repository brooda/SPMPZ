import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGalleries } from "./build-galleries.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalPages = [
  "index.html",
  "english.html",
  "about_pl.html",
  "about_en.html",
  "partners_pl.html",
  "partners_en.html",
  "projects_pl.html",
  "projects_en.html",
  "projects_history_pl.html",
  "projects_history_en.html",
  "migration_project_pl.html",
  "migration_project_en.html",
  "weaving_pl.html",
  "weaving.html",
  "contact_pl.html",
  "contact_en.html",
  "index_en.html",
  "index_enn.html",
  "en/index.html",
];

for (const page of canonicalPages) {
  if (!existsSync(resolve(root, page))) throw new Error(`Missing canonical page: ${page}`);
}

await buildGalleries({ root });
