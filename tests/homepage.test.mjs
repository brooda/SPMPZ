import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const englishHtml = readFileSync(resolve(root, "english.html"), "utf8");
const cssPath = resolve(root, "css/modern.css");

const section = (document, id, nextId) => {
  const match = document.match(
    new RegExp(`<section[^>]+id=["']${id}["'][\\s\\S]*?(?=<section[^>]+id=["']${nextId}["'])`),
  );
  assert.ok(match, `Missing section #${id}`);
  return match[0];
};

test("homepage exposes the agreed sections and current lead story", () => {
  for (const id of [
    "aktualnosci",
    "partnerzy",
    "projekty",
    "o-nas",
    "kontakt",
    "variant-a",
    "variant-b",
    "nav-toggle",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  for (const phrase of [
    "Twin Green",
    "24 sierpnia 2026",
    "Polski",
    "Niemiec",
    "Włoch",
    "Wielkiej Brytanii",
    "Belgii",
    "Hiszpanii",
    "Węgier",
  ]) {
    assert.match(html, new RegExp(phrase, "i"));
  }

  for (const source of [
    "https://www.facebook.com/share/p/198Uct8a7r/",
    "https://www.facebook.com/share/p/18qQkk54jS/",
    "https://www.zamojska.pl/artykul/6268%2Czamosc-gospodarzem-miedzynarodowego-spotkania-o-transformacji-energetycznej",
    "https://www.kronikatygodnia.pl/artykul/55329%2Czamosc-gospodarzem-europejskiego-projektu-ekologicznego-twin-green",
  ]) {
    assert.ok(html.includes(source), `Missing source: ${source}`);
  }
});

test("news presents only the current Twin Green story", () => {
  for (const [document, label] of [
    [html, "Polish"],
    [englishHtml, "English"],
  ]) {
    const news = section(document, "aktualnosci", "partnerzy");
    assert.match(news, /Twin Green/i, `${label} news is missing Twin Green`);
    assert.doesNotMatch(
      news,
      /archive-stream|report_22\/report\.pdf|migration_project_|projects_history_/i,
      `${label} news mixes current and earlier work`,
    );
  }
});

test("Twin Green exposes the same compact six-photo gallery in both languages", () => {
  const polishNews = section(html, "aktualnosci", "partnerzy");
  const englishNews = section(englishHtml, "aktualnosci", "partnerzy");

  for (const [news, language] of [[polishNews, "Polish"], [englishNews, "English"]]) {
    assert.equal([...news.matchAll(/data-gallery-item/g)].length, 6, `${language} gallery must contain six photos`);
    assert.match(news, /data-meeting-gallery="twin-green-2026"/);
    assert.match(news, /class="meeting-gallery__teaser"/);
    assert.match(news, /<dialog class="gallery-lightbox" data-gallery-dialog/);
    assert.doesNotMatch(news, /Zdjęcia — wkrótce|Photos — coming soon/);

    for (const id of ["uczestnicy", "program", "geotermia", "pgk", "wystapienie", "dyskusja"]) {
      assert.match(news, new RegExp(`images/meetings/twin-green-2026/${id}-large\\.webp`));
      assert.equal(existsSync(resolve(root, `images/meetings/twin-green-2026/${id}-large.webp`)), true);
    }
    assert.match(news, /images\/meetings\/twin-green-2026\/uczestnicy-thumb\.webp/);
    assert.equal([...news.matchAll(/-thumb\.webp/g)].length, 1, `${language} gallery must show one thumbnail`);
  }

  assert.equal(existsSync(resolve(root, "images/meetings/twin-green-2026/uczestnicy-thumb.webp")), true);
  for (const id of ["program", "geotermia", "pgk", "wystapienie", "dyskusja"]) {
    assert.equal(existsSync(resolve(root, `images/meetings/twin-green-2026/${id}-thumb.webp`)), false);
  }

  assert.match(polishNews, /<h3 id="gallery-twin-green-2026-title">Galeria zdjęć<\/h3>/);
  assert.match(polishNews, /Zobacz galerię/);
  assert.match(englishNews, /<h3 id="gallery-twin-green-2026-title">Photo gallery<\/h3>/);
  assert.match(englishNews, /View gallery/);
});

test("partner map story leads with people rather than organisation counts", () => {
  const polishPartners = section(html, "partnerzy", "projekty");
  const englishPartners = section(englishHtml, "partnerzy", "projekty");

  assert.match(
    polishPartners,
    /<h2 id="partners-title">Na mapie dzielą je kilometry\. Łączą je ludzie\.<\/h2>/,
  );
  assert.doesNotMatch(polishPartners, /<h2 id="partners-title">Miasta nie tylko na mapie<\/h2>/);
  assert.doesNotMatch(polishPartners, /<h3>Na mapie dzielą je kilometry\. Łączą je ludzie\.<\/h3>/);
  assert.doesNotMatch(polishPartners, /Siedem miast\. Osiem organizacji przy wspólnym stole\./);

  assert.match(
    englishPartners,
    /<h2 id="partners-title">Kilometres apart on the map\. Brought together by people\.<\/h2>/,
  );
  assert.doesNotMatch(
    englishPartners,
    /<h3>Kilometres apart on the map\. Brought together by people\.<\/h3>/,
  );
  assert.doesNotMatch(englishPartners, /Seven towns\. Eight organisations around one table\./);
});

test("earlier work is collected once below the projects heading without calling it an archive", () => {
  const polishProjects = section(html, "projekty", "o-nas");
  const englishProjects = section(englishHtml, "projekty", "o-nas");

  assert.match(polishProjects, /data-past-projects/);
  assert.match(polishProjects, /Z wcześniejszych lat/i);
  assert.doesNotMatch(polishProjects, /archiw/i);

  assert.match(englishProjects, /data-past-projects/);
  assert.match(englishProjects, /From earlier years/i);
  assert.doesNotMatch(englishProjects, /archive/i);

  for (const target of [
    "report_22/report.pdf",
    "migration_project_pl.html",
    "projects_history_pl.html",
    "weaving_pl.html",
  ]) {
    assert.ok(polishProjects.includes(target), `Polish earlier work is missing ${target}`);
  }

  for (const target of [
    "report_22/report.pdf",
    "migration_project_en.html",
    "projects_history_en.html",
    "weaving.html",
  ]) {
    assert.ok(englishProjects.includes(target), `English earlier work is missing ${target}`);
  }
});

test("past projects use compact text-only rows", () => {
  const css = readFileSync(cssPath, "utf8");

  for (const [document, label] of [
    [html, "Polish"],
    [englishHtml, "English"],
  ]) {
    const projects = section(document, "projekty", "o-nas");
    assert.doesNotMatch(projects, /project-chapter--image|<img\b/i, `${label} projects still use background photography`);
    assert.equal(
      [...projects.matchAll(/<article class="project-chapter">/g)].length,
      6,
      `${label} projects are not a uniform text list`,
    );
  }

  assert.match(
    css,
    /\.project-stream\[data-past-projects\] \.project-chapter\s*\{[^}]*padding-block:\s*clamp\(14px,\s*1\.6vw,\s*22px\)[^}]*grid-template-columns:\s*3\.25rem\s+minmax\(11rem,\s*0\.7fr\)\s+minmax\(0,\s*1\.3fr\)\s+auto/s,
  );
});

test("homepage uses secure external resources", () => {
  assert.doesNotMatch(html, /(?:src|href)=["']http:\/\//i);
});

test("homepage local links and images point to existing files", () => {
  const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|mailto:|#)/i.test(value));

  for (const reference of references) {
    const relativePath = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    assert.equal(existsSync(resolve(root, relativePath)), true, `Missing local file: ${relativePath}`);
  }
});

test("the top anchor is independent from the sticky header", () => {
  assert.match(html, /<div class="page-top" id="top"/);
  assert.doesNotMatch(html, /<header[^>]+id="top"/);
});

test("only the Polish homepage uses the compact hero title", () => {
  assert.match(html, /<h1[^>]+class="hero-title--compact"[^>]*>Zamość bliżej Europy\./);
  assert.doesNotMatch(englishHtml, /hero-title--compact/);

  const css = readFileSync(cssPath, "utf8");
  const desktopMax = css.match(
    /\.hero__copy h1\.hero-title--compact\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s,
  );
  const mobileMax = css.match(
    /@media\s*\(max-width:\s*680px\)[\s\S]*?\.hero__copy h1\.hero-title--compact\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/,
  );

  assert.ok(desktopMax, "Missing compact homepage title scale");
  assert.ok(mobileMax, "Missing mobile compact homepage title scale");
  assert.ok(Number(desktopMax[1]) <= 3.25, "Compact homepage title is too large on desktop");
  assert.ok(Number(mobileMax[1]) <= 2.8, "Compact homepage title is too large on mobile");
});

test("sitewide headings stay within an editorial scale", () => {
  const css = readFileSync(cssPath, "utf8");
  const headingCaps = [
    [/(?:^|\n)h1\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s, 3.6, "h1"],
    [/(?:^|\n)h2\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s, 2.75, "h2"],
    [/(?:^|\n)h3\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s, 1.7, "h3"],
    [/\.page-hero h1\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s, 4.75, "page hero"],
    [/\.page-hero__index\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s, 12, "decorative page number"],
    [/\.social-strip p,\s*\.page-cta h2\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/s, 2.75, "call to action"],
    [/@media\s*\(max-width:\s*680px\)[\s\S]*?\.hero__copy h1\s*\{[^}]*font-size:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/, 3.1, "mobile homepage hero"],
  ];

  for (const [pattern, cap, label] of headingCaps) {
    const match = css.match(pattern);
    assert.ok(match, `Missing ${label} scale`);
    assert.ok(Number(match[1]) <= cap, `${label} exceeds ${cap}rem`);
  }
});

test("stylesheet defines both designs and accessibility adaptations", () => {
  assert.equal(existsSync(cssPath), true, "Modern stylesheet is missing");
  const css = readFileSync(cssPath, "utf8");

  for (const pattern of [
    /\[data-variant=["']a["']\]/,
    /\[data-variant=["']b["']\]/,
    /@media\s*\([^)]*max-width/,
    /:focus-visible/,
    /prefers-reduced-motion:\s*reduce/,
  ]) {
    assert.match(css, pattern);
  }
});

test("both variants follow the Genesio MD3 token model with green and blue palettes", () => {
  const css = readFileSync(cssPath, "utf8");

  for (const token of [
    "--md-sys-shape-corner-medium",
    "--md-sys-shape-corner-large",
    "--md-sys-spacing-4",
    "--md-sys-motion-easing-standard",
    "--md-sys-typescale-font-family-headline",
    "--md-sys-color-surface-container",
    "--md-sys-elevation-2",
  ]) {
    assert.ok(css.includes(token), `Missing Genesio token: ${token}`);
  }

  assert.match(css, /html\[data-variant=["']a["']\][\s\S]*--md-sys-color-primary:\s*#176b4d/i);
  assert.match(css, /html\[data-variant=["']b["']\][\s\S]*--md-sys-color-primary:\s*#315f9f/i);
  assert.doesNotMatch(css, /#b3312d|#ff6b4a|#c7f36b/i);
  assert.match(html, /<span>Zielony<\/span>/);
  assert.match(html, /<span>Niebieski<\/span>/);
});

test("the Zamość variant uses the logo-led fortress palette and motif", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /html\[data-variant=["']c["']\][\s\S]*--md-sys-color-primary:\s*#a92725/i);
  assert.match(css, /html\[data-variant=["']c["']\][\s\S]*--md-sys-color-secondary:\s*#7a5b00/i);
  assert.match(css, /\[data-variant=["']c["']\] \.hero__inner::after[\s\S]*clip-path:\s*polygon\(/i);
  assert.match(html, /id="variant-c"[^>]+data-variant-choice="c"[^>]*>[\s\S]*?<span>Zamość<\/span>/);
});

test("the Twin Green story keeps its green background in every visual variant", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(
    css,
    /--twin-green-background:\s*linear-gradient\([^;]*#0e5c40[^;]*#176b4d[^;]*#2b8262[^;]*\)/i,
  );
  assert.match(
    css,
    /\.lead-story__visual\s*\{[^}]*background:\s*var\(--twin-green-background\)/i,
  );
});
