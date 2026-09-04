# Rekomendacja hostingu i poczty dla SPMPZ

Data analizy: 2026-09-03

## Rekomendowany wariant docelowy

| Element | Rozwiązanie | Przewidywany koszt |
| --- | --- | ---: |
| Strona statyczna | GitHub Pages z własną domeną | 0 zł |
| Certyfikat HTTPS | GitHub Pages | 0 zł |
| Poczta | Google Workspace for Nonprofits | 0 zł po pozytywnej weryfikacji |
| Domena i DNS | Zachowanie obecnej delegacji lub przeniesienie do niezależnego operatora DNS | Zależnie od operatora |

SPMPZ jest zarejestrowanym stowarzyszeniem. Google wymienia polskie stowarzyszenia wśród organizacji, które mogą ubiegać się o Google for Nonprofits. Po pozytywnej weryfikacji Google Workspace for Nonprofits zapewnia pocztę we własnej domenie bez opłat za użytkownika.

Źródła:

- [Google Workspace for Nonprofits](https://www.google.com/nonprofits/offerings/workspace/)
- [Warunki kwalifikacji Google for Nonprofits dla Polski](https://support.google.com/nonprofits/answer/3215869?hl=pl)
- [Własna domena w GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

## Obecny stan techniczny

Publiczne rekordy DNS sprawdzone 2026-09-03 nie wskazują na infrastrukturę nazwa.pl:

- `spmpz.zamosc.pl` wskazuje na `195.78.67.29`,
- odwrotny DNS tego adresu wskazuje na `s154.cyber-folks.pl`,
- serwery DNS subdomeny to `dns1.linuxpl.com` i `dns2.linuxpl.com`,
- poczta jest kierowana do `mail.spmpz.zamosc.pl`, również pod adresem `195.78.67.29`,
- SPF korzysta z `spf.linuxpl.com`,
- witryna nie ma obecnie prawidłowego certyfikatu TLS dla `spmpz.zamosc.pl`; serwer przedstawia certyfikat dla `*.cyber-folks.pl`.

Może to oznaczać, że hosting został wcześniej przeniesiony, usługa w nazwa.pl dotyczy innego zasobu albo nadal opłacana jest usługa, z której SPMPZ już nie korzysta. Przed wypowiedzeniem jakiejkolwiek umowy trzeba porównać ten stan z panelem klienta i ostatnimi fakturami.

## Bezpieczna kolejność migracji

1. Ustalić faktycznego dostawcę, zakres obecnej umowy, termin odnowienia i koszt.
2. Spisać wszystkie skrzynki, aliasy, przekierowania oraz zajętość poczty.
3. Złożyć wniosek do Google for Nonprofits i uruchomić Google Workspace.
4. Utworzyć konta oraz aliasy i skopiować dotychczasową pocztę przez IMAP.
5. Skonfigurować i zweryfikować rekordy MX, SPF, DKIM i DMARC.
6. Opublikować stronę na GitHub Pages i przypisać `spmpz.zamosc.pl` jako własną domenę.
7. Przez co najmniej kilka dni monitorować stronę i dostarczanie poczty, pozostawiając stary serwer aktywny.
8. Dopiero po pozytywnych testach wypowiedzieć zbędny hosting.

## Warunki konieczne przed rezygnacją z hostingu

- działają wszystkie używane skrzynki, aliasy i przekierowania,
- stare wiadomości zostały przeniesione i sprawdzone,
- wysyłanie oraz odbieranie poczty działa z zewnętrznych domen,
- strona działa pod docelową domeną przez HTTPS,
- wiadomo, kto będzie utrzymywał DNS po zamknięciu hostingu,
- istnieje kopia strony, plików i poczty,
- potwierdzono, że opłacana usługa nie obsługuje żadnych innych domen ani systemów.

## Wariant awaryjny

Jeśli SPMPZ nie przejdzie weryfikacji Google for Nonprofits, stronę nadal można utrzymywać bezpłatnie na GitHub Pages, a pocztę przenieść do osobnej usługi pocztowej. Przykładowo Migadu oferuje plany rozliczane za całe konto zamiast za każdą skrzynkę, ale najtańsze warianty mają niskie limity wysyłki. Wybór takiej usługi powinien nastąpić dopiero po ustaleniu liczby skrzynek, wielkości archiwum i typowego ruchu pocztowego.

## Informacje potrzebne do obliczenia oszczędności

- ostatnia faktura i cena odnowienia,
- nazwa oraz wariant opłacanej usługi,
- liczba aktywnych skrzynek i aliasów,
- rozmiar każdej skrzynki,
- informacja, czy na koncie działają inne strony lub domeny,
- informacja, kto administruje domeną nadrzędną `zamosc.pl` i delegacją `spmpz.zamosc.pl`.
