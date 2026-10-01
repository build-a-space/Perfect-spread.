# Perfect Spread — website

A server-rendered Node.js (Express) site for **Perfect Spread**, a mobile luxury picnic and event-experience company in Smithfield, VA. Ashlie Hampton is the founder and picnic curator. The site is built for local SEO across Hampton Roads and Williamsburg.

```bash
npm install
npm run dev      # http://localhost:3000 (restarts when files change)
npm test         # renders all 167 indexable pages and checks their SEO basics
npm start        # production (set NODE_ENV=production)
```

Node 22 is required (pinned in `package.json` so Vercel uses the same version).

## Deploying to Vercel

The repo is ready for Vercel with no build step:

- `api/index.js` exports the Express app as a single serverless function.
- `vercel.json` sends every non-file request to that function. Files in `public/` (CSS, JS, images) are served straight from Vercel's CDN with long-lived cache headers.
- Rendered pages are cached at the edge for an hour (`s-maxage=3600`, then stale-while-revalidate).

To deploy, import the GitHub repo in Vercel and keep the defaults. Every push to the production branch deploys automatically; other branches get preview URLs.

Environment variables to set in the Vercel project:

| Variable | Purpose |
|---|---|
| `SITE_URL` | Canonical domain, e.g. `https://perfectspread.org`. Set it once the domain points at Vercel; until then the project's `*.vercel.app` URL is used. |
| `INQUIRY_WEBHOOK_URL` | Where inquiries are sent. **Required on Vercel**: the filesystem is read-only, so `data/inquiries.jsonl` is only written when running on a normal server. Inquiries also appear in the function logs as `INQUIRY {...}`. |

## What's in it

**The homepage changes mood as you scroll.** The hero stays pinned while the visitor scrolls through three experiences, and the whole site re-themes to match each one:

| Mood | Look | For |
|---|---|---|
| `picnic` | Blush waterfront sunset | Luxury picnics |
| `celebrate` | Ivory and sage, with a floral arch | Weddings, showers, birthdays |
| `romance` | Dark, candlelit, string lights, fireflies | Date nights, anniversaries, proposals |

The colors are registered CSS custom properties (`@property`), so the sky, water, cushions and buttons fade smoothly from one mood to the next. Visitors can also use the tabs or arrows to jump between moods. Each service page always renders in its own mood.

Other interactive pieces:
- Mouse-driven parallax on the hero
- Magnetic buttons
- A warm glow that follows the cursor in candlelit mode
- A draggable package carousel with mood filters
- A scrolling marquee of occasions
- A booking timeline that fills in as you scroll
- An animated service-area map
- Tilt effects on cards

All motion respects `prefers-reduced-motion`. The site also works with JavaScript turned off.

## SEO

- **167 pages.** Each of the 16 services is paired with each of the 8 cities (e.g. `/services/proposal-picnics/williamsburg-va`). There are also service hubs, city hubs, 8 package pages, FAQ, About and Contact.
- **Unique metadata on every page.** Each page gets its own title, meta description, canonical URL, Open Graph/Twitter card and exactly one `h1`. The tests check all of these.
- **JSON-LD structured data:** `LocalBusiness` (with an offer catalog and areas served), `Service` / `AggregateOffer`, `FAQPage` and `BreadcrumbList`.
- `/sitemap.xml` and `/robots.txt` are generated automatically. URLs are canonicalized to lowercase with no trailing slash.
- **301 redirects from the old site,** so existing rankings carry over: `/index`, `/basic-picnic-package`, `/EventPlanningServices`, `/ashlie-hampton`.
- **Fast pages.** Pages are rendered in memory and served with gzip. The JavaScript is tiny and has no framework, and the illustrations are inline SVG with no image requests.

Set `SITE_URL` in production if the domain is different from `https://perfectspread.org`.

## Editing content

All business content lives in **`src/content.js`**: packages and prices, inclusions, policies, occasions, services, cities, FAQs and testimonials. Pages, schema and the sitemap all update from that file.

- **Testimonials** start empty on purpose. The section only shows up once you add real client reviews.
- **Package inclusions marked `confirm: true`** were extrapolated from the published Basic and Cabana packages. Have Ashlie confirm them.
- **Social links** go in `business.social`. They appear in the footer and in `sameAs` in the structured data.

## Photos

The site ships with hand-built illustrations. To replace any of them with real photography, drop a file into `public/img/photos/` (`.webp`, `.jpg` or `.png`) and restart the server:

| File name | Replaces |
|---|---|
| `hero-picnic`, `hero-celebrate`, `hero-romance` | The homepage stage, one per mood |
| `<package-slug>` e.g. `cabana-picnic` | That package's card and page |
| `<service-slug>` e.g. `proposal-picnics` | That service's page hero |
| `ashlie-hampton` | The founder portrait |
| `og-image` | The social share image (1200×630) |

## Inquiries

The form posts to `/api/inquiry`. It works with or without JavaScript, validates the input, and uses a honeypot field plus a per-IP rate limit to stop spam. Each submission is appended to `data/inquiries.jsonl`.

Set `INQUIRY_WEBHOOK_URL` to forward every inquiry as JSON to Zapier, Make, Slack or a CRM.

## Structure

```
server.js          routes, redirects, inquiry API
src/content.js     all copy, prices and policies
src/pages.js       page templates
src/layout.js      HTML shell, <head> SEO, header and footer
src/seo.js         JSON-LD and sitemap
src/art.js         SVG scenes and icons
public/css/main.css
public/js/main.js
```
