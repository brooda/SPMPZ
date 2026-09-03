import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const englishHtml = readFileSync(resolve(root, "english.html"), "utf8");
const cssPath = resolve(root, "css/modern.css");

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
