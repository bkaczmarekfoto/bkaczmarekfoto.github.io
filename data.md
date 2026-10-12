# Brief — strona wizytówka: Bartosz Kaczmarek Fotografia

> Szablon KubaBuba.pl. Oznaczenia: ✅ potwierdzone · ❓ do ustalenia z klientem · N/D nie dotyczy
> Źródła: rozmowa z Kubą (12.10.2026), dwa projekty Canva od Bartka (strona „portfolio” + ulotka), logo w `dane/`.

---

## 0. Metryka zlecenia

| Pole | Wartość |
|---|---|
| Status | w realizacji |
| Data pierwszego kontaktu | 12.10.2026 |
| Osoba kontaktowa po stronie klienta * | Bartosz Kaczmarek, tel. +48 694 609 476, foto.bkaczmarek@gmail.com ✅ |
| Kto akceptuje projekt i treści * | Bartosz Kaczmarek ❓ |
| Preferowany kanał kontaktu | ❓ |
| Termin publikacji | ❓ |
| Wycena / zaliczka / płatność | ❓ |
| Opieka po wdrożeniu | ❓ |
| Wykonanie | kubabuba.pl |

## 1. Dane klienta

| Pole | Wartość |
|---|---|
| Nazwa wyświetlana na stronie * | Bartosz Kaczmarek Fotografia ✅ |
| Pełna nazwa prawna | ❓ |
| Forma prawna / właściciel | ❓ (JDG? działalność nierejestrowana?) |
| NIP / REGON | ❓ |
| Adres * | ❓ — potrzebny tylko do polityki prywatności (nie pokazujemy na stronie) |
| Telefon(y) * | +48 694 609 476 ✅ |
| E-mail * | foto.bkaczmarek@gmail.com ✅ (w Canvie był foto.bkaczmarek@interia.pl — przyjęto gmail, wg Kuby) |
| Godziny otwarcia * | N/D — zamiast tego kalendarz wolnych terminów |
| Rejestracja online | własny kalendarz wolnych terminów (Kalendarz Google → GitHub Actions) + formularz EmailJS ✅ |
| Profil Google (Mapy) | ❓ |
| Obszar działania | ❓ (miasto / promień dojazdu — ważne dla SEO) |

### Media społecznościowe
- Facebook: „Co widział mój obiektyw - Bartosz Kaczmarek” — ❓ link
- Instagram / TikTok: Ladny_swiat_z_gory / Ladny_swiat_z_dolu — ❓ który profil jest który, linki
- Czy można pobierać treści i zdjęcia z profili? — zdjęcia i teksty z Canvy: tak ✅

## 2. Domena, poczta, hosting

| Pole | Wartość |
|---|---|
| Domena istniejąca | ❓ |
| Domena docelowa * | ❓ |
| Poczta na domenie | nie — Gmail |
| Hosting DEV | GitHub Pages (Pages source: GitHub Actions) → https://bkaczmarekfoto.github.io/ ✅ |
| Hosting PROD | GitHub Pages + CNAME albo home.pl ❓ |
| SSL | automatyczny |

## 3. Zakres strony

Struktura: kilka podstron (header/stopka jak w Filar).

- [x] Strona główna: hero, o mnie, usługi, mozaika portfolio, kalendarz, cytat, CTA
- [x] O mnie (`o-mnie.html`)
- [x] Usługi + cennik + jak wygląda współpraca + FAQ (`oferta.html`)
- [x] Portfolio z filtrami i lightboxem (`portfolio.html`)
- [x] Kalendarz wolnych terminów + kontakt (`kontakt.html`, też na stronie głównej)
- [x] Formularz zapytania w modalu (EmailJS) — wiadomości na foto.bkaczmarek@gmail.com
- [x] Polityka prywatności
- [x] Pasek dostępności (A+/A−/kontrast)
- [ ] Opinie klientów ❓ (jeśli Bartek ma — np. z FB)

## 4. Treści

| Pole | Wartość |
|---|---|
| Kto dostarcza teksty? | z Canvy Bartka, zredagowane przez KubaBuba |
| Opis działalności * | Fotograf eventowy: naturalne kadry, prawdziwe emocje, atmosfera wydarzenia ✅ |
| Grupa docelowa | rodziny organizujące urodziny, osiemnastki, komunie; pary (sesje narzeczeńskie, gender reveal) |
| Frazy do wyszukiwarki | „fotograf na osiemnastkę {miasto}”, „fotograf komunia {miasto}”, „fotograf urodziny {miasto}” ❓ miasto |

### Usługi *
| Usługa | Krótki opis | Cena |
|---|---|---|
| Reportaż z imprez okolicznościowych | urodziny, osiemnastki, komunie | wg pakietów |
| Sesje okolicznościowe | narzeczeńska, gender reveal | wg pakietów ❓ czy sesje mają osobny cennik |
| Sesje portretowe | (sekcja „Portretowa” w Canvie) | ❓ |

### Cennik (z Canvy) ✅
| Pakiet | Czas | Cena | Zdjęć po obróbce |
|---|---|---|---|
| Mini | 3 h | 300–400 zł | 50–60 |
| Standard | 5 h | 500–650 zł | 80–120 |
| Maxi | do 8 h | 700–850 zł | 150–250 |
| Nadgodziny | — | 150–200 zł / h | płatne przy rozliczeniu |

❓ Czas oddania zdjęć, forma przekazania (galeria online? pendrive?), koszt dojazdu, zaliczka.

## 5. Identyfikacja wizualna

| Pole | Wartość |
|---|---|
| Logo | PNG (sygnet B.K + pełne) ✅ — wektor ❓ |
| Kolory firmowe | tło #E1E1D6, linia #8C7E64 (z logo) ✅ |
| Fonty | Canva: szeryfowe wersaliki + skrypt; na stronie: systemowe szeryfowe (bez Google Fonts) |
| Zdjęcia | własne Bartka (z Canvy) ✅ — kto jest na `fotograf-w-plenerze` (Bartek?) ❓ |
| Zgody na wizerunek osób na zdjęciach | ❓ **ważne** — na zdjęciach są rozpoznawalni goście i dziecko (komunia) |

## 6. Prawo i RODO

| Pole | Wartość |
|---|---|
| Administrator danych * | Bartosz Kaczmarek, ❓ adres, ❓ NIP |
| Formularz — jakie dane zbieramy | imię, e-mail lub telefon, data, rodzaj zdjęć, pakiet, wiadomość |
| Cookies / analityka | brak |
| Mapa Google | N/D |

## 7. Technika i marketing

| Pole | Wartość |
|---|---|
| Stack | HTML + CSS + Vanilla JS ✅ |
| Repozytorium | **bkaczmarekfoto/bkaczmarekfoto.github.io** ✅ publiczne (organizacja GitHub `bkaczmarekfoto`) |
| Kalendarz | dedykowane konto Google Bartka ✅; sekret `GCAL_ICS_URL` w repo |
| EmailJS | ❓ konto na foto.bkaczmarek@gmail.com (Service + Template + Public Key) |

## 8. Materiały do dostarczenia przez klienta
- [x] Logo (PNG)
- [x] Zdjęcia (10 z Canvy)
- [x] Teksty (Canva)
- [ ] Tajny adres iCal z kalendarza (Ustawienia kalendarza → „Tajny adres w formacie iCal”)
- [ ] Dane do polityki prywatności
- [ ] Linki do social media
- [ ] Zgody na publikację wizerunku
- [ ] Więcej zdjęć do portfolio (najlepiej 20–40, różne kategorie)

## 9. Checklista odbioru (przed PROD)
- [ ] Klient zaakceptował treści i wygląd
- [ ] Dane kontaktowe sprawdzone (klik w telefon, e-mail)
- [ ] Formularz testowo wysłany i dotarł
- [ ] Kalendarz: „Wolne” w Google → po ≤1 h zielony dzień na stronie; rezerwacja → dzień znika
- [ ] Test na telefonie, tablecie, desktopie (Chrome, Safari, Firefox)
- [ ] Lighthouse ≥ 90 (Performance, Accessibility, SEO)
- [ ] Meta tagi, OG (og:image bezwzględny), favicon, JSON-LD, `robots.txt`, `sitemap.xml`
- [ ] Polityka prywatności z danymi administratora
- [ ] Domena podpięta, HTTPS działa
- [ ] Realizacja dodana do portfolio na kubabuba.pl (za zgodą klienta)

## 10. Uwagi dodatkowe
- Kalendarz: Bartek oznacza **wolne** dni wydarzeniem „Wolne” (całodniowym lub z godzinami, może być cykliczne). Dzień z „Wolne” i bez innych wydarzeń = zielony „+” na stronie. Po dogadaniu się z klientem Bartek ręcznie dopisuje rezerwację / usuwa „Wolne”.
- Zdjęcie „Z lotu ptaka” (liczba 40) — ❓ czy Bartek robi zdjęcia dronem i chce to oferować.
