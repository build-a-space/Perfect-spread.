'use strict';

/*
 * Accessibility panel: a real set of display adjustments (saved per visitor)
 * plus a plain-language explainer for site owners about why accessibility
 * matters and what actually reduces ADA legal risk.
 *
 * Keep the legal copy honest: a widget does not make a site compliant and does
 * not prevent lawsuits (the FTC fined an overlay vendor in 2025 for claiming
 * otherwise). What helps is accessible code, testing, and a way to get help.
 */

const { business } = require('./content');
const { icon } = require('./art');

// [key, label, help text, icon, levels]
const controls = [
  ['text', 'Larger text', 'Cycle through 3 sizes', 'textsize', 3],
  ['contrast', 'High contrast', 'Stronger text and borders', 'contrast', 1],
  ['links', 'Highlight links', 'Underline and outline links', 'link', 1],
  ['font', 'Readable font', 'Swap script lettering for plain text', 'font', 1],
  ['spacing', 'Text spacing', 'More room between lines and letters', 'spacing', 1],
  ['motion', 'Pause animations', 'Stop motion, parallax and scrolling effects', 'pause', 1],
  ['cursor', 'Large cursor', 'A bigger, high-contrast pointer', 'cursor', 1],
];

const builtIn = [
  'Real headings, landmarks and labels so screen readers can navigate',
  'Every feature works with a keyboard, with visible focus outlines',
  'A “skip to content” link on every page',
  'Text descriptions for every illustration',
  'Form fields with labels and clear error messages',
  'Respects your device’s “reduce motion” setting automatically',
  'Text that can zoom to 200% without breaking the layout',
];

const sources = [
  ['ADA Title III & websites — U.S. Department of Justice guidance (2022)', 'https://www.ada.gov/resources/web-guidance/'],
  ['Web Content Accessibility Guidelines (WCAG) 2.1 — W3C', 'https://www.w3.org/TR/WCAG21/'],
  ['FTC order against an accessibility-overlay vendor (2025)', 'https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites'],
  ['Over 70 million U.S. adults report a disability — CDC (2024)', 'https://www.cdc.gov/media/releases/2024/s0716-Adult-disability.html'],
];

function controlButtons() {
  return controls.map(([key, label, help, ic, levels]) => `
    <button type="button" class="a11y-opt" data-a11y="${key}" data-levels="${levels}" aria-pressed="false" aria-describedby="a11y-help-${key}">
      ${icon(ic, 'a11y-ico')}
      <span class="a11y-opt-label">${label}</span>
      <span class="a11y-opt-help" id="a11y-help-${key}">${help}</span>
      ${levels > 1 ? `<span class="a11y-dots" aria-hidden="true">${'<i></i>'.repeat(levels)}</span>` : '<span class="a11y-switch" aria-hidden="true"></span>'}
    </button>`).join('');
}

function explainer() {
  return `
    <section class="a11y-sec">
      <h3>${icon('access')} What this is</h3>
      <p>This panel lets anyone adjust how the site looks and moves — bigger text, stronger contrast, calmer motion — and remembers those choices on this device.</p>
      <p>The panel is the visible part. The more important work is in the site’s code, which follows the <strong>WCAG 2.1 AA</strong> guidelines:</p>
      <ul class="a11y-list">${builtIn.map((b) => `<li>${icon('check')}<span>${b}</span></li>`).join('')}</ul>
    </section>

    <section class="a11y-sec">
      <h3>${icon('heart')} Why a website needs it</h3>
      <p><strong>More than 1 in 4 U.S. adults</strong> (over 70 million people) report a disability, according to the CDC. That includes vision, hearing, mobility and cognitive disabilities, and many more people have temporary injuries or age-related changes in vision. They plan proposals, book showers and celebrate birthdays like everyone else, and they choose businesses whose websites they can actually use.</p>
      <p>The law points the same way. The U.S. Department of Justice says the <strong>ADA applies to the websites of businesses open to the public</strong>, and it points businesses to the Web Content Accessibility Guidelines (WCAG) as the technical standard to follow.</p>
    </section>

    <section class="a11y-sec">
      <h3>${icon('shield')} How it helps protect your business</h3>
      <p><strong>Thousands of website accessibility lawsuits</strong> are filed in the U.S. every year, and small local businesses are frequent targets. Most are triggered by problems an automated scan can find in minutes, like unlabeled forms, missing image descriptions or menus that don’t work with a keyboard.</p>
      <p class="a11y-callout"><strong>A widget alone is not protection.</strong> Many lawsuits each year are filed against websites that already have accessibility widgets installed. In 2025 the FTC fined one widget company $1 million for claiming its tool made websites compliant.</p>
      <p>What actually reduces risk:</p>
      <ol class="a11y-steps">
        <li><strong>Accessible code.</strong> Fix the underlying site, not just add an overlay. That’s how this site is built.</li>
        <li><strong>Regular testing.</strong> Use automated scans plus real keyboard and screen-reader checks whenever pages change.</li>
        <li><strong>A published accessibility statement</strong> with a real person to contact. It shows good faith and gives customers a path to help before a complaint.</li>
        <li><strong>Prompt fixes.</strong> Respond quickly when someone reports a barrier.</li>
      </ol>
      <p class="a11y-fine">This is general information, not legal advice. For questions about your obligations, talk to an attorney.</p>
    </section>

    <section class="a11y-sec">
      <h3>${icon('mail')} Need help?</h3>
      <p>If anything on this site is hard to use, contact <a href="mailto:${business.email}">${business.email}</a> or call <a href="tel:${business.phone}">${business.phoneDisplay}</a>. We’ll help you book directly and fix the problem. You can read our full <a href="/accessibility">accessibility statement</a>.</p>
      <details class="a11y-sources"><summary>Sources</summary><ul>${sources.map(([t, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${t}</a></li>`).join('')}</ul></details>
    </section>`;
}

function a11yWidget() {
  return `<button type="button" class="a11y-tab" data-a11y-open aria-controls="a11y-panel" aria-expanded="false">
  ${icon('access')}<span>Accessibility</span>
</button>
<aside class="drawer from-left a11y-panel" id="a11y-panel" role="dialog" aria-modal="false" aria-labelledby="a11y-title" hidden>
  <header class="drawer-head">
    <div>
      <p class="eyebrow">Accessibility</p>
      <h2 id="a11y-title">Make this site <span class="script">yours</span></h2>
    </div>
    <button class="drawer-x" type="button" data-a11y-close aria-label="Close accessibility panel"><span></span><span></span></button>
  </header>
  <div class="a11y-tabs" role="tablist" aria-label="Accessibility panel sections">
    <button type="button" role="tab" id="a11y-t-adjust" aria-controls="a11y-adjust" aria-selected="true">Adjust</button>
    <button type="button" role="tab" id="a11y-t-why" aria-controls="a11y-why" aria-selected="false" tabindex="-1">Why it’s here</button>
  </div>
  <div class="a11y-pane" id="a11y-adjust" role="tabpanel" aria-labelledby="a11y-t-adjust">
    <div class="a11y-grid">${controlButtons()}</div>
    <button type="button" class="btn btn-ghost a11y-reset" data-a11y-reset>${icon('reset')} Reset all</button>
    <p class="a11y-fine">Your browser’s zoom and “reduce motion” settings always work too. Choices are saved on this device only.</p>
  </div>
  <div class="a11y-pane" id="a11y-why" role="tabpanel" aria-labelledby="a11y-t-why" hidden>${explainer()}</div>
</aside>`;
}

// Applied before first paint so saved preferences never flash.
const earlyScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var p=JSON.parse(localStorage.getItem('ps-a11y')||'{}');for(var k in p){if(p[k])d.setAttribute('data-a11y-'+k,String(p[k]));}}catch(e){}})();`;

module.exports = { a11yWidget, explainer, builtIn, earlyScript };
