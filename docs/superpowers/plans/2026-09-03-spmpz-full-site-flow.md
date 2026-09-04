# SPMPZ Full-Site Editorial Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-heavy prototype and every legacy PL/EN page with one flowing Genesio-based visual system available in green and blue.

**Architecture:** Static semantic HTML remains the delivery format. All canonical pages share `css/modern.css` and `js/modern-site.mjs`; the script owns variant persistence, mobile navigation, language-pair navigation and propagation of `?variant=` across local links. The homepage uses continuous editorial bands, while detail pages reuse a small set of flowing article, directory, timeline and contact layouts without content cards.

**Tech Stack:** HTML5, CSS3, browser-native ES modules, Node.js built-in test runner, GitHub Pages, Vinext/GPT Sites

**Spec:** `docs/superpowers/specs/2026-09-03-spmpz-modernization-design.md`

## Global Constraints

- Treat this repository as a non-production prototype; proceed with reasonable defaults for reversible styling/content work without optional approval questions.
- Keep one comprehensive pull request.
- Modernize every canonical Polish and English page listed in the spec.
- Expose green Variant A and blue Variant B on every canonical page using the same content and semantic order.
- Avoid content cards, floating boxes and repeated shadows; use editorial bands, rules, whitespace and text/image rhythm.
- Preserve existing public URLs for documents, reports and legacy English entry points.
- Preserve all content without JavaScript; Variant A remains the default.
- Do not add runtime dependencies or implement the CMS in this change.

---

## File Map

- `AGENTS.md`: local prototype/autonomy instruction.
- `index.html`, `english.html`: full Polish and English one-page home experiences.
- `about_*.html`, `partners_*.html`, `projects_*.html`, `migration_project_*.html`, `contact_*.html`: canonical bilingual detail pages.
- `projects_history_pl.html`, `projects_history_en.html`: bilingual project archive.
- `weaving_pl.html`, `weaving.html`: bilingual Weaving Webs project detail.
- `index_en.html`, `index_enn.html`, `en/index.html`: compatibility redirects to `english.html` that preserve the query string and hash.
- `css/modern.css`: Genesio tokens plus continuous homepage/detail-page layouts.
- `js/modern-site.mjs`: variant/menu controller, local-link variant propagation and pair-aware language navigation.
- `tests/full-site.test.mjs`: page inventory, shared-shell, language-pair, local-target and no-card contract tests.
- `tests/variant.test.mjs`: pure URL/variant behavior tests.
- `sites-preview/public/spmpz/**`: synchronized deployable copy of the validated site.

---

### Task 1: Record autonomy and lock the full-site contract

**Files:**
- Create: `AGENTS.md`
- Create: `tests/full-site.test.mjs`

**Interfaces:**
- Consumes: canonical page map from the design spec.
- Produces: `CANONICAL_PAIRS`, shared IDs `site-header`, `nav-toggle`, `primary-navigation`, `variant-a`, `variant-b`, and page marker `data-page`.

- [ ] **Step 1: Create a failing inventory test**

Create `tests/full-site.test.mjs` with the exact pairs below and assert that every file exists, declares the expected `lang`, loads `css/modern.css` and `js/modern-site.mjs`, and contains all shared control IDs.

```js
const PAIRS = [
  ["index.html", "english.html"],
  ["about_pl.html", "about_en.html"],
  ["partners_pl.html", "partners_en.html"],
  ["projects_pl.html", "projects_en.html"],
  ["projects_history_pl.html", "projects_history_en.html"],
  ["migration_project_pl.html", "migration_project_en.html"],
  ["weaving_pl.html", "weaving.html"],
  ["contact_pl.html", "contact_en.html"],
];
```

Also assert that canonical pages do not contain legacy assets `css/style.css`, `js/skel.min.js`, `Template strony`, or `Page template`.

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/full-site.test.mjs`

Expected: FAIL because two paired pages do not exist and the legacy pages do not expose the modern shell.

- [ ] **Step 3: Record the repository working agreement**

Create `AGENTS.md` containing the existing single-PR instruction plus: this is a non-production prototype; for reversible visual/content/code changes, make reasonable assumptions and execute without optional confirmation gates; ask only for destructive actions, secrets, external-account changes or decisions that materially change the requested outcome.

- [ ] **Step 4: Commit the contract**

```bash
git add AGENTS.md tests/full-site.test.mjs
git commit -m "test: define full SPMPZ site contract"
```

---

### Task 2: Extend the shared controller to every page

**Files:**
- Modify: `js/modern-site.mjs`
- Modify: `tests/variant.test.mjs`

**Interfaces:**
- Produces: `isLocalHtmlLink(href: string): boolean`, `withVariant(url: string, variant: "a" | "b"): string`, and `initializeSite(doc, win): void` that updates all local HTML anchors after a variant selection.
- Consumes: the existing storage key `spmpz-variant` and the same shared control IDs on every page.

- [ ] **Step 1: Add failing local-link tests**

Test that `isLocalHtmlLink("about_pl.html")`, `isLocalHtmlLink("projects_en.html#archive")`, and `isLocalHtmlLink("./english.html")` are true, while mail, PDF, external, hash-only and Facebook links are false. Test that `withVariant("https://spmpz.test/about_en.html#mission", "b")` preserves the path/hash and appends `variant=b`.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/variant.test.mjs`

Expected: FAIL because `isLocalHtmlLink` is not exported.

- [ ] **Step 3: Implement shared navigation propagation**

Add the pure helper and make `initializeSite` rewrite local HTML link URLs whenever the active variant changes. Do not rewrite downloads, external sources, mail links or in-page anchors. Keep behavior guarded so Node tests can import the module without a DOM.

- [ ] **Step 4: Run and commit**

Run: `node --test tests/variant.test.mjs`

Expected: all variant tests PASS.

```bash
git add js/modern-site.mjs tests/variant.test.mjs
git commit -m "feat: preserve visual variants across pages"
```

---

### Task 3: Replace homepage cards with editorial flow and add English parity

**Files:**
- Modify: `index.html`
- Replace: `english.html`
- Modify: `css/modern.css`
- Modify: `tests/homepage.test.mjs`
- Modify: `tests/full-site.test.mjs`

**Interfaces:**
- Produces: continuous `lead-story`, ruled `coverage-list`, row-based `partner-list`, vertical `project-stream`, split `about-flow`, `join-band`, and `contact-flow` patterns.
- Consumes: existing verified Twin Green copy, sources and repository-owned imagery.

- [ ] **Step 1: Add failing flow/parity assertions**

Require both homepages to contain `data-page="home"`, the Twin Green lead story, matching section IDs, a correct paired language link, and no `source-card`, `project-card`, `archive-news`, `box-shadow` on the content patterns, or card-like background declarations for their direct items.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/homepage.test.mjs tests/full-site.test.mjs`

Expected: FAIL on the old card selectors and incomplete English homepage.

- [ ] **Step 3: Refactor Polish homepage markup and styling**

Turn coverage into a numbered ruled list, partner towns into rows flowing around one central statement, projects into a vertical editorial stream with alternating text/media, and About/Contact into open columns separated by borders. Remove card shadows/background islands while keeping buttons, tags and images shaped.

- [ ] **Step 4: Build the complete English homepage**

Translate the modern content naturally, including Twin Green, partner network, projects, mission, membership and contact. Keep source URLs identical and map every local detail link to its English equivalent.

- [ ] **Step 5: Run and commit**

Run: `node --test tests/homepage.test.mjs tests/full-site.test.mjs`

Expected: homepage and shared flow tests PASS.

```bash
git add index.html english.html css/modern.css tests/homepage.test.mjs tests/full-site.test.mjs
git commit -m "feat: create flowing bilingual SPMPZ homepages"
```

---

### Task 4: Modernize all About, Partners and Contact pages

**Files:**
- Replace: `about_pl.html`, `about_en.html`, `partners_pl.html`, `partners_en.html`, `contact_pl.html`, `contact_en.html`
- Modify: `css/modern.css`
- Modify: `tests/full-site.test.mjs`

**Interfaces:**
- Produces: detail-page shell classes `page-hero`, `editorial-copy`, `directory-list`, `registry-list`, `people-list`, `page-cta`.
- Consumes: shared header/footer/controller and exact language-pair URLs.

- [ ] **Step 1: Add failing semantic content tests**

Require the association mission and 2003 founding year, all eight partner towns, contact email, KRS `0000158936`, NIP `922-26-16-692`, REGON `951194700`, and the correct language-pair anchor on each page.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/full-site.test.mjs`

Expected: FAIL because legacy pages lack the new shell/classes.

- [ ] **Step 3: Replace the six pages**

Use open typography, horizontal rules and alternating columns. Partners are directory rows, registry data are definition-list rows, and board members are a plain ruled list. Improve malformed/awkward English while preserving factual meaning. Do not invent new office holders.

- [ ] **Step 4: Run and commit**

Run: `node --test tests/full-site.test.mjs`

Expected: all implemented page families PASS.

```bash
git add about_*.html partners_*.html contact_*.html css/modern.css tests/full-site.test.mjs
git commit -m "feat: modernize bilingual association pages"
```

---

### Task 5: Modernize Projects, archives and project detail pages

**Files:**
- Replace: `projects_pl.html`, `projects_en.html`, `projects_history_pl.html`, `migration_project_pl.html`, `migration_project_en.html`, `weaving.html`
- Create: `projects_history_en.html`, `weaving_pl.html`
- Modify: `css/modern.css`
- Modify: `tests/full-site.test.mjs`

**Interfaces:**
- Produces: `project-index`, `project-chapter`, `timeline`, `media-strip`, and `download-link` editorial patterns.
- Consumes: existing project facts, local images, `migration.pdf`, `Final report/index.html`, and social/project links.

- [ ] **Step 1: Add failing project parity tests**

Require Youth for Europe, Migration and Integration, Loughborough exchange, Weaving Webs and the historical Eeklo/Kiskunfélegyháza/Mangala entries in both languages. Require all PDF/report/image targets to exist locally.

- [ ] **Step 2: Run and confirm failure**

Run: `node --test tests/full-site.test.mjs`

Expected: FAIL because English history and Polish Weaving pages do not exist.

- [ ] **Step 3: Replace and translate the project pages**

Use a numbered project index, long-form chapters with readable measure, a chronological ruled timeline and full-width image strips. Remove placeholder `AAA` and `href="#"` entries. Preserve historical dates and statements; translate missing counterparts naturally without adding unverified facts.

- [ ] **Step 4: Run and commit**

Run: `node --test tests/full-site.test.mjs`

Expected: all canonical page, content and local-target tests PASS.

```bash
git add projects_*.html migration_project_*.html weaving*.html css/modern.css tests/full-site.test.mjs
git commit -m "feat: modernize bilingual project archive"
```

---

### Task 6: Preserve aliases, synchronize GPT Sites and verify

**Files:**
- Replace: `index_en.html`, `index_enn.html`, `en/index.html`
- Update: `sites-preview/public/spmpz/**`
- Modify: `README.md`

**Interfaces:**
- Produces: compatibility redirects and a GPT Sites artifact identical to the validated canonical source.
- Consumes: all canonical pages and shared assets completed above.

- [ ] **Step 1: Implement compatible English entry redirects**

Each alias uses a canonical link, an immediate meta refresh and a small inline script that forwards `location.search` and `location.hash` to the correct relative `english.html`. Include a visible fallback link.

- [ ] **Step 2: Add alias and global link verification**

Require every alias to name `english.html`, every canonical language pair to be reciprocal, all local targets to exist, and every canonical page to avoid insecure `http://` resources.

- [ ] **Step 3: Run the complete static-site suite**

Run: `node --test`

Expected: all tests PASS with zero failures.

- [ ] **Step 4: Synchronize and build GPT Sites**

Copy the validated canonical HTML, `css/modern.css`, `js/modern-site.mjs`, required images and documents into `sites-preview/public/spmpz/`. Run:

```bash
npm --prefix sites-preview run lint
npm --prefix sites-preview run build
npm --prefix sites-preview audit --omit=dev
```

Expected: lint/build exit 0 and audit reports zero vulnerabilities.

- [ ] **Step 5: Perform final checks and publish one update**

Run `git diff --check`, verify both variants at desktop/mobile widths, commit the synchronized preview, push the same feature branch and update the existing private GPT Sites project with one new saved version/deployment.

```bash
git add README.md index_en.html index_enn.html en/index.html sites-preview
git commit -m "feat: publish complete bilingual SPMPZ preview"
```
