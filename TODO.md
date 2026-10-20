# TODO

## Od Bartka
- [x] Tajny adres iCal kalendarza → sekret `GCAL_ICS_URL`
- [ ] Ustalić z Bartkiem, czy ma być wolny codziennie (teraz 7 cotygodniowych „Wolne” = każdy dzień) i że rezerwacje wpisuje w TYM SAMYM kalendarzu
- [x] EmailJS: klucze w `assets/js/booking.js`
- [x] Adres do polityki prywatności
- [ ] NIP — jeśli Bartek prowadzi działalność gospodarczą (polityka prywatności)
- [ ] Linki: Facebook, Instagram, TikTok (który profil to „z góry”, który „z dołu”?) → stopka + kontakt + JSON-LD `sameAs`
- [ ] Obszar działania (miasto, dojazd) → teksty + SEO + JSON-LD `areaServed`
- [ ] Zgody na publikację wizerunku osób ze zdjęć (zwłaszcza dziecko — komunia)
- [x] Zdjęcie Bartka do „O mnie” (`assets/img/bartek-portret*.webp`, oryginał `dane/bartek-portret.jpg`)
- [ ] Czy na `fotograf-w-plenerze` (portfolio, „Za kulisami”) jest Bartek?
- [ ] Dron: czy robi zdjęcia z drona i chce to oferować? (kategoria „Z lotu ptaka”)
- [ ] Czas i forma oddania zdjęć, dojazd, zaliczka → FAQ / oferta
- [ ] Czy sesje (narzeczeńska, gender reveal, portret) mają osobny cennik?
- [ ] Więcej zdjęć do portfolio (20–40, jest 18), ewentualnie opinie klientów; oryginały w pełnej rozdzielczości zamiast z WhatsAppa (4 nowe zdjęcia z osiemnastki mają tylko 1280 px)
- [ ] Akceptacja tekstów i wyglądu

## Technika
- [x] Repozytorium `bkaczmarekfoto/bkaczmarekfoto.github.io`, Pages (GitHub Actions), sekret `GCAL_ICS_URL`
- [ ] Domena → `CNAME`, `og:url`, `og:image` (bezwzględny), `canonical`, `sitemap.xml`, `robots.txt` z adresem sitemapy
- [x] Kalendarz podłączony (dane już nie są przykładowe)
- [x] Apps Script na koncie Bartka + fine-grained token GitHub (wdrożone 14.10.2026)
- [ ] Odnowić token GitHub dla Apps Script przed wygaśnięciem (ok. październik 2027) — nowy token → Właściwości skryptu `GITHUB_TOKEN`
- [ ] EmailJS: ograniczyć domeny w Account → Security
- [ ] Lighthouse na produkcji
