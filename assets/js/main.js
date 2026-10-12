/**
 * main.js — interakcje strony
 * - Intersection Observer (reveal animations)
 * - FAQ accordion
 * - Galeria: filtry kategorii + lightbox (klawiatura, swipe)
 * Formularz zapytania o termin: booking.js, kalendarz: calendar.js
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════
     REVEAL ANIMATIONS
  ══════════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || 0;
            setTimeout(() => el.classList.add('visible'), Number(delay));
            revealObs.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ══════════════════════════════════════════════
     FAQ ACCORDION
  ══════════════════════════════════════════════ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');

      faqItems.forEach(i => {
        const q = i.querySelector('.faq-question');
        q?.classList.remove('open');
        q?.setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-answer')?.classList.remove('open');
      });

      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

  /* ══════════════════════════════════════════════
     GALERIA — FILTRY
  ══════════════════════════════════════════════ */
  const gallery = document.querySelector('.gallery');
  const filters = document.querySelector('.gallery-filters');

  if (gallery && filters) {
    const items = [...gallery.querySelectorAll('.gallery-item')];

    // Liczniki przy przyciskach
    filters.querySelectorAll('button[data-filter]').forEach(btn => {
      const f = btn.dataset.filter;
      const n = f === 'all' ? items.length : items.filter(i => i.dataset.category.split(' ').includes(f)).length;
      const c = document.createElement('span');
      c.className = 'count';
      c.textContent = `(${n})`;
      btn.appendChild(c);
    });

    const applyFilter = f => {
      filters.querySelectorAll('button[data-filter]').forEach(b =>
        b.setAttribute('aria-pressed', String(b.dataset.filter === f))
      );
      items.forEach(i => {
        i.hidden = f !== 'all' && !i.dataset.category.split(' ').includes(f);
      });
    };

    filters.addEventListener('click', e => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      applyFilter(btn.dataset.filter);
      history.replaceState(null, '', btn.dataset.filter === 'all' ? location.pathname : `#${btn.dataset.filter}`);
    });

    const fromHash = location.hash.slice(1);
    if (fromHash && filters.querySelector(`button[data-filter="${CSS.escape(fromHash)}"]`)) applyFilter(fromHash);
  }

  /* ══════════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════════ */
  const lightbox = document.getElementById('lightbox');

  if (gallery && lightbox && typeof lightbox.showModal === 'function') {
    const lbImg     = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('figcaption');
    const lbCounter = lightbox.querySelector('.lightbox-counter');
    let visible = [];
    let index   = 0;
    let opener  = null;

    const show = i => {
      index = (i + visible.length) % visible.length;
      const item = visible[index];
      const img  = item.querySelector('img');
      lbImg.src = item.querySelector('button').dataset.full;
      lbImg.alt = img.alt;
      const cap = item.querySelector('figcaption');
      lbCaption.textContent = cap ? [...cap.childNodes].map(n => n.textContent.trim()).filter(Boolean).join(' — ') : '';
      lbCounter.textContent = `${index + 1} / ${visible.length}`;
    };

    gallery.addEventListener('click', e => {
      const btn = e.target.closest('.gallery-item button');
      if (!btn) return;
      visible = [...gallery.querySelectorAll('.gallery-item:not([hidden])')];
      opener  = btn;
      show(visible.indexOf(btn.closest('.gallery-item')));
      lightbox.showModal();
      document.body.style.overflow = 'hidden';
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(index - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(index + 1));

    lightbox.addEventListener('close', () => {
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
      opener?.focus();
    });
    lightbox.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    // Klik w tło zamyka
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) lightbox.close();
    });

    // Swipe
    let startX = 0;
    lightbox.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) show(diff > 0 ? index + 1 : index - 1);
    });
  }

  /* ══════════════════════════════════════════════
     SMOOTH SCROLL (links starting with #)
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
