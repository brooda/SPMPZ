# SPMPZ Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SPMPZ homepage with one accessible static site that offers two complete visual variants, highlights Twin Green, and documents a practical route to multi-author publishing.

**Architecture:** A single semantic `index.html` remains the canonical content source. `css/modern.css` adapts the Genesio / Promethic UI Material Design 3 token and component model into green Variant A and blue Variant B, keyed by `data-variant`, while `js/modern-site.mjs` provides progressive enhancement for variant persistence, shareable URLs, and the mobile menu. The legacy pages and documents stay in place as an archive, and GPT Sites is used as a second presentation surface after the local site passes verification.

**Tech Stack:** HTML5, CSS3, browser-native ES modules, Node.js built-in test runner, GitHub Pages, GPT Sites

**Spec:** `docs/superpowers/specs/2026-09-03-spmpz-modernization-design.md`

## Global Constraints

- Do not add a runtime framework, package manager, or Jekyll dependency.
- Keep existing archival HTML, PDF, report, and image URLs available.
- Use only repository-owned imagery; do not copy images from press or Facebook posts.
- The full content must remain available when JavaScript is disabled.
- Variant A is the no-JavaScript default.
- Support `?variant=a` and `?variant=b`, and persist the last explicit selection in `localStorage`.
- Meet WCAG AA contrast, keyboard, focus, heading, alternative text, and reduced-motion requirements.
- Do not implement member accounts or a CMS in this change.
- Keep all implementation commits on one feature branch for one comprehensive pull request.

---

## File Map

- `index.html`: canonical Polish homepage content, semantic components, metadata, and source links.
- `css/modern.css`: reset, shared tokens, Variant A rules, Variant B rules, responsive rules, and reduced-motion handling.
- `js/modern-site.mjs`: pure variant-resolution helpers plus browser initialization for the variant picker and mobile navigation.
- `tests/homepage.test.mjs`: structural, content, local-link, and insecure-resource tests for the homepage.
- `tests/variant.test.mjs`: unit tests for URL/storage precedence and shareable variant URLs.
- `images/site/hero-zamosc.jpg`: optimized hero derivative from `images/WW/WW1.jpg`.
- `images/site/fortress-night.jpg`: optimized supporting derivative from `images/JB/JB1.jpg`.
- `docs/recommendations/publishing-and-benchmarks.md`: benchmark findings and post-publication options, written only after the page implementation.
- GPT Sites artifact: hosted presentation of the same content and both variants, created through the Sites workflow.

---

### Task 1: Lock the homepage content and semantic contract

**Files:**
- Create: `tests/homepage.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing archive files including `about_pl.html`, `projects_pl.html`, `partners_pl.html`, `statute_pl.pdf`, and `report_22/report.pdf`.
- Produces: section IDs `aktualnosci`, `partnerzy`, `projekty`, `o-nas`, and `kontakt`; controls `variant-a`, `variant-b`, and `nav-toggle`; one canonical semantic DOM used by both visual variants.

- [ ] **Step 1: Write the failing structural and content test**

Create `tests/homepage.test.mjs` with Node's built-in test runner. The test must read `index.html`, assert the required IDs, check Twin Green facts and all four supplied/source links, and reject insecure `http://` resource URLs. The full local-link check is added after the CSS and JavaScript targets exist in Task 4.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");

test("homepage exposes the agreed sections and current lead story", () => {
  for (const id of ["aktualnosci", "partnerzy", "projekty", "o-nas", "kontakt", "variant-a", "variant-b", "nav-toggle"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const phrase of ["Twin Green", "24 sierpnia 2026", "Polski", "Niemiec", "Włoch", "Wielkiej Brytanii", "Belgii", "Hiszpanii", "Węgier"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
  for (const source of [
    "https://www.facebook.com/share/p/198Uct8a7r/",
    "https://www.facebook.com/share/p/18qQkk54jS/",
    "https://www.zamojska.pl/artykul/6268%2Czamosc-gospodarzem-miedzynarodowego-spotkania-o-transformacji-energetycznej",
    "https://www.kronikatygodnia.pl/artykul/55329%2Czamosc-gospodarzem-europejskiego-projektu-ekologicznego-twin-green",
  ]) assert.ok(html.includes(source), `Missing source: ${source}`);
});

test("homepage uses secure external resources", () => {
  assert.doesNotMatch(html, /(?:src|href)=["']http:\/\//i);
});
```

- [ ] **Step 2: Run the test and verify the legacy homepage fails the contract**

Run: `node --test tests/homepage.test.mjs`

Expected: FAIL because the required section/control IDs and Twin Green story are absent and insecure resources remain.

- [ ] **Step 3: Replace the homepage with the semantic one-page experience**

Write a complete Polish homepage with:

- skip link and sticky header,
- text-based SPMPZ mark plus full organization name,
- variant fieldset containing buttons `variant-a` and `variant-b`,
- mobile button `nav-toggle` with `aria-expanded="false"` and `aria-controls="primary-navigation"`,
- hero with the message „Zamość bliżej Europy. Europa bliżej Zamościa.”,
- Twin Green lead story marked up as `<article>` with verified date and seven-country participation,
- source cards for both supplied Facebook URLs and the Zamojska/Kronika Tygodnia press URLs,
- partner grid for Bagnols-sur-Cèze, Braunfels, Carcaixent, Eeklo, Feltre, Kiskunfélegyháza, Newbury, and Loughborough,
- project cards for Twin Green, Youth for Europe, Migration Project, Loughborough exchange, and Weaving a Europe of Solidarity,
- mission and membership call to action,
- contact email, KRS `0000158936`, NIP `922-26-16-692`, REGON `951194700`, statute, reports, photo credit, and archive/English links,
- local `<link rel="stylesheet" href="css/modern.css">` and `<script type="module" src="js/modern-site.mjs"></script>` only.

All external links open with `target="_blank" rel="noopener noreferrer"`. Use descriptive anchor text rather than raw URLs.

- [ ] **Step 4: Run the content contract test**

Run: `node --test tests/homepage.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the semantic homepage**

```bash
git add index.html tests/homepage.test.mjs
git commit -m "feat: rebuild SPMPZ homepage content"
```

---

### Task 2: Build two Genesio-based responsive variants

**Files:**
- Modify: `tests/homepage.test.mjs`
- Create: `css/modern.css`
- Create: `images/site/hero-zamosc.jpg`
- Create: `images/site/fortress-night.jpg`

**Interfaces:**
- Consumes: `html[data-variant="a"]` and `html[data-variant="b"]` from the homepage/controller contract.
- Produces: shared layout primitives and complete A/B treatments for all homepage components at desktop and mobile sizes.

- [ ] **Step 1: Add a failing stylesheet contract test**

Extend `tests/homepage.test.mjs` to read `css/modern.css` and require explicit Variant A, Variant B, mobile, focus-visible, and reduced-motion rules.

```js
const css = readFileSync(resolve(root, "css/modern.css"), "utf8");

test("stylesheet defines both designs and accessibility adaptations", () => {
  for (const pattern of [
    /\[data-variant=["']a["']\]/,
    /\[data-variant=["']b["']\]/,
    /@media\s*\([^)]*max-width/,
    /:focus-visible/,
    /prefers-reduced-motion:\s*reduce/,
  ]) assert.match(css, pattern);
});
```

- [ ] **Step 2: Run the stylesheet test and verify it fails**

Run: `node --test tests/homepage.test.mjs`

Expected: FAIL with `ENOENT` for `css/modern.css`.

- [x] **Step 3: Generate optimized repository-owned image derivatives**

```bash
mkdir -p images/site
sips -s format jpeg -s formatOptions 82 -Z 1920 images/WW/WW1.jpg --out images/site/hero-zamosc.jpg
sips -s format jpeg -s formatOptions 80 -Z 1440 images/JB/JB1.jpg --out images/site/fortress-night.jpg
```

Keep the originals unchanged. Reference both derivatives with explicit dimensions, useful alternative text, and lazy loading for the non-hero image.

- [x] **Step 4: Implement shared Genesio CSS and green Variant A**

Define a reset, fluid type scale, `--page-gutter`, `--content-width`, accessible focus ring, reusable buttons/cards, and image treatments. Import the Genesio conventions: MD3 color roles, 4 px spacing tokens, 16/24/32 px shapes, Manrope/Inter typography, tonal surfaces, pill-shaped actions, and restrained elevation. Variant A uses green `#176b4d`, light green-gray surfaces, and a balanced split hero.

```css
html[data-variant="a"] {
  --md-sys-color-primary: #176b4d;
  --md-sys-color-on-primary: #fff;
  --md-sys-color-primary-container: #bcefd4;
  --md-sys-color-background: #e7efe9;
}

:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 4px;
}
```

- [x] **Step 5: Implement blue Variant B as an alternate composition**

Variant B uses blue `#315f9f`, arctic blue-gray surfaces, a wide image-led hero, country badges, and a more structured card composition. It keeps the same Genesio tokens and accessibility rules while CSS Grid reorders the lead story without changing document order.

```css
html[data-variant="b"] {
  --md-sys-color-primary: #315f9f;
  --md-sys-color-on-primary: #fff;
  --md-sys-color-primary-container: #d6e4ff;
  --md-sys-color-background: #e3eaf4;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Run the stylesheet contract test**

Run: `node --test tests/homepage.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit both visual systems**

```bash
git add css/modern.css images/site/hero-zamosc.jpg images/site/fortress-night.jpg tests/homepage.test.mjs index.html
git commit -m "feat: add two SPMPZ visual variants"
```

---

### Task 3: Add progressive variant and navigation behavior

**Files:**
- Create: `tests/variant.test.mjs`
- Create: `js/modern-site.mjs`

**Interfaces:**
- Produces: `resolveVariant(search: string, stored: string | null): "a" | "b"`, `withVariant(url: string, variant: "a" | "b"): string`, and `initializeSite(doc: Document, win: Window): void`.
- Consumes: controls `variant-a`, `variant-b`, `nav-toggle`, and `primary-navigation`; storage key `spmpz-variant`.

- [ ] **Step 1: Write failing unit tests for precedence and shareable URLs**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { resolveVariant, withVariant } from "../js/modern-site.mjs";

test("query parameter wins over stored preference", () => {
  assert.equal(resolveVariant("?variant=b", "a"), "b");
  assert.equal(resolveVariant("?variant=a", "b"), "a");
});

test("stored valid preference is used and invalid values fall back to A", () => {
  assert.equal(resolveVariant("", "b"), "b");
  assert.equal(resolveVariant("?variant=orange", "orange"), "a");
});

test("share URL preserves unrelated query values and the hash", () => {
  assert.equal(
    withVariant("https://example.org/?ref=mail#projekty", "b"),
    "https://example.org/?ref=mail&variant=b#projekty",
  );
});
```

- [ ] **Step 2: Run unit tests and verify they fail**

Run: `node --test tests/variant.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `js/modern-site.mjs`.

- [ ] **Step 3: Implement the pure functions and browser initializer**

```js
const VALID_VARIANTS = new Set(["a", "b"]);
export function resolveVariant(search, stored) {
  const requested = new URLSearchParams(search).get("variant");
  if (VALID_VARIANTS.has(requested)) return requested;
  return VALID_VARIANTS.has(stored) ? stored : "a";
}

export function withVariant(url, variant) {
  const next = new URL(url);
  next.searchParams.set("variant", VALID_VARIANTS.has(variant) ? variant : "a");
  return next.toString();
}
```

`initializeSite` sets `documentElement.dataset.variant`, synchronizes `aria-pressed` on both variant buttons, saves explicit button choices inside a guarded `try/catch`, updates the current URL with `history.replaceState`, and keeps the mobile menu's `aria-expanded`/hidden state synchronized. It also closes the menu after an in-page navigation link is activated and on `Escape`.

Guard auto-initialization with `if (typeof document !== "undefined")` so Node can import the pure helpers.

- [ ] **Step 4: Run all automated tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

- [ ] **Step 5: Commit progressive enhancement**

```bash
git add js/modern-site.mjs tests/variant.test.mjs
git commit -m "feat: add accessible variant switcher"
```

---

### Task 4: Verify the rendered site and correct defects

**Files:**
- Modify if required: `index.html`
- Modify if required: `css/modern.css`
- Modify if required: `js/modern-site.mjs`
- Modify if required: `tests/homepage.test.mjs`
- Modify if required: `tests/variant.test.mjs`

**Interfaces:**
- Consumes: the complete local static site.
- Produces: verified desktop/mobile presentation for both variants and an evidence log in the final handoff.

- [ ] **Step 1: Start a local static server**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Expected: server listens at `http://127.0.0.1:4173/` without invoking Jekyll.

- [ ] **Step 2: Inspect four representative viewports**

Open and capture:

- `http://127.0.0.1:4173/?variant=a` at 1440×1000,
- `http://127.0.0.1:4173/?variant=b` at 1440×1000,
- `http://127.0.0.1:4173/?variant=a` at 390×844,
- `http://127.0.0.1:4173/?variant=b` at 390×844.

Verify no overlap, clipping, horizontal scroll, unreadable text, broken image, or inaccessible hidden navigation.

- [ ] **Step 3: Exercise interactions and accessibility**

Using only the keyboard, traverse the skip link, navigation, both variant controls, every lead-story source, project links, contact action, and footer links. Confirm `Escape` closes the mobile menu, chosen variants survive reload, query URLs override storage, and reduced motion removes non-essential transitions.

- [ ] **Step 4: Inspect browser errors and rerun tests**

Confirm the browser console has zero errors and zero insecure-resource warnings.

Before rerunning the suite, add `existsSync` to the existing `node:fs` import and extend `tests/homepage.test.mjs` with the final relative-link check now that all homepage assets exist:

```js
test("all relative homepage targets exist", () => {
  const hrefs = [...html.matchAll(/href=["']([^"'#?]+)(?:[?#][^"']*)?["']/g)].map((match) => match[1]);
  for (const href of hrefs.filter((value) => !/^(?:https:|mailto:|tel:)/.test(value))) {
    assert.equal(existsSync(resolve(root, href)), true, `Missing local target: ${href}`);
  }
});
```

Run: `node --test tests/*.test.mjs && git diff --check`

Expected: all tests PASS and `git diff --check` emits no output.

- [ ] **Step 5: Commit any verified QA corrections**

```bash
git add index.html css/modern.css js/modern-site.mjs tests
git commit -m "fix: polish responsive SPMPZ experience"
```

Skip the commit when verification requires no code correction.

---

### Task 5: Produce the benchmark and publishing recommendation

**Files:**
- Create: `docs/recommendations/publishing-and-benchmarks.md`

**Interfaces:**
- Consumes: implemented site boundaries, verified current vendor documentation, and reviewed association websites.
- Produces: an evidence-backed decision record that does not change the live publishing architecture.

- [ ] **Step 1: Document the benchmark sites and extracted patterns**

Cover at least Newbury Twin Town Association, Buckingham Twinning Association, Darlington Town Twinning & International Association, and one active association with a lightweight blog/news model. For each, record the direct URL, useful pattern, limitation, and its concrete influence on the SPMPZ implementation.

- [ ] **Step 2: Compare three editorial models**

Use one table with rows for:

1. Git-backed CMS with moderation,
2. hosted headless CMS with named editor accounts,
3. submission form plus editor approval.

Columns must cover nontechnical ease, roles/approval, photo workflow, account security, backups, recurring cost, maintenance, and migration fit with this static homepage.

- [ ] **Step 3: Make a staged recommendation**

Recommend a specific first choice and a lower-complexity fallback. Include a proposed author-to-publication flow, required roles, minimum security controls, indicative costs with a retrieval date, and a small pilot scope. Clearly label prices/features that require rechecking before purchase.

- [ ] **Step 4: Check the document for unsupported or stale claims**

Every vendor capability or current price must link to an official vendor source. Every benchmark observation must link to the association page demonstrating it. Remove claims that cannot be verified.

- [ ] **Step 5: Commit the recommendation**

```bash
git add docs/recommendations/publishing-and-benchmarks.md
git commit -m "docs: recommend SPMPZ publishing workflow"
```

---

### Task 6: Create and publish the GPT Sites presentation

**Files:**
- Modify only when produced by the Sites workflow: `.openai/hosting.json`

**Interfaces:**
- Consumes: locally verified homepage, both variant URLs, repository-owned images, and final Polish copy.
- Produces: a published GPT Sites preview that exposes the same A/B comparison without becoming the canonical content store.

- [ ] **Step 1: Invoke the Sites building workflow**

Provide the completed site and its design contract to the Sites builder. Require both variant controls, the Twin Green lead story, partner/project sections, contact details, repository-owned imagery, and no CMS/account functionality.

- [ ] **Step 2: Compare the Sites result with the local contract**

Verify the published artifact contains both variants, uses the same facts/source links, works at mobile and desktop widths, and does not introduce fabricated partners, events, people, or images.

- [ ] **Step 3: Publish through the Sites hosting workflow**

Use the hosting workflow required by the Sites skill. Record the resulting preview link and any generated hosting configuration. Do not replace GitHub Pages as the canonical deployment.

- [ ] **Step 4: Run final repository verification**

Run: `node --test tests/*.test.mjs && git diff --check && git status --short`

Expected: tests PASS, no whitespace errors, and only intentional Sites-generated files remain uncommitted.

- [ ] **Step 5: Commit intentional Sites configuration**

```bash
git add .openai/hosting.json
git commit -m "chore: add GPT Sites preview configuration"
```

Skip this commit if Sites does not create repository configuration.

---

### Task 7: Final verification and handoff

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: all completed tasks and the GPT Sites preview URL.
- Produces: reproducible local viewing/testing instructions and a concise implementation handoff.

- [ ] **Step 1: Add current development and preview instructions**

Document:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
node --test tests/*.test.mjs
```

Explain `?variant=a` and `?variant=b`, identify GitHub Pages as canonical, and add the GPT Sites preview URL when available.

- [ ] **Step 2: Run the complete final verification**

Run: `node --test tests/*.test.mjs && git diff --check && git status --short --branch`

Expected: every test passes, no whitespace errors, and no accidental untracked files.

- [ ] **Step 3: Review the complete diff for scope and archival preservation**

Run: `git diff origin/master...HEAD --stat && git diff --name-status origin/master...HEAD`

Expected: the design/spec/plan, homepage, focused CSS/JS/tests, two derived images, recommendation, README, and optional Sites config only; legacy pages and documents remain present.

- [ ] **Step 4: Commit the final documentation**

```bash
git add README.md
git commit -m "docs: add SPMPZ preview instructions"
```

- [ ] **Step 5: Prepare one pull-request handoff**

Summarize the two variants, Twin Green update, verification evidence, benchmark/CMS recommendation, GPT Sites preview, and any content that SPMPZ members should confirm before production. Keep everything in one proposed pull request.
