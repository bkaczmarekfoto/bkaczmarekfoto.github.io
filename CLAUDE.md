# Bartosz Kaczmarek Fotografia — kontekst projektu

Wspólny standard KubaBuba: `D:\DEV\KUBABUBA_WORK\CLAUDE.md`. Tu tylko to, co specyficzne dla klienta.

## Klient
- **Bartosz Kaczmarek** — młody fotograf eventowy: reportaż z imprez okolicznościowych (urodziny, osiemnastki, komunie), sesje narzeczeńskie, gender reveal, portrety.
- Tel. +48 694 609 476 · foto.bkaczmarek@gmail.com (dedykowane konto Google — kalendarz + docelowo EmailJS).
- Repozytorium: **bkaczmarekfoto/bkaczmarekfoto.github.io** (organizacja GitHub `bkaczmarekfoto`, właściciel: konto Kuby commitpanic; branch `main`).
- Strona (DEV, docelowo do czasu własnej domeny): https://bkaczmarekfoto.github.io/
- Brief i otwarte kwestie: `data.md`. Materiały źródłowe (logo, zdjęcia z Canvy): `dane/` — nie trafia do repo/na stronę.
- Zawód nieregulowany — można pisać sprzedażowo, ale bez przesady i bez obietnic, których Bartek nie potwierdził (np. dron, czas oddania zdjęć).

## Decyzje
- Header/stopka jak w Filar (`assets/js/components.js`, pasek dostępności), treść pod fotografa: rozbudowane portfolio (filtry + lightbox na `<dialog>`), cennik pakietów, kalendarz.
- Kolory z logo: tło #E1E1D6, taupe #8C7E64 (tekst/przyciski ciemniejsze `--color-primary` #6b604c dla kontrastu). Nagłówki: Palatino Linotype/Palatino → Georgia (tylko kroje z polskimi znakami — Bodoni MT/Didot ich nie mają). Pionowe zdjęcia w przyciętych kaflach: klasa `img-top`.
- Strony z jasnym `page-hero` mają `<body class="nav-solid">` (nawigacja od razu na jasnym tle).
- **Kalendarz wolnych terminów** (decyzja Kuby 12.10.2026):
  - Kalendarz Google jest tylko źródłem danych. Bartek oznacza **wolne** dni wydarzeniem „Wolne”/„Wolny”/„Dostępny” (całodniowe lub z godzinami, może być cykliczne). Dzień wolny = ma znacznik i nie ma innego blokującego wydarzenia.
  - `scripts/build-availability.mjs` (Node, zero zależności, parser iCal z RRULE/EXDATE/RECURRENCE-ID) → `assets/data/availability.json` (tylko daty + godziny ze znacznika).
  - `.github/workflows/pages.yml`: co 15 min (realnie rzadziej — GitHub pomija część przebiegów) pobiera tajny adres iCal (sekret `GCAL_ICS_URL`), commituje JSON tylko przy zmianie (+ heartbeat co 7 dni, żeby GitHub nie wyłączył crona po 60 dniach), deployuje Pages przez Actions (bez `dane/`, `scripts/`, `*.md`).
  - Front: `assets/js/calendar.js` — zielony dzień z „+” → zdarzenie `booking:open` → `assets/js/booking.js` otwiera modal z formularzem (data wpisana; imię; e-mail **lub** telefon; rodzaj zdjęć; pakiet; RODO; honeypot `website`). EmailJS SDK ładowany leniwie przy otwarciu modala.
  - Rezerwacja NIE jest automatyczna — Bartek dostaje maila i sam nanosi zmiany w kalendarzu.
  - Cron GitHuba przy „co godzinę” odpalał się realnie co 4–8 h → od 14.10.2026 `*/15`. Cron mimo to nie odpalał (GitHub porzuca przebiegi), więc **od 14.10.2026 wdrożony** Google Apps Script na koncie foto.bkaczmarek@gmail.com, projekt „Synchronizacja strony”, kalendarz „Bartosz Kaczmarek” (`scripts/apps-script/Synchronizacja.gs`): wyzwalacz kalendarza → po 3 min `workflow_dispatch` (fine-grained PAT z konta commitpanic, owner `bkaczmarekfoto`, tylko Actions: write na tym repo, we Właściwościach skryptu jako `GITHUB_TOKEN`; ważny ok. rok — odnowić). Cron `*/15` zostaje jako zapas. Instrukcja w README.
  - Diagnoza: ręczny workflow z `debug=true` (bez tytułów; przy „inne” bez godzin — log jest publiczny).
- Test parsera: `node scripts/build-availability.mjs --ics scripts/test/przyklad.ics --today 2026-10-12 --out <plik> --force`.

## Otwarte kwestie
Patrz `TODO.md` i pola ❓ w `data.md`.
