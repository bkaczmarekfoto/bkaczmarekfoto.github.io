# TODO

## Od Bartka
- [ ] Tajny adres iCal kalendarza → sekret `GCAL_ICS_URL` (i pierwsze „Wolne” w kalendarzu)
- [x] EmailJS: klucze w `assets/js/booking.js`
- [ ] Dane administratora do polityki prywatności (adres, ew. NIP)
- [ ] Linki: Facebook, Instagram, TikTok (który profil to „z góry”, który „z dołu”?) → stopka + kontakt + JSON-LD `sameAs`
- [ ] Obszar działania (miasto, dojazd) → teksty + SEO + JSON-LD `areaServed`
- [ ] Zgody na publikację wizerunku osób ze zdjęć (zwłaszcza dziecko — komunia)
- [ ] Czy na `fotograf-w-plenerze` jest Bartek? (alt na stronie O mnie zakłada, że tak)
- [ ] Dron: czy robi zdjęcia z drona i chce to oferować? (kategoria „Z lotu ptaka”)
- [ ] Czas i forma oddania zdjęć, dojazd, zaliczka → FAQ / oferta
- [ ] Czy sesje (narzeczeńska, gender reveal, portret) mają osobny cennik?
- [ ] Więcej zdjęć do portfolio (20–40), ewentualnie opinie klientów
- [ ] Akceptacja tekstów i wyglądu

## Technika
- [x] Repozytorium `bkaczmarekfoto/bkaczmarekfoto.github.io`, Pages (GitHub Actions), sekret `GCAL_ICS_URL`
- [ ] Domena → `CNAME`, `og:url`, `og:image` (bezwzględny), `canonical`, `sitemap.xml`, `robots.txt` z adresem sitemapy
- [ ] Po podłączeniu kalendarza usunąć `"demo": true` (zrobi to pierwszy przebieg workflow)
- [ ] EmailJS: ograniczyć domeny w Account → Security
- [ ] Lighthouse na produkcji
