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

test("coverage uses concise bilingual headings and announces upcoming photos", () => {
  const polishNews = section(html, "aktualnosci", "partnerzy");
  const englishNews = section(englishHtml, "aktualnosci", "partnerzy");

  assert.match(
    polishNews,
    /<div class="coverage__intro">\s*<h3 id="coverage-title">Relacje<\/h3>\s*<p class="eyebrow">Zdjęcia — wkrótce<\/p>/,
  );
  assert.doesNotMatch(polishNews, /Zobacz wydarzenie z kilku perspektyw/);

  assert.match(
    englishNews,
    /<div class="coverage__intro">\s*<h3>Coverage<\/h3>\s*<p class="eyebrow">Photos — coming soon<\/p>/,
  );
  assert.doesNotMatch(englishNews, /See the event from several perspectives/);
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
  assert.match(
    css,
    /\.hero__copy h1\.hero-title--compact\s*\{[^}]*font-size:\s*clamp\(2\.3rem,\s*4\.2vw,\s*4rem\)/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*680px\)[\s\S]*?\.hero__copy h1\.hero-title--compact\s*\{[^}]*font-size:\s*clamp\(2\.1rem,\s*10vw,\s*3\.25rem\)/,
  );
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
