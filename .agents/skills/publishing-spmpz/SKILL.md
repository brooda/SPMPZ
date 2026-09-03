---
name: publishing-spmpz
description: Use when implementing, validating, saving, or publishing changes to the SPMPZ website or its GPT Sites deployment.
---

# Publishing SPMPZ

## Core rule

An explicit request to implement a change to the SPMPZ website includes publishing the validated result to its existing live destination. Complete the full path: update both the canonical site and `sites-preview`, test, build, commit, push, save the Sites version, and deploy it. Do not stop at a local build or saved version and do not ask a redundant publishing question.

This default does not authorize changing the audience, access policy, slug, domain, secrets, or hosting provider.

## Decision table

| User request | Finish at |
|---|---|
| Implement/change/fix the SPMPZ site | Existing live deployment |
| “Local only”, draft, or preview | Requested non-production state |
| Review, analysis, status, or explanation | Read-only answer |
| Build/test/deployment failure | Safe stopping point with the failure reported |

If a platform explicitly requires fresh approval despite this project preference, request only that mandatory confirmation immediately before deployment.

## Completion check

Confirm the deployed version succeeded and return the live URL. Never claim publication from a successful build, push, or saved version alone.
