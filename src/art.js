'use strict';

/*
 * Hand-built SVG illustrations. Colors come from CSS custom properties
 * (registered with @property in main.css), so the same scene morphs smoothly
 * between moods as the page's data-mood attribute changes.
 *
 * Drop real photography into public/img/photos to replace any illustration —
 * see views.js `media()`.
 */

let uid = 0;
const id = (p) => `${p}${++uid}`;

const range = (n) => Array.from({ length: n }, (_, i) => i);

// Deterministic pseudo-random so server renders are stable.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function candle(x, y, h = 34, w = 10, delay = 0) {
  return `<g class="candle" style="--d:${delay}s">
    <circle class="candle-glow" fill="url(#ps-glow)" cx="${x}" cy="${y - h - 8}" r="${w * 4.2}"/>
    <rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="2" class="candle-wax"/>
    <path class="candle-flame" d="M${x} ${y - h - 16} q5 8 0 12 q-5 -4 0 -12z"/>
  </g>`;
}

function flowers(cx, cy, r, seed) {
  const rand = rng(seed);
  const out = [];
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI;
    const d = rand() * r;
    const x = cx + Math.cos(a) * d * 1.3 - 0;
    const y = cy - Math.sin(a) * d;
    const size = 7 + rand() * 11;
    const tone = 1 + Math.floor(rand() * 3);
    if (rand() < 0.3) out.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${size * 1.2}" ry="${size * 0.45}" transform="rotate(${(rand() * 80 - 40).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" class="leaf"/>`);
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" class="bloom b${tone}"/>`);
  }
  return out.join('');
}

function stringLights(x1, y1, x2, y2, sag, n, cls = '') {
  const mx = (x1 + x2) / 2;
  const my = Math.max(y1, y2) + sag;
  const bulbs = range(n).map((i) => {
    const t = (i + 0.5) / n;
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t ** 2 * x2;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t ** 2 * y2;
    return `<g class="bulb" style="--d:${((i * 0.37) % 3).toFixed(2)}s"><circle cx="${x.toFixed(1)}" cy="${(y + 9).toFixed(1)}" r="18" class="bulb-glow" fill="url(#ps-bulb)"/><circle cx="${x.toFixed(1)}" cy="${(y + 9).toFixed(1)}" r="4.5" class="bulb-core"/></g>`;
  });
  return `<g class="lights ${cls}"><path d="M${x1} ${y1} Q${mx} ${my + sag} ${x2} ${y2}" class="wire"/>${bulbs.join('')}</g>`;
}

/* ------------------------------------------------------------------ hero -- */

function heroScene() {
  const g = id('h');
  const rand = rng(7);
  const stars = range(70).map(() => {
    const x = (rand() * 1600).toFixed(0);
    const y = (rand() * 520).toFixed(0);
    const r = (0.6 + rand() * 1.6).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${r}" style="--d:${(rand() * 4).toFixed(2)}s"/>`;
  }).join('');
  const shimmer = range(16).map((i) => {
    const y = 640 + i * i * 1.25;
    const w = 40 + rand() * 160;
    const x = 760 - w / 2 + (rand() * 60 - 30);
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${1.5 + i * 0.25}" rx="2" style="--d:${(rand() * 3).toFixed(2)}s"/>`;
  }).join('');
  const ripples = range(22).map(() => {
    const y = 630 + rand() * 360;
    const x = rand() * 1600;
    const w = 30 + rand() * 120;
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="1.5" rx="1"/>`;
  }).join('');

  return `<svg class="scene scene-hero" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of a styled waterfront picnic at sunset" focusable="false">
  <defs>
    <linearGradient id="${g}sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="s-sky1"/><stop offset=".55" class="s-sky2"/><stop offset="1" class="s-sky3"/>
    </linearGradient>
    <linearGradient id="${g}water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="s-water1"/><stop offset="1" class="s-water2"/>
    </linearGradient>
    <radialGradient id="${g}sun"><stop offset="0" class="s-sun" stop-opacity="1"/><stop offset=".35" class="s-sun" stop-opacity=".55"/><stop offset="1" class="s-sun" stop-opacity="0"/></radialGradient>
    <radialGradient id="${g}warm" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#ffcf87" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf87" stop-opacity="0"/></radialGradient>
  </defs>

  <rect width="1600" height="1000" fill="url(#${g}sky)"/>
  <g class="layer-stars">${stars}</g>
  <g class="layer-moon"><circle cx="1180" cy="260" r="120" fill="url(#${g}sun)" opacity=".5"/><circle cx="1180" cy="260" r="34" class="moon"/></g>

  <g class="layer-sun parallax" style="--depth:0.15">
    <circle cx="780" cy="600" r="260" fill="url(#${g}sun)"/>
    <circle cx="780" cy="600" r="70" class="sun-disc"/>
  </g>
  <g class="layer-clouds parallax" style="--depth:0.08">
    <path d="M120 300 q60 -40 130 -6 q50 -30 110 4 q40 0 60 18 h-320z"/>
    <path d="M1080 230 q70 -46 150 -8 q60 -34 130 6 q46 2 66 20 h-370z"/>
    <path d="M560 160 q40 -26 90 -4 q36 -20 80 4 h-190z" opacity=".6"/>
  </g>

  <path class="shore parallax" style="--depth:0.2" d="M0 606 C120 590 180 598 260 588 C330 580 360 596 420 592 L520 598 C600 600 640 592 700 602 L1600 604 L1600 624 L0 624Z"/>
  <path class="shore far" d="M960 600 C1040 584 1120 586 1180 578 C1250 570 1310 584 1400 580 C1480 576 1540 590 1600 588 L1600 608 L960 608Z"/>

  <rect y="604" width="1600" height="396" fill="url(#${g}water)"/>
  <g class="layer-ripples">${ripples}</g>
  <g class="layer-shimmer">${shimmer}</g>

  <!-- dock -->
  <g class="dock parallax" style="--depth:0.35">
    <path d="M0 720 L470 640 L520 646 L0 790Z" class="dock-top"/>
    <path d="M0 790 L520 646 L520 656 L0 806Z" class="dock-edge"/>
    ${[60, 170, 270, 360, 440].map((x, i) => `<rect x="${x}" y="${700 - i * 14}" width="${12 - i * 1.5}" height="${110 - i * 18}" class="dock-post"/>`).join('')}
  </g>

  <!-- celebrate: floral arch -->
  <g class="layer-arch parallax" style="--depth:0.45">
    <path d="M600 900 L600 770 A200 200 0 0 1 1000 770 L1000 900" class="arch-frame"/>
    <path d="M612 790 C660 730 720 840 800 760 C880 840 940 730 988 790" class="drape"/>
    <g class="arch-flowers">${flowers(620, 790, 46, 3)}${flowers(980, 790, 46, 9)}${flowers(700, 640, 50, 11)}${flowers(880, 640, 50, 21)}</g>
  </g>

  <!-- romance: string lights + lanterns -->
  <g class="layer-lights parallax" style="--depth:0.5">
    ${stringLights(-20, 120, 820, 140, 140, 14)}
    ${stringLights(780, 140, 1640, 110, 160, 14)}
    ${stringLights(-20, 300, 1640, 280, 120, 26, 'lights-low')}
  </g>

  <!-- picnic table vignette -->
  <g class="vignette parallax" style="--depth:0.6">
    <ellipse cx="800" cy="930" rx="560" ry="90" class="rug"/>
    <ellipse cx="800" cy="930" rx="470" ry="66" class="rug-inner"/>
    <ellipse cx="800" cy="960" rx="760" ry="160" fill="url(#${g}warm)" class="warm"/>
    <!-- back cushions -->
    <rect x="430" y="790" width="150" height="110" rx="46" class="pillow p2"/>
    <rect x="1020" y="790" width="150" height="110" rx="46" class="pillow p2"/>
    <rect x="520" y="770" width="130" height="96" rx="40" class="pillow p1"/>
    <rect x="950" y="770" width="130" height="96" rx="40" class="pillow p1"/>
    <!-- table -->
    <rect x="560" y="842" width="480" height="26" rx="6" class="table-top"/>
    <rect x="590" y="868" width="16" height="60" class="table-leg"/>
    <rect x="994" y="868" width="16" height="60" class="table-leg"/>
    <path d="M560 852 h480 v18 c-40 18 -440 18 -480 0z" class="runner"/>
    <!-- centrepiece -->
    <path d="M770 842 l8 -40 h44 l8 40z" class="vase"/>
    <g class="centre-flowers">${flowers(800, 800, 74, 5)}</g>
    <!-- plates & glasses -->
    <ellipse cx="660" cy="846" rx="34" ry="7" class="plate"/>
    <ellipse cx="940" cy="846" rx="34" ry="7" class="plate"/>
    <path d="M700 842 v-30 q12 -4 24 0 v30z" class="glass"/>
    <path d="M876 842 v-30 q12 -4 24 0 v30z" class="glass"/>
    ${candle(620, 842, 40, 10, 0)}${candle(720, 842, 56, 11, 0.6)}${candle(880, 842, 48, 11, 1.2)}${candle(980, 842, 36, 10, 0.3)}
    <!-- floor candles & lanterns -->
    ${candle(380, 930, 44, 14, 0.9)}${candle(420, 948, 28, 12, 1.5)}${candle(1200, 940, 52, 14, 0.4)}${candle(1240, 956, 30, 12, 1.1)}
    <g class="lantern"><rect x="300" y="868" width="56" height="78" rx="6" class="lantern-frame"/>${candle(328, 936, 30, 12, 0.2)}<path d="M308 868 q20 -26 40 0" class="lantern-handle"/></g>
    <g class="lantern"><rect x="1290" y="874" width="50" height="72" rx="6" class="lantern-frame"/>${candle(1315, 938, 28, 11, 0.8)}<path d="M1298 874 q17 -22 34 0" class="lantern-handle"/></g>
    <!-- front pillows -->
    <rect x="600" y="900" width="150" height="70" rx="34" class="pillow p1"/>
    <rect x="850" y="900" width="150" height="70" rx="34" class="pillow p3"/>
    <!-- petals -->
    ${range(18).map((i) => `<ellipse cx="${(520 + ((i * 97) % 560)).toFixed(0)}" cy="${(950 + ((i * 37) % 40)).toFixed(0)}" rx="6" ry="3" class="petal" transform="rotate(${(i * 41) % 180} ${(520 + ((i * 97) % 560)).toFixed(0)} ${(950 + ((i * 37) % 40)).toFixed(0)})"/>`).join('')}
  </g>
  <g class="layer-fireflies">${range(20).map((i) => `<circle cx="${(100 + ((i * 271) % 1400)).toFixed(0)}" cy="${(420 + ((i * 113) % 380)).toFixed(0)}" r="2.4" style="--d:${(i * 0.43) % 5}s;--x:${(i % 2 ? 1 : -1) * (14 + (i % 5) * 6)}px"/>`).join('')}</g>
</svg>`;
}

/* --------------------------------------------------------- package cards -- */

const cardBase = (g) => `
  <defs>
    <linearGradient id="${g}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="c-bg1"/><stop offset="1" class="c-bg2"/></linearGradient>
    <radialGradient id="${g}glow"><stop offset="0" stop-color="#ffd59a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="300" fill="url(#${g}bg)"/>
  <rect y="210" width="400" height="90" class="c-ground"/>`;

function miniTable(cx = 200, y = 230, w = 150) {
  return `<ellipse cx="${cx}" cy="${y + 26}" rx="${w * 0.95}" ry="22" class="c-rug"/>
  <rect x="${cx - w / 2 - 38}" y="${y - 30}" width="52" height="42" rx="18" class="pillow p2"/>
  <rect x="${cx + w / 2 - 14}" y="${y - 30}" width="52" height="42" rx="18" class="pillow p1"/>
  <rect x="${cx - w / 2}" y="${y - 4}" width="${w}" height="10" rx="3" class="table-top"/>
  <rect x="${cx - w / 2 + 8}" y="${y + 6}" width="6" height="16" class="table-leg"/><rect x="${cx + w / 2 - 14}" y="${y + 6}" width="6" height="16" class="table-leg"/>
  <g>${flowers(cx, y - 14, 22, cx + y)}</g>
  ${candle(cx - 46, y - 4, 18, 5, 0.2)}${candle(cx + 46, y - 4, 22, 5, 0.9)}
  <rect x="${cx - 40}" y="${y + 16}" width="54" height="26" rx="12" class="pillow p3"/><rect x="${cx + 4}" y="${y + 18}" width="50" height="24" rx="12" class="pillow p1"/>`;
}

const structures = {
  picnic: () => `<circle cx="300" cy="120" r="40" class="c-sun"/>${miniTable()}`,
  teepee: () => `<path d="M200 40 L95 238 H305Z" class="c-canvas"/><path d="M200 40 L160 238 H240Z" class="c-canvas-in"/><path d="M188 30 L200 40 L212 30 M200 40 L200 20" class="c-pole"/>
    <path d="M150 110 Q200 140 250 110" class="c-bunting"/>${miniTable(200, 236, 120)}`,
  cabana: () => `<path d="M70 70 H330 L345 92 H55Z" class="c-canvas"/><path d="M78 92 V236 M322 92 V236" class="c-pole"/>
    <path d="M60 92 C80 160 70 200 96 236 L60 236Z M340 92 C320 160 330 200 304 236 L340 236Z" class="c-canvas-in"/>${miniTable()}`,
  eggchair: () => `${[120, 280].map((x) => `<path d="M${x} 40 V80" class="c-pole"/><path d="M${x - 44} 140 C${x - 44} 80 ${x + 44} 80 ${x + 44} 140 C${x + 44} 200 ${x - 44} 200 ${x - 44} 140Z" class="c-wicker"/><ellipse cx="${x}" cy="${160}" rx="30" ry="22" class="pillow p1"/>`).join('')}
    <rect x="160" y="230" width="80" height="8" rx="3" class="table-top"/>${candle(200, 230, 16, 5, 0.3)}<g>${flowers(185, 222, 14, 4)}</g><ellipse cx="200" cy="258" rx="150" ry="18" class="c-rug"/>`,
  igloo: () => `<path d="M60 240 A140 140 0 0 1 340 240Z" class="c-dome"/>
    <path d="M200 100 V240 M115 135 Q200 170 285 135 M78 190 Q200 220 322 190 M130 112 Q160 180 140 240 M270 112 Q240 180 260 240" class="c-dome-ribs"/>
    ${stringLights(90, 170, 310, 170, 20, 9)}${miniTable(200, 230, 110)}`,
  haunted: () => `<circle cx="300" cy="80" r="28" class="moon"/>
    <path d="M30 210 L40 120 L48 210 M60 210 L72 90 L84 210" class="c-tree"/>
    <path d="M340 210 C330 150 360 130 350 70 M350 120 L370 100 M345 150 L325 135" class="c-tree"/>
    <ellipse cx="128" cy="236" rx="18" ry="14" class="c-pumpkin"/><ellipse cx="282" cy="238" rx="14" ry="11" class="c-pumpkin"/>${miniTable()}`,
  photo: () => `<rect x="110" y="40" width="180" height="170" rx="90" class="c-backdrop"/>
    <g>${flowers(130, 80, 34, 12)}${flowers(270, 200, 30, 19)}</g>
    <path d="M150 120 h100" class="c-sign"/><text x="200" y="128" class="c-sign-text" text-anchor="middle">Class of</text>
    ${miniTable(200, 236, 110)}`,
  proposal: () => `${stringLights(0, 40, 400, 30, 40, 12)}
    <path d="M128 110 h144 v54 h-144z" class="c-signboard"/><text x="200" y="146" class="c-sign-script" text-anchor="middle">Marry me?</text>
    ${range(9).map((i) => candle(40 + i * 40, 268 + (i % 2) * 8, 14 + (i % 3) * 6, 6, i * 0.3)).join('')}${miniTable(200, 230, 120)}`,
};

function cardScene(art, label) {
  const g = id('c');
  return `<svg class="scene scene-card" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" focusable="false">${cardBase(g)}<g transform="translate(200 196) scale(1.22) translate(-200 -196)">${(structures[art] || structures.picnic)()}</g></svg>`;
}

/* ------------------------------------------------------------- icons ------ */

const icons = {
  setup: '<path d="M4 20h16M6 20v-5h12v5M8 15V9l4-5 4 5v6"/><path d="M10 15v-3h4v3"/>',
  food: '<path d="M4 11h16a8 8 0 0 1-16 0zM12 4v3M8 5l1 2M16 5l-1 2"/>',
  theme: '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
  clean: '<path d="M5 12a7 7 0 1 0 2-5M5 4v4h4"/><path d="M10 12l2 2 3-4"/>',
  board: '<rect x="3" y="8" width="18" height="10" rx="3"/><circle cx="8" cy="13" r="1.5"/><circle cx="13" cy="12" r="1.5"/><path d="M16 14h2"/>',
  glass: '<path d="M7 3h10l-1 7a4 4 0 0 1-8 0zM12 14v6M8 21h8"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/>',
  flower: '<circle cx="12" cy="9" r="2.5"/><path d="M12 6.5a3 3 0 1 1 3 2.5M12 6.5a3 3 0 1 0-3 2.5M9.5 9a3 3 0 1 0 2.5 3M14.5 9a3 3 0 1 1-2.5 3M12 12v9M12 18c-2-2-4-2-5-1"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
  right: '<path d="M9 6l6 6-6 6"/>',
  chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" stroke-width="2.4"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  access: '<circle cx="12" cy="4.6" r="1.9"/><path d="M4.5 8.6l7.5 1.6 7.5-1.6M12 10.2v4.4M12 14.6l-3.2 6.2M12 14.6l3.2 6.2"/>',
  textsize: '<path d="M3 19l5-13 5 13M4.8 14.5h6.4M15 19l3-8 3 8M15.9 16.5h4.2"/>',
  contrast: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  font: '<path d="M5 19V6h9M5 12h7M15 19l2.5-7 2.5 7M15.8 17h3.4"/>',
  spacing: '<path d="M4 6h16M4 12h16M4 18h16M2 9l2-3 2 3M2 15l2 3 2-3"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  cursor: '<path d="M6 3l12 7.5-5.2 1.3 3.4 6.7-2.6 1.3-3.4-6.7L6 17z"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
};

const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name] || ''}</svg>`;

module.exports = { heroScene, cardScene, icon, candle };
