import test from "node:test";
import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const builderUrl = pathToFileURL(resolve(projectRoot, "scripts/build-galleries.mjs")).href;
const fixtureImage = resolve(projectRoot, "images/site/hero-zamosc.jpg");

function createWorkspace(manifest, pages = ["index.html", "english.html"]) {
  const root = mkdtempSync(resolve(tmpdir(), "spmpz-gallery-"));
  const source = resolve(root, "gallery-sources/demo/originals");
  mkdirSync(source, { recursive: true });
  cpSync(fixtureImage, resolve(source, "photo.jpg"));
  writeFileSync(
    resolve(root, "gallery-sources/demo/gallery.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  for (const page of pages) {
    writeFileSync(
      resolve(root, page),
      `<!doctype html><main>before<!-- gallery:demo:start --><p>stale</p><!-- gallery:demo:end -->after</main>`,
    );
  }

  return root;
}

function manifest(photos) {
  return {
    id: "demo",
    eyebrow: {
      pl: "Demo w obiektywie",
      en: "Demo in pictures",
    },
    pages: {
      pl: "index.html",
      en: "english.html",
    },
    photos,
  };
}

test("builds optimized bilingual gallery markup from local source photos", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "opening",
      source: "photo.jpg",
      alt: {
        pl: "Uczestnicy spotkania & prezentacja",
        en: "Meeting participants & presentation",
      },
      caption: {
        pl: "Otwarcie <Twin Green>",
        en: "Opening <Twin Green>",
      },
      credit: "Archiwum SPMPZ",
    },
  ]));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "sites-preview/public/spmpz"), { recursive: true });
  writeFileSync(resolve(root, "sites-preview/public/spmpz/index.html"), "stale Polish preview");
  writeFileSync(resolve(root, "sites-preview/public/spmpz/english.html"), "stale English preview");

  const { buildGalleries } = await import(builderUrl);
  const result = await buildGalleries({ root });

  assert.deepEqual(result, { galleries: 1, photos: 1, pages: 2 });

  const sharp = (await import("sharp")).default;
  const full = await sharp(resolve(root, "images/meetings/demo/opening-large.webp")).metadata();
  const thumbnail = await sharp(resolve(root, "images/meetings/demo/opening-thumb.webp")).metadata();
  assert.deepEqual([full.width, full.height], [1600, 1067]);
  assert.deepEqual([thumbnail.width, thumbnail.height], [640, 427]);
  assert.equal(full.exif, undefined, "Published image should not retain EXIF metadata");

  const polish = readFileSync(resolve(root, "index.html"), "utf8");
  assert.match(polish, /<section class="meeting-gallery"[^>]+aria-labelledby="gallery-demo-title"/);
  assert.match(polish, /<p class="eyebrow">Demo w obiektywie<\/p>/);
  assert.match(polish, /<h3 id="gallery-demo-title">Galeria zdjęć<\/h3>/);
  assert.match(polish, /href="images\/meetings\/demo\/opening-large\.webp"/);
  assert.match(polish, /src="images\/meetings\/demo\/opening-thumb\.webp"/);
  assert.match(polish, /width="640" height="427" loading="lazy" decoding="async"/);
  assert.match(polish, /alt="Uczestnicy spotkania &amp; prezentacja"/);
  assert.match(polish, /data-gallery-caption="Otwarcie &lt;Twin Green&gt; · Archiwum SPMPZ"/);
  assert.match(polish, /aria-label="Otwórz galerię zdjęć: 1 zdjęcie"/);
  assert.match(polish, /Zobacz galerię/);
  assert.match(polish, /<dialog class="gallery-lightbox" data-gallery-dialog/);
  assert.match(polish, /data-gallery-previous[^>]+aria-label="Poprzednie zdjęcie"/);
  assert.match(polish, /data-gallery-next[^>]+aria-label="Następne zdjęcie"/);
  assert.match(polish, /data-gallery-close[^>]+aria-label="Zamknij galerię"/);
  assert.doesNotMatch(polish, /data-gallery-image src=""/);
  assert.match(polish, /<!-- gallery:demo:start -->[\s\S]+<!-- gallery:demo:end -->/);

  const english = readFileSync(resolve(root, "english.html"), "utf8");
  assert.match(english, /<h3 id="gallery-demo-title">Photo gallery<\/h3>/);
  assert.match(english, /<p class="eyebrow">Demo in pictures<\/p>/);
  assert.match(english, /alt="Meeting participants &amp; presentation"/);
  assert.match(english, /data-gallery-caption="Opening &lt;Twin Green&gt; · Archiwum SPMPZ"/);
  assert.match(english, /View gallery/);
  assert.match(english, /data-gallery-close[^>]+aria-label="Close gallery"/);

  assert.equal(readFileSync(resolve(root, "sites-preview/public/spmpz/index.html"), "utf8"), polish);
  assert.equal(readFileSync(resolve(root, "sites-preview/public/spmpz/english.html"), "utf8"), english);
  assert.equal(existsSync(resolve(root, "sites-preview/public/spmpz/images/meetings/demo/opening-thumb.webp")), true);
  assert.equal(existsSync(resolve(root, "sites-preview/public/spmpz/images/meetings/demo/opening-large.webp")), true);
});

test("renders a compact teaser while keeping every photo available in the lightbox", async (t) => {
  const photos = ["opening", "presentation", "discussion"].map((id, index) => ({
    id,
    source: "photo.jpg",
    alt: {
      pl: `Zdjęcie ${index + 1}`,
      en: `Photo ${index + 1}`,
    },
    caption: {
      pl: `Podpis ${index + 1}`,
      en: `Caption ${index + 1}`,
    },
    credit: "Archiwum SPMPZ",
  }));
  const root = createWorkspace(manifest(photos));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { buildGalleries } = await import(builderUrl);
  await buildGalleries({ root });

  const polish = readFileSync(resolve(root, "index.html"), "utf8");
  const gallery = polish.match(/<section class="meeting-gallery"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(gallery, /class="meeting-gallery__teaser"/);
  assert.equal(gallery.match(/data-gallery-item/g)?.length, 3);
  assert.equal(gallery.match(/<img src=/g)?.length, 1);
  assert.match(gallery, /Zobacz galerię/);
  assert.match(gallery, /3 zdjęcia/);
  assert.match(gallery, /data-gallery-alt="Zdjęcie 2"/);
  assert.match(gallery, /data-gallery-caption="Podpis 2 · Archiwum SPMPZ"/);
  assert.equal(existsSync(resolve(root, "images/meetings/demo/opening-thumb.webp")), true);
  assert.equal(existsSync(resolve(root, "images/meetings/demo/presentation-thumb.webp")), false);
  assert.equal(existsSync(resolve(root, "images/meetings/demo/discussion-thumb.webp")), false);
});

test("an empty photo list leaves no visible gallery section", async (t) => {
  const root = createWorkspace(manifest([]));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "images/meetings/demo"), { recursive: true });
  writeFileSync(resolve(root, "images/meetings/demo/obsolete.webp"), "old image");

  const { buildGalleries } = await import(builderUrl);
  await buildGalleries({ root });

  for (const page of ["index.html", "english.html"]) {
    const html = readFileSync(resolve(root, page), "utf8");
    assert.match(html, /before<!-- gallery:demo:start -->\s*<!-- gallery:demo:end -->after/);
    assert.doesNotMatch(html, /meeting-gallery|stale/);
  }
  assert.equal(existsSync(resolve(root, "images/meetings/demo/obsolete.webp")), false);
});

test("rejects source paths that could escape the gallery folder", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "unsafe",
      source: "../photo.jpg",
      alt: { pl: "Opis", en: "Description" },
      credit: "Archiwum SPMPZ",
    },
  ]));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(
    buildGalleries({ root }),
    /must be a file name without directories/,
  );
});

test("rejects target pages outside the project without changing them", async (t) => {
  const root = createWorkspace(manifest([]));
  const outside = `${root}-outside.html`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { force: true });
  });
  const outsideMarkup = "outside<!-- gallery:demo:start --><p>private</p><!-- gallery:demo:end -->";
  writeFileSync(outside, outsideMarkup);
  const unsafe = manifest([]);
  unsafe.pages.pl = `../${outside.split("/").at(-1)}`;
  writeFileSync(resolve(root, "gallery-sources/demo/gallery.json"), `${JSON.stringify(unsafe, null, 2)}\n`);

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(buildGalleries({ root }), /must stay inside the project root/);
  assert.equal(readFileSync(outside, "utf8"), outsideMarkup);
});

test("rejects a target-page symlink that escapes the project", async (t) => {
  const root = createWorkspace(manifest([]));
  const outside = `${root}-outside.html`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { force: true });
  });
  const outsideMarkup = "outside<!-- gallery:demo:start --><p>private</p><!-- gallery:demo:end -->";
  writeFileSync(outside, outsideMarkup);
  symlinkSync(outside, resolve(root, "linked.html"));
  const unsafe = manifest([]);
  unsafe.pages.pl = "linked.html";
  writeFileSync(resolve(root, "gallery-sources/demo/gallery.json"), `${JSON.stringify(unsafe, null, 2)}\n`);

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(buildGalleries({ root }), /must stay inside the project root/);
  assert.equal(readFileSync(outside, "utf8"), outsideMarkup);
});

test("rejects a source-image symlink that escapes its originals directory", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "opening",
      source: "photo.jpg",
      alt: { pl: "Opis", en: "Description" },
      credit: "Archiwum SPMPZ",
    },
  ]));
  const outside = `${root}-outside.jpg`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { force: true });
  });
  cpSync(fixtureImage, outside);
  rmSync(resolve(root, "gallery-sources/demo/originals/photo.jpg"));
  symlinkSync(outside, resolve(root, "gallery-sources/demo/originals/photo.jpg"));

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(
    buildGalleries({ root }),
    /must stay inside the gallery originals directory/,
  );
});

test("rejects an originals-directory symlink that escapes the gallery", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "opening",
      source: "photo.jpg",
      alt: { pl: "Opis", en: "Description" },
      credit: "Archiwum SPMPZ",
    },
  ]));
  const outside = `${root}-outside`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });
  mkdirSync(outside);
  cpSync(fixtureImage, resolve(outside, "photo.jpg"));
  rmSync(resolve(root, "gallery-sources/demo/originals"), { recursive: true });
  symlinkSync(outside, resolve(root, "gallery-sources/demo/originals"), "dir");

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(
    buildGalleries({ root }),
    /originals directory must stay inside its gallery directory/,
  );
});

test("rejects a gallery-sources symlink that escapes the project", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "opening",
      source: "photo.jpg",
      alt: { pl: "Opis", en: "Description" },
      credit: "Archiwum SPMPZ",
    },
  ]));
  const outside = `${root}-sources`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });
  cpSync(resolve(root, "gallery-sources"), outside, { recursive: true });
  rmSync(resolve(root, "gallery-sources"), { recursive: true });
  symlinkSync(outside, resolve(root, "gallery-sources"), "dir");

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(
    buildGalleries({ root }),
    /Gallery sources directory must stay inside the project root/,
  );
});

test("a preflight failure leaves existing pages and images unchanged", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "opening",
      source: "photo.jpg",
      alt: { pl: "Opis", en: "Description" },
      credit: "Archiwum SPMPZ",
    },
  ]));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(resolve(root, "english.html"), "page without a gallery marker");
  mkdirSync(resolve(root, "images/meetings/demo"), { recursive: true });
  writeFileSync(resolve(root, "images/meetings/demo/existing.webp"), "existing image");
  const polishBefore = readFileSync(resolve(root, "index.html"), "utf8");

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(buildGalleries({ root }), /missing the demo gallery markers/);
  assert.equal(readFileSync(resolve(root, "index.html"), "utf8"), polishBefore);
  assert.equal(readFileSync(resolve(root, "images/meetings/demo/existing.webp"), "utf8"), "existing image");
});

test("removes generated assets and markup for galleries no longer configured", async (t) => {
  const root = createWorkspace(manifest([]));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const page of ["index.html", "english.html"]) {
    const path = resolve(root, page);
    writeFileSync(
      path,
      readFileSync(path, "utf8").replace(
        "after",
        "after<!-- gallery:retired:start --><section>stale gallery</section><!-- gallery:retired:end -->",
      ),
    );
  }
  mkdirSync(resolve(root, "images/meetings/retired"), { recursive: true });
  writeFileSync(resolve(root, "images/meetings/retired/old.webp"), "old image");

  const { buildGalleries } = await import(builderUrl);
  await buildGalleries({ root });

  assert.equal(existsSync(resolve(root, "images/meetings/retired")), false);
  for (const page of ["index.html", "english.html"]) {
    const html = readFileSync(resolve(root, page), "utf8");
    assert.doesNotMatch(html, /stale gallery/);
    assert.match(html, /<!-- gallery:retired:start -->\s*<!-- gallery:retired:end -->/);
  }
});

test("clears an active gallery from pages no longer listed in its manifest", async (t) => {
  const root = createWorkspace(manifest([]));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(
    resolve(root, "old.html"),
    "old<!-- gallery:demo:start --><section>moved gallery</section><!-- gallery:demo:end -->",
  );

  const { buildGalleries } = await import(builderUrl);
  await buildGalleries({ root });

  const oldPage = readFileSync(resolve(root, "old.html"), "utf8");
  assert.doesNotMatch(oldPage, /moved gallery/);
  assert.match(oldPage, /<!-- gallery:demo:start -->\s*<!-- gallery:demo:end -->/);
});

test("a preview sync failure rolls back canonical pages and images", async (t) => {
  const root = createWorkspace(manifest([
    {
      id: "opening",
      source: "photo.jpg",
      alt: { pl: "Opis", en: "Description" },
      credit: "Archiwum SPMPZ",
    },
  ]));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "images/meetings/demo"), { recursive: true });
  writeFileSync(resolve(root, "images/meetings/demo/existing.webp"), "existing image");
  mkdirSync(resolve(root, "sites-preview/public/spmpz/index.html"), { recursive: true });
  const polishBefore = readFileSync(resolve(root, "index.html"), "utf8");
  const englishBefore = readFileSync(resolve(root, "english.html"), "utf8");

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(buildGalleries({ root }));

  assert.equal(readFileSync(resolve(root, "index.html"), "utf8"), polishBefore);
  assert.equal(readFileSync(resolve(root, "english.html"), "utf8"), englishBefore);
  assert.equal(readFileSync(resolve(root, "images/meetings/demo/existing.webp"), "utf8"), "existing image");
  assert.equal(existsSync(resolve(root, "images/meetings/demo/opening-thumb.webp")), false);
  assert.equal(statSync(resolve(root, "sites-preview/public/spmpz/index.html")).isDirectory(), true);
});

test("preview sync rejects a symlinked target without changing external data", async (t) => {
  const root = createWorkspace(manifest([]));
  const external = `${root}-outside.html`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(external, { force: true });
  });
  mkdirSync(resolve(root, "sites-preview/public/spmpz"), { recursive: true });
  writeFileSync(external, "external data");
  symlinkSync(external, resolve(root, "sites-preview/public/spmpz/index.html"));

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(
    buildGalleries({ root }),
    /Preview target must not contain symbolic links/,
  );
  assert.equal(readFileSync(external, "utf8"), "external data");
});

test("preview sync rejects a dangling target symlink without creating its destination", async (t) => {
  const root = createWorkspace(manifest([]));
  const external = `${root}-missing.html`;
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(external, { force: true });
  });
  mkdirSync(resolve(root, "sites-preview/public/spmpz"), { recursive: true });
  symlinkSync(external, resolve(root, "sites-preview/public/spmpz/index.html"));

  const { buildGalleries } = await import(builderUrl);
  await assert.rejects(
    buildGalleries({ root }),
    /Preview target must not contain symbolic links/,
  );
  assert.equal(existsSync(external), false);
});

test("regenerating shared pages is idempotent and synchronizes the preview", (t) => {
  const root = mkdtempSync(resolve(tmpdir(), "spmpz-render-pages-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, "scripts"), { recursive: true });
  mkdirSync(resolve(root, "js"), { recursive: true });
  mkdirSync(resolve(root, "sites-preview/public/spmpz"), { recursive: true });
  cpSync(resolve(projectRoot, "scripts/render-pages.mjs"), resolve(root, "scripts/render-pages.mjs"));
  cpSync(resolve(projectRoot, "scripts/build-galleries.mjs"), resolve(root, "scripts/build-galleries.mjs"));
  cpSync(resolve(projectRoot, "js/partner-map-data.mjs"), resolve(root, "js/partner-map-data.mjs"));
  const generatedPages = [
    "about_pl.html", "about_en.html", "partners_pl.html", "partners_en.html",
    "projects_pl.html", "projects_en.html", "projects_history_pl.html", "projects_history_en.html",
    "migration_project_pl.html", "migration_project_en.html", "weaving_pl.html", "weaving.html",
    "contact_pl.html", "contact_en.html", "index_en.html", "index_enn.html", "en/index.html",
  ];
  writeFileSync(resolve(root, "index.html"), "hand-authored Polish homepage");
  writeFileSync(resolve(root, "english.html"), "hand-authored English homepage");
  for (const page of generatedPages) {
    const target = resolve(root, page);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(projectRoot, page), target);
  }
  for (const page of ["index.html", "english.html", ...generatedPages]) {
    const target = resolve(root, "sites-preview/public/spmpz", page);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, "stale preview");
  }
  mkdirSync(resolve(root, "images/meetings/retired"), { recursive: true });
  writeFileSync(resolve(root, "images/meetings/retired/old.webp"), "old image");

  const run = spawnSync(process.execPath, ["scripts/render-pages.mjs"], {
    cwd: root,
    encoding: "utf8",
  });

  assert.equal(run.status, 0, run.stderr);
  assert.equal(readFileSync(resolve(root, "index.html"), "utf8"), "hand-authored Polish homepage");
  assert.equal(readFileSync(resolve(root, "english.html"), "utf8"), "hand-authored English homepage");
  for (const page of generatedPages) {
    assert.equal(
      readFileSync(resolve(root, page), "utf8"),
      readFileSync(resolve(projectRoot, page), "utf8"),
      `${page} changed when regenerated`,
    );
  }
  for (const page of ["index.html", "english.html", ...generatedPages]) {
    assert.equal(
      readFileSync(resolve(root, "sites-preview/public/spmpz", page), "utf8"),
      readFileSync(resolve(root, page), "utf8"),
      `${page} was not synchronized to the preview`,
    );
  }
  assert.equal(existsSync(resolve(root, "images/meetings/retired")), false);
});
