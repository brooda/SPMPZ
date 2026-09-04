import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { resolveVariant, withVariant } from "../js/modern-site.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stylesheet = readFileSync(path.join(root, "css", "modern.css"), "utf8");

const contentPages = [
  "index.html",
  "english.html",
  "about_pl.html",
  "about_en.html",
  "contact_pl.html",
  "contact_en.html",
  "migration_project_pl.html",
  "migration_project_en.html",
  "partners_pl.html",
  "partners_en.html",
  "projects_pl.html",
  "projects_en.html",
  "projects_history_pl.html",
  "projects_history_en.html",
  "weaving_pl.html",
  "weaving.html",
];

test("Europe is a valid optional theme while Zamość stays the default", () => {
  assert.equal(resolveVariant("?variant=d", null), "d");
  assert.equal(resolveVariant("", "d"), "d");
  assert.equal(resolveVariant("", null), "c");
  assert.equal(
    new URL(withVariant("https://spmpz.test/index.html", "d")).searchParams.get("variant"),
    "d",
  );
});

test("every content page exposes the Europe theme switch", () => {
  for (const filename of contentPages) {
    const html = readFileSync(path.join(root, filename), "utf8");
    assert.match(
      html,
      /<button id="variant-d" type="button" data-variant-choice="d" aria-pressed="false">D <span>(?:Europa|Europe)<\/span><\/button>/,
      filename,
    );
  }
});

function colorChannels(literal) {
  if (literal.startsWith("#")) {
    return [
      Number.parseInt(literal.slice(1, 3), 16),
      Number.parseInt(literal.slice(3, 5), 16),
      Number.parseInt(literal.slice(5, 7), 16),
    ];
  }

  return literal
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number);
}

function hasGreenHue(literal) {
  const [red, green, blue] = colorChannels(literal).map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const chroma = max - min;
  if (chroma < 0.04) return false;

  let hue;
  if (max === red) hue = 60 * (((green - blue) / chroma) % 6);
  else if (max === green) hue = 60 * ((blue - red) / chroma + 2);
  else hue = 60 * ((red - green) / chroma + 4);
  if (hue < 0) hue += 360;

  return hue >= 70 && hue <= 190;
}

test("Europe theme keeps its final cream, gold and burgundy gradients", () => {
  const themeTokens = stylesheet.match(/html\[data-variant="d"\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const visualRules = stylesheet.match(/\/\* Option D — luminous Europe[^]*?\*\/([\s\S]*?)\n\.contact-lead > a/)?.[1] ?? "";
  const gradientDeclarations = [...(themeTokens + visualRules).matchAll(
    /(?:--md-gradient-[\w-]+|background(?:-image)?):([\s\S]*?);/g,
  )]
    .map((match) => match[1])
    .filter((value) => value.includes("gradient("));
  const colors = gradientDeclarations.flatMap(
    (value) => value.match(/#[\da-f]{6}|rgba?\(\s*\d[^)]*\)/gi) ?? [],
  );

  assert.ok(gradientDeclarations.length > 0, "Europe theme gradients are missing");
  assert.deepEqual(colors.filter(hasGreenHue), []);
});

test("all project rows share one Europe theme background", () => {
  const perProjectOverrides = [...stylesheet.matchAll(
    /\[data-variant="d"\] \.project-stream\[data-past-projects\] \.project-chapter:nth-child\(\d+\)\s*\{([\s\S]*?)\}/g,
  )].map((match) => match[1]);

  assert.equal(
    perProjectOverrides.some((rule) => /--project-accent|background(?:-image)?\s*:/.test(rule)),
    false,
  );
});
