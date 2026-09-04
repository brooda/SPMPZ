# SPMPZ

Website of Zamość Twin Towns Organization (Stowarzyszenie Przyjaciół Miast Partnerskich Zamościa).

The site is a framework-free, bilingual static experience. Every Polish and English page shares a flowing Genesio-based presentation with four visual variants:

- `?variant=a` — green,
- `?variant=b` — blue,
- `?variant=c` — Zamość fortress,
- `?variant=d` — Europe.

The picker stores an explicit choice in `localStorage`. Without JavaScript, Variant A and all content remain available.

The canonical English homepage is `english.html`; the older `index_en.html`, `index_enn.html` and `en/index.html` addresses redirect to it. The committed HTML files are the source of truth. After editing them, run the synchronization command below to rebuild galleries and update the local Sites preview without regenerating page copy:

```bash
npm run render:pages
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

## Lokalne galerie i publikacja przez FTP

Galerie są przygotowywane na komputerze i publikowane jako zwykłe pliki statyczne. Serwer nie potrzebuje PHP, bazy danych ani panelu administracyjnego.

Jednorazowo zainstaluj narzędzie do optymalizacji zdjęć:

```bash
npm install
```

Każda galeria ma osobny katalog:

```text
gallery-sources/<identyfikator>/
├── gallery.json
└── originals/
    ├── pierwsze-zdjecie.jpg
    └── drugie-zdjecie.jpg
```

`gallery.json` wskazuje polską i angielską nazwę galerii, strony spotkania oraz kolejność zdjęć, opisy alternatywne, podpisy i źródło. W stronach docelowych musi znajdować się pusty slot:

```html
<!-- gallery:<identyfikator>:start --><!-- gallery:<identyfikator>:end -->
```

Pole `photos` może być pustą tablicą. Wtedy generator usuwa wcześniejszą zawartość slotu i nie pozostawia na stronie pustej sekcji galerii. Gotowy przykład znajduje się w `gallery-sources/twin-green-2026/`.

Do podglądu po samej zmianie galerii uruchom:

```bash
npm run build:galleries
```

Generator najpierw sprawdza komplet źródeł, stron i znaczników, a dopiero potem aktualizuje pliki. Tworzy dla każdego zdjęcia miniaturę i większy plik WebP w `images/meetings/<identyfikator>/`, usuwa metadane EXIF, osadza dostępny HTML w obu wersjach językowych i synchronizuje lokalny podgląd `sites-preview`.

Przed wysłaniem strony na hosting uruchom:

```bash
npm run package:ftp
```

Na serwer FTP wyślij **zawartość** katalogu `dist/ftp/`. Pakiet zawiera stronę i zoptymalizowane zdjęcia, ale celowo pomija oryginały z `gallery-sources/`, testy, dokumentację i narzędzia deweloperskie.

## Documentation

- Design: `docs/superpowers/specs/2026-09-03-spmpz-modernization-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-03-spmpz-modernization.md`
- Full-site flow plan: `docs/superpowers/plans/2026-09-03-spmpz-full-site-flow.md`
- Publishing and benchmark recommendation: `docs/recommendations/publishing-and-benchmarks.md`
- Hosting and email recommendation: `docs/hosting-and-email-recommendation.md`
