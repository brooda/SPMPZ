---
name: managing-spmpz-galleries
description: Use when adding, changing, removing, rebuilding, or troubleshooting meeting photo galleries in the SPMPZ repository, including work from local photos and preparation for manual FTP transfer.
---

# Managing SPMPZ Galleries

## Overview

Treat `gallery-sources/<gallery-id>/gallery.json` and its `originals/` directory as the source of truth. Generated HTML and WebP files are outputs, not editing surfaces.

## Workflow

1. Identify the intended meeting and its Polish and English target pages. Do not assume the photos belong to the current Twin Green story merely because it is the existing example.
2. Inspect every supplied image for content, orientation, duplicates, and publication suitability. Copy selected originals into `gallery-sources/<gallery-id>/originals/`; do not move or alter the user's source files.
3. Create or update `gallery.json`. Use lowercase IDs with digits and hyphens. Every photo needs a source basename, factual `alt.pl` and `alt.en`, and a verified credit. Captions are optional but, when present, need both languages. Never invent a photographer or ownership credit; ask when the repository context does not establish it.
4. Ensure each configured target page contains exactly one matching slot:

```html
<!-- gallery:<gallery-id>:start --><!-- gallery:<gallery-id>:end -->
```

5. Run `npm run build:galleries`. Inspect both target pages and the generated files in `images/meetings/<gallery-id>/`.
6. Run `npm test` and `git diff --check`. When regenerating shared pages, use `npm run render:pages`; it rebuilds galleries afterward.

## Optional-gallery states

| Situation | Representation |
|---|---|
| Meeting has no gallery | No manifest and no gallery slot are required. |
| Existing gallery has no photos yet | Keep the manifest and set `"photos": []`; the slot remains invisible. |
| Gallery is removed | Remove its manifest, run the builder, and confirm stale markup and generated images disappeared. |
| Gallery moves to another page | Add the new slot, update `pages`, run the builder, and confirm the old slot was cleared. |

## FTP handoff

Run `npm run package:ftp` only when an FTP-ready release is requested. It rebuilds galleries and creates a complete local static site in `dist/ftp/`, including HTML, CSS, JavaScript, optimized images, PDFs, reports, and `.htaccess`. It excludes gallery originals and development files.

`package:ftp` does not connect to a server and does not upload anything. Uploading the **contents** of `dist/ftp/` to the hosting web root is a separate action that requires an explicit user request and the relevant server access.

## Common mistakes

- Do not hand-edit content between gallery markers; regeneration overwrites it.
- Do not edit `dist/ftp/`; change source files and rebuild the package.
- Do not publish `gallery-sources/` or original photos.
- Do not report “uploaded” or “published” after merely creating `dist/ftp/`.
