'use strict';

const { business, policies, services, areas, packages } = require('./content');
const { abs, SITE_URL } = require('./layout');

const ORG_ID = `${SITE_URL}/#business`;

function localBusiness() {
  const sameAs = Object.values(business.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ORG_ID,
    name: business.name,
    description: `${business.tagline}. ${business.shortPitch}`,
    url: abs('/'),
    email: business.email,
    telephone: business.phone,
    image: abs('/img/og-image.jpg'),
    logo: abs('/img/favicon.svg'),
    priceRange: business.priceRange,
    founder: { '@type': 'Person', name: business.founder, jobTitle: business.founderTitle },
    address: {
      '@type': 'PostalAddress', addressLocality: business.city, addressRegion: business.region,
      postalCode: business.postalCode, addressCountry: business.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: business.geo.lat, longitude: business.geo.lng },
    areaServed: areas.map((a) => ({ '@type': 'City', name: `${a.name}, VA` })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Picnic packages',
      itemListElement: packages.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        url: abs(`/packages/${p.slug}`),
        price: p.price,
        priceCurrency: 'USD',
        priceSpecification: { '@type': 'PriceSpecification', price: p.price, priceCurrency: 'USD', valueAddedTaxIncluded: false },
      })),
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function website() {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: business.name, url: abs('/'), publisher: { '@id': ORG_ID } };
}

function breadcrumbs(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.path) })),
  };
}

function faqPage(items) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

function service(svc, area) {
  const recommended = svc.packages.map((s) => packages.find((p) => p.slug === s)).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: area ? `${svc.name} in ${area.name}, VA` : svc.name,
    serviceType: svc.name,
    description: svc.intro,
    provider: { '@id': ORG_ID },
    url: abs(area ? `/services/${svc.slug}/${area.slug}` : `/services/${svc.slug}`),
    areaServed: area ? { '@type': 'City', name: `${area.name}, VA` } : areas.map((a) => ({ '@type': 'City', name: `${a.name}, VA` })),
    ...(recommended.length ? {
      offers: {
        '@type': 'AggregateOffer', priceCurrency: 'USD',
        lowPrice: Math.min(...recommended.map((p) => p.price)), highPrice: Math.max(...recommended.map((p) => p.price)),
        offerCount: recommended.length,
      },
    } : {}),
  };
}

function packageSchema(pkg) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: pkg.name,
    serviceType: 'Luxury picnic',
    description: `${pkg.blurb} Includes ${pkg.includes.join(', ').toLowerCase()}.`,
    provider: { '@id': ORG_ID },
    url: abs(`/packages/${pkg.slug}`),
    offers: {
      '@type': 'Offer', price: pkg.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock',
      url: abs(`/packages/${pkg.slug}`),
      eligibleQuantity: { '@type': 'QuantitativeValue', value: policies.baseGuests, unitText: 'guests' },
    },
  };
}

// Every indexable URL, used by sitemap.xml and the route tests.
function allPaths() {
  return [
    '/', '/services', '/packages', '/service-areas', '/about', '/faq', '/contact',
    ...services.map((s) => `/services/${s.slug}`),
    ...services.flatMap((s) => areas.map((a) => `/services/${s.slug}/${a.slug}`)),
    ...areas.map((a) => `/service-areas/${a.slug}`),
    ...packages.map((p) => `/packages/${p.slug}`),
  ];
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const priority = (p) => (p === '/' ? '1.0' : p.split('/').length > 3 ? '0.6' : '0.8');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths().map((p) => `  <url><loc>${abs(p)}</loc><lastmod>${today}</lastmod><priority>${priority(p)}</priority></url>`).join('\n')}
</urlset>`;
}

module.exports = { localBusiness, website, breadcrumbs, faqPage, service, packageSchema, sitemap, allPaths };
