'use strict';

/*
 * Demo concierge chat. A scripted conversation (name → service → details →
 * contact) with light keyword matching so replies feel natural. It never
 * submits anything: it ends by explaining what a live version would do, and
 * offers the real inquiry form prefilled with what the visitor typed.
 */

const { business, services, areas, packages } = require('./content');
const { icon } = require('./art');

// Extra words that point to each service, on top of its own name.
const keywords = {
  'luxury-picnics': ['picnic', 'luxury', 'spread'],
  'romantic-picnics': ['romantic', 'romance', 'date', 'partner', 'wife', 'husband', 'girlfriend', 'boyfriend'],
  'proposal-picnics': ['propos', 'engag', 'ring', 'marry', 'pop the question'],
  'anniversary-picnics': ['anniversary', 'years together'],
  'date-night-picnics': ['date night', 'first date', 'movie'],
  'birthday-picnics': ['birthday', 'bday', 'b-day', 'turning'],
  'bridal-shower-picnics': ['bridal', 'bride'],
  'baby-shower-picnics': ['baby', 'gender reveal'],
  'bachelorette-picnics': ['bachelorette', 'bach', 'girls trip'],
  'graduation-picnics': ['graduat', 'senior', 'grad'],
  'corporate-picnics': ['corporate', 'team', 'company', 'office', 'client', 'work'],
  'event-planning': ['wedding', 'event planning', 'fundraiser', 'gala'],
  'picnic-photography': ['photo', 'photographer', 'shoot'],
  'igloo-experiences': ['igloo', 'dome', 'winter'],
  'cabana-experiences': ['cabana'],
  'teepee-experiences': ['teepee', 'tipi', 'tent'],
};

const featured = ['romantic-picnics', 'proposal-picnics', 'birthday-picnics', 'bridal-shower-picnics', 'corporate-picnics', 'event-planning'];

function chatData() {
  return {
    business: { name: business.name, phone: business.phoneDisplay, owner: business.founder.split(' ')[0] },
    services: services.map((s) => ({ slug: s.slug, name: s.name, tagline: s.tagline, packages: s.packages, keywords: [s.name.toLowerCase().replace(/ picnics?| experiences?/g, ''), ...(keywords[s.slug] || [])] })),
    featured,
    areas: areas.map((a) => a.name),
    packages: packages.map((p) => ({ slug: p.slug, name: p.name, price: p.price })),
  };
}

function chatWidget() {
  return `<div class="chat" data-chat>
  <button type="button" class="chat-launcher" data-chat-toggle aria-expanded="false" aria-controls="chat-window">
    ${icon('chat')}<span class="chat-launcher-label">Ask our concierge</span>
  </button>
  <section class="chat-window" id="chat-window" role="dialog" aria-label="Perfect Spread concierge chat (demo)" hidden>
    <header class="chat-head">
      <span class="chat-avatar" aria-hidden="true">PS</span>
      <div class="chat-title">
        <strong>Picnic Concierge</strong>
        <span><i class="chat-dot" aria-hidden="true"></i> Replies instantly · <em class="chat-demo">Demo</em></span>
      </div>
      <button type="button" class="chat-x" data-chat-toggle aria-label="Close chat"><span></span><span></span></button>
    </header>
    <div class="chat-log" role="log" aria-live="polite" aria-relevant="additions" data-chat-log></div>
    <div class="chat-chips" data-chat-chips></div>
    <form class="chat-input" data-chat-form autocomplete="off">
      <label class="sr" for="chat-text">Type your message</label>
      <input id="chat-text" name="text" maxlength="400" placeholder="Type your message…" enterkeyhint="send">
      <button type="submit" aria-label="Send message">${icon('send')}</button>
    </form>
    <script type="application/json" data-chat-data>${JSON.stringify(chatData()).replace(/</g, '\\u003c')}</script>
  </section>
</div>`;
}

module.exports = { chatWidget };
