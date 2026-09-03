# SPMPZ

Website of Zamość Twin Towns Organization (Stowarzyszenie Przyjaciół Miast Partnerskich Zamościa).

The site is a framework-free, bilingual static experience. Every Polish and English page shares a flowing Genesio-based presentation with two visual variants:

- `?variant=a` — green,
- `?variant=b` — blue.

The picker stores an explicit choice in `localStorage`. Without JavaScript, Variant A and all content remain available.

The canonical English homepage is `english.html`; the older `index_en.html`, `index_enn.html` and `en/index.html` addresses redirect to it. Shared detail pages can be regenerated deterministically after editing their structured copy in `scripts/render-pages.mjs`:

```bash
node scripts/render-pages.mjs
```

## Local preview

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

## Tests

```bash
node --test
git diff --check
```

The tests verify all PL/EN page pairs, both variants, accessibility adaptations, URL/storage behavior, navigation behavior, local asset targets and parity with the GPT Sites bundle.

## Documentation

- Design: `docs/superpowers/specs/2026-09-03-spmpz-modernization-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-03-spmpz-modernization.md`
- Full-site flow plan: `docs/superpowers/plans/2026-09-03-spmpz-full-site-flow.md`
- Publishing and benchmark recommendation: `docs/recommendations/publishing-and-benchmarks.md`
- Hosting and email recommendation: `docs/hosting-and-email-recommendation.md`
