/* Perfect Spread — progressive enhancement. The site works without this file. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const themeColors = { picnic: '#f3c3b8', celebrate: '#f3efe6', romance: '#0f0e14' };
  const metaTheme = $('meta[name="theme-color"]');

  function setMood(mood) {
    if (!mood || root.dataset.mood === mood) return;
    root.dataset.mood = mood;
    if (metaTheme) metaTheme.content = themeColors[mood] || metaTheme.content;
  }

  /* ---------------------------------------------------------- header -- */
  const header = $('[data-header]');
  const stage = $('[data-stage]');
  const toggle = $('.nav-toggle');
  const navList = $('#nav-list');

  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      navList.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navList.addEventListener('click', (e) => { if (e.target.closest('a')) toggle.click(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') toggle.click(); });
  }

  /* ----------------------------------------------------------- stage -- */
  let chosenMood = 'picnic';
  let stageState = null;

  if (stage) {
    const chapters = $$('[data-chapter]', stage);
    const tabs = $$('[data-goto]', stage);
    const keys = chapters.map((c) => c.dataset.chapter);
    let active = 0;

    const metrics = () => {
      const top = stage.getBoundingClientRect().top + scrollY;
      const span = stage.offsetHeight - innerHeight;
      return { top, span };
    };

    const activate = (i) => {
      if (i === active && chapters[i].classList.contains('is-active')) return;
      active = i;
      chapters.forEach((c, n) => {
        c.classList.toggle('is-active', n === i);
        c.setAttribute('aria-hidden', String(n !== i));
        $$('a, button', c).forEach((el) => { el.tabIndex = n === i ? 0 : -1; });
      });
      tabs.forEach((t, n) => t.setAttribute('aria-selected', String(n === i)));
    };

    const goTo = (i) => {
      const { top, span } = metrics();
      const idx = Math.max(0, Math.min(keys.length - 1, i));
      chosenMood = keys[idx];
      const y = top + (span * (idx + 0.5)) / keys.length;
      scrollTo({ top: idx === 0 ? top : y, behavior: reduced ? 'auto' : 'smooth' });
    };

    tabs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
    tabs.forEach((t, i) => t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus();
        goTo(n);
      }
    }));
    $('[data-stage-prev]', stage)?.addEventListener('click', () => goTo(active - 1));
    $('[data-stage-next]', stage)?.addEventListener('click', () => goTo(active + 1));

    stageState = () => {
      const { top, span } = metrics();
      const p = Math.max(0, Math.min(1, (scrollY - top) / span));
      const inStage = scrollY < top + span + innerHeight * 0.4;
      const f = p * keys.length;
      const i = Math.min(keys.length - 1, Math.floor(f));
      activate(i);
      tabs.forEach((t, n) => t.style.setProperty('--tp', n === i ? (f - i).toFixed(3) : 0));
      stage.style.setProperty('--stage-p', p.toFixed(3));
      // Inside the stage the mood follows the scroll; below it, the page keeps
      // the experience the visitor last chose (default: picnic).
      if (inStage) {
        setMood(keys[i]);
      } else {
        setMood(chosenMood);
      }
      if (header) header.classList.toggle('is-solid', scrollY > top + span - 60);
    };
    activate(0);
  }

  /* ------------------------------------------------- scroll handlers -- */
  const steps = $$('[data-steps]');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (stageState) stageState();
      else if (header) header.classList.toggle('is-solid', scrollY > 40);
      steps.forEach((list) => {
        const r = list.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (innerHeight * 0.75 - r.top) / r.height));
        list.style.setProperty('--steps-p', p.toFixed(3));
        const items = $$('.step', list);
        items.forEach((s, n) => s.classList.toggle('is-lit', p >= n / Math.max(1, items.length - 1) - 0.02));
      });
      if (!reduced) root.style.setProperty('--sy', String(Math.min(1, scrollY / innerHeight)));
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ----------------------------------------------- pointer parallax -- */
  if (!reduced && finePointer) {
    const scenes = $$('.stage-scene, .page-hero-scene');
    let raf = 0;
    addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;
        scenes.forEach((s) => { s.style.setProperty('--px', x.toFixed(3)); s.style.setProperty('--py', y.toFixed(3)); });
      });
    }, { passive: true });

    // Warm glow that follows the cursor in candlelit mood.
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    addEventListener('pointermove', (e) => { glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; }, { passive: true });

    // Magnetic buttons.
    $$('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.setProperty('--mx', `${(dx * 0.18).toFixed(1)}px`);
        btn.style.setProperty('--my', `${(dy * 0.3).toFixed(1)}px`);
        btn.style.setProperty('--hx', `${e.clientX - r.left}px`);
        btn.style.setProperty('--hy', `${e.clientY - r.top}px`);
      });
      btn.addEventListener('pointerleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
    });

    // Subtle 3D tilt.
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width) - 0.5) * 10}deg`);
        el.style.setProperty('--rx', `${(0.5 - ((e.clientY - r.top) / r.height)) * 10}deg`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------------------------------------------------------- reveal -- */
  const revealEls = $$('.reveal');
  revealEls.forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
    if (sibs.length > 1 && !el.style.getPropertyValue('--i')) el.style.setProperty('--i', String(Math.min(sibs.indexOf(el), 6)));
  });
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------- package rail -- */
  const rail = $('[data-rail]');
  if (rail) {
    const cardStep = () => ($('.pkg-card:not(.is-hidden)', rail)?.offsetWidth || 300) + 22;
    $('[data-rail-prev]')?.addEventListener('click', () => rail.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
    $('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: cardStep(), behavior: 'smooth' }));

    // Drag to scroll (mouse only; touch scrolls natively).
    let down = false; let startX = 0; let startLeft = 0; let moved = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5 && !moved) { moved = true; rail.classList.add('is-dragging'); }
      if (moved) rail.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        rail.classList.remove('is-dragging');
        const step = cardStep();
        rail.scrollTo({ left: Math.round(rail.scrollLeft / step) * step, behavior: 'smooth' });
      }
    });
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);

    $$('[data-filter-btn]').forEach((btn) => btn.addEventListener('click', () => {
      const f = btn.dataset.filterBtn;
      $$('[data-filter-btn]').forEach((b) => { b.classList.toggle('is-on', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      $$('.pkg-card', rail).forEach((card) => card.classList.toggle('is-hidden', f !== 'all' && card.dataset.filter !== f));
      rail.scrollTo({ left: 0, behavior: 'smooth' });
      if (f !== 'all') { chosenMood = f; setMood(f); }
    }));
  }

  /* ---------------------------------------------------- testimonials -- */
  const quotes = $$('[data-quotes] .quote');
  if (quotes.length > 1 && !reduced) {
    let q = 0;
    setInterval(() => {
      quotes[q].classList.remove('is-active');
      q = (q + 1) % quotes.length;
      quotes[q].classList.add('is-active');
    }, 6000);
  }

  /* ----------------------------------------------------- inquiry form -- */
  const form = $('[data-inquiry]');
  if (form && window.fetch) {
    const status = $('.form-status', form);
    const dateInput = form.elements.date;
    if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      $$('.field.has-error', form).forEach((f) => { f.classList.remove('has-error'); $('.err', f)?.remove(); });
      status.className = 'form-status';
      status.textContent = 'Sending…';
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      payload.addons = data.getAll('addons');
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          form.reset();
          status.classList.add('ok');
          status.textContent = json.message || 'Thank you! We’ll be in touch within 24 hours.';
        } else {
          status.classList.add('bad');
          status.textContent = json.error || 'Something went wrong — please call or email us.';
          Object.entries(json.errors || {}).forEach(([name, msg]) => {
            const field = form.elements[name]?.closest('.field');
            if (!field) return;
            field.classList.add('has-error');
            const span = document.createElement('span');
            span.className = 'err';
            span.textContent = msg;
            field.appendChild(span);
          });
          $('.has-error input, .has-error select', form)?.focus();
        }
      } catch {
        status.classList.add('bad');
        status.textContent = 'Network error — please try again, or call us.';
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
