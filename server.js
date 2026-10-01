'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');

const pages = require('./src/pages');
const seo = require('./src/seo');
const { services, areas, packages, business } = require('./src/content');
const { SITE_URL } = require('./src/layout');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const isServerless = Boolean(process.env.VERCEL);
const isProd = process.env.NODE_ENV === 'production' || isServerless;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.set('strict routing', false);
app.use(compression());

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});

// Legacy URLs from the previous site → new pages (keeps existing search rankings).
const legacy = {
  '/index': '/',
  '/home': '/',
  '/basic-picnic-package': '/packages/basic-picnic',
  '/eventplanningservices': '/services/event-planning',
  '/ashlie-hampton': '/about',
  '/contact-us': '/contact',
  '/pricing': '/packages',
};
// Canonical URLs: lowercase, no trailing slash (except root).
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const { path: p } = req;
  let target = p;
  if (target.length > 1 && target.endsWith('/')) target = target.replace(/\/+$/, '');
  if (legacy[target.toLowerCase()]) return res.redirect(301, legacy[target.toLowerCase()]);
  if (/[A-Z]/.test(target) && !target.startsWith('/img/')) target = target.toLowerCase();
  if (target !== p) return res.redirect(301, target + (req.url.slice(p.length) || ''));
  return next();
});


app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '30d' : 0,
  setHeaders(res, file) {
    if (/\.(css|js)$/.test(file)) res.set('Cache-Control', isProd ? 'public, max-age=31536000, immutable' : 'no-cache');
  },
}));

// On Vercel the CDN caches rendered pages; browsers always revalidate.
const PAGE_CACHE = isServerless ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' : 'public, max-age=300';
const html = (res, body, status = 200) => {
  if (!res.get('Cache-Control')) res.set('Cache-Control', PAGE_CACHE);
  return res.status(status).type('html').send(body);
};

// Pages are rendered once and cached in memory (contact varies by query string).
const cache = new Map();
const cached = (key, fn) => {
  if (!isProd) return fn();
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
};

app.get('/', (req, res) => html(res, cached('/', pages.home)));
app.get('/services', (req, res) => html(res, cached('/services', pages.servicesIndex)));
app.get('/services/:svc', (req, res, next) => {
  const svc = services.find((s) => s.slug === req.params.svc);
  return svc ? html(res, cached(req.path, () => pages.service(svc))) : next();
});
app.get('/services/:svc/:area', (req, res, next) => {
  const svc = services.find((s) => s.slug === req.params.svc);
  const area = areas.find((a) => a.slug === req.params.area);
  return svc && area ? html(res, cached(req.path, () => pages.service(svc, area))) : next();
});
app.get('/service-areas', (req, res) => html(res, cached('/service-areas', pages.areasIndex)));
app.get('/service-areas/:area', (req, res, next) => {
  const area = areas.find((a) => a.slug === req.params.area);
  return area ? html(res, cached(req.path, () => pages.area(area))) : next();
});
app.get('/packages', (req, res) => html(res, cached('/packages', pages.packagesIndex)));
app.get('/packages/:pkg', (req, res, next) => {
  const pkg = packages.find((p) => p.slug === req.params.pkg);
  return pkg ? html(res, cached(req.path, () => pages.packageDetail(pkg))) : next();
});
app.get('/about', (req, res) => html(res, cached('/about', pages.about)));
app.get('/faq', (req, res) => html(res, cached('/faq', pages.faqPage)));
app.get('/contact', (req, res) => {
  res.set('Cache-Control', 'no-store');
  html(res, pages.contact(req.query));
});

app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(seo.sitemap()));
app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`));
app.get('/healthz', (req, res) => res.json({ ok: true }));

/* ------------------------------------------------------------ inquiries -- */

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const clean = (v, max = 200) => String(Array.isArray(v) ? v.join(', ') : v ?? '').trim().slice(0, max);

app.post('/api/inquiry', express.urlencoded({ extended: false, limit: '20kb' }), express.json({ limit: '20kb' }), async (req, res) => {
  const wantsJson = req.is('application/json') || (req.get('accept') || '').includes('application/json');
  const b = req.body || {};
  const reply = (status, payload) => (wantsJson
    ? res.status(status).json(payload)
    : status < 400 ? res.redirect(303, '/contact?sent=1#inquiry') : res.status(status).type('text').send(payload.error));

  // Honeypot: pretend success for bots.
  if (b.company) return reply(200, { ok: true });
  if (rateLimited(req.ip)) return reply(429, { error: 'Too many requests — please call or email us instead.' });

  const inquiry = {
    receivedAt: new Date().toISOString(),
    name: clean(b.name, 100),
    email: clean(b.email, 160),
    phone: clean(b.phone, 40),
    date: clean(b.date, 20),
    occasion: clean(b.occasion, 80),
    package: clean(b.package, 80),
    guests: clean(b.guests, 5),
    area: clean(b.area, 60),
    location: clean(b.location, 200),
    addons: clean(b.addons, 300),
    message: clean(b.message, 3000),
    page: clean(b.page, 200),
  };

  const errors = {};
  if (!inquiry.name) errors.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(inquiry.email)) errors.email = 'Please enter a valid email.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inquiry.date)) errors.date = 'Please choose your event date.';
  if (Object.keys(errors).length) return reply(422, { error: 'Please check the highlighted fields.', errors });

  if (isServerless) {
    // Serverless filesystems are read-only; the inquiry is kept in the
    // function logs and delivered via INQUIRY_WEBHOOK_URL.
    console.log('INQUIRY', JSON.stringify(inquiry));
  } else {
    try {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
      await fs.promises.appendFile(path.join(DATA_DIR, 'inquiries.jsonl'), `${JSON.stringify(inquiry)}\n`);
    } catch (err) {
      console.error('Could not store inquiry', err);
    }
  }

  // Forward to Zapier/Make/Slack/CRM. Awaited so serverless functions don't
  // freeze before the request is sent.
  if (process.env.INQUIRY_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.INQUIRY_WEBHOOK_URL, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source: business.name, ...inquiry }),
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) console.error('Inquiry webhook responded', r.status);
    } catch (err) {
      console.error('Inquiry webhook failed', err.message);
    }
  }

  return reply(200, { ok: true, message: 'Thank you! We’ll be in touch within 24 hours.' });
});

app.use((req, res) => html(res.set('Cache-Control', 'no-store'), pages.notFound(), 404));

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).type('text').send('Something went wrong.');
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Perfect Spread running at http://localhost:${PORT}`));
}

module.exports = app;
