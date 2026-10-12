/**
 * booking.js — okno (modal) z formularzem zapytania o termin
 *
 * Otwierane przez:
 *  - kliknięcie wolnego dnia w kalendarzu (zdarzenie `booking:open` z calendar.js),
 *  - dowolny element z atrybutem [data-booking] (opcjonalnie data-package / data-type).
 *
 * Wysyłka przez EmailJS (GitHub Pages nie ma backendu). SDK ładowany dopiero
 * przy pierwszym otwarciu okna — do tego czasu strona nie łączy się z EmailJS.
 * Termin NIE jest rezerwowany automatycznie: Bartek dostaje e-mail, ustala
 * szczegóły z klientem i sam nanosi rezerwację w Kalendarzu Google.
 */

(function () {
  /* ── EmailJS — uzupełnić po założeniu konta na foto.bkaczmarek@gmail.com ── */
  const EMAILJS_PUBLIC_KEY  = 'TODO_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID  = 'TODO_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'TODO_TEMPLATE_ID';
  const EMAILJS_SDK = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js';

  const TYPES = [
    ['reportaz', 'Reportaż z imprezy (urodziny, osiemnastka, komunia…)'],
    ['sesja-okolicznosciowa', 'Sesja okolicznościowa (narzeczeńska, gender reveal…)'],
    ['portret', 'Sesja portretowa'],
    ['inne', 'Inne — opiszę w wiadomości'],
  ];
  const PACKAGES = [
    ['mini', 'Pakiet Mini — 3 godziny (300–400 zł)'],
    ['standard', 'Pakiet Standard — 5 godzin (500–650 zł)'],
    ['maxi', 'Pakiet Maxi — do 8 godzin (700–850 zł)'],
    ['nie-wiem', 'Jeszcze nie wiem — proszę o radę'],
  ];
  const options = list => list.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
  const fmtDate = key => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const html = `
  <dialog class="modal" id="bookingModal" aria-labelledby="bookingTitle">
    <div class="modal-inner">
      <button type="button" class="modal-close" aria-label="Zamknij okno">×</button>

      <div class="modal-body" data-step="form">
        <span class="label">Zapytanie o termin</span>
        <h2 id="bookingTitle">Zarezerwuj termin</h2>
        <p class="modal-date" id="bookingDateText" hidden></p>
        <p class="modal-intro">Wypełnij krótki formularz — odezwę się, żeby ustalić szczegóły. Termin potwierdzam po rozmowie.</p>

        <form id="bookingForm" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="bk-name">Imię *</label>
              <input type="text" id="bk-name" name="name" autocomplete="given-name" required>
              <span class="error-msg" data-error="name">Podaj imię.</span>
            </div>
            <div class="form-group">
              <label for="bk-date">Data wydarzenia</label>
              <input type="date" id="bk-date" name="date">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="bk-email">E-mail</label>
              <input type="email" id="bk-email" name="email" autocomplete="email" inputmode="email" aria-describedby="bk-contact-hint">
              <span class="error-msg" data-error="email">Sprawdź adres e-mail.</span>
            </div>
            <div class="form-group">
              <label for="bk-phone">Telefon</label>
              <input type="tel" id="bk-phone" name="phone" autocomplete="tel" inputmode="tel" aria-describedby="bk-contact-hint">
              <span class="error-msg" data-error="phone">Sprawdź numer telefonu.</span>
            </div>
          </div>
          <p class="form-hint" id="bk-contact-hint">Podaj e-mail <strong>lub</strong> telefon — wystarczy jedno.</p>
          <p class="error-msg form-group-error" data-error="contact">Podaj e-mail lub numer telefonu, żebym mógł odpowiedzieć.</p>

          <div class="form-row">
            <div class="form-group">
              <label for="bk-type">Rodzaj zdjęć *</label>
              <select id="bk-type" name="type" required>
                <option value="">— wybierz —</option>
                ${options(TYPES)}
              </select>
              <span class="error-msg" data-error="type">Wybierz rodzaj zdjęć.</span>
            </div>
            <div class="form-group">
              <label for="bk-package">Pakiet *</label>
              <select id="bk-package" name="package" required>
                <option value="">— wybierz —</option>
                ${options(PACKAGES)}
              </select>
              <span class="error-msg" data-error="package">Wybierz pakiet.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="bk-message">Kilka słów o wydarzeniu <span class="optional">(opcjonalnie)</span></label>
            <textarea id="bk-message" name="message" rows="3" placeholder="Miejscowość, godzina rozpoczęcia, liczba gości…"></textarea>
          </div>

          <div class="form-group form-consent">
            <input type="checkbox" id="bk-rodo" name="rodo" required>
            <label for="bk-rodo">Zgadzam się na przetwarzanie moich danych w celu odpowiedzi na zapytanie, zgodnie z <a href="polityka-prywatnosci.html" target="_blank">polityką prywatności</a>. *</label>
          </div>
          <p class="error-msg form-group-error" data-error="rodo">Zaznacz zgodę, żebym mógł odpowiedzieć.</p>

          <!-- Pułapka na boty: pole niewidoczne dla ludzi -->
          <div class="hp-field" aria-hidden="true">
            <label for="bk-website">Strona www</label>
            <input type="text" id="bk-website" name="website" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit" class="btn btn-primary btn-block">Wyślij zapytanie</button>
          <div class="form-status" role="alert"></div>
        </form>
      </div>

      <div class="modal-body modal-success" data-step="success" hidden>
        <div class="success-icon" aria-hidden="true">✓</div>
        <h2 tabindex="-1">Dziękuję za wiadomość!</h2>
        <p>Zapytanie dotarło. Odezwę się najszybciej, jak to możliwe — zwykle tego samego lub następnego dnia. Termin jest potwierdzony dopiero po naszej rozmowie.</p>
        <button type="button" class="btn btn-outline-dark modal-done">Zamknij</button>
      </div>
    </div>
  </dialog>`;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal    = document.getElementById('bookingModal');
  const form     = document.getElementById('bookingForm');
  const dateText = document.getElementById('bookingDateText');
  const statusEl = form.querySelector('.form-status');
  const submit   = form.querySelector('button[type="submit"]');
  const stepForm = modal.querySelector('[data-step="form"]');
  const stepOk   = modal.querySelector('[data-step="success"]');
  let opener = null;
  let currentHours = null;

  /* ── EmailJS SDK (leniwie) ───────────────────────────── */
  let sdkPromise = null;
  const loadSdk = () => {
    if (window.emailjs) return Promise.resolve(window.emailjs);
    if (!sdkPromise) {
      sdkPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = EMAILJS_SDK;
        s.onload = () => { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); resolve(window.emailjs); };
        s.onerror = () => { sdkPromise = null; reject(new Error('EmailJS SDK not loaded')); };
        document.head.appendChild(s);
      });
    }
    return sdkPromise;
  };

  /* ── Otwieranie / zamykanie ──────────────────────────── */
  const showDateText = () => {
    const d = form.date.value;
    dateText.hidden = !d;
    if (d) dateText.textContent = fmtDate(d) + (currentHours ? `, ${currentHours}` : '');
  };

  function open({ date = '', hours = null, pkg = '', type = '', from = null } = {}) {
    opener = from || document.activeElement;
    stepForm.hidden = false;
    stepOk.hidden = true;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
    form.date.value = date;
    currentHours = hours;
    if (pkg) form.package.value = pkg;
    if (type) form.type.value = type;
    showDateText();
    modal.showModal();
    document.body.style.overflow = 'hidden';
    form.name.focus();
    loadSdk().catch(() => { /* błąd pokażemy przy wysyłce */ });
  }

  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
    opener?.focus?.();
  });
  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
  modal.querySelector('.modal-done').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  form.date.addEventListener('change', () => { currentHours = null; showDateText(); });

  document.addEventListener('booking:open', e => open({
    date: e.detail?.date, hours: e.detail?.hours, from: e.detail?.opener,
  }));

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-booking]');
    if (!trigger) return;
    e.preventDefault();
    open({ pkg: trigger.dataset.package, type: trigger.dataset.type, from: trigger });
  });

  /* ── Walidacja ───────────────────────────────────────── */
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = v => v.replace(/[^\d]/g, '').length >= 9;

  const setError = (key, show, input) => {
    form.querySelector(`[data-error="${key}"]`)?.classList.toggle('visible', show);
    if (input) {
      input.classList.toggle('error', show);
      input.setAttribute('aria-invalid', String(show));
    }
  };

  function validate() {
    const name  = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const errors = [];

    setError('name', name.length < 2, form.name);              if (name.length < 2) errors.push(form.name);
    const badEmail = email && !isEmail(email);
    const badPhone = phone && !isPhone(phone);
    setError('email', badEmail, form.email);                   if (badEmail) errors.push(form.email);
    setError('phone', badPhone, form.phone);                   if (badPhone) errors.push(form.phone);
    const noContact = !email && !phone;
    setError('contact', noContact);
    form.email.classList.toggle('error', noContact || badEmail);
    form.phone.classList.toggle('error', noContact || badPhone);
    if (noContact) errors.push(form.email);
    setError('type', !form.type.value, form.type);             if (!form.type.value) errors.push(form.type);
    setError('package', !form.package.value, form.package);    if (!form.package.value) errors.push(form.package);
    setError('rodo', !form.rodo.checked, form.rodo);           if (!form.rodo.checked) errors.push(form.rodo);

    errors[0]?.focus();
    return errors.length === 0;
  }

  form.querySelectorAll('input, select').forEach(el =>
    el.addEventListener('change', () => { if (form.dataset.tried) validate(); })
  );

  /* ── Wysyłka ─────────────────────────────────────────── */
  const label = sel => sel.options[sel.selectedIndex]?.text.trim() || '';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    form.dataset.tried = '1';

    // Bot wypełnił ukryte pole — udajemy sukces, nic nie wysyłamy
    if (form.website.value) { showSuccess(); return; }
    if (!validate()) return;

    submit.disabled = true;
    submit.textContent = 'Wysyłanie…';
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    const email = form.email.value.trim();
    const params = {
      name:        form.name.value.trim(),
      from_name:   form.name.value.trim(),
      email:       email || 'nie podano',
      reply_to:    email,
      phone:       form.phone.value.trim() || 'nie podano',
      event_date:  form.date.value ? fmtDate(form.date.value) : 'nie wybrano',
      event_hours: currentHours || '',
      event_type:  label(form.type),
      package:     label(form.package),
      message:     form.message.value.trim() || '—',
      page:        location.href,
      time:        new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
    };

    try {
      const emailjs = await loadSdk();
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      showSuccess();
    } catch (err) {
      console.error('EmailJS error:', err);
      statusEl.className = 'form-status error-status';
      statusEl.textContent = '✗ Nie udało się wysłać wiadomości. Spróbuj ponownie albo zadzwoń: +48 694 609 476.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Wyślij zapytanie';
    }
  });

  function showSuccess() {
    form.reset();
    delete form.dataset.tried;
    currentHours = null;
    stepForm.hidden = true;
    stepOk.hidden = false;
    stepOk.querySelector('h2').focus();
  }
})();
