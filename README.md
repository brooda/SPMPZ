# SPMPZ

Website of Zamość Twin Towns Organization (Stowarzyszenie Przyjaciół Miast Partnerskich Zamościa).

The Polish homepage is a framework-free static site with one content source and two Genesio-based visual variants:

- `?variant=a` — green,
- `?variant=b` — blue.

The picker stores an explicit choice in `localStorage`. Without JavaScript, Variant A and all content remain available.

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

The tests verify the content contract, both variants, accessibility adaptations, URL/storage behavior, navigation behavior and local asset targets.

## Documentation

- Design: `docs/superpowers/specs/2026-09-03-spmpz-modernization-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-03-spmpz-modernization.md`
- Publishing and benchmark recommendation: `docs/recommendations/publishing-and-benchmarks.md`
- Hosting and email recommendation: `docs/hosting-and-email-recommendation.md`
