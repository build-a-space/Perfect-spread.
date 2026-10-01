'use strict';

const C = require('./content');
const seo = require('./seo');
const { heroScene, cardScene, icon } = require('./art');
const { layout, esc, money, media } = require('./layout');

const { business, policies, packages, services, areas, moods, faqs } = C;

const findPkg = (slug) => packages.find((p) => p.slug === slug);
const svcFor = (mood) => services.filter((s) => s.mood === mood);

const occasionLinks = {
  Anniversaries: 'anniversary-picnics', 'First dates': 'date-night-picnics', Engagements: 'proposal-picnics',
  Birthdays: 'birthday-picnics', 'Bridal showers': 'bridal-shower-picnics', 'Baby showers': 'baby-shower-picnics',
  'Bachelorette parties': 'bachelorette-picnics', Graduations: 'graduation-picnics', 'Corporate events': 'corporate-picnics',
  'Gender reveals': 'baby-shower-picnics', Promposals: 'romantic-picnics', 'Movie nights': 'date-night-picnics',
  'Yoga & meditation': 'corporate-picnics',
};

/* ------------------------------------------------------------ partials -- */

function packageCard(p, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `<article class="pkg-card reveal" data-mood="${p.mood}" data-filter="${p.mood}">
    <a href="/packages/${p.slug}" class="pkg-link" aria-label="${esc(p.name)} — from ${money(p.price)}">
      <div class="pkg-media">${media(p.slug, cardScene(p.art, `${p.name} illustration`), p.name)}</div>
      <div class="pkg-body">
        <${h} class="pkg-name">${esc(p.name)}</${h}>
        <p class="pkg-price">From <strong>${money(p.price)}</strong> <span>+ tax</span></p>
        <p class="pkg-blurb">${esc(p.blurb)}</p>
        <span class="pkg-more">View details ${icon('arrow')}</span>
      </div>
    </a>
  </article>`;
}

function features() {
  const items = [
    ['setup', 'Fully styled setup'],
    ['food', 'Gourmet food & drinks'],
    ['theme', 'Custom themes & décor'],
    ['clean', 'We set up & clean up'],
  ];
  return `<ul class="features">${items.map(([i, t]) => `<li class="reveal">${icon(i, 'icon-lg')}<span>${t}</span></li>`).join('')}</ul>`;
}

function steps() {
  return `<ol class="steps" data-steps>
    ${C.bookingSteps.map((s, i) => `<li class="step reveal" style="--i:${i}"><span class="step-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
  </ol>`;
}

function faqList(items, { open = 0 } = {}) {
  return `<div class="faq">${items.map(([q, a], i) => `<details class="reveal"${i < open ? ' open' : ''}><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><div class="faq-a"><p>${esc(a)}</p></div></details>`).join('')}</div>`;
}

function ctaBand(mood, { title = 'Let’s plan something beautiful', text = 'Tell us about your occasion and we’ll create a custom experience just for you.', href = '/contact' } = {}) {
  return `<section class="cta-band"${mood ? ` data-mood="${mood}"` : ''}>
    <div class="wrap cta-inner reveal">
      <p class="script cta-script">${esc(title)}</p>
      <p>${esc(text)}</p>
      <div class="cta-actions">
        <a class="btn btn-accent magnetic" href="${href}">Inquire now ${icon('arrow')}</a>
        <a class="btn btn-ghost" href="tel:${business.phone}">${icon('phone')} ${business.phoneDisplay}</a>
      </div>
      <p class="fine">We reply within ${policies.responseTime} · Dates held for ${policies.dateHold}</p>
    </div>
  </section>`;
}

function credentials() {
  return `<ul class="creds">${business.credentials.map((c) => `<li class="reveal"><span class="cred-label">${esc(c.label)}</span><span class="cred-name">${esc(c.name)}</span><span class="cred-detail">${esc(c.detail)}</span></li>`).join('')}</ul>`;
}

function testimonials() {
  if (!C.testimonials.length) return '';
  return `<section class="section testimonials"><div class="wrap">
    <div class="quotes" data-quotes>${C.testimonials.map((t, i) => `<figure class="quote${i === 0 ? ' is-active' : ''}"><blockquote>“${esc(t.quote)}”</blockquote><figcaption>— ${esc(t.name)}${t.occasion ? `, ${esc(t.occasion)}` : ''}</figcaption></figure>`).join('')}</div>
  </div></section>`;
}

// Map of service areas, plotted from real coordinates.
function areaMap() {
  const coords = {
    'smithfield-va': [36.982, -76.631], 'suffolk-va': [36.728, -76.584], 'williamsburg-va': [37.271, -76.707],
    'newport-news-va': [37.087, -76.473], 'hampton-va': [37.030, -76.345], 'norfolk-va': [36.851, -76.286],
    'chesapeake-va': [36.768, -76.287], 'virginia-beach-va': [36.853, -75.978],
  };
  const lat = [36.65, 37.35]; const lng = [-76.8, -75.9];
  const pt = ([la, ln]) => [((ln - lng[0]) / (lng[1] - lng[0])) * 560 + 20, (1 - (la - lat[0]) / (lat[1] - lat[0])) * 360 + 20];
  const home = pt(coords['smithfield-va']);
  return `<svg class="area-map" viewBox="0 0 600 400" role="img" aria-label="Map of Perfect Spread service areas around Hampton Roads">
    ${areas.filter((a) => a.slug !== 'smithfield-va').map((a, i) => { const [x, y] = pt(coords[a.slug]); return `<path class="map-line" style="--i:${i}" d="M${home[0].toFixed(0)} ${home[1].toFixed(0)} Q${((home[0] + x) / 2).toFixed(0)} ${(Math.min(home[1], y) - 40).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}"/>`; }).join('')}
    ${areas.map((a) => { const [x, y] = pt(coords[a.slug]); const isHome = a.slug === 'smithfield-va'; return `<a href="/service-areas/${a.slug}" class="map-pt${isHome ? ' is-home' : ''}"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${isHome ? 9 : 6}"/><circle class="map-pulse" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${isHome ? 9 : 6}"/><text x="${(x + 12).toFixed(0)}" y="${(y + 4).toFixed(0)}">${esc(a.name)}</text></a>`; }).join('')}
  </svg>`;
}

function pageHero({ mood, eyebrow, title, script, lede, ctaHref = '/contact', ctaLabel = 'Plan your experience', photoKey }) {
  return `<section class="page-hero" data-mood="${mood}">
    <div class="page-hero-scene">${media(photoKey || `hero-${mood}`, heroScene(), title, { eager: true })}</div>
    <div class="stage-veil"></div>
    <div class="wrap page-hero-copy">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1>${script ? `<span class="script">${esc(script)}</span> ` : ''}${esc(title)}</h1>
      <p class="lede">${esc(lede)}</p>
      <a class="btn btn-accent magnetic" href="${ctaHref}">${esc(ctaLabel)} ${icon('arrow')}</a>
    </div>
  </section>`;
}

/* --------------------------------------------------------------- home -- */

function home() {
  const moodList = Object.values(moods);
  const stage = `<section class="stage" data-stage aria-label="Experiences">
    <div class="stage-sticky">
      <div class="stage-scene" aria-hidden="false">
        ${moodList.map((m) => { const src = media(`hero-${m.key}`, '', `${m.label} by Perfect Spread`, { eager: m.key === 'picnic', cls: 'stage-photo' }); return src ? `<div class="stage-photo-wrap" data-for="${m.key}">${src}</div>` : ''; }).join('')}
        ${heroScene()}
      </div>
      <div class="stage-veil"></div>
      <div class="stage-copy wrap">
        ${moodList.map((m, i) => {
          const H = i === 0 ? 'h1' : 'h2';
          return `<article class="chapter${i === 0 ? ' is-active' : ''}" data-chapter="${m.key}" id="mood-${m.key}">
            <p class="eyebrow">${esc(m.eyebrow)}${i === 0 ? '<span class="eyebrow-extra"> · Smithfield, Hampton Roads &amp; Williamsburg</span>' : ''}</p>
            <${H} class="chapter-title"><span class="script">${esc(m.title[0])}</span><span class="display">${esc(m.title[1])}</span></${H}>
            <p class="lede">${esc(m.lede)}</p>
            <div class="chapter-actions">
              <a class="btn btn-accent magnetic" href="${m.cta.href}">${esc(m.cta.label)} ${icon('arrow')}</a>
              <a class="btn btn-link" href="${m.link}">Explore ${esc(m.label.toLowerCase())}</a>
            </div>
          </article>`;
        }).join('')}
      </div>
      <button class="stage-arrow prev" data-stage-prev aria-label="Previous experience">${icon('left')}</button>
      <button class="stage-arrow next" data-stage-next aria-label="Next experience">${icon('right')}</button>
      <div class="mood-switch" role="tablist" aria-label="Choose an experience">
        ${moodList.map((m, i) => `<button role="tab" data-goto="${m.key}" aria-selected="${i === 0}" aria-controls="mood-${m.key}"><span>${esc(m.label)}</span><i class="tab-progress"></i></button>`).join('')}
      </div>
      <div class="scroll-cue" aria-hidden="true"><span>Scroll to explore</span><i></i></div>
    </div>
    <div class="stage-track" aria-hidden="true">${moodList.map((m) => `<div class="stage-step" data-step="${m.key}"></div>`).join('')}</div>
  </section>`;

  const body = `${stage}
  <section class="section section-features"><div class="wrap">${features()}</div></section>

  <section class="section intro">
    <div class="wrap narrow center">
      <p class="eyebrow reveal">The Perfect Spread difference</p>
      <h2 class="h-display reveal">More than a picnic. <span class="script">It’s an experience.</span></h2>
      <p class="lede reveal">${esc(business.shortPitch)} From romantic dates to celebrations with family and friends, we create beautifully styled outdoor experiences across Smithfield, Hampton Roads and Williamsburg.</p>
    </div>
    <div class="marquee" aria-label="Occasions we style">
      ${[0, 1].map((row) => `<div class="marquee-row${row ? ' reverse' : ''}"><ul>${[...C.occasions.slice(row * 9, row * 9 + 9), ...C.occasions.slice(row * 9, row * 9 + 9)].map((o, i) => {
        const slug = occasionLinks[o];
        const inner = `${icon(['heart', 'sparkle', 'flower'][i % 3])}<span>${esc(o)}</span>`;
        return `<li${i >= 9 ? ' aria-hidden="true"' : ''}>${slug ? `<a href="/services/${slug}"${i >= 9 ? ' tabindex="-1"' : ''}>${inner}</a>` : `<span class="chip">${inner}</span>`}</li>`;
      }).join('')}</ul></div>`).join('')}
    </div>
  </section>

  <section class="section packages-section" id="packages">
    <div class="wrap">
      <div class="section-head">
        <div><p class="eyebrow reveal">Signature experiences</p><h2 class="h-display reveal">Choose your <span class="script">spread</span></h2></div>
        <div class="filters" role="group" aria-label="Filter packages">
          <button class="chip is-on" data-filter-btn="all" aria-pressed="true">All</button>
          ${Object.values(moods).map((m) => `<button class="chip" data-filter-btn="${m.key}" aria-pressed="false">${esc(m.label)}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="rail" data-rail>
      <div class="rail-track">${packages.map((p) => packageCard(p)).join('')}</div>
    </div>
    <div class="wrap rail-foot">
      <div class="rail-controls"><button data-rail-prev aria-label="Scroll packages left">${icon('left')}</button><button data-rail-next aria-label="Scroll packages right">${icon('right')}</button></div>
      <p class="fine">Prices for 2 guests · ${policies.duration} · +$${policies.extraGuest}/guest up to ${policies.maxStandardGuests} · Custom pricing for larger groups</p>
      <a class="btn btn-ghost" href="/packages">Compare all packages ${icon('arrow')}</a>
    </div>
  </section>

  <section class="section how" id="how-it-works">
    <div class="wrap">
      <div class="section-head center"><p class="eyebrow reveal">How it works</p><h2 class="h-display reveal">Show up. <span class="script">We handle the rest.</span></h2></div>
      ${steps()}
    </div>
  </section>

  <section class="section addons">
    <div class="wrap">
      <div class="section-head center"><p class="eyebrow reveal">Make it yours</p><h2 class="h-display reveal">Thoughtful add-ons</h2></div>
      <ul class="addon-grid">${C.addOns.map((a) => `<li class="reveal tilt">${icon(a.icon, 'icon-lg')}<span>${esc(a.name)}</span></li>`).join('')}</ul>
      <p class="center fine">Themes include ${C.themes.map((t) => t.toLowerCase()).join(', ')} — or bring us your own vision.</p>
    </div>
  </section>

  <section class="section places" id="locations">
    <div class="wrap places-grid">
      <div>
        <p class="eyebrow reveal">Beautiful settings</p>
        <h2 class="h-display reveal">Hampton Roads <span class="script">looks better together</span></h2>
        <p class="reveal">We’re based in Smithfield and set up at waterfronts, beaches, scenic parks, backyards and private venues across Hampton Roads and Williamsburg. Not sure where to go? We’ll help you find the perfect spot.</p>
        <ul class="area-chips reveal">${areas.map((a) => `<li><a class="chip" href="/service-areas/${a.slug}">${icon('pin')} ${esc(a.name)}</a></li>`).join('')}</ul>
      </div>
      <div class="reveal">${areaMap()}</div>
    </div>
  </section>

  <section class="section about-teaser">
    <div class="wrap about-grid">
      <div class="about-art reveal">${media('ashlie-hampton', heroScene(), `${business.founder}, ${business.founderTitle}`)}</div>
      <div>
        <p class="eyebrow reveal">Meet your curator</p>
        <h2 class="h-display reveal">${esc(business.founder)}</h2>
        <p class="reveal">Founder and picnic curator ${esc(business.founder)} blends meticulous planning with fresh ideas to design experiences that feel effortless. She especially loves the waterfront settings and scenic parks throughout Hampton Roads and Williamsburg — and making sure every guest feels like the occasion was made just for them.</p>
        ${credentials()}
        <a class="btn btn-ghost reveal" href="/about">Our story ${icon('arrow')}</a>
      </div>
    </div>
  </section>

  ${testimonials()}

  <section class="section faq-section">
    <div class="wrap narrow">
      <div class="section-head center"><p class="eyebrow reveal">Good to know</p><h2 class="h-display reveal">Questions, answered</h2></div>
      ${faqList(faqs.slice(0, 5), { open: 1 })}
      <p class="center"><a class="btn btn-link" href="/faq">All FAQs</a></p>
    </div>
  </section>

  ${ctaBand(null)}`;

  return layout({
    title: 'Luxury Picnics in Smithfield, Hampton Roads & Williamsburg, VA | Perfect Spread',
    description: `Luxury picnic and event experiences in Smithfield, Hampton Roads and Williamsburg, VA. Proposals, birthdays, showers, date nights and corporate events — fully styled, set up and cleaned up. From ${money(packages[0].price)}.`,
    path: '/',
    mood: 'picnic',
    body,
    bodyClass: 'is-home',
    jsonld: [seo.localBusiness(), seo.website(), seo.faqPage(faqs)],
  });
}

/* ----------------------------------------------------------- services -- */

function servicesIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Experiences', path: '/services' }];
  const groups = Object.values(moods).map((m) => `<section class="section svc-group" data-mood="${m.key}">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow">${esc(m.eyebrow)}</p><h2 class="h-display"><span class="script">${esc(m.script)}</span> ${esc(m.label.toLowerCase())}</h2></div>
      <ul class="svc-grid">${svcFor(m.key).map((s) => `<li class="reveal"><a href="/services/${s.slug}" class="svc-card"><h3>${esc(s.name)}</h3><p>${esc(s.tagline)}</p><span class="pkg-more">Explore ${icon('arrow')}</span></a></li>`).join('')}</ul>
    </div>
  </section>`).join('');

  return layout({
    title: 'Picnic & Event Experiences in Hampton Roads',
    description: 'Romantic picnics, proposals, birthdays, bridal and baby showers, corporate events and full event planning across Smithfield, Hampton Roads and Williamsburg, VA.',
    path: '/services',
    mood: 'picnic',
    crumbs,
    body: `${pageHero({ mood: 'picnic', eyebrow: 'Experiences', script: 'Every', title: 'occasion, beautifully styled', lede: 'One team, endless settings. Find the experience made for your moment.' })}${groups}${ctaBand('picnic')}`,
    jsonld: [seo.localBusiness(), seo.breadcrumbs(crumbs)],
  });
}

function serviceBody(svc, area) {
  const recommended = svc.packages.map(findPkg).filter(Boolean);
  const where = area ? `${area.name}, VA` : 'Hampton Roads';
  const areaFaq = area ? [
    [`Do you set up ${svc.name.toLowerCase()} in ${area.name}?`, `Yes. ${business.name} is based in Smithfield and regularly travels to ${area.name} and the surrounding ${area.county} area. Any travel details are confirmed in your quote.`],
    [`Where can we have a picnic in ${area.name}?`, `Popular options include ${area.settings.slice(0, 3).join(', ')}, as well as private homes and venues. Each public space has its own rules for vendors and permits — we’ll help you choose a spot that works.`],
  ] : [];
  const pageFaqs = [...areaFaq, ...svc.faq, ...faqs.slice(1, 4)];

  return {
    pageFaqs,
    html: `
  <section class="section svc-intro">
    <div class="wrap svc-intro-grid">
      <div>
        <p class="eyebrow reveal">${esc(svc.name)}${area ? ` · ${esc(area.name)}` : ''}</p>
        <h2 class="h-display reveal">${esc(svc.tagline)}</h2>
        <p class="lede reveal">${esc(svc.intro)}</p>
        ${area ? `<p class="reveal">${esc(area.intro)}</p>` : ''}
      </div>
      <ul class="checks reveal">${svc.highlights.map((h) => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
    </div>
  </section>

  ${recommended.length ? `<section class="section">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow reveal">Recommended packages</p><h2 class="h-display reveal">Perfect for ${esc(svc.name.toLowerCase())}${area ? ` in ${esc(area.name)}` : ''}</h2></div>
      <div class="pkg-grid">${recommended.map((p) => packageCard(p)).join('')}</div>
      <p class="fine">All packages are priced for 2 guests for ${policies.duration}. Additional guests $${policies.extraGuest} each up to ${policies.maxStandardGuests}; custom pricing for larger groups.</p>
    </div>
  </section>` : `<section class="section"><div class="wrap narrow">
      <div class="section-head"><p class="eyebrow">What we handle</p><h2 class="h-display">Every detail, start to finish</h2></div>
      <p>Whether you’re planning a wedding, corporate function, milestone celebration or nonprofit fundraiser, we handle concept and design, venue selection, vendor coordination for catering, entertainment, florals and rentals, logistics and timelines, and on-site coordination — so you can enjoy the moment with confidence. Every event planning project is custom-quoted.</p>
    </div></section>`}

  ${area ? `<section class="section settings" data-mood="${svc.mood}">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow reveal">Settings we love in ${esc(area.name)}</p><h2 class="h-display reveal">Where to set the scene</h2></div>
      <ul class="setting-grid">${area.settings.map((s) => `<li class="reveal">${icon('pin', 'icon-lg')}<span>${esc(s)}</span></li>`).join('')}</ul>
      <p class="fine">Public parks and beaches each have their own vendor, permit and alcohol rules. We’ll confirm what’s allowed before your booking.</p>
    </div>
  </section>` : `<section class="section">
    <div class="wrap">
      <div class="section-head"><p class="eyebrow reveal">Where we set up</p><h2 class="h-display reveal">${esc(svc.name)} near you</h2></div>
      <ul class="area-chips">${areas.map((a) => `<li><a class="chip" href="/services/${svc.slug}/${a.slug}">${icon('pin')} ${esc(svc.name)} in ${esc(a.name)}</a></li>`).join('')}</ul>
    </div>
  </section>`}

  <section class="section how"><div class="wrap">
    <div class="section-head center"><p class="eyebrow reveal">How booking works</p><h2 class="h-display reveal">Five simple steps</h2></div>
    ${steps()}
  </div></section>

  <section class="section"><div class="wrap narrow">
    <div class="section-head center"><p class="eyebrow reveal">FAQ</p><h2 class="h-display reveal">${esc(svc.name)} in ${esc(where)}: your questions</h2></div>
    ${faqList(pageFaqs, { open: 1 })}
  </div></section>

  ${area ? `<section class="section related"><div class="wrap related-grid">
    <div><h2 class="h-sub">${esc(svc.name)} in nearby cities</h2><ul class="link-list">${areas.filter((a) => a.slug !== area.slug).map((a) => `<li><a href="/services/${svc.slug}/${a.slug}">${esc(svc.name)} in ${esc(a.name)}</a></li>`).join('')}</ul></div>
    <div><h2 class="h-sub">More experiences in ${esc(area.name)}</h2><ul class="link-list">${services.filter((s) => s.slug !== svc.slug).slice(0, 8).map((s) => `<li><a href="/services/${s.slug}/${area.slug}">${esc(s.name)} in ${esc(area.name)}</a></li>`).join('')}</ul></div>
  </div></section>` : `<section class="section related"><div class="wrap">
    <h2 class="h-sub">You might also love</h2>
    <ul class="link-list cols">${services.filter((s) => s.slug !== svc.slug).map((s) => `<li><a href="/services/${s.slug}">${esc(s.name)}</a></li>`).join('')}</ul>
  </div></section>`}

  ${ctaBand(svc.mood, { href: `/contact?experience=${encodeURIComponent(svc.name)}${area ? `&area=${encodeURIComponent(area.name)}` : ''}` })}`,
  };
}

function service(svc, area) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Experiences', path: '/services' }, { name: svc.name, path: `/services/${svc.slug}` }];
  if (area) crumbs.push({ name: area.name, path: `/services/${svc.slug}/${area.slug}` });
  const m = moods[svc.mood];
  const { html, pageFaqs } = serviceBody(svc, area);
  const recommended = svc.packages.map(findPkg).filter(Boolean);
  const from = recommended.length ? ` From ${money(Math.min(...recommended.map((p) => p.price)))}.` : '';
  const title = area ? `${svc.name} in ${area.name}, VA` : `${svc.name} in Hampton Roads & Williamsburg, VA`;
  const description = area
    ? `${svc.name} in ${area.name}, Virginia by Perfect Spread. ${svc.tagline} Fully styled, set up and cleaned up for you.${from}`
    : `${svc.name} by Perfect Spread across Smithfield, Hampton Roads and Williamsburg, VA. ${svc.tagline}${from}`;

  return layout({
    title,
    description,
    path: crumbs[crumbs.length - 1].path,
    mood: svc.mood,
    crumbs,
    body: `${pageHero({
      mood: svc.mood,
      eyebrow: area ? `${area.name}, Virginia` : m.eyebrow,
      script: area ? null : m.script,
      title: area ? `${svc.name} in ${area.name}` : svc.name,
      lede: svc.tagline + (area ? ` Styled, set up and cleaned up anywhere in ${area.name}.` : ' Styled, set up and cleaned up across Hampton Roads.'),
      ctaHref: `/contact?experience=${encodeURIComponent(svc.name)}${area ? `&area=${encodeURIComponent(area.name)}` : ''}`,
      ctaLabel: 'Check availability',
      photoKey: svc.slug,
    })}${html}`,
    drawer: { experience: svc.name, area: area && area.name },
    jsonld: [seo.service(svc, area), seo.breadcrumbs(crumbs), seo.faqPage(pageFaqs)],
  });
}

/* -------------------------------------------------------------- areas -- */

function areasIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/service-areas' }];
  return layout({
    title: 'Service Areas: Smithfield, Williamsburg, Norfolk, Virginia Beach & More',
    description: 'Perfect Spread brings luxury picnics and styled events to Smithfield, Suffolk, Williamsburg, Newport News, Hampton, Norfolk, Chesapeake and Virginia Beach.',
    path: '/service-areas',
    mood: 'picnic',
    crumbs,
    body: `${pageHero({ mood: 'picnic', eyebrow: 'Locations', script: 'Beautiful', title: 'places across Hampton Roads', lede: 'Based in Smithfield. Setting up at waterfronts, parks, beaches and backyards throughout the region.' })}
    <section class="section"><div class="wrap places-grid">
      <div class="reveal">${areaMap()}</div>
      <ul class="area-cards">${areas.map((a) => `<li class="reveal"><a href="/service-areas/${a.slug}"><h2 class="h-sub">${esc(a.name)}, VA</h2><p>${esc(a.intro)}</p><span class="pkg-more">Explore ${icon('arrow')}</span></a></li>`).join('')}</ul>
    </div></section>${ctaBand('picnic')}`,
    jsonld: [seo.localBusiness(), seo.breadcrumbs(crumbs)],
  });
}

function area(a) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Locations', path: '/service-areas' }, { name: a.name, path: `/service-areas/${a.slug}` }];
  const areaFaqs = [
    [`Do you offer luxury picnics in ${a.name}?`, `Yes — ${business.name} sets up picnics and styled events throughout ${a.name} and ${a.county}.`],
    [`Where are the best picnic spots in ${a.name}?`, `Some of our favorite settings include ${a.settings.join(', ')}. We’ll help you check vendor and permit rules for public spaces.`],
    ...faqs.slice(1, 3),
  ];
  return layout({
    title: `Luxury Picnics & Events in ${a.name}, VA`,
    description: `Luxury picnics, proposals, birthdays and showers in ${a.name}, VA. ${business.name} handles styling, setup and cleanup at ${a.settings[0]} and beyond. From ${money(packages[0].price)}.`,
    path: `/service-areas/${a.slug}`,
    mood: 'picnic',
    crumbs,
    body: `${pageHero({ mood: 'picnic', eyebrow: `${a.county}`, title: `Luxury picnics in ${a.name}, VA`, lede: a.intro, ctaHref: `/contact?area=${encodeURIComponent(a.name)}` })}
    <section class="section"><div class="wrap">
      <div class="section-head"><p class="eyebrow reveal">Settings we love</p><h2 class="h-display reveal">Where to picnic in ${esc(a.name)}</h2></div>
      <ul class="setting-grid">${a.settings.map((s) => `<li class="reveal">${icon('pin', 'icon-lg')}<span>${esc(s)}</span></li>`).join('')}</ul>
    </div></section>
    ${Object.values(moods).map((m) => `<section class="section svc-group" data-mood="${m.key}"><div class="wrap">
      <div class="section-head"><p class="eyebrow">${esc(m.eyebrow)}</p><h2 class="h-display"><span class="script">${esc(m.script)}</span> in ${esc(a.name)}</h2></div>
      <ul class="svc-grid">${svcFor(m.key).map((s) => `<li class="reveal"><a class="svc-card" href="/services/${s.slug}/${a.slug}"><h3>${esc(s.name)} in ${esc(a.name)}</h3><p>${esc(s.tagline)}</p><span class="pkg-more">Explore ${icon('arrow')}</span></a></li>`).join('')}</ul>
    </div></section>`).join('')}
    <section class="section"><div class="wrap narrow"><div class="section-head center"><h2 class="h-display">${esc(a.name)} picnic FAQ</h2></div>${faqList(areaFaqs, { open: 1 })}</div></section>
    ${ctaBand('picnic', { href: `/contact?area=${encodeURIComponent(a.name)}` })}`,
    drawer: { area: a.name },
    jsonld: [seo.localBusiness(), seo.breadcrumbs(crumbs), seo.faqPage(areaFaqs)],
  });
}

/* ----------------------------------------------------------- packages -- */

function packagesIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Packages', path: '/packages' }];
  return layout({
    title: 'Picnic Packages & Pricing',
    description: `Luxury picnic packages from ${money(packages[0].price)} for two: Basic, Teepee, Cabana, Egg Chair, Igloo, Haunted, Senior Photo and Proposal picnics in Hampton Roads, VA.`,
    path: '/packages',
    mood: 'picnic',
    crumbs,
    body: `${pageHero({ mood: 'picnic', eyebrow: 'Packages & pricing', script: 'Choose', title: 'your spread', lede: `Every package is priced for two guests for ${policies.duration}, fully styled with setup and cleanup included.` })}
    <section class="section"><div class="wrap">
      <div class="pkg-grid">${packages.map((p) => packageCard(p, { headingLevel: 2 })).join('')}</div>
    </div></section>
    <section class="section pricing-notes"><div class="wrap pricing-grid">
      <div class="reveal"><h2 class="h-sub">Guests</h2><p>Packages include 2 guests. Add guests for $${policies.extraGuest} each, up to ${policies.maxStandardGuests}. Larger groups get custom pricing.</p></div>
      <div class="reveal"><h2 class="h-sub">Reserving</h2><p>A ${policies.deposit} deposit reserves your date; the balance is due ${policies.balanceDue}. We hold dates for ${policies.dateHold} after your quote.</p></div>
      <div class="reveal"><h2 class="h-sub">Add-ons</h2><p>${C.addOns.map((a) => a.name).join(', ')}.</p></div>
    </div></section>
    <section class="section how"><div class="wrap"><div class="section-head center"><h2 class="h-display">How booking works</h2></div>${steps()}</div></section>
    ${ctaBand('picnic')}`,
    jsonld: [seo.localBusiness(), seo.breadcrumbs(crumbs)],
  });
}

function packageDetail(p) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Packages', path: '/packages' }, { name: p.name, path: `/packages/${p.slug}` }];
  const related = packages.filter((x) => x.slug !== p.slug && (x.mood === p.mood || x.price === p.price)).slice(0, 3);
  const body = `
  <section class="pkg-hero" data-mood="${p.mood}">
    <div class="wrap pkg-hero-grid">
      <div class="pkg-hero-art reveal">${media(p.slug, cardScene(p.art, `${p.name} illustration`), p.name, { eager: true })}</div>
      <div class="pkg-hero-copy">
        <p class="eyebrow">Package${p.seasonal ? ` · ${esc(p.seasonal)}` : ''}</p>
        <h1 class="h-display">${esc(p.name)}</h1>
        <p class="pkg-price big">${money(p.price)} <span>+ tax · 2 guests · ${policies.duration}</span></p>
        <p class="lede">${esc(p.blurb)}</p>
        <h2 class="h-sub">What’s included</h2>
        <ul class="checks">${p.includes.map((i) => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('')}</ul>
        <p class="fine">Additional guests $${policies.extraGuest} each up to ${policies.maxStandardGuests}. Groups over ${policies.maxStandardGuests} receive custom pricing.</p>
        <div class="chapter-actions">
          <a class="btn btn-accent magnetic" href="/contact?package=${encodeURIComponent(p.slug)}">Book the ${esc(p.name)} ${icon('arrow')}</a>
          <a class="btn btn-link" href="/packages">All packages</a>
        </div>
      </div>
    </div>
  </section>
  <section class="section how"><div class="wrap"><div class="section-head center"><h2 class="h-display">How booking works</h2></div>${steps()}</div></section>
  ${related.length ? `<section class="section"><div class="wrap"><div class="section-head"><h2 class="h-display">You may also love</h2></div><div class="pkg-grid">${related.map((r) => packageCard(r)).join('')}</div></div></section>` : ''}
  ${ctaBand(p.mood, { href: `/contact?package=${encodeURIComponent(p.slug)}` })}`;

  return layout({
    title: `${p.name} — ${money(p.price)} Luxury Picnic in Hampton Roads`,
    description: `${p.name} from ${money(p.price)} + tax for two guests, ${policies.duration}. ${p.blurb} Serving Smithfield, Hampton Roads & Williamsburg, VA.`,
    path: `/packages/${p.slug}`,
    mood: p.mood,
    crumbs,
    body,
    drawer: { pkg: p.slug },
    jsonld: [seo.packageSchema(p), seo.breadcrumbs(crumbs)],
  });
}

/* ----------------------------------------------------- about, faq etc -- */

function about() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }];
  return layout({
    title: `About ${business.founder}, Founder & Picnic Curator`,
    description: `Meet ${business.founder}, founder and picnic curator of Perfect Spread — a mobile luxury picnic and event experience company based in Smithfield, VA.`,
    path: '/about',
    mood: 'celebrate',
    crumbs,
    body: `${pageHero({ mood: 'celebrate', eyebrow: 'Our story', script: 'Good food,', title: 'great company, beautiful places', lede: 'A mobile luxury picnic and event-experience company based in Smithfield, Virginia.' })}
    <section class="section"><div class="wrap about-grid">
      <div class="about-art reveal">${media('ashlie-hampton', heroScene(), `${business.founder}, ${business.founderTitle}`)}</div>
      <div>
        <p class="eyebrow reveal">${esc(business.founderTitle)}</p>
        <h2 class="h-display reveal">Hi, I’m Ashlie.</h2>
        <p class="reveal">${esc(business.name)} creates luxurious outdoor dining experiences — curated picnics with elegant setups and local food that transform any gathering into a memorable event. Whether your style is romantic and whimsical or sleek and modern, we craft a picnic that captures your unique vibe.</p>
        <p class="reveal">Each setup is thoughtfully curated to immerse you in a serene, beautiful space — perfect for unwinding and connecting with those who matter most. We handle every detail, from planning and styling to full setup and cleanup, so all you have to do is show up.</p>
        <p class="reveal">Beyond picnics, we offer full event planning for weddings, corporate functions, milestone celebrations and nonprofit fundraisers.</p>
        ${credentials()}
      </div>
    </div></section>
    <section class="section"><div class="wrap">${features()}</div></section>
    ${ctaBand('celebrate')}`,
    jsonld: [seo.localBusiness(), seo.breadcrumbs(crumbs)],
  });
}

function faqPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }];
  const all = [...faqs, ...services.flatMap((s) => s.faq)];
  return layout({
    title: 'Luxury Picnic FAQ: Pricing, Guests, Weather & Booking',
    description: 'Answers about Perfect Spread picnic pricing, guest counts, deposits, locations, weather and add-ons in Hampton Roads and Williamsburg, VA.',
    path: '/faq',
    mood: 'picnic',
    crumbs,
    body: `${pageHero({ mood: 'picnic', eyebrow: 'FAQ', script: 'Good', title: 'to know', lede: 'Everything you need to plan your picnic with confidence.' })}
    <section class="section"><div class="wrap narrow">${faqList(all, { open: 1 })}</div></section>${ctaBand('picnic')}`,
    jsonld: [seo.breadcrumbs(crumbs), seo.faqPage(all)],
  });
}

function contact(query = {}) {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }];
  const pre = {
    pkg: findPkg(query.package) ? query.package : '',
    experience: String(query.experience || '').slice(0, 80),
    area: String(query.area || '').slice(0, 40),
  };
  const opt = (v, label, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
  const occasionsOpts = C.inquiryOccasions;
  const exp = pre.experience.toLowerCase();
  const matchOcc = occasionsOpts.find((o) => exp && (exp.includes(o.toLowerCase().split(' ')[0]) || o.toLowerCase().includes(exp.split(' ')[0])));
  const sent = query.sent === '1';

  const body = `${pageHero({ mood: 'celebrate', eyebrow: 'Inquire', script: 'Let’s plan', title: 'something beautiful', lede: `Tell us about your event and we’ll reply within ${policies.responseTime} with details and a quote.`, ctaHref: '#inquiry', ctaLabel: 'Start below' })}
  <section class="section" id="inquiry"><div class="wrap contact-grid">
    <div class="form-card reveal">
      ${sent ? '<div class="notice success" role="status"><strong>Thank you!</strong> Your inquiry is in. We’ll be in touch within 24 hours.</div>' : ''}
      <form class="inquiry" method="post" action="/api/inquiry" data-inquiry novalidate>
        <div class="field-row">
          <label class="field"><span>Your name *</span><input name="name" autocomplete="name" required maxlength="100"></label>
          <label class="field"><span>Email *</span><input name="email" type="email" autocomplete="email" required maxlength="160"></label>
        </div>
        <div class="field-row">
          <label class="field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel" maxlength="40"></label>
          <label class="field"><span>Event date *</span><input name="date" type="date" required></label>
        </div>
        <div class="field-row">
          <label class="field"><span>Occasion</span><select name="occasion"><option value="">Select…</option>${occasionsOpts.map((o) => opt(o, o, o === matchOcc)).join('')}</select></label>
          <label class="field"><span>Package</span><select name="package"><option value="">Not sure yet</option>${packages.map((p) => opt(p.slug, `${p.name} — ${money(p.price)}`, p.slug === pre.pkg)).join('')}</select></label>
        </div>
        <div class="field-row">
          <label class="field"><span>Guests</span><input name="guests" type="number" min="1" max="500" value="2"></label>
          <label class="field"><span>Area</span><select name="area"><option value="">Select…</option>${areas.map((a) => opt(a.name, `${a.name}, VA`, a.name === pre.area)).join('')}${opt('Other', 'Other / not sure', false)}</select></label>
        </div>
        <label class="field"><span>Preferred location or venue</span><input name="location" maxlength="200" placeholder="e.g. Jamestown Beach, our backyard, help me choose"></label>
        <fieldset class="field">
          <legend>Add-ons you’re interested in</legend>
          <div class="checkgrid">${C.addOns.map((a) => `<label class="check"><input type="checkbox" name="addons" value="${esc(a.name)}"><span>${esc(a.name)}</span></label>`).join('')}</div>
        </fieldset>
        <label class="field"><span>Tell us your vision</span><textarea name="message" rows="5" maxlength="3000" placeholder="Colors, theme, surprises, dietary needs…">${pre.experience ? esc(`I’m interested in: ${pre.experience}. `) : ''}</textarea></label>
        <label class="hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
        <input type="hidden" name="page" value="/contact">
        <button class="btn btn-accent magnetic" type="submit">Send inquiry ${icon('arrow')}</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
    <aside class="contact-aside">
      <div class="reveal">
        <h2 class="h-sub">Prefer to talk?</h2>
        <p><a href="tel:${business.phone}">${icon('phone')} ${business.phoneDisplay}</a></p>
        <p><a href="mailto:${business.email}">${icon('mail')} ${business.email}</a></p>
        <p>${icon('pin')} ${esc(business.city)}, ${business.region} ${business.postalCode}<br><small>Serving Hampton Roads &amp; Williamsburg</small></p>
      </div>
      <div class="reveal">
        <h2 class="h-sub">What happens next</h2>
        <ol class="mini-steps">${C.bookingSteps.slice(1).map((s) => `<li><strong>${esc(s.title)}.</strong> ${esc(s.text)}</li>`).join('')}</ol>
      </div>
      <p class="fine reveal">Planning something last-minute? Reach out anyway — we’ll always try to make it work.</p>
    </aside>
  </div></section>`;

  return layout({
    title: 'Book a Luxury Picnic — Inquiry',
    description: `Request a quote for a luxury picnic or styled event in Smithfield, Hampton Roads or Williamsburg, VA. We reply within ${policies.responseTime}.`,
    path: '/contact',
    mood: 'celebrate',
    crumbs,
    body,
    noindex: sent,
    drawer: false,
    jsonld: [seo.localBusiness(), seo.breadcrumbs(crumbs)],
  });
}

function notFound() {
  return layout({
    title: 'Page not found',
    description: 'This page has wandered off for a picnic.',
    path: '/404',
    mood: 'romance',
    noindex: true,
    body: `${pageHero({ mood: 'romance', eyebrow: '404', script: 'Oops', title: '— this spot is taken', lede: 'The page you’re looking for has wandered off for a picnic. Let’s get you somewhere beautiful.', ctaHref: '/', ctaLabel: 'Back home' })}`,
  });
}

module.exports = { home, servicesIndex, service, areasIndex, area, packagesIndex, packageDetail, about, faqPage, contact, notFound };
