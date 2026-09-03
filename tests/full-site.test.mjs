import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const pairs = [
  ["index.html", "english.html"],
  ["about_pl.html", "about_en.html"],
  ["partners_pl.html", "partners_en.html"],
  ["projects_pl.html", "projects_en.html"],
  ["projects_history_pl.html", "projects_history_en.html"],
  ["migration_project_pl.html", "migration_project_en.html"],
  ["weaving_pl.html", "weaving.html"],
  ["contact_pl.html", "contact_en.html"],
];

const canonicalPages = pairs.flat();
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("every Polish page has a modern English counterpart", () => {
  for (const [polish, english] of pairs) {
    assert.ok(existsSync(resolve(root, polish)), `Missing ${polish}`);
    assert.ok(existsSync(resolve(root, english)), `Missing ${english}`);

    const polishHtml = read(polish);
    const englishHtml = read(english);
    assert.match(polishHtml, /<html\s+lang="pl"[^>]*data-variant="a"/);
    assert.match(englishHtml, /<html\s+lang="en"[^>]*data-variant="a"/);
    assert.ok(polishHtml.includes(`href="${english}"`), `${polish} must link to ${english}`);
    assert.ok(englishHtml.includes(`href="${polish}"`), `${english} must link to ${polish}`);
  }
});

test("every canonical page exposes the shared accessible shell", () => {
  for (const page of canonicalPages) {
    const html = read(page);
    for (const id of ["site-header", "nav-toggle", "primary-navigation", "variant-a", "variant-b", "main-content"]) {
      assert.match(html, new RegExp(`id="${id}"`), `${page} missing #${id}`);
    }
    assert.match(html, /data-page="[a-z-]+"/);
    assert.match(html, /href="css\/modern\.css"/);
    assert.match(html, /src="js\/modern-site\.mjs"/);
    assert.doesNotMatch(html, /css\/style(?:-desktop|-mobile|-1000px)?\.css|js\/skel(?:-panels)?\.min\.js/i);
    assert.doesNotMatch(html, /Template strony:|Page template:/i);
  }
});

test("canonical pages have no broken local targets or insecure resources", () => {
  for (const page of canonicalPages) {
    const html = read(page);
    assert.doesNotMatch(html, /(?:href|src)="http:\/\//i, `${page} contains an insecure URL`);
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      const target = match[1];
      if (/^(?:https?:|mailto:|tel:|data:)/.test(target)) continue;
      const path = target.split("?")[0];
      if (!path || path === "/") continue;
      assert.ok(existsSync(resolve(root, path)), `${page} points to missing ${path}`);
    }
  }
});

test("page families retain the association's essential information", () => {
  for (const phrase of ["2003", "bezpośrednich kontaktów", "direct contact"])
    assert.ok(read("about_pl.html").includes(phrase) || read("about_en.html").includes(phrase));

  const partnerContent = read("partners_pl.html") + read("partners_en.html");
  for (const city of ["Bagnols-sur-Cèze", "Braunfels", "Carcaixent", "Eeklo", "Feltre", "Kiskunfélegyháza", "Newbury", "Loughborough"])
    assert.ok(partnerContent.includes(city), `Missing partner ${city}`);

  const contactContent = read("contact_pl.html") + read("contact_en.html");
  for (const fact of ["kontakt@spmpz.zamosc.pl", "0000158936", "922-26-16-692", "951194700"])
    assert.ok(contactContent.includes(fact), `Missing contact fact ${fact}`);

  const projectContent = canonicalPages.filter((page) => /projects|migration|weaving/.test(page)).map(read).join("\n");
  for (const project of ["Youth for Europe", "Migration", "Loughborough", "Weaving", "Eeklo", "Kiskunfélegyháza", "Mangala"])
    assert.match(projectContent, new RegExp(project, "i"), `Missing project content ${project}`);
});

test("project reports have one contextual home in each language", () => {
  const polishPages = pairs.map(([polish]) => read(polish)).join("\n");
  const englishPages = pairs.map(([, english]) => read(english)).join("\n");

  for (const [pages, language] of [
    [polishPages, "Polish"],
    [englishPages, "English"],
  ]) {
    assert.equal(
      pages.split('href="report_22/report.pdf"').length - 1,
      1,
      `${language} pages duplicate the ImagE50 report`,
    );
    assert.equal(
      pages.split('href="Final report/index.html"').length - 1,
      1,
      `${language} pages duplicate the Migration Project report`,
    );
  }

  for (const page of ["contact_pl.html", "contact_en.html"]) {
    assert.doesNotMatch(
      read(page),
      /report_22\/report\.pdf|Final report\/index\.html/,
      `${page} should contain contact and association documents, not project reports`,
    );
  }
});

test("the complete partner network is presented on a real interactive map", () => {
  const mapPages = ["index.html", "english.html", "partners_pl.html", "partners_en.html"];
  const cities = ["Zamość", "Bagnols-sur-Cèze", "Braunfels", "Carcaixent", "Eeklo", "Feltre", "Kiskunfélegyháza", "Newbury", "Loughborough"];

  for (const page of mapPages) {
    const html = read(page);
    assert.match(html, /data-partner-map/);
    assert.match(html, /leaflet@1\.9\.4\/dist\/leaflet\.css/);
    assert.match(html, /leaflet@1\.9\.4\/dist\/leaflet\.js/);
    assert.match(html, /src="js\/partner-map\.mjs"/);
    assert.match(html, /7 Cities/);
    for (const city of cities)
      assert.ok(html.includes(city), `${page} map index is missing ${city}`);
  }

  assert.doesNotMatch(read("index.html"), /Zobacz archiwalną listę partnerów/i);
  assert.doesNotMatch(read("english.html"), /Explore the partner network/i);
});

test("photo footer uses only the simple label", () => {
  for (const page of canonicalPages) {
    const html = read(page);
    assert.doesNotMatch(html, /Zdjęcia:|Photos:/);
    assert.match(html, /<p>(?:Zdjęcia|Photos)<\/p>/);
  }
});

test("legacy English entry points resolve to the canonical English homepage", () => {
  for (const alias of ["index_en.html", "index_enn.html", "en/index.html"]) {
    const html = read(alias);
    assert.match(html, /english\.html/);
    assert.match(html, /location\.(?:search|hash)/);
  }
});

test("content layout avoids card-based presentation", () => {
  const css = read("css/modern.css");
  for (const obsolete of ["source-card", "project-card", "archive-news"])
    assert.doesNotMatch(css, new RegExp(`\\.${obsolete}\\b`), `Obsolete card selector .${obsolete}`);
  for (const page of canonicalPages)
    assert.doesNotMatch(read(page), /class="[^"]*(?:source-card|project-card|archive-news)[^"]*"/);
});

test("GPT Sites contains the same canonical pages and shared presentation", () => {
  for (const path of [...canonicalPages, "index_en.html", "index_enn.html", "css/modern.css", "js/modern-site.mjs"])
    assert.equal(read(`sites-preview/public/spmpz/${path}`), read(path), `Sites copy differs: ${path}`);

  for (const path of ["en/index.html", "images/site/hero-zamosc.jpg", "images/site/fortress-night.jpg", "images/weaving.jpg", "report_22/report.pdf", "migration.pdf", "statute_pl.pdf"])
    assert.ok(existsSync(resolve(root, "sites-preview/public/spmpz", path)), `Sites copy missing: ${path}`);
});
