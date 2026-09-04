# Modernizacja strony SPMPZ — projekt

Data: 2026-09-03

## Cel

Zastąpić przestarzałą witrynę SPMPZ spójną, nowoczesną i responsywną stroną polsko-angielską. Strona główna ma prowadzić czytelnika przez jedną płynną opowieść, a wszystkie podstrony mają korzystać z tego samego języka wizualnego oraz dwóch wariantów Genesio. Witryna ma pozostać prosta w hostowaniu na GitHub Pages i nie będzie zależna od Jekylla ani innego generatora w czasie działania.

## Zakres

### Strona główna i płynny układ

Powstanie pojedyncza, semantyczna strona HTML z sekcjami:

1. nawigacja i krótkie przedstawienie stowarzyszenia,
2. wyróżniona aktualność o projekcie Twin Green i spotkaniu w Zamościu w sierpniu 2026 r.,
3. aktualności i ważne materiały,
4. miasta oraz organizacje partnerskie,
5. najważniejsze projekty i archiwum działań,
6. misja stowarzyszenia i zaproszenie do członkostwa,
7. kontakt, dane rejestrowe i odnośniki do dokumentów.

Nawigacja strony głównej będzie prowadziła do sekcji na tej samej stronie. Układ nie może przypominać dashboardu ani kolekcji niezależnych kart. Kolejne treści tworzą redakcyjny flow za pomocą szerokich pasów, zmiennego rytmu tekst–obraz, dużych nagłówków, linii podziału, numeracji i kontrolowanego oddechu. Zaokrąglenia pozostaną głównie na obrazach, przyciskach i elementach sterujących; zwykła treść nie będzie zamykana w osobnych pudełkach ani unoszona cieniem.

### Pełna mapa podstron PL/EN

Modernizacja obejmuje wszystkie publiczne strony informacyjne i ich angielskie odpowiedniki:

| Obszar | Polski adres | Angielski adres |
| --- | --- | --- |
| Strona główna | `index.html` | `english.html` |
| O stowarzyszeniu | `about_pl.html` | `about_en.html` |
| Partnerzy | `partners_pl.html` | `partners_en.html` |
| Projekty | `projects_pl.html` | `projects_en.html` |
| Historia projektów | `projects_history_pl.html` | `projects_history_en.html` |
| Migration and Integration | `migration_project_pl.html` | `migration_project_en.html` |
| Weaving Webs | `weaving_pl.html` | `weaving.html` |
| Kontakt | `contact_pl.html` | `contact_en.html` |

`index_en.html`, `index_enn.html` i `en/index.html` pozostaną kompatybilnymi wejściami do angielskiej strony głównej, ale nie będą utrzymywać trzeciej kopii treści. Raporty, prezentacje, zdjęcia i pliki PDF pozostaną dostępne pod obecnymi adresami. Strony raportów zachowają charakter archiwalny, ale otrzymają czytelną drogę powrotu do bieżącej witryny.

Każda podstrona otrzyma wspólny nagłówek, stopkę, nawigację, przełącznik języka i przełącznik wariantu. Przełącznik języka prowadzi do semantycznego odpowiednika bieżącej strony, a nie zawsze do strony głównej. Tłumaczenie angielskie zachowuje tę samą informację i hierarchię, ale może stosować naturalne angielskie sformułowania zamiast tłumaczenia słowo w słowo.

### Dwa warianty na jednej stronie

Oba warianty wykorzystają tę samą treść i semantyczną strukturę HTML. Ich wspólną bazą jest design system Genesio / Promethic UI oparty na Material Design 3: Manrope i Inter, siatka odstępów co 4 px, role kolorystyczne powierzchni, promienie 16/24/32 px, tonalne kontenery, łagodne cienie oraz przyciski typu filled, tonal i outlined. Warianty różnią się kolorem i rozmieszczeniem najważniejszych elementów, ale pozostają częścią jednego systemu.

#### Wariant A — „Genesio Green”

- jasna zielona paleta oparta na rolach kolorystycznych MD3,
- spokojny, otwarty układ redakcyjny z asymetrycznymi przesunięciami,
- dzielony hero z tekstem i fotografią Zamościa,
- duże pola koloru, fotografie oraz sekcje oddzielone rytmem i liniami zamiast kart,
- nacisk na relacje mieszkańców, partnerstwa i dostępność.

#### Wariant B — „Genesio Blue”

- jasna arktyczna paleta i główny niebieski kolor znany z Genesio,
- szeroki niebieski hero z fotografią w tle i białą treścią,
- bardziej uporządkowana, geometryczna siatka redakcyjna i mocniejsze linie podziału,
- znaczniki krajów oraz wyraźne wezwania do działania,
- ten sam język komponentów i dostępności co w wariancie zielonym.

Widoczny przełącznik A/B będzie dostępny w nagłówku każdej strony. Wybór zostanie zapisany w `localStorage`. Parametr adresu `?variant=a` lub `?variant=b` pozwoli otworzyć i udostępnić konkretną wersję, a nawigacja wewnętrzna i przełącznik języka zachowają aktywny wariant. Bez JavaScript każda strona pokaże wariant A i zachowa dostęp do całej treści.

## Treści i źródła

Najważniejszą nową aktualnością będzie zakończone 24 sierpnia 2026 r. spotkanie projektu „Twin Green” w Zamościu. Tekst zostanie napisany na podstawie:

- informacji przekazanych przez użytkownika,
- publicznych wpisów Rafała Zwolaka i Marty Pfeifer wskazanych przez użytkownika,
- dostępnych publikacji lokalnej prasy opisujących temat, uczestników i przebieg projektu.

Aktualność ma podawać tylko informacje potwierdzone przez co najmniej jedno wiarygodne źródło. Zamiast kopiowania cudzych zdjęć strona użyje materiałów już znajdujących się w repozytorium i poda bezpośrednie odnośniki do publikacji zewnętrznych. Zdjęcia własne zostaną opatrzone dostępnymi informacjami o autorstwie.

Przegląd dobrych stron podobnych stowarzyszeń posłuży do wyboru wzorców, nie do kopiowania wyglądu. Analiza oceni przede wszystkim: czytelność aktualności, prezentację miast partnerskich, kalendarz wydarzeń, członkostwo, archiwum i kontakt.

## Implementacja

Cała witryna będzie oparta na:

- semantycznym HTML5,
- jednym głównym arkuszu CSS z tokenami, układami redakcyjnymi i regułami obu wariantów,
- niewielkim, niezależnym skrypcie JavaScript obsługującym menu mobilne, przełącznik wariantu i zapamiętanie wyboru,
- lokalnych obrazach zoptymalizowanych do zastosowań internetowych,
- zerowej liczbie wymaganych zależności uruchomieniowych.

Treść pozostanie czytelna w HTML, co zapewni indeksowanie, dostępność i działanie bez JavaScript. Wspólne wzorce podstron obejmą: hero podstrony, redakcyjne kolumny treści, cytat lub wyróżnioną liczbę, listę wierszową, oś czasu, galerię oraz pas wezwania do działania. Granice komponentów będą oznaczone klasami i elementami semantycznymi tak, aby później można było zasilać każdą stronę i sekcję z CMS bez przebudowy projektu wizualnego.

Stare pliki Jekylla nie będą wykorzystywane przez nową stronę. Ich usunięcie nie jest konieczne dla działania projektu i nie nastąpi w tej zmianie, chyba że test odnośników wykaże, że można je bezpiecznie usunąć bez utraty archiwalnej zawartości.

## Dostępność i zachowanie

- pełna obsługa klawiaturą,
- widoczne stany fokusu,
- właściwa hierarchia nagłówków i etykiety elementów sterujących,
- tekst alternatywny dla zdjęć,
- respektowanie `prefers-reduced-motion`,
- kontrast tekstu zgodny co najmniej z WCAG AA,
- responsywne układy dla telefonu, tabletu i komputera,
- brak polegania wyłącznie na kolorze przy przekazywaniu informacji.

## Weryfikacja

Przed zakończeniem zostaną sprawdzone:

1. oba warianty na szerokościach telefonu i komputera dla każdej strony,
2. działanie przełącznika, parametrów URL i zapamiętywania wyboru,
3. mobilna nawigacja i obsługa klawiaturą,
4. wszystkie lokalne oraz zewnętrzne odnośniki i pary językowe,
5. brak błędów JavaScript i brak mieszanej zawartości HTTP,
6. czytelność oraz kadrowanie obrazów,
7. podstawowa walidacja HTML i kontrola dostępności.

## Prezentacja w GPT Sites

Po ukończeniu i lokalnej weryfikacji pełna witryna zostanie także zaktualizowana w GPT Sites. Podgląd ma prezentować oba języki, wszystkie podstrony, te same dwa warianty i tę samą zweryfikowaną treść. Repozytorium GitHub pozostaje źródłem kodu strony; GPT Sites pełni rolę wygodnej demonstracji i miejsca do porównania wariantów.

## Analiza publikowania przez członków

System publikacji wieloautorskiej nie zostanie wdrożony w tej zmianie. Po ukończeniu strony powstanie osobna analiza rozwiązania, które pozwoli uprawnionym osobom edytować wszystkie strony i kolekcje treści — nie tylko dodawać aktualności. Zakres panelu obejmie stronę główną, O nas, partnerów, projekty, kontakt, nawigację, dokumenty oraz posty. Analiza porówna co najmniej:

- panel CMS zapisujący zatwierdzone treści do repozytorium,
- zewnętrzny CMS z kontami redaktorów,
- formularz zgłoszeniowy z moderacją przed publikacją.

Porównanie obejmie łatwość obsługi przez nietechniczne osoby, role i zatwierdzanie wpisów, bezpieczeństwo kont, kopie zapasowe, koszty, obsługę zdjęć oraz nakład administracyjny. Rekomendacja nie będzie wymagać migracji obecnej strony, jeśli wystarczy dołączenie wybranego źródła aktualności.

## Poza zakresem bieżącego prototypu

- uruchomienie kont użytkowników i panelu redakcyjnego dla wszystkich podstron,
- automatyczne importowanie wpisów z Facebooka,
- zmiana domeny i konfiguracji DNS,
- publikacja treści lub zdjęć, do których nie ma potwierdzonego prawa użycia.
