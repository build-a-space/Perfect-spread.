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

  /* ------------------------------------------ demo concierge chatbot -- */
  const chat = $('[data-chat]');
  if (chat) {
    const win = $('.chat-window', chat);
    const launcher = $('.chat-launcher', chat);
    const log = $('[data-chat-log]', chat);
    const chipsEl = $('[data-chat-chips]', chat);
    const form = $('[data-chat-form]', chat);
    const input = form.elements.text;
    const data = JSON.parse($('[data-chat-data]', chat).textContent);
    const svcBySlug = Object.fromEntries(data.services.map((s) => [s.slug, s]));
    const pkgBySlug = Object.fromEntries(data.packages.map((p) => [p.slug, p]));

    let step = 'idle';
    let busy = false;
    let lead = {};

    const scrollDown = () => { log.scrollTop = log.scrollHeight; };
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

    const addMsg = (who, content) => {
      const row = el('div', `chat-msg ${who}`);
      const bubble = el('div', 'chat-bubble');
      if (typeof content === 'string') bubble.textContent = content; else bubble.appendChild(content);
      row.appendChild(bubble);
      log.appendChild(row);
      scrollDown();
      return row;
    };

    const setChips = (list) => {
      chipsEl.replaceChildren();
      list.forEach(([label, value]) => {
        const b = el('button', 'chat-chip', label);
        b.type = 'button';
        b.addEventListener('click', () => { if (!busy) handle(value ?? label, label); });
        chipsEl.appendChild(b);
      });
      chipsEl.hidden = !list.length;
      requestAnimationFrame(scrollDown); // chips shrink the log; keep the newest message in view
    };

    // Bot "types" each message with a short delay that scales with length.
    const say = async (...msgs) => {
      busy = true;
      for (const m of msgs) {
        const typing = addMsg('bot typing', el('span', 'chat-typing'));
        $('.chat-typing', typing).append(el('i'), el('i'), el('i'));
        typing.setAttribute('aria-hidden', 'true');
        const len = typeof m === 'string' ? m.length : 120;
        await new Promise((r) => setTimeout(r, isReduced() ? 120 : Math.min(1500, 420 + len * 11)));
        typing.remove();
        addMsg('bot', m);
      }
      busy = false;
    };

    /* ---- light "understanding" ---- */
    const titleCase = (t) => t.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
    const parseName = (t) => {
      const cleaned = t.replace(/^(hi|hey|hello)[,!.\s]*/i, '').replace(/^(my name is|my name's|name's|i am|i'm|im|it's|its|this is|call me)\s+/i, '');
      const words = cleaned.replace(/[^\p{L}\s'-]/gu, ' ').trim().split(/\s+/).slice(0, 2).join(' ');
      return words ? titleCase(words.toLowerCase()) : '';
    };
    const findService = (t) => {
      const low = t.toLowerCase();
      let best = null; let bestLen = 0;
      data.services.forEach((s) => s.keywords.forEach((k) => { if (k && low.includes(k) && k.length > bestLen) { best = s; bestLen = k.length; } }));
      return best;
    };
    const months = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec';
    const extract = (t) => {
      const low = t.toLowerCase();
      const out = {};
      const g = low.match(/(\d{1,3})\s*(?:people|guests|persons|adults|friends|of us|ppl|girls|ladies|kids|coworkers|employees)/) || low.match(/(?:party|group|table) of (\d{1,3})/) || low.match(/for (\d{1,3})\b(?!\s*(?:am|pm|:|hours?|hrs?))/);
      if (g) out.guests = Number(g[1]);
      else if (/\b(just (the )?two of us|two of us|couple|me and my|my (wife|husband|girlfriend|boyfriend|partner|fianc))/.test(low)) out.guests = 2;
      const d = t.match(new RegExp(`\\b(?:(?:${months})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?|\\d{1,2}(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?:${months})|\\d{1,2}/\\d{1,2}(?:/\\d{2,4})?|(?:this|next)\\s+(?:weekend|week|month|friday|saturday|sunday|monday|tuesday|wednesday|thursday)|(?:${months}))\\b`, 'i'));
      if (d) out.date = d[0];
      const a = data.areas.find((x) => low.includes(x.toLowerCase()));
      if (a) out.area = a;
      const vibes = ['boho', 'romantic', 'pink', 'blush', 'gold', 'neutral', 'modern', 'rustic', 'garden', 'sunset', 'beach', 'waterfront', 'candle', 'floral', 'elegant', 'whimsical', 'halloween', 'christmas', 'surprise'];
      const vibeText = data.areas.reduce((acc, x) => acc.replace(x.toLowerCase(), ' '), low); // so "Virginia Beach" isn't read as a beach vibe
      out.vibe = vibes.filter((v) => vibeText.includes(v));
      const p = data.packages.find((x) => low.includes(x.name.toLowerCase().split(' ')[0]) && x.slug !== 'basic-picnic');
      if (p) out.pkg = p.slug;
      return out;
    };
    const emailRe = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
    const phoneRe = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

    /* ---- conversation ---- */
    const askService = () => {
      setChips([...data.featured.map((slug) => [svcBySlug[slug].name, slug]), ['Show me options', '__options']]);
    };

    async function handle(raw, label) {
      const text = String(raw).trim();
      if (!text || busy) return;
      addMsg('user', label || text);
      setChips([]);

      if (step === 'name') {
        const name = parseName(text);
        if (!name) { await say('Sorry, I didn’t catch that. What name should I use?'); return; }
        lead.name = name;
        step = 'service';
        await say(`Lovely to meet you, ${name}! 🌸`, 'What service are you looking for, or would you like some options?');
        askService();
        return;
      }

      if (step === 'service') {
        if (raw === '__options' || /\b(option|not sure|unsure|idk|don't know|dont know|help|ideas?|suggest)/i.test(text)) {
          const list = el('div', 'chat-list');
          list.append(el('p', null, 'Of course! Here’s what people love most:'));
          const ul = el('ul');
          ['luxury-picnics', 'romantic-picnics', 'proposal-picnics', 'birthday-picnics', 'bridal-shower-picnics', 'igloo-experiences', 'corporate-picnics', 'event-planning'].forEach((slug) => {
            const s = svcBySlug[slug];
            const li = el('li');
            li.append(el('strong', null, s.name), document.createTextNode(` — ${s.tagline}`));
            ul.append(li);
          });
          list.append(ul);
          await say(list, 'Tap one that sounds right, or tell me in your own words.');
          setChips(['luxury-picnics', 'romantic-picnics', 'proposal-picnics', 'birthday-picnics', 'bridal-shower-picnics', 'igloo-experiences', 'corporate-picnics', 'event-planning'].map((slug) => [svcBySlug[slug].name, slug]));
          return;
        }
        const svc = svcBySlug[raw] || findService(text);
        lead.service = svc ? svc.name : text;
        lead.serviceSlug = svc && svc.slug;
        step = 'details';
        await say(
          svc ? `${svc.name}, great choice. ${svc.tagline}` : 'That sounds wonderful. We style all kinds of occasions, so we can absolutely make that happen.',
          'Can you tell me about what you’re looking for? Date, number of guests, where, and the vibe you’re imagining — whatever you know so far.',
        );
        return;
      }

      if (step === 'details') {
        lead.details = text;
        Object.assign(lead, extract(text));
        if (!lead.serviceSlug) { const s = findService(text); if (s) { lead.serviceSlug = s.slug; } }
        const bits = [];
        if (lead.guests) bits.push(`for ${lead.guests} ${lead.guests === 1 ? 'guest' : 'guests'}`);
        if (lead.area) bits.push(`in ${lead.area}`);
        if (lead.date) bits.push(`around ${lead.date}`);
        const reflect = bits.length ? `Got it — ${bits.join(', ')}${lead.vibe.length ? `, with a ${lead.vibe.slice(0, 2).join(' & ')} feel` : ''}. That’s going to be beautiful.` : 'Got it, that’s going to be beautiful.';
        const recSlug = lead.pkg || (lead.serviceSlug && svcBySlug[lead.serviceSlug].packages[0]);
        const rec = recSlug && pkgBySlug[recSlug];
        const extra = [];
        if (rec) extra.push(`Our ${rec.name} (from $${rec.price}) would be a lovely fit${lead.guests && lead.guests > 2 && lead.guests <= 8 ? `, plus $35 per extra guest` : ''}.`);
        if (lead.guests > 8) extra.push(`Since you’re planning for more than 8 guests, ${data.business.owner} will put together custom pricing for you.`);
        lead.recommended = rec && rec.name;
        step = 'contact';
        await say(reflect, ...extra, 'Last thing: what’s the best phone number or email to reach you?');
        return;
      }

      if (step === 'contact') {
        const email = text.match(emailRe); const phone = text.match(phoneRe);
        if (!email && !phone) { await say('Hmm, I didn’t catch a phone number or email there. Could you share one so we can send you the details?'); return; }
        lead.email = email && email[0];
        lead.phone = phone && phone[0];
        step = 'done';
        const card = el('div', 'chat-summary');
        card.append(el('p', 'chat-summary-h', 'Your request'));
        const dl = el('dl');
        [['Name', lead.name], ['Service', lead.service], ['Guests', lead.guests], ['When', lead.date], ['Where', lead.area], ['Suggested', lead.recommended], ['Contact', [lead.phone, lead.email].filter(Boolean).join(' · ')], ['Details', lead.details]]
          .filter(([, v]) => v).forEach(([k, v]) => { dl.append(el('dt', null, k), el('dd', null, String(v))); });
        card.append(dl);
        const note = el('div', 'chat-demo-note');
        note.append(el('strong', null, '✨ Demo mode'), el('p', null, `If this was a real chat, ${lead.name} would have been through the system and gotten a text message, and all the information and a summary would have been sent to you by text.`));
        await say(`Perfect, thank you ${lead.name.split(' ')[0]}! Here’s a summary of everything:`, card, note);
        setChips([['Send this as a real inquiry', '__real'], ['Start over', '__restart']]);
        return;
      }

      if (step === 'done') {
        if (raw === '__restart' || /start over|restart/i.test(text)) { start(true); return; }
        if (raw === '__real' || /real|inquir|book|yes/i.test(text)) { sendReal(); return; }
        await say('Want to send this as a real inquiry, or start over?');
        setChips([['Send this as a real inquiry', '__real'], ['Start over', '__restart']]);
      }
    }

    // Hand the conversation to the real inquiry form, prefilled.
    function sendReal() {
      const message = [lead.service && `Interested in: ${lead.service}.`, lead.details].filter(Boolean).join(' ');
      const dForm = $('#inquiry-drawer form');
      if (!dForm) {
        location.href = `/contact?experience=${encodeURIComponent(lead.service || '')}${lead.area ? `&area=${encodeURIComponent(lead.area)}` : ''}`;
        return;
      }
      const f = dForm.elements;
      f.name.value = lead.name || '';
      if (lead.email) f.email.value = lead.email;
      if (lead.phone) f.phone.value = lead.phone;
      if (lead.guests) f.guests.value = lead.guests;
      if (lead.area) f.area.value = lead.area;
      if (lead.pkg || (lead.serviceSlug && svcBySlug[lead.serviceSlug].packages[0])) f.package.value = lead.pkg || svcBySlug[lead.serviceSlug].packages[0];
      f.message.value = message;
      toggle(false);
      $('.pull-tab').click();
    }

    async function start(restart = false) {
      lead = {};
      log.replaceChildren();
      setChips([]);
      step = 'name';
      await say(restart ? 'Let’s start fresh!' : 'Hi there! I’m the Perfect Spread concierge.', 'I can help you plan a picnic or event in four quick questions. First, can I have your name?');
      input.focus({ preventScroll: true });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value;
      if (!v.trim() || busy) return;
      input.value = '';
      handle(v);
    });

    function toggle(open = win.hidden) {
      if (open) {
        win.hidden = false;
        win.getBoundingClientRect();
        win.classList.add('is-open');
        launcher.setAttribute('aria-expanded', 'true');
        chat.classList.add('is-open');
        if (step === 'idle') start(); else input.focus({ preventScroll: true });
      } else {
        win.classList.remove('is-open');
        launcher.setAttribute('aria-expanded', 'false');
        chat.classList.remove('is-open');
        setTimeout(() => { if (!win.classList.contains('is-open')) win.hidden = true; }, isReduced() ? 0 : 400);
        launcher.focus({ preventScroll: true });
      }
    }
    $$('[data-chat-toggle]', chat).forEach((b) => b.addEventListener('click', () => toggle()));
    win.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); toggle(false); } });
    setTimeout(() => chat.classList.add('show-label'), 3500);
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
