import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
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
