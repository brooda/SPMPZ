# Modernizacja strony SPMPZ — projekt

Data: 2026-09-03

## Cel

Zastąpić przestarzałą stronę główną SPMPZ jedną nowoczesną, responsywną stroną, która przedstawia bieżące działania stowarzyszenia i pozwala porównać dwa wyraźnie różne kierunki wizualne. Strona ma pozostać prosta w hostowaniu na GitHub Pages i nie będzie zależna od Jekylla ani innego generatora.

## Zakres

### Nowa strona główna

Powstanie pojedyncza, semantyczna strona HTML z sekcjami:

1. nawigacja i krótkie przedstawienie stowarzyszenia,
2. wyróżniona aktualność o projekcie Twin Green i spotkaniu w Zamościu w sierpniu 2026 r.,
3. aktualności i ważne materiały,
4. miasta oraz organizacje partnerskie,
5. najważniejsze projekty i archiwum działań,
6. misja stowarzyszenia i zaproszenie do członkostwa,
7. kontakt, dane rejestrowe i odnośniki do dokumentów.

Nawigacja będzie prowadziła do sekcji na tej samej stronie. Istniejące strony, raporty, prezentacje, zdjęcia i pliki PDF pozostaną dostępne pod obecnymi adresami. Polska strona główna nie będzie odsyłać do nieistniejących zasobów. Dotychczasowa wersja angielska pozostanie dostępna jako materiał archiwalny; jej pełna przebudowa nie wchodzi do tego zakresu.

### Dwa warianty na jednej stronie

Oba warianty wykorzystają tę samą treść i semantyczną strukturę HTML. Ich wspólną bazą jest design system Genesio / Promethic UI oparty na Material Design 3: Manrope i Inter, siatka odstępów co 4 px, role kolorystyczne powierzchni, promienie 16/24/32 px, tonalne kontenery, łagodne cienie oraz przyciski typu filled, tonal i outlined. Warianty różnią się kolorem i rozmieszczeniem najważniejszych elementów, ale pozostają częścią jednego systemu.

#### Wariant A — „Genesio Green”

- jasna zielona paleta oparta na rolach kolorystycznych MD3,
- miękkie zielone kontenery i spokojny, otwarty układ,
- dzielony hero z tekstem i fotografią Zamościa,
- karty o dużych promieniach i subtelnej elewacji,
- nacisk na relacje mieszkańców, partnerstwa i dostępność.

#### Wariant B — „Genesio Blue”

- jasna arktyczna paleta i główny niebieski kolor znany z Genesio,
- szeroki niebieski hero z fotografią w tle i białą treścią,
- bardziej uporządkowane, geometryczne karty informacyjne,
- znaczniki krajów oraz wyraźne wezwania do działania,
- ten sam język komponentów i dostępności co w wariancie zielonym.

Widoczny przełącznik A/B będzie dostępny w nagłówku. Wybór zostanie zapisany w `localStorage`. Parametr adresu `?variant=a` lub `?variant=b` pozwoli otworzyć i udostępnić konkretną wersję. Bez JavaScript strona pokaże wariant A i zachowa dostęp do całej treści.

## Treści i źródła

Najważniejszą nową aktualnością będzie zakończone 24 sierpnia 2026 r. spotkanie projektu „Twin Green” w Zamościu. Tekst zostanie napisany na podstawie:

- informacji przekazanych przez użytkownika,
- publicznych wpisów Rafała Zwolaka i Marty Pfeifer wskazanych przez użytkownika,
- dostępnych publikacji lokalnej prasy opisujących temat, uczestników i przebieg projektu.

Aktualność ma podawać tylko informacje potwierdzone przez co najmniej jedno wiarygodne źródło. Zamiast kopiowania cudzych zdjęć strona użyje materiałów już znajdujących się w repozytorium i poda bezpośrednie odnośniki do publikacji zewnętrznych. Zdjęcia własne zostaną opatrzone dostępnymi informacjami o autorstwie.

Przegląd dobrych stron podobnych stowarzyszeń posłuży do wyboru wzorców, nie do kopiowania wyglądu. Analiza oceni przede wszystkim: czytelność aktualności, prezentację miast partnerskich, kalendarz wydarzeń, członkostwo, archiwum i kontakt.

## Implementacja

Nowa część strony będzie oparta na:

- semantycznym HTML5,
- jednym głównym arkuszu CSS z tokenami i regułami obu wariantów,
- niewielkim, niezależnym skrypcie JavaScript obsługującym menu mobilne, przełącznik wariantu i zapamiętanie wyboru,
- lokalnych obrazach zoptymalizowanych do zastosowań internetowych,
- zerowej liczbie wymaganych zależności uruchomieniowych.

Treść pozostanie czytelna w HTML, co zapewni indeksowanie, dostępność i działanie bez JavaScript. Granice komponentów będą oznaczone klasami i elementami semantycznymi tak, aby później można było zasilać sekcję aktualności z CMS bez przebudowy projektu wizualnego.

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

1. oba warianty na szerokościach telefonu i komputera,
2. działanie przełącznika, parametrów URL i zapamiętywania wyboru,
3. mobilna nawigacja i obsługa klawiaturą,
4. wszystkie lokalne oraz zewnętrzne odnośniki,
5. brak błędów JavaScript i brak mieszanej zawartości HTTP,
6. czytelność oraz kadrowanie obrazów,
7. podstawowa walidacja HTML i kontrola dostępności.

## Prezentacja w GPT Sites

Po ukończeniu i lokalnej weryfikacji strona zostanie także przygotowana i opublikowana jako podgląd w GPT Sites. Podgląd ma prezentować te same dwa warianty i tę samą zweryfikowaną treść. Repozytorium GitHub pozostaje źródłem kodu strony; GPT Sites pełni rolę wygodnej demonstracji i miejsca do porównania wariantów.

## Analiza publikowania przez członków

System publikacji wieloautorskiej nie zostanie wdrożony w tej zmianie. Po ukończeniu strony powstanie osobna analiza rozwiązania, które pozwoli uprawnionym osobom edytować wszystkie strony i kolekcje treści — nie tylko dodawać aktualności. Zakres panelu obejmie stronę główną, O nas, partnerów, projekty, kontakt, nawigację, dokumenty oraz posty. Analiza porówna co najmniej:

- panel CMS zapisujący zatwierdzone treści do repozytorium,
- zewnętrzny CMS z kontami redaktorów,
- formularz zgłoszeniowy z moderacją przed publikacją.

Porównanie obejmie łatwość obsługi przez nietechniczne osoby, role i zatwierdzanie wpisów, bezpieczeństwo kont, kopie zapasowe, koszty, obsługę zdjęć oraz nakład administracyjny. Rekomendacja nie będzie wymagać migracji obecnej strony, jeśli wystarczy dołączenie wybranego źródła aktualności.

## Poza zakresem bieżącego prototypu

- uruchomienie kont użytkowników i panelu redakcyjnego dla wszystkich podstron,
- automatyczne importowanie wpisów z Facebooka,
- pełne tłumaczenie oraz przebudowa wszystkich stron angielskich,
- zmiana domeny i konfiguracji DNS,
- publikacja treści lub zdjęć, do których nie ma potwierdzonego prawa użycia.
