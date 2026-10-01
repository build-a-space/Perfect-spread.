/* Perfect Spread — progressive enhancement. The site works without this file. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  // True when the OS asks for less motion or the visitor paused animations in the accessibility panel.
  const isReduced = () => motionQuery.matches || root.hasAttribute('data-a11y-motion');
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
    navList.addEventListener('click', (e) => { if (e.target.closest('a') && toggle.getAttribute('aria-expanded') === 'true') toggle.click(); });
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
      scrollTo({ top: idx === 0 ? top : y, behavior: isReduced() ? 'auto' : 'smooth' });
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
      if (!isReduced()) root.style.setProperty('--sy', String(Math.min(1, scrollY / innerHeight)));
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ----------------------------------------------- pointer parallax -- */
  if (finePointer) {
    const scenes = $$('.stage-scene, .page-hero-scene');
    let raf = 0;
    addEventListener('pointermove', (e) => {
      if (raf || isReduced()) return;
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
        if (isReduced()) return;
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
        if (isReduced()) return;
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
  if ('IntersectionObserver' in window && !isReduced()) {
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
  if (quotes.length > 1) {
    let q = 0;
    setInterval(() => {
      if (isReduced()) return;
      quotes[q].classList.remove('is-active');
      q = (q + 1) % quotes.length;
      quotes[q].classList.add('is-active');
    }, 6000);
  }

  /* ---------------------------------------------------- inquiry forms -- */
  if (window.fetch) $$('[data-inquiry]').forEach((form) => {
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
  });

  /* ------------------------------------------- accessibility widget -- */
  const a11yPanel = $('#a11y-panel');
  const a11yTab = $('[data-a11y-open]');
  if (a11yPanel && a11yTab) {
    const KEY = 'ps-a11y';
    const opts = $$('[data-a11y]', a11yPanel);
    let prefs = {};
    try { prefs = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { prefs = {}; }

    const live = document.createElement('p');
    live.className = 'sr';
    live.setAttribute('aria-live', 'polite');
    a11yPanel.appendChild(live);

    const apply = () => {
      opts.forEach((btn) => {
        const key = btn.dataset.a11y;
        const v = Number(prefs[key]) || 0;
        if (v) root.setAttribute(`data-a11y-${key}`, String(v)); else root.removeAttribute(`data-a11y-${key}`);
        btn.setAttribute('aria-pressed', String(v > 0));
        btn.dataset.level = String(v);
      });
      try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* private mode: settings last for this page view */ }
      onScroll();
    };

    opts.forEach((btn) => btn.addEventListener('click', () => {
      const key = btn.dataset.a11y;
      const levels = Number(btn.dataset.levels) || 1;
      prefs[key] = ((Number(prefs[key]) || 0) + 1) % (levels + 1);
      apply();
      const label = $('.a11y-opt-label', btn).textContent;
      live.textContent = prefs[key] ? `${label} on${levels > 1 ? `, level ${prefs[key]} of ${levels}` : ''}` : `${label} off`;
    }));
    $('[data-a11y-reset]', a11yPanel).addEventListener('click', () => {
      prefs = {};
      apply();
      live.textContent = 'All accessibility settings reset';
    });
    apply();

    // "Adjust" / "Why it's here" tabs.
    const tabs = $$('[role="tab"]', a11yPanel);
    const select = (t) => tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      $(`#${x.getAttribute('aria-controls')}`).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        n.focus();
        select(n);
      });
    });

    // Non-modal panel: the page stays visible so changes can be seen live.
    let hideTimer = 0;
    const openPanel = () => {
      clearTimeout(hideTimer);
      a11yPanel.hidden = false;
      a11yPanel.getBoundingClientRect(); // commit the closed state so the slide animates
      a11yPanel.classList.add('is-open');
      a11yTab.setAttribute('aria-expanded', 'true');
      setTimeout(() => opts[0].focus({ preventScroll: true }), isReduced() ? 0 : 300);
    };
    const closePanel = (returnFocus = true) => {
      a11yPanel.classList.remove('is-open');
      a11yTab.setAttribute('aria-expanded', 'false');
      hideTimer = setTimeout(() => { a11yPanel.hidden = true; }, isReduced() ? 0 : 600);
      if (returnFocus) a11yTab.focus({ preventScroll: true });
    };
    a11yTab.addEventListener('click', () => (a11yPanel.classList.contains('is-open') ? closePanel() : openPanel()));
    $('[data-a11y-close]', a11yPanel).addEventListener('click', () => closePanel());
    a11yPanel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); closePanel(); } });
    // Opening the booking drawer tucks this panel away.
    document.addEventListener('click', (e) => {
      if (a11yPanel.classList.contains('is-open') && !a11yPanel.contains(e.target) && e.target.closest('.pull-tab, a[href^="/contact"]')) closePanel(false);
    }, true);
  }

  /* ------------------------------------------- pull-out inquiry drawer -- */
  const drawer = $('#inquiry-drawer');
  const tab = $('.pull-tab');
  if (drawer && tab) {
    const backdrop = $('.drawer-backdrop');
    const dForm = $('form', drawer);
    let lastFocus = null;
    let closeTimer = 0;
    const focusables = () => $$('a[href], button:not([disabled]), input:not([type=hidden]):not([tabindex="-1"]), select, textarea', drawer)
      .filter((el) => el.offsetParent !== null);

    // Prefill from the link that opened the drawer (/contact?package=…&experience=…&area=…).
    const prefill = (href) => {
      let q;
      try { q = new URL(href, location.href).searchParams; } catch { return; }
      const pkg = q.get('package'); const exp = q.get('experience'); const area = q.get('area');
      if (pkg && dForm.elements.package) dForm.elements.package.value = pkg;
      if (area && dForm.elements.area) dForm.elements.area.value = area;
      if (exp) {
        const sel = dForm.elements.occasion;
        const word = exp.toLowerCase().split(' ')[0];
        const match = sel && Array.from(sel.options).find((o) => o.value && (o.value.toLowerCase().includes(word) || exp.toLowerCase().includes(o.value.toLowerCase().split(' ')[0])));
        if (match) sel.value = match.value;
        const msg = dForm.elements.message;
        if (msg && !msg.value.trim()) msg.value = `I’m interested in: ${exp}. `;
      }
    };

    const open = (trigger) => {
      clearTimeout(closeTimer);
      lastFocus = trigger || document.activeElement;
      drawer.hidden = false; backdrop.hidden = false;
      drawer.getBoundingClientRect(); // commit the closed state so the slide animates
      drawer.classList.add('is-open'); backdrop.classList.add('is-open');
      tab.classList.add('is-hidden');
      tab.setAttribute('aria-expanded', 'true');
      root.classList.add('drawer-lock');
      setTimeout(() => (finePointer ? dForm.elements.name : $('.drawer-x', drawer)).focus({ preventScroll: true }), isReduced() ? 0 : 350);
    };
    const close = () => {
      drawer.classList.remove('is-open', 'is-dragging'); backdrop.classList.remove('is-open');
      drawer.style.removeProperty('--drag');
      tab.classList.remove('is-hidden');
      tab.setAttribute('aria-expanded', 'false');
      root.classList.remove('drawer-lock');
      closeTimer = setTimeout(() => { drawer.hidden = true; backdrop.hidden = true; }, isReduced() ? 0 : 600);
      requestAnimationFrame(() => lastFocus?.focus?.({ preventScroll: true }));
    };

    // The tab, and any link to /contact, opens the drawer instead of navigating.
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest('a[data-drawer-open], a[href^="/contact"]');
      if (!link || drawer.contains(link)) return;
      e.preventDefault();
      prefill(link.href);
      open(link);
    });
    $$('[data-drawer-close]').forEach((el) => el.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { // keep focus inside the dialog
        const els = focusables();
        const first = els[0]; const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Swipe right to dismiss on touch screens.
    let sx = 0; let sy = 0; let dx = 0; let tracking = false;
    drawer.addEventListener('touchstart', (e) => {
      if (e.target.closest('input, select, textarea')) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; tracking = true;
    }, { passive: true });
    drawer.addEventListener('touchmove', (e) => {
      if (!tracking) return;
      const mx = e.touches[0].clientX - sx; const my = e.touches[0].clientY - sy;
      if (!drawer.classList.contains('is-dragging')) {
        if (Math.abs(my) > Math.abs(mx) || mx < 8) { if (Math.abs(my) > 10) tracking = false; return; }
        drawer.classList.add('is-dragging');
      }
      dx = Math.max(0, mx);
      drawer.style.setProperty('--drag', `${dx}px`);
      backdrop.style.opacity = String(Math.max(0, 1 - dx / drawer.offsetWidth));
    }, { passive: true });
    drawer.addEventListener('touchend', () => {
      if (!tracking) return;
      tracking = false;
      backdrop.style.removeProperty('opacity');
      drawer.classList.remove('is-dragging');
      if (dx > Math.min(110, drawer.offsetWidth * 0.28)) close(); else drawer.style.removeProperty('--drag');
    });

    // A gentle nudge once per visit, after the visitor has had a look around.
    try {
      if (!sessionStorage.getItem('ps-nudged')) {
        setTimeout(() => {
          if (drawer.classList.contains('is-open')) return;
          tab.classList.add('is-nudge');
          sessionStorage.setItem('ps-nudged', '1');
        }, 9000);
      }
    } catch { /* storage unavailable: skip the nudge */ }
  }
})();
