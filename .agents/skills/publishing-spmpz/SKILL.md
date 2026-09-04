---
name: publishing-spmpz
description: Use when preparing, packaging, uploading, deploying, or publishing the SPMPZ website, especially for a release intended for ordinary static hosting and manual FTP transfer.
---

# Publishing SPMPZ

## Deployment model

SPMPZ is a static website prepared locally and hosted on an ordinary web server. The repository's release artifact is the complete `dist/ftp/` directory; GPT Sites and GitHub Pages are not the production deployment target.

Local packaging and remote uploading are separate actions. Do not infer permission to connect to a server from a request to implement, build, test, or prepare the website.

**REQUIRED SUB-SKILL:** Use `managing-spmpz-galleries` when the change adds, updates, removes, or troubleshoots meeting photos or galleries.

## Decision table

| User request | Finish at |
|---|---|
| Implement, change, or fix the site | Verified working tree; package only when requested or useful for the stated handoff. |
| Prepare for FTP or publication | Run `npm run package:ftp`, verify it, and return the local `dist/ftp/` path. |
| Upload or publish to the hosting server | Proceed only after an explicit upload request and sufficient server, destination, and access information. |
| Review, analysis, status, or explanation | Read-only answer. |

## FTP release

`npm run package:ftp` rebuilds galleries and creates a complete static copy of the website. The package includes public HTML, CSS, JavaScript, optimized images, PDFs, report directories, and `.htaccess`. It excludes original gallery sources and development files.

The manual FTP step uploads the **contents** of `dist/ftp/` into the hosting web root while preserving its directory structure. The command itself never opens an FTP connection and never uploads files.

## Completion checks

For a local FTP handoff, run the project tests, `git diff --check`, build the package, and confirm representative HTML, CSS, JavaScript, image, and document files are present while development sources are absent.

For an actual remote upload, also verify the deployed pages at the public URL. Never claim “uploaded” or “published” from a successful local build or package alone.
