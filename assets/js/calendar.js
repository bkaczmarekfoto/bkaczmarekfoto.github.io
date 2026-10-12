/**
 * calendar.js — kalendarz wolnych terminów
 *
 * Dane: assets/data/availability.json, generowany co godzinę przez GitHub Actions
 * (scripts/build-availability.mjs) z prywatnego adresu iCal Kalendarza Google.
 * Wolne są tylko dni, które Bartek oznaczył wydarzeniem „Wolne” (i nie ma w nich
 * innego wydarzenia). W pliku są wyłącznie daty — bez tytułów, miejsc i opisów.
 *
 * Użycie: <div class="cal" data-availability></div>
 * Kliknięcie wolnego dnia wysyła zdarzenie `booking:open` (obsługuje je booking.js).
 */

(function () {
  const DATA_URL   = 'assets/data/availability.json';
  const STALE_DAYS = 3;
  const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec',
                  'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
  const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca',
                      'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const DOW      = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  const DOW_LONG = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

  const pad = n => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const formatPlDate = key => {
    const [y, m, d] = key.split('-').map(Number);
    const dow = (new Date(y, m - 1, d).getDay() + 6) % 7;
    return `${DOW_LONG[dow]}, ${d} ${MONTHS_GEN[m - 1]} ${y}`;
  };

  // „Dzisiaj” liczymy w strefie Bartka, nie odwiedzającego
  const todayInWarsaw = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date());

  function init(root) {
    root.innerHTML = '<p class="cal-error">Ładowanie kalendarza…</p>';

    fetch(DATA_URL, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => render(root, data))
      .catch(err => {
        console.error('Kalendarz:', err);
        root.innerHTML = '<p class="cal-error">Nie udało się wczytać kalendarza. Zadzwoń lub napisz — sprawdzę termin od ręki: <a href="tel:+48694609476">+48 694 609 476</a>.</p>';
      });
  }

  function render(root, data) {
    const today = todayInWarsaw();
    const free  = new Set((data.free || []).filter(d => d >= today));
    const hours = data.hours || {};
    const to    = data.to || today;
    const [ty, tm] = today.split('-').map(Number);
    const [ly, lm] = to.split('-').map(Number);
    const minIdx = ty * 12 + (tm - 1);
    const maxIdx = Math.max(minIdx, ly * 12 + (lm - 1));
    let cur = minIdx;

    // Zacznij od pierwszego miesiąca, w którym jest wolny termin
    const firstFree = [...free].sort()[0];
    if (firstFree) {
      const [fy, fm] = firstFree.split('-').map(Number);
      cur = Math.min(maxIdx, fy * 12 + (fm - 1));
    }

    root.innerHTML = `
      <div class="cal-head">
        <button type="button" class="cal-nav" data-dir="-1" aria-label="Poprzedni miesiąc">‹</button>
        <h3 class="cal-title" aria-live="polite"></h3>
        <button type="button" class="cal-nav" data-dir="1" aria-label="Następny miesiąc">›</button>
      </div>
      <table class="cal-table">
        <caption class="visually-hidden">Wolne terminy — wybierz zielony dzień, aby zapytać o rezerwację</caption>
        <thead><tr>${DOW.map(d => `<th scope="col">${d}</th>`).join('')}</tr></thead>
        <tbody></tbody>
      </table>
      <div class="cal-legend" aria-hidden="true">
        <span><i class="lg-free">+</i>wolny termin — kliknij, aby zarezerwować</span>
        <span><i class="lg-off"></i>niedostępny</span>
      </div>
      <p class="cal-empty" hidden>W tym miesiącu nie ma wolnych terminów — sprawdź kolejny albo napisz, ustalimy coś indywidualnie.</p>
      <p class="cal-meta"></p>`;

    const title = root.querySelector('.cal-title');
    const tbody = root.querySelector('tbody');
    const prev  = root.querySelector('[data-dir="-1"]');
    const next  = root.querySelector('[data-dir="1"]');
    const empty = root.querySelector('.cal-empty');
    const meta  = root.querySelector('.cal-meta');

    if (data.demo) {
      meta.classList.add('is-demo');
      meta.textContent = 'Dane przykładowe — kalendarz nie jest jeszcze podłączony.';
    } else if (data.generated) {
      const gen = new Date(data.generated);
      const stale = (Date.now() - gen.getTime()) / 864e5 > STALE_DAYS;
      meta.textContent = `Aktualizacja: ${gen.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.`
        + (stale ? ' Kalendarz może być nieaktualny — potwierdź termin telefonicznie.' : '');
    }

    function draw() {
      const y = Math.floor(cur / 12);
      const m = cur % 12;
      title.textContent = `${MONTHS[m]} ${y}`;
      prev.disabled = cur <= minIdx;
      next.disabled = cur >= maxIdx;

      const first   = (new Date(y, m, 1).getDay() + 6) % 7; // pon = 0
      const inMonth = new Date(y, m + 1, 0).getDate();
      let html = '<tr>';
      let freeCount = 0;
      for (let i = 0; i < first; i++) html += '<td></td>';

      for (let d = 1; d <= inMonth; d++) {
        const key = iso(y, m, d);
        const cls = ['cal-day'];
        if (key === today) cls.push('is-today');

        if (free.has(key)) {
          freeCount++;
          cls.push('is-free');
          const h = hours[key] ? `, ${hours[key]}` : '';
          html += `<td><button type="button" class="${cls.join(' ')}" data-date="${key}" aria-label="${formatPlDate(key)}${h} — wolny, zarezerwuj">`
                + `<span class="cal-num">${d}</span><span class="cal-plus" aria-hidden="true">+</span></button></td>`;
        } else {
          cls.push(key < today ? 'is-past' : 'is-off');
          html += `<td><span class="${cls.join(' ')}"><span class="cal-num">${d}</span></span></td>`;
        }
        if ((first + d) % 7 === 0 && d !== inMonth) html += '</tr><tr>';
      }
      const tail = (7 - ((first + inMonth) % 7)) % 7;
      for (let i = 0; i < tail; i++) html += '<td></td>';
      tbody.innerHTML = html + '</tr>';
      empty.hidden = freeCount > 0;
    }

    prev.addEventListener('click', () => { if (cur > minIdx) { cur--; draw(); } });
    next.addEventListener('click', () => { if (cur < maxIdx) { cur++; draw(); } });

    tbody.addEventListener('click', e => {
      const btn = e.target.closest('button[data-date]');
      if (!btn) return;
      const date = btn.dataset.date;
      document.dispatchEvent(new CustomEvent('booking:open', {
        detail: { date, hours: hours[date] || null, opener: btn },
      }));
    });

    draw();
  }

  document.querySelectorAll('[data-availability]').forEach(init);
})();
