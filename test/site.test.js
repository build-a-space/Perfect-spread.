'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

process.env.SITE_URL = 'https://perfectspread.org';
const app = require('../server');
const { allPaths } = require('../src/seo');

let server; let base;
before(() => new Promise((resolve) => {
  server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; resolve(); });
}));
after(() => server.close());

test('every sitemap URL renders with SEO essentials', async () => {
  const paths = allPaths();
  assert.ok(paths.length > 150, `expected 150+ indexable pages, got ${paths.length}`);
  const titles = new Set();
  for (const p of paths) {
    const res = await fetch(base + p);
    assert.strictEqual(res.status, 200, p);
    const html = await res.text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title, `${p} title`);
    assert.ok(!titles.has(title), `duplicate title on ${p}: ${title}`);
    titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]{50,}"/, `${p} description`);
    assert.ok(html.includes(`<link rel="canonical" href="https://perfectspread.org${p}">`), `${p} canonical`);
    assert.strictEqual((html.match(/<h1[\s>]/g) || []).length, 1, `${p} should have exactly one h1`);
    for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(block[1]);
  }
});

test('legacy URLs 301 to their new homes', async () => {
  const cases = { '/index': '/', '/EventPlanningServices': '/services/event-planning', '/basic-picnic-package': '/packages/basic-picnic', '/ashlie-hampton': '/about' };
  for (const [from, to] of Object.entries(cases)) {
    const res = await fetch(base + from, { redirect: 'manual' });
    assert.strictEqual(res.status, 301, from);
    assert.strictEqual(new URL(res.headers.get('location'), base).pathname, to, from);
  }
});

test('robots, sitemap and 404', async () => {
  assert.match(await (await fetch(`${base}/robots.txt`)).text(), /Sitemap: https:\/\/perfectspread.org\/sitemap.xml/);
  assert.match(await (await fetch(`${base}/sitemap.xml`)).text(), /<urlset/);
  const nf = await fetch(`${base}/services/not-a-thing`);
  assert.strictEqual(nf.status, 404);
  assert.match(await nf.text(), /noindex/);
});

test('inquiry API validates and stores', async () => {
  const bad = await fetch(`${base}/api/inquiry`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '' }) });
  assert.strictEqual(bad.status, 422);
  const body = await bad.json();
  assert.ok(body.errors.email && body.errors.date && body.errors.name);

  const file = path.join(__dirname, '..', 'data', 'inquiries.jsonl');
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const ok = await fetch(`${base}/api/inquiry`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test Person', email: 'test@example.com', date: '2026-12-01', addons: ['Photography'] }),
  });
  assert.strictEqual(ok.status, 200);
  const after = fs.readFileSync(file, 'utf8');
  assert.ok(after.length > before.length);
  fs.writeFileSync(file, before); // leave no test data behind
});
