'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { business, services, areas, moods, packages, policies, inquiryOccasions } = require('./content');
const { icon } = require('./art');
const { a11yWidget, earlyScript } = require('./a11y');
const { chatWidget } = require('./chat');

// Canonical origin. Set SITE_URL once the custom domain points at Vercel;
// until then the project's production *.vercel.app URL is used.
const SITE_URL = (process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  || 'https://perfectspread.org').replace(/\/$/, '');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const money = (n) => `$${Number(n).toLocaleString('en-US')}`;
const abs = (p) => `${SITE_URL}${p}`;

// Asset fingerprint for cache-busting static files. Hashes file contents
// (not mtimes, which hosts like Vercel reset on every deploy), so the URL
// changes exactly when the CSS or JS changes.
const ASSET_VERSION = (() => {
  try {
    const hash = crypto.createHash('sha1');
    ['css/main.css', 'js/main.js'].forEach((f) => hash.update(fs.readFileSync(path.join(PUBLIC_DIR, f))));
    return hash.digest('hex').slice(0, 10);
  } catch { return String(Date.now()); }
})();

/*
 * Real photography: drop e.g. public/img/photos/hero-picnic.jpg or
 * public/img/photos/cabana-picnic.jpg and it replaces the illustration.
 */
function photo(key) {
  for (const ext of ['webp', 'jpg', 'jpeg', 'png']) {
    if (fs.existsSync(path.join(PUBLIC_DIR, 'img', 'photos', `${key}.${ext}`))) return `/img/photos/${key}.${ext}`;
  }
  return null;
}

function media(key, fallback, alt, { eager = false, cls = '' } = {}) {
  const src = photo(key);
  if (!src) return fallback;
  return `<img class="photo ${cls}" src="${src}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

const ogImage = () => (photo('og-image') ? abs(photo('og-image')) : abs('/img/og-image.jpg'));

function breadcrumbsHtml(crumbs) {
  if (!crumbs || crumbs.length < 2) return '';
  return `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => (i === crumbs.length - 1
    ? `<li aria-current="page">${esc(c.name)}</li>`
    : `<li><a href="${c.path}">${esc(c.name)}</a></li>`)).join('')}</ol></nav>`;
}

function header(current) {
  const links = [
    ['/services', 'Experiences'],
    ['/packages', 'Packages'],
    ['/service-areas', 'Locations'],
    ['/about', 'About'],
    ['/faq', 'FAQ'],
  ];
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="${esc(business.name)} home">
      <span class="brand-script">Perfect Spread</span>
      <svg class="brand-flourish" viewBox="0 0 60 20" aria-hidden="true"><path d="M2 14c10-10 20 4 30-4s16-6 26 0"/><circle cx="44" cy="6" r="1.6"/><circle cx="50" cy="3" r="1"/></svg>
    </a>
    <nav class="nav" aria-label="Main">
      <ul class="nav-list" id="nav-list">
        ${links.map(([href, label]) => `<li><a href="${href}"${current && current.startsWith(href) ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}
        <li class="nav-cta-li"><a class="btn btn-sm btn-accent" href="/contact">Inquire</a></li>
      </ul>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-list"><span></span><span></span><span class="sr">Menu</span></button>
    </nav>
  </div>
</header>`;
}

function footer() {
  const social = Object.entries(business.social).filter(([, v]) => v);
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/"><span class="brand-script">Perfect Spread</span></a>
      <p>${esc(business.shortPitch)}</p>
      <p class="footer-script">Good food. Great company. Beautiful places.</p>
      ${social.length ? `<p class="social">${social.map(([k, v]) => `<a href="${esc(v)}" rel="noopener" target="_blank">${k[0].toUpperCase() + k.slice(1)}</a>`).join('')}</p>` : ''}
    </div>
    <div>
      <h2 class="footer-h">Experiences</h2>
      <ul>${services.slice(0, 8).map((s) => `<li><a href="/services/${s.slug}">${esc(s.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-h">Locations</h2>
      <ul>${areas.map((a) => `<li><a href="/service-areas/${a.slug}">${esc(a.name)}, VA</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="footer-h">Contact</h2>
      <address>
        <p><strong>${esc(business.founder)}</strong><br>${esc(business.founderTitle)}</p>
        <p><a href="mailto:${business.email}">${icon('mail')} ${business.email}</a></p>
        <p><a href="tel:${business.phone}">${icon('phone')} ${business.phoneDisplay}</a></p>
        <p>${icon('pin')} ${esc(business.city)}, ${business.region} ${business.postalCode}</p>
      </address>
      <a class="btn btn-sm btn-accent" href="/contact">Start your inquiry ${icon('arrow')}</a>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© ${new Date().getFullYear()} ${esc(business.name)} · Luxury picnics &amp; events in Smithfield, Hampton Roads &amp; Williamsburg, Virginia</p>
    <p><a href="/accessibility">Accessibility</a> · <a href="/sitemap.xml">Sitemap</a></p>
  </div>
</footer>`;
}


/*
 * Pull-out inquiry drawer: a tab fixed to the right edge on every page (except
 * /contact). Without JavaScript the tab is a plain link to /contact.
 */
function inquiryDrawer(pagePath, ctx = {}) {
  const opt = (v, label, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
  const exp = (ctx.experience || '').toLowerCase();
  const occ = exp && inquiryOccasions.find((o) => exp.includes(o.toLowerCase().split(' ')[0]) || o.toLowerCase().includes(exp.split(' ')[0]));
  return `<a class="pull-tab" href="/contact" data-drawer-open aria-controls="inquiry-drawer" aria-expanded="false">
  ${icon('calendar')}<span>Plan your picnic</span>
</a>
<div class="drawer-backdrop" data-drawer-close hidden></div>
<aside class="drawer" id="inquiry-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" hidden>
  <header class="drawer-head">
    <div>
      <p class="eyebrow">Inquire · reply within ${policies.responseTime}</p>
      <h2 id="drawer-title"><span class="script">Let’s plan</span> something beautiful</h2>
    </div>
    <button class="drawer-x" type="button" data-drawer-close aria-label="Close inquiry form"><span></span><span></span></button>
  </header>
  <div class="drawer-quick">
    <a href="tel:${business.phone}">${icon('phone')} Call</a>
    <a href="sms:${business.phone}">${icon('heart')} Text</a>
    <a href="mailto:${business.email}">${icon('mail')} Email</a>
  </div>
  <form class="inquiry drawer-form" method="post" action="/api/inquiry" data-inquiry novalidate>
    <label class="field"><span>Your name *</span><input name="name" autocomplete="name" required maxlength="100"></label>
    <div class="field-row stack">
      <label class="field"><span>Email *</span><input name="email" type="email" inputmode="email" autocomplete="email" required maxlength="160"></label>
      <label class="field"><span>Phone</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="40"></label>
    </div>
    <div class="field-row">
      <label class="field"><span>Event date *</span><input name="date" type="date" required></label>
      <label class="field"><span>Guests</span><input name="guests" type="number" inputmode="numeric" min="1" max="500" value="2"></label>
    </div>
    <div class="field-row">
      <label class="field"><span>Occasion</span><select name="occasion"><option value="">Select…</option>${inquiryOccasions.map((o) => opt(o, o, o === occ)).join('')}</select></label>
      <label class="field"><span>Area</span><select name="area"><option value="">Select…</option>${areas.map((a) => opt(a.name, a.name, a.name === ctx.area)).join('')}${opt('Other', 'Other / not sure', false)}</select></label>
    </div>
    <label class="field"><span>Package</span><select name="package"><option value="">Not sure yet</option>${packages.map((p) => opt(p.slug, `${p.name} — $${p.price}`, p.slug === ctx.pkg)).join('')}</select></label>
    <label class="field"><span>Your vision</span><textarea name="message" rows="3" maxlength="3000" placeholder="Colors, theme, surprises…">${ctx.experience ? esc(`I’m interested in: ${ctx.experience}${ctx.area ? ` in ${ctx.area}` : ''}. `) : ''}</textarea></label>
    <label class="hp" aria-hidden="true">Company<input name="company" tabindex="-1" autocomplete="off"></label>
    <input type="hidden" name="page" value="${esc(pagePath)}">
    <button class="btn btn-accent" type="submit">Send inquiry ${icon('arrow')}</button>
    <p class="form-status" role="status" aria-live="polite"></p>
    <p class="fine">We hold your date for ${policies.dateHold} after your quote. Prefer more detail? <a href="/contact">Use the full form</a>.</p>
  </form>
</aside>`;
}

const themeColor = { picnic: '#f3c3b8', celebrate: '#f3efe6', romance: '#0f0e14' };

function layout({ title, description, path: pagePath, mood = 'picnic', body, jsonld = [], crumbs, noindex = false, bodyClass = '', drawer = {} }) {
  const fullTitle = title.includes(business.name) ? title : `${title} | ${business.name}`;
  const ld = jsonld.filter(Boolean).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="en" data-mood="${mood}" data-page-mood="${mood}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(pagePath)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="${themeColor[mood]}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(business.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(pagePath)}">
<meta property="og:image" content="${ogImage()}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage()}">
<meta name="geo.region" content="US-VA">
<meta name="geo.placename" content="${esc(business.city)}">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&family=Pinyon+Script&display=swap">
<link rel="stylesheet" href="/css/main.css?v=${ASSET_VERSION}">
<script>${earlyScript}</script>
${ld}
</head>
<body class="${bodyClass}">
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<radialGradient id="ps-glow"><stop offset="0" stop-color="#ffc56b" stop-opacity=".9"/><stop offset=".4" stop-color="#ffb24d" stop-opacity=".35"/><stop offset="1" stop-color="#ffb24d" stop-opacity="0"/></radialGradient>
<radialGradient id="ps-bulb"><stop offset="0" stop-color="#ffe2a0" stop-opacity="1"/><stop offset=".45" stop-color="#ffc56a" stop-opacity=".35"/><stop offset="1" stop-color="#ffc56a" stop-opacity="0"/></radialGradient>
</defs></svg>
${header(pagePath)}
<main id="main">
${breadcrumbsHtml(crumbs)}
${body}
</main>
${footer()}
${drawer === false ? '' : inquiryDrawer(pagePath, drawer)}
${a11yWidget()}
${chatWidget()}
<script src="/js/main.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}

module.exports = { layout, esc, money, abs, media, photo, SITE_URL, moods };
