import {
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ignoredHtmlDirectories = new Set([
  ".git",
  ".agents",
  "css",
  "dist",
  "docs",
  "gallery-sources",
  "images",
  "js",
  "node_modules",
  "scripts",
  "sites-preview",
  "tests",
]);

function requireText(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function validateManifest(manifest, directoryName) {
  if (!manifest || typeof manifest !== "object") throw new Error("Gallery manifest must be an object");
  if (!safeId.test(manifest.id ?? "")) throw new Error("Gallery id must use lowercase letters, numbers and hyphens");
  if (manifest.id !== directoryName) throw new Error(`Gallery id ${manifest.id} must match its directory name`);
  if (!manifest.pages || typeof manifest.pages !== "object") throw new Error(`${manifest.id}.pages must be an object`);
  requireText(manifest.eyebrow?.pl, `${manifest.id}.eyebrow.pl`);
  requireText(manifest.eyebrow?.en, `${manifest.id}.eyebrow.en`);
  if (!Array.isArray(manifest.photos)) throw new Error(`${manifest.id}.photos must be an array`);

  const photoIds = new Set();
  for (const [index, photo] of manifest.photos.entries()) {
    const label = `${manifest.id}.photos[${index}]`;
    if (!safeId.test(photo.id ?? "")) throw new Error(`${label}.id must use lowercase letters, numbers and hyphens`);
    if (photoIds.has(photo.id)) throw new Error(`${label}.id must be unique`);
    photoIds.add(photo.id);
    requireText(photo.source, `${label}.source`);
    if (basename(photo.source) !== photo.source) {
      throw new Error(`${label}.source must be a file name without directories`);
    }
    requireText(photo.alt?.pl, `${label}.alt.pl`);
    requireText(photo.alt?.en, `${label}.alt.en`);
    requireText(photo.credit, `${label}.credit`);
    if (photo.caption !== undefined) {
      requireText(photo.caption?.pl, `${label}.caption.pl`);
      requireText(photo.caption?.en, `${label}.caption.en`);
    }
  }
}

function pathIsInside(parent, target) {
  const pathFromParent = relative(parent, target);
  return pathFromParent !== ""
    && pathFromParent !== ".."
    && !pathFromParent.startsWith(`..${sep}`)
    && !isAbsolute(pathFromParent);
}

function assertInside(parent, target, message) {
  if (!pathIsInside(parent, target)) throw new Error(message);
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

function assertPathHasNoSymlinks(parent, target, message) {
  assertInside(parent, target, message);
  let current = parent;
  for (const component of relative(parent, target).split(sep).filter(Boolean)) {
    current = resolve(current, component);
    if (entryExists(current) && lstatSync(current).isSymbolicLink()) {
      throw new Error(`${message}: ${current}`);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function photoCount(count, language) {
  if (language === "en") return `${count} ${count === 1 ? "photo" : "photos"}`;
  if (count === 1) return "1 zdjęcie";
  const tens = count % 100;
  const ones = count % 10;
  return `${count} ${ones >= 2 && ones <= 4 && !(tens >= 12 && tens <= 14) ? "zdjęcia" : "zdjęć"}`;
}

function webPath(fromPage, target) {
  return relative(dirname(fromPage), target).split(sep).join("/");
}

function renderGallery({ manifest, language, pagePath, processed }) {
  if (processed.length === 0) return "";

  const polish = language === "pl";
  const closeLabel = polish ? "Zamknij galerię" : "Close gallery";
  const previousLabel = polish ? "Poprzednie zdjęcie" : "Previous photo";
  const nextLabel = polish ? "Następne zdjęcie" : "Next photo";
  const galleryTitle = polish ? "Galeria zdjęć" : "Photo gallery";
  const countLabel = photoCount(processed.length, language);
  const openLabel = polish
    ? `Otwórz galerię zdjęć: ${countLabel}`
    : `Open photo gallery: ${countLabel}`;
  const actionLabel = polish ? "Zobacz galerię" : "View gallery";
  const itemAttributes = ({ photo, full }) => {
    const caption = photo.caption?.[language];
    const fullPath = escapeHtml(webPath(pagePath, full.path));
    const alt = escapeHtml(photo.alt[language]);
    const captionText = escapeHtml([caption, photo.credit].filter(Boolean).join(" · "));
    return `href="${fullPath}" data-gallery-item data-gallery-alt="${alt}" data-gallery-caption="${captionText}"`;
  };
  const cover = processed[0];
  const coverThumbnailPath = escapeHtml(webPath(pagePath, cover.thumbnail.path));
  const hiddenItems = processed.slice(1).map((item) => (
    `<a ${itemAttributes(item)} hidden></a>`
  )).join("\n          ");

  return `
        <section class="meeting-gallery" data-meeting-gallery="${escapeHtml(manifest.id)}" aria-labelledby="gallery-${escapeHtml(manifest.id)}-title">
          <a class="meeting-gallery__teaser" ${itemAttributes(cover)} aria-label="${escapeHtml(openLabel)}">
            <span class="meeting-gallery__thumbnail">
              <img src="${coverThumbnailPath}" width="${cover.thumbnail.width}" height="${cover.thumbnail.height}" loading="lazy" decoding="async" alt="${escapeHtml(cover.photo.alt[language])}">
            </span>
            <span class="meeting-gallery__summary">
              <p class="eyebrow">${escapeHtml(manifest.eyebrow[language])}</p>
              <h3 id="gallery-${escapeHtml(manifest.id)}-title">${galleryTitle}</h3>
              <span class="meeting-gallery__count">${countLabel}</span>
              <strong class="meeting-gallery__action">${actionLabel} <span aria-hidden="true">→</span></strong>
            </span>
          </a>
          ${hiddenItems}
          <dialog class="gallery-lightbox" data-gallery-dialog aria-labelledby="gallery-${escapeHtml(manifest.id)}-title">
            <div class="gallery-lightbox__surface">
              <button class="gallery-lightbox__close" type="button" data-gallery-close aria-label="${closeLabel}">×</button>
              <figure>
                <img data-gallery-image alt="">
                <figcaption data-gallery-caption></figcaption>
              </figure>
              <div class="gallery-lightbox__controls">
                <button type="button" data-gallery-previous aria-label="${previousLabel}"><span aria-hidden="true">←</span></button>
                <p data-gallery-status aria-live="polite"></p>
                <button type="button" data-gallery-next aria-label="${nextLabel}"><span aria-hidden="true">→</span></button>
              </div>
            </div>
          </dialog>
        </section>`;
}

function galleryMarkers(id) {
  return {
    start: `<!-- gallery:${id}:start -->`,
    end: `<!-- gallery:${id}:end -->`,
  };
}

function validateGalleryMarkers(html, id, pagePath) {
  const { start, end } = galleryMarkers(id);
  const starts = html.split(start).length - 1;
  const ends = html.split(end).length - 1;
  if (starts !== 1 || ends !== 1 || html.indexOf(end) < html.indexOf(start)) {
    throw new Error(`${pagePath} is missing the ${id} gallery markers or contains duplicates`);
  }
}

function replaceGallery(html, id, markup) {
  const { start, end } = galleryMarkers(id);
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  const contentStart = startIndex + start.length;
  return `${html.slice(0, contentStart)}${markup}${html.slice(endIndex)}`;
}

function findPublicHtml(root) {
  const pages = [];
  const visit = (directory, topLevel = false) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (topLevel && ignoredHtmlDirectories.has(entry.name)) continue;
        visit(path);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".html") {
        pages.push(path);
      }
    }
  };
  visit(root, true);
  return pages;
}

function getPageState(pageStates, pagePath) {
  if (!pageStates.has(pagePath)) {
    const original = readFileSync(pagePath, "utf8");
    pageStates.set(pagePath, { original, html: original });
  }
  return pageStates.get(pagePath);
}

function collectBuildPlan(root) {
  const canonicalRoot = realpathSync(root);
  const sourceRoot = resolve(root, "gallery-sources");
  const canonicalSourceRoot = existsSync(sourceRoot) ? realpathSync(sourceRoot) : null;
  if (canonicalSourceRoot) {
    assertInside(
      canonicalRoot,
      canonicalSourceRoot,
      "Gallery sources directory must stay inside the project root",
    );
  }
  const directories = existsSync(sourceRoot)
    ? readdirSync(sourceRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
    : [];
  const galleries = [];
  const pageStates = new Map();
  const syncPaths = new Set();
  const configuredPlacements = new Set();

  for (const directory of directories) {
    const galleryDirectory = resolve(sourceRoot, directory.name);
    const canonicalGalleryDirectory = realpathSync(galleryDirectory);
    assertInside(
      canonicalSourceRoot,
      canonicalGalleryDirectory,
      `${directory.name} gallery directory must stay inside the gallery sources directory`,
    );
    const manifestPath = resolve(galleryDirectory, "gallery.json");
    if (!existsSync(manifestPath)) continue;
    if (!statSync(manifestPath).isFile()) throw new Error(`Gallery manifest must be a regular file: ${manifestPath}`);
    assertInside(
      canonicalGalleryDirectory,
      realpathSync(manifestPath),
      `${directory.name} manifest must stay inside its gallery directory`,
    );
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    validateManifest(manifest, directory.name);

    const pagePlans = [];
    for (const language of ["pl", "en"]) {
      const configuredPage = requireText(manifest.pages[language], `${manifest.id}.pages.${language}`);
      if (extname(configuredPage).toLowerCase() !== ".html") {
        throw new Error(`${manifest.id}.pages.${language} must point to an HTML file`);
      }
      const pagePath = resolve(root, configuredPage);
      assertInside(root, pagePath, `${manifest.id}.pages.${language} must stay inside the project root`);
      if (!existsSync(pagePath) || !statSync(pagePath).isFile()) {
        throw new Error(`Missing gallery target page: ${configuredPage}`);
      }
      assertInside(
        canonicalRoot,
        realpathSync(pagePath),
        `${manifest.id}.pages.${language} must stay inside the project root`,
      );
      const state = getPageState(pageStates, pagePath);
      validateGalleryMarkers(state.original, manifest.id, configuredPage);
      pagePlans.push({ language, pagePath });
      syncPaths.add(pagePath);
      configuredPlacements.add(`${manifest.id}\0${pagePath}`);
    }

    const originalsDirectory = resolve(galleryDirectory, "originals");
    const canonicalOriginals = manifest.photos.length > 0 && existsSync(originalsDirectory)
      ? realpathSync(originalsDirectory)
      : null;
    if (canonicalOriginals) {
      assertInside(
        canonicalGalleryDirectory,
        canonicalOriginals,
        `${manifest.id} originals directory must stay inside its gallery directory`,
      );
    }
    for (const photo of manifest.photos) {
      const source = resolve(originalsDirectory, photo.source);
      if (!canonicalOriginals || !existsSync(source) || !statSync(source).isFile()) {
        throw new Error(`Missing gallery source image: ${source}`);
      }
      assertInside(
        canonicalOriginals,
        realpathSync(source),
        `${manifest.id}.${photo.id}.source must stay inside the gallery originals directory`,
      );
    }

    galleries.push({ galleryDirectory, manifest, pagePlans });
  }

  for (const pagePath of findPublicHtml(root)) {
    getPageState(pageStates, pagePath);
    const relativePage = relative(root, pagePath);
    if (dirname(relativePage) === "." || relativePage === `en${sep}index.html`) {
      syncPaths.add(pagePath);
    }
  }
  return { configuredPlacements, galleries, pageStates, syncPaths };
}

async function processPhotos({ root, stagingMeetings, galleryDirectory, manifest }) {
  if (manifest.photos.length === 0) return [];
  const sharp = (await import("sharp")).default;
  const stagingDirectory = resolve(stagingMeetings, manifest.id);
  const finalDirectory = resolve(root, "images/meetings", manifest.id);
  mkdirSync(stagingDirectory, { recursive: true });
  const processed = [];

  for (const [index, photo] of manifest.photos.entries()) {
    const source = resolve(galleryDirectory, "originals", photo.source);
    const stagedFullPath = resolve(stagingDirectory, `${photo.id}-large.webp`);
    const full = await sharp(source)
      .autoOrient()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toFile(stagedFullPath);
    let thumbnail = null;
    if (index === 0) {
      const stagedThumbnailPath = resolve(stagingDirectory, `${photo.id}-thumb.webp`);
      const thumbnailImage = await sharp(source)
        .autoOrient()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78, effort: 4 })
        .toFile(stagedThumbnailPath);
      thumbnail = {
        path: resolve(finalDirectory, `${photo.id}-thumb.webp`),
        width: thumbnailImage.width,
        height: thumbnailImage.height,
      };
    }

    processed.push({
      photo,
      full: {
        path: resolve(finalDirectory, `${photo.id}-large.webp`),
        width: full.width,
        height: full.height,
      },
      thumbnail,
    });
  }

  return processed;
}

function removeInactiveGalleryMarkup(pageStates, configuredPlacements, syncPaths) {
  const markerPattern = /<!-- gallery:([a-z0-9]+(?:-[a-z0-9]+)*):start -->([\s\S]*?)<!-- gallery:\1:end -->/g;
  for (const [pagePath, state] of pageStates) {
    const cleaned = state.html.replace(markerPattern, (match, id, content) => {
      if (configuredPlacements.has(`${id}\0${pagePath}`) || content === "") return match;
      return `<!-- gallery:${id}:start --><!-- gallery:${id}:end -->`;
    });
    if (cleaned !== state.html) syncPaths.add(pagePath);
    state.html = cleaned;
  }
}

function preparePreviewTransaction({ root, syncPaths, backupRoot }) {
  const previewRoot = resolve(root, "sites-preview/public/spmpz");
  if (!existsSync(previewRoot)) return null;
  assertPathHasNoSymlinks(root, previewRoot, "Preview target must not contain symbolic links");

  const files = [...syncPaths].map((source) => ({
    source,
    target: resolve(previewRoot, relative(root, source)),
  }));
  for (const relativePath of [
    "css/modern.css",
    "js/modern-site.mjs",
    "js/gallery-lightbox.mjs",
    "js/partner-map-data.mjs",
    "js/partner-map.mjs",
  ]) {
    const source = resolve(root, relativePath);
    if (existsSync(source)) files.push({ source, target: resolve(previewRoot, relativePath) });
  }

  const snapshots = files.map(({ source, target }, index) => {
    assertPathHasNoSymlinks(previewRoot, target, "Preview target must not contain symbolic links");
    if (!existsSync(target)) return { source, target, existed: false };
    if (!lstatSync(target).isFile()) throw new Error(`Preview target must be a regular file: ${target}`);
    const backup = resolve(backupRoot, "preview-files", String(index));
    mkdirSync(dirname(backup), { recursive: true });
    copyFileSync(target, backup);
    return { source, target, existed: true, backup };
  });

  const meetings = resolve(root, "images/meetings");
  const previewMeetings = resolve(previewRoot, "images/meetings");
  const backupMeetings = resolve(backupRoot, "preview-meetings");
  assertPathHasNoSymlinks(previewRoot, previewMeetings, "Preview target must not contain symbolic links");
  if (existsSync(previewMeetings)) {
    if (!lstatSync(previewMeetings).isDirectory()) {
      throw new Error(`Preview meetings target must be a directory: ${previewMeetings}`);
    }
    cpSync(previewMeetings, backupMeetings, { recursive: true });
  }

  return {
    meetings,
    previewMeetings,
    backupMeetings,
    hadMeetings: existsSync(previewMeetings),
    snapshots,
  };
}

function applyPreviewTransaction(plan) {
  if (!plan) return;
  rmSync(plan.previewMeetings, { recursive: true, force: true });
  if (existsSync(plan.meetings)) cpSync(plan.meetings, plan.previewMeetings, { recursive: true });
  for (const { source, target } of plan.snapshots) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}

function restorePreviewTransaction(plan) {
  if (!plan) return;
  rmSync(plan.previewMeetings, { recursive: true, force: true });
  if (plan.hadMeetings) cpSync(plan.backupMeetings, plan.previewMeetings, { recursive: true });
  for (const snapshot of plan.snapshots) {
    if (snapshot.existed) {
      mkdirSync(dirname(snapshot.target), { recursive: true });
      copyFileSync(snapshot.backup, snapshot.target);
    } else {
      rmSync(snapshot.target, { force: true });
    }
  }
}

function commitBuild({ root, stagingMeetings, pageStates, syncPaths }) {
  const meetings = resolve(root, "images/meetings");
  const backupRoot = mkdtempSync(resolve(tmpdir(), "spmpz-gallery-backup-"));
  const backupMeetings = resolve(backupRoot, "meetings");
  const changedPages = [...pageStates.entries()].filter(([, state]) => state.html !== state.original);
  const stagedPages = [];
  let previewPlan = null;

  try {
    for (const [index, [pagePath, state]] of changedPages.entries()) {
      const stagedPath = resolve(dirname(pagePath), `.spmpz-gallery-${process.pid}-${index}.tmp`);
      writeFileSync(stagedPath, state.html);
      stagedPages.push({ pagePath, stagedPath, original: state.original });
    }

    if (existsSync(meetings)) cpSync(meetings, backupMeetings, { recursive: true });
    previewPlan = preparePreviewTransaction({ root, syncPaths, backupRoot });
    rmSync(meetings, { recursive: true, force: true });
    if (existsSync(stagingMeetings)) cpSync(stagingMeetings, meetings, { recursive: true });
    for (const { pagePath, stagedPath } of stagedPages) renameSync(stagedPath, pagePath);
    applyPreviewTransaction(previewPlan);
  } catch (error) {
    rmSync(meetings, { recursive: true, force: true });
    if (existsSync(backupMeetings)) cpSync(backupMeetings, meetings, { recursive: true });
    for (const { pagePath, original } of stagedPages) writeFileSync(pagePath, original);
    restorePreviewTransaction(previewPlan);
    throw error;
  } finally {
    for (const { stagedPath } of stagedPages) rmSync(stagedPath, { force: true });
    rmSync(backupRoot, { recursive: true, force: true });
  }
}

export async function buildGalleries({ root = projectRoot } = {}) {
  const resolvedRoot = resolve(root);
  const { configuredPlacements, galleries, pageStates, syncPaths } = collectBuildPlan(resolvedRoot);
  const stagingRoot = mkdtempSync(resolve(tmpdir(), "spmpz-gallery-build-"));
  const stagingMeetings = resolve(stagingRoot, "meetings");
  let photoTotal = 0;

  try {
    for (const gallery of galleries) {
      const processed = await processPhotos({
        root: resolvedRoot,
        stagingMeetings,
        galleryDirectory: gallery.galleryDirectory,
        manifest: gallery.manifest,
      });
      for (const { language, pagePath } of gallery.pagePlans) {
        const state = pageStates.get(pagePath);
        const markup = renderGallery({ manifest: gallery.manifest, language, pagePath, processed });
        state.html = replaceGallery(state.html, gallery.manifest.id, markup);
      }
      photoTotal += gallery.manifest.photos.length;
    }

    removeInactiveGalleryMarkup(pageStates, configuredPlacements, syncPaths);
    commitBuild({ root: resolvedRoot, stagingMeetings, pageStates, syncPaths });
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }

  return {
    galleries: galleries.length,
    photos: photoTotal,
    pages: galleries.reduce((total, gallery) => total + gallery.pagePlans.length, 0),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildGalleries();
  console.log(`Built ${result.galleries} galleries (${result.photos} photos) in ${result.pages} pages.`);
}
