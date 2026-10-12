# Bartosz Kaczmarek Fotografia

Strona wizytówka fotografa: statyczny HTML + CSS + Vanilla JS, kalendarz wolnych terminów zasilany z Kalendarza Google, formularz rezerwacji przez EmailJS.

## Struktura

```
/
├── index.html                 # strona główna (hero, o mnie, usługi, mozaika, kalendarz, CTA)
├── o-mnie.html
├── portfolio.html             # galeria z filtrami + lightbox
├── oferta.html                # usługi, cennik, współpraca, FAQ
├── kontakt.html               # kalendarz wolnych terminów + dane kontaktowe
├── polityka-prywatnosci.html
├── favicon.png, apple-touch-icon.png
├── assets/
│   ├── css/style.css
│   ├── js/components.js       # wspólny header/footer + pasek dostępności
│   ├── js/main.js             # animacje, FAQ, galeria, lightbox
│   ├── js/calendar.js         # widok kalendarza (czyta availability.json)
│   ├── js/booking.js          # modal z formularzem + EmailJS
│   ├── data/availability.json # generowany automatycznie — nie edytować ręcznie
│   └── img/
├── scripts/
│   ├── build-availability.mjs # iCal → availability.json (Node 18+, bez zależności)
│   └── test/przyklad.ics      # przykładowy kalendarz do testów
├── .github/workflows/pages.yml
└── dane/                      # materiały źródłowe od klienta (nie publikujemy)
```

Podgląd lokalny (kalendarz wymaga serwera HTTP, nie działa z `file://`):

```bash
python -m http.server 8742
```

## Kalendarz wolnych terminów

### Jak to działa
1. Bartek w Kalendarzu Google (dedykowane konto) dodaje wydarzenie **„Wolne”** w dni, w które może przyjąć zlecenie — całodniowe albo z godzinami (np. 14:00–20:00). Może ustawić je cyklicznie, np. „co sobotę”.
2. Co godzinę GitHub Actions pobiera kalendarz (tajny adres iCal), a skrypt `scripts/build-availability.mjs` wylicza wolne dni i zapisuje `assets/data/availability.json` — **tylko daty**, bez tytułów, opisów i miejsc.
3. Na stronie wolny dzień jest zielony z „+”. Kliknięcie otwiera formularz z wpisaną datą; zapytanie trafia mailem do Bartka.
4. Po dogadaniu się z klientem Bartek dopisuje rezerwację w kalendarzu (albo usuwa „Wolne”) — w ciągu ok. godziny dzień znika ze strony.

### Reguły
- Dzień jest wolny, jeśli ma wydarzenie zaczynające się od **Wolne / Wolny / Dostępny** (wielkość liter i polskie znaki bez znaczenia) **i nie ma żadnego innego wydarzenia**.
- Wydarzenia ustawione jako „Pokaż jako: dostępny” (np. przypomnienia) nie blokują dnia.
- Odwołane wydarzenia są ignorowane. Obsługiwane są wydarzenia cykliczne, wyjątki i przesunięte pojedyncze wystąpienia.
- Zakres: 12 miesięcy do przodu.

### Konfiguracja (jednorazowo)
1. Kalendarz Google Bartka → Ustawienia → wybrany kalendarz → **„Tajny adres w formacie iCal”** → skopiować.
2. Repo na GitHubie → Settings → Secrets and variables → Actions → **New repository secret**: `GCAL_ICS_URL` = skopiowany adres.
3. Settings → Pages → Source: **GitHub Actions**.
4. Actions → „Strona i wolne terminy” → **Run workflow** (pierwsze uruchomienie ręcznie).

Tajny adres daje dostęp do pełnej treści kalendarza — nie wklejać go nigdzie poza sekretem repo. Jeśli wycieknie: w ustawieniach kalendarza „Zresetuj” i podmienić sekret.

### Uwagi
- Workflow commituje `availability.json` tylko przy zmianie oraz raz na 7 dni (heartbeat), żeby GitHub nie wyłączył harmonogramu po 60 dniach bez aktywności. Jeśli dane są starsze niż 3 dni, kalendarz na stronie pokazuje ostrzeżenie.
- Harmonogram GitHub Actions bywa opóźniony o kilka–kilkanaście minut.
- Błąd pobierania (np. zresetowany adres) = czerwony workflow + mail z GitHuba; strona pokazuje ostatnie poprawne dane.
- Test lokalny parsera:
  ```bash
  node scripts/build-availability.mjs --ics scripts/test/przyklad.ics --today 2026-10-12 --out /tmp/test.json --force
  ```

## Formularz (EmailJS)

GitHub Pages nie ma backendu, więc formularz wysyła wiadomości przez [EmailJS](https://www.emailjs.com). Identyfikatory są w `assets/js/booking.js` (`EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`). Klucz publiczny EmailJS jest z założenia jawny. SDK ładuje się dopiero po otwarciu formularza.

Zmienne szablonu: `{{name}}`, `{{email}}`, `{{reply_to}}`, `{{phone}}`, `{{event_date}}`, `{{event_hours}}`, `{{event_type}}`, `{{package}}`, `{{message}}`, `{{page}}`, `{{time}}`.

Propozycja tematu maila: `Zapytanie o termin: {{event_date}} — {{name}}`.

Ochrona przed spamem: ukryte pole-pułapka `website` + w panelu EmailJS (Account → Security) ograniczenie domen do adresu strony.

## Portfolio — dodawanie zdjęć

1. Wersja pełna (maks. 1600 px dłuższy bok) i miniatura `-sm` (maks. 720 px), format `.webp`, do `assets/img/portfolio/`.
2. W `portfolio.html` skopiować jeden `<figure class="gallery-item">`, ustawić `data-category` (`wydarzenia`, `portrety`, `plener`, `z-gory`; kilka oddzielonych spacją), `data-full`, `alt` i podpis.

## Deploy

Push na `main` → GitHub Actions → GitHub Pages. Publikowane są pliki strony bez `dane/`, `scripts/`, `.github/` i `*.md`.
