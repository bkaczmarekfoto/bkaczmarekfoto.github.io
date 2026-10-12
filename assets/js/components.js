/**
 * components.js — injects shared header & footer into every page
 * Usage: add <script src="assets/js/components.js"></script> at end of <body>
 * The script reads data-page="pagename" on <body> to mark the active nav link.
 */

(function () {
  /* ── Header HTML ─────────────────────────────────────── */
  const headerHTML = `
  <a href="#main" class="skip-link">Przejdź do treści</a>
  <nav id="navbar" aria-label="Menu główne">
    <div class="container">
      <div class="nav-inner">
        <a href="index.html" class="nav-logo" aria-label="Bartosz Kaczmarek Fotografia — strona główna">
          <img src="assets/img/logo-bk-white.png" class="logo-light" alt="" width="55" height="44">
          <img src="assets/img/logo-bk.png" class="logo-dark" alt="" width="55" height="44">
          <span class="nav-logo-text"><strong>Bartosz Kaczmarek</strong><span>Fotografia</span></span>
        </a>
        <ul class="nav-links" id="navLinks" role="list">
          <li><a href="index.html"     data-page="home">Strona główna</a></li>
          <li><a href="o-mnie.html"    data-page="o-mnie">O mnie</a></li>
          <li><a href="portfolio.html" data-page="portfolio">Portfolio</a></li>
          <li><a href="oferta.html"    data-page="oferta">Oferta i cennik</a></li>
          <li><a href="kontakt.html"   data-page="kontakt" class="nav-cta">Wolne terminy</a></li>
        </ul>
        <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>`;

  /* ── Footer HTML ─────────────────────────────────────── */
  const footerHTML = `
  <footer id="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo"><img src="assets/img/logo-bk-white.png" alt="" width="60" height="48">Bartosz Kaczmarek</div>
          <p>Fotografia okolicznościowa i reportaż z imprez — urodziny, komunie, sesje narzeczeńskie, gender reveal. Naturalne kadry i prawdziwe emocje.</p>
        </div>
        <div class="footer-col">
          <h4>Strony</h4>
          <ul>
            <li><a href="index.html">Strona główna</a></li>
            <li><a href="o-mnie.html">O mnie</a></li>
            <li><a href="portfolio.html">Portfolio</a></li>
            <li><a href="oferta.html">Oferta i cennik</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Informacje</h4>
          <ul>
            <li><a href="kontakt.html#terminy">Wolne terminy</a></li>
            <li><a href="kontakt.html">Kontakt</a></li>
            <li><a href="polityka-prywatnosci.html">Polityka prywatności</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Kontakt</h4>
          <ul>
            <li><a href="tel:+48694609476">+48 694 609 476</a></li>
            <li><a href="mailto:foto.bkaczmarek@gmail.com">foto.bkaczmarek@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="footerYear"></span> Bartosz Kaczmarek Fotografia. Wszelkie prawa zastrzeżone.</p>
        <p>Created by <a href="https://kubabuba.pl" target="_blank" rel="noopener noreferrer">kubabuba.pl</a></p>
      </div>
    </div>
  </footer>`;

  /* ── Inject ───────────────────────────────────────────── */
  const headerEl = document.getElementById('header-placeholder');
  const footerEl = document.getElementById('footer-placeholder');

  if (headerEl) headerEl.outerHTML = headerHTML;
  if (footerEl) footerEl.outerHTML = footerHTML;

  /* ── Footer year ─────────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Active nav link ─────────────────────────────────── */
  const currentPage = document.body.dataset.page || 'home';
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ── Navbar scroll ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hamburger ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    // Close on outside click / Escape
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  /* ── Accessibility toolbar (desktop only) ───────────────── */
  const a11yCSS = `
    #a11y-bar {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      z-index: 999;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: #3d372c;
      border-radius: 8px 0 0 8px;
      padding: 6px 4px;
      box-shadow: -2px 0 12px rgba(0,0,0,.25);
    }
    #a11y-bar button {
      width: 38px;
      height: 38px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #f7f6f1;
      font-size: .8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s;
      line-height: 1;
      padding: 0;
    }
    #a11y-bar button:hover { background: rgba(255,255,255,.15); }
    #a11y-bar button.a11y-active { background: #ffe066; color: #000; }
    #a11y-bar .a11y-sep { height: 1px; background: rgba(255,255,255,.15); margin: 2px 4px; }
    @media (max-width: 768px) { #a11y-bar { display: none !important; } }

    /* High contrast mode */
    body.hc-mode {
      --color-primary: #ffe066 !important;
      --color-primary-dark: #fff !important;
      --color-text: #fff !important;
      --color-text-light: #d1d5db !important;
      --color-bg: #000 !important;
      --color-bg-alt: #000 !important;
      --color-white: #111 !important;
      --color-border: #666 !important;
      background: #000 !important;
      color: #fff !important;
    }
    body.hc-mode #navbar,
    body.hc-mode footer { background: #111 !important; border-color: #444 !important; }
    body.hc-mode a { color: #ffe066 !important; }
    body.hc-mode .btn-primary,
    body.hc-mode .nav-cta { background: #ffe066 !important; color: #000 !important; border-color: #ffe066 !important; }
    body.hc-mode .btn-outline,
    body.hc-mode .btn-outline-dark { background: #000 !important; color: #fff !important; border-color: #fff !important; }
    body.hc-mode .service-card,
    body.hc-mode .pricing-card,
    body.hc-mode .process-step,
    body.hc-mode .faq-question,
    body.hc-mode .faq-answer,
    body.hc-mode .cal { background: #111 !important; border-color: #555 !important; color: #fff !important; }
    body.hc-mode h1, body.hc-mode h2, body.hc-mode h3, body.hc-mode h4 { color: #fff !important; }
    body.hc-mode input,
    body.hc-mode textarea,
    body.hc-mode select { background: #1a1a1a !important; color: #fff !important; border-color: #666 !important; }
    body.hc-mode .cal-day.is-free { background: #0b3d0b !important; color: #fff !important; border-color: #6f6 !important; }
    body.hc-mode .cal-day.is-free .cal-plus { color: #6f6 !important; }
    body.hc-mode .cal-day.is-off { background: #222 !important; color: #999 !important; }
    body.hc-mode .modal { background: #111 !important; color: #fff !important; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = a11yCSS;
  document.head.appendChild(styleEl);

  const a11yBar = document.createElement('div');
  a11yBar.id = 'a11y-bar';
  a11yBar.setAttribute('role', 'toolbar');
  a11yBar.setAttribute('aria-label', 'Narzędzia dostępności');
  a11yBar.innerHTML = `
    <button id="a11y-increase" title="Powiększ tekst" aria-label="Powiększ tekst">A+</button>
    <button id="a11y-decrease" title="Pomniejsz tekst" aria-label="Pomniejsz tekst">A−</button>
    <button id="a11y-reset"    title="Resetuj rozmiar tekstu" aria-label="Resetuj rozmiar tekstu" style="font-size:.65rem;">A↺</button>
    <div class="a11y-sep"></div>
    <button id="a11y-contrast" title="Wysoki kontrast" aria-label="Włącz/wyłącz wysoki kontrast" aria-pressed="false" style="font-size:.7rem;">WK</button>
  `;
  document.body.appendChild(a11yBar);

  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ } },
  };

  // Restore saved prefs
  let currentSize = parseInt(store.get('a11y-size') || '0', 10);
  const contrastBtn = document.getElementById('a11y-contrast');
  const applySize = () => {
    document.documentElement.style.fontSize = currentSize ? (100 + currentSize * 10) + '%' : '';
    store.set('a11y-size', currentSize);
  };
  const applyHC = on => {
    document.body.classList.toggle('hc-mode', on);
    contrastBtn.classList.toggle('a11y-active', on);
    contrastBtn.setAttribute('aria-pressed', String(on));
  };
  if (currentSize !== 0) applySize();
  if (store.get('a11y-hc') === '1') applyHC(true);

  document.getElementById('a11y-increase').addEventListener('click', () => {
    if (currentSize >= 3) return;
    currentSize++;
    applySize();
  });
  document.getElementById('a11y-decrease').addEventListener('click', () => {
    if (currentSize <= -1) return;
    currentSize--;
    applySize();
  });
  document.getElementById('a11y-reset').addEventListener('click', () => {
    currentSize = 0;
    applySize();
  });
  contrastBtn.addEventListener('click', () => {
    const isHC = !document.body.classList.contains('hc-mode');
    applyHC(isHC);
    store.set('a11y-hc', isHC ? '1' : '0');
  });

})();
