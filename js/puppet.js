// Articulated SVG puppets for the animated stage and the character turntables.
// Every figure is built from its spec in data/cast.js. Animation state is a plain
// object (p.state) that GSAP tweens; render() writes the transforms.
import { CAST } from './data/cast.js';

const NS = 'http://www.w3.org/2000/svg';
let UID = 0;

/* ───────── colour helpers ───────── */
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
export function shade(h, a) { const [r, g, b] = hex2rgb(h); return a >= 0 ? rgb2hex(r + (255 - r) * a, g + (255 - g) * a, b + (255 - b) * a) : rgb2hex(r * (1 + a), g * (1 + a), b * (1 + a)); }

const GOLD = '#e8b44a', INK = '#2a1408';

/* ───────── shared gradient defs ───────── */
function defs(u, s) {
  const lin = (id, c, x2 = 1, y2 = 0) => `<linearGradient id="${u}-${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${shade(c, -.32)}"/><stop offset=".55" stop-color="${shade(c, .12)}"/><stop offset="1" stop-color="${shade(c, -.12)}"/></linearGradient>`;
  const skin = s.kind === 'vanara' || s.kind === 'bear' ? s.fur : s.skin || '#c8906a';
  return `<defs>
    ${lin('skin', skin)}
    ${lin('face', s.face || skin)}
    ${lin('cloth', s.valkala ? '#8a6238' : (s.saree || s.dhoti || '#c89a5a'), 1, .4)}
    ${lin('drape', s.valkala ? '#b08a58' : (s.pallu || s.uttariya || '#a03a2a'), 1, .6)}
    <linearGradient id="${u}-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="${GOLD}"/><stop offset="1" stop-color="#8a5a10"/></linearGradient>
    <linearGradient id="${u}-armor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5260"/><stop offset=".5" stop-color="#2a2430"/><stop offset="1" stop-color="#1a141e"/></linearGradient>
    <radialGradient id="${u}-aura"><stop offset="0" stop-color="${s.aura || '#ffd080'}" stop-opacity=".75"/><stop offset=".5" stop-color="${s.aura || '#ffd080'}" stop-opacity=".22"/><stop offset="1" stop-color="${s.aura || '#ffd080'}" stop-opacity="0"/></radialGradient>
  </defs>`;
}

/* ───────── weapons (drawn in hand space, hand centre at 0,0) ───────── */
function weapon(type, u) {
  const g = `url(#${u}-gold)`;
  switch (type) {
    case 'bow': return `<g class="wpn"><path d="M0 -120 C 34 -100, 36 -40, 8 -8 L 8 8 C 36 40, 34 100, 0 120" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M0 -120 C 34 -100, 36 -40, 8 -8 L 8 8 C 36 40, 34 100, 0 120" fill="none" stroke="#9a5a22" stroke-width="5.5" stroke-linecap="round"/><path d="M2 -60 C 20 -55 22 -25 8 -10 M2 60 C 20 55 22 25 8 10" stroke="${g}" stroke-width="3" fill="none"/><line class="string" x1="0" y1="-120" x2="0" y2="120" stroke="#f0e6c8" stroke-width="1.3"/></g>`;
    case 'mace': return `<g class="wpn"><rect x="-4" y="-12" width="8" height="120" rx="3" fill="${g}" stroke="${INK}" stroke-width="1.5"/><ellipse cx="0" cy="128" rx="30" ry="34" fill="${g}" stroke="${INK}" stroke-width="2"/><path d="M-28 122 Q0 112 28 122 M-26 138 Q0 148 26 138" stroke="#8a5a10" stroke-width="2" fill="none"/><path d="M0 160 L-6 176 L6 176 Z" fill="${g}"/><circle cx="0" cy="128" r="6" fill="#c8202a"/></g>`;
    case 'sword': return `<g class="wpn"><rect x="-10" y="-6" width="20" height="6" fill="${g}"/><path d="M-4 0 C -6 40, 2 80, 22 112 C 10 76, 6 40, 5 0 Z" fill="#d8dce8" stroke="${INK}" stroke-width="1.5"/><path d="M0 4 C 0 40 6 74 16 100" stroke="#fff" stroke-width="1" opacity=".7" fill="none"/><rect x="-3" y="-22" width="6" height="16" fill="${g}"/></g>`;
    case 'trident': return `<g class="wpn"><line x1="0" y1="80" x2="0" y2="-200" stroke="#7a5a3a" stroke-width="6"/><path d="M-26 -190 C -26 -220, -14 -232, -14 -246 M26 -190 C 26 -220, 14 -232, 14 -246 M0 -190 L0 -258 M-28 -190 L28 -190" stroke="${g}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="0" cy="-176" r="8" fill="#c8a070" stroke="${INK}"/></g>`;
    case 'axe': return `<g class="wpn"><line x1="0" y1="70" x2="0" y2="-170" stroke="#6a4a2a" stroke-width="7"/><path d="M0 -165 C 40 -190, 56 -150, 48 -118 C 40 -134, 20 -140, 0 -135 Z" fill="#c8ccd8" stroke="${INK}" stroke-width="2"/></g>`;
    case 'staff': return `<g class="wpn"><line x1="0" y1="80" x2="0" y2="-150" stroke="#7a5230" stroke-width="7" stroke-linecap="round"/><circle cx="0" cy="-152" r="6" fill="${g}"/></g>`;
    case 'spear': return `<g class="wpn"><line x1="0" y1="90" x2="0" y2="-200" stroke="#3a2a22" stroke-width="6"/><path d="M0 -240 L-10 -200 L10 -200 Z" fill="#c8ccd8" stroke="${INK}"/></g>`;
    case 'vajra': return `<g class="wpn"><rect x="-4" y="-14" width="8" height="28" fill="${g}"/><path d="M0 -14 C -16 -24 -14 -40 0 -50 C 14 -40 16 -24 0 -14 M0 14 C -16 24 -14 40 0 50 C 14 40 16 24 0 14" fill="${g}" stroke="${INK}"/></g>`;
    case 'veena': return `<g class="wpn" transform="rotate(-35)"><line x1="0" y1="-110" x2="0" y2="90" stroke="#7a4a1a" stroke-width="8"/><circle cx="0" cy="-104" r="20" fill="#b8742a" stroke="${INK}"/><circle cx="0" cy="88" r="28" fill="#b8742a" stroke="${INK}"/><line x1="-3" y1="-90" x2="-3" y2="80" stroke="#f0e0b0" stroke-width=".8"/><line x1="3" y1="-90" x2="3" y2="80" stroke="#f0e0b0" stroke-width=".8"/></g>`;
    case 'kamandalu': return `<g class="wpn"><path d="M-14 6 C -20 30, 20 30, 14 6 Z" fill="${g}" stroke="${INK}"/><path d="M14 10 Q 26 6 30 -2" stroke="${GOLD}" stroke-width="3" fill="none"/><path d="M-8 6 Q 0 -10 8 6" stroke="${GOLD}" stroke-width="2" fill="none"/></g>`;
    case 'lotus': return `<g class="wpn">${[0, 1, 2, 3, 4].map(i => `<path d="M0 0 C -8 -14 -6 -28 0 -36 C 6 -28 8 -14 0 0" fill="#f6a0c0" stroke="#c8507a" transform="rotate(${-40 + i * 20})"/>`).join('')}</g>`;
    case 'herb': return `<g class="wpn">${[-30, -10, 10, 30].map(r => `<path d="M0 0 C -6 -20 -2 -40 0 -54" stroke="#3a8a3a" stroke-width="3" fill="none" transform="rotate(${r})"/><ellipse cx="0" cy="-50" rx="5" ry="9" fill="#7aff8a" opacity=".85" transform="rotate(${r})"/>`).join('')}</g>`;
    case 'block': return `<g class="wpn"><rect x="-26" y="-10" width="52" height="34" rx="3" fill="#8a7a6a" stroke="${INK}" stroke-width="1.5"/><path d="M-20 0 h40 M-20 10 h40" stroke="#5a4a3a"/></g>`;
    case 'basket': return `<g class="wpn"><path d="M-22 0 C -22 26 22 26 22 0 Z" fill="#a8743a" stroke="${INK}"/><path d="M-22 0 Q 0 -26 22 0" stroke="#7a4a1a" stroke-width="3" fill="none"/>${[-10, 0, 10].map(x => `<circle cx="${x}" cy="2" r="5" fill="#c8302a"/>`).join('')}</g>`;
    case 'scroll': return `<g class="wpn"><rect x="-6" y="-30" width="12" height="44" rx="3" fill="#e8d8a8" stroke="${INK}"/><path d="M-6 -20 h12 M-6 -10 h12 M-6 0 h12" stroke="#8a6a3a"/></g>`;
    case 'chakra': return `<g class="wpn"><g class="spin"><circle r="22" fill="none" stroke="${g}" stroke-width="5"/>${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="0" x2="${Math.cos(i * .52) * 20}" y2="${Math.sin(i * .52) * 20}" stroke="${GOLD}" stroke-width="2"/>`).join('')}<circle r="5" fill="${GOLD}"/></g></g>`;
    default: return '';
  }
}

/* ───────── heads ───────── */
function eyes(s, rak) {
  const iris = rak ? '#f0c020' : '#1a0e08';
  const e = (x) => `<path d="M${x - 7} -36 Q ${x} -42 ${x + 7} -36 Q ${x} -32 ${x - 7} -36 Z" fill="#fbf4ea" stroke="${INK}" stroke-width="1.2"/><circle cx="${x}" cy="-36.5" r="2.6" fill="${iris}"/>`;
  return e(-8.5) + e(8.5) + `<path d="M-16 -44 Q -9 ${rak ? -50 : -47} -2 -44 M2 -44 Q 9 ${rak ? -50 : -47} 16 -44" stroke="${INK}" stroke-width="${rak ? 3 : 2}" fill="none" stroke-linecap="round"/>`;
}
function tilak(t) {
  if (t === 'v') return `<path d="M-4 -58 L-3 -45 M4 -58 L3 -45" stroke="#fff6e0" stroke-width="1.8"/><line x1="0" y1="-58" x2="0" y2="-46" stroke="#d82020" stroke-width="2"/>`;
  if (t === 't') return `<path d="M-10 -55 h20 M-10 -51.5 h20 M-10 -48 h20" stroke="#efe6d6" stroke-width="1.6"/><circle cx="0" cy="-51.5" r="1.6" fill="#d82020"/>`;
  if (t === 'h') return `<path d="M0 -60 L0 -45" stroke="#e8301a" stroke-width="3.5" stroke-linecap="round"/>`;
  if (t === 'b') return `<circle cx="0" cy="-49" r="2.6" fill="#d8101a"/>`;
  return '';
}
function crown(u, type, female) {
  const g = `url(#${u}-gold)`;
  if (type === 'spiky') return `<path d="M-26 -62 L-30 -96 L-18 -78 L-12 -108 L-4 -82 L0 -118 L4 -82 L12 -108 L18 -78 L30 -96 L26 -62 Z" fill="${g}" stroke="${INK}" stroke-width="1.4"/><circle cx="0" cy="-74" r="4" fill="#c8102a"/><rect x="-26" y="-66" width="52" height="6" fill="${g}" stroke="${INK}" stroke-width="1"/>`;
  if (female) return `<path d="M-20 -62 Q 0 -80 20 -62 L16 -58 Q 0 -70 -16 -58 Z" fill="${g}" stroke="${INK}"/><path d="M0 -78 L-5 -68 L5 -68 Z" fill="${g}"/><circle cx="0" cy="-66" r="2.5" fill="#d82050"/>`;
  return `<path d="M-24 -60 L-22 -88 C -16 -96 -8 -100 -6 -108 C -4 -118 4 -118 6 -108 C 8 -100 16 -96 22 -88 L24 -60 Z" fill="${g}" stroke="${INK}" stroke-width="1.4"/><path d="M-22 -76 Q 0 -84 22 -76 M-22 -68 Q 0 -74 22 -68" stroke="#8a5a10" stroke-width="1.4" fill="none"/><circle cx="0" cy="-90" r="4.5" fill="#c8102a" stroke="#fff3" /><circle cx="-12" cy="-80" r="2.2" fill="#2a8a5a"/><circle cx="12" cy="-80" r="2.2" fill="#2a8a5a"/><path d="M0 -118 L-3 -128 L0 -134 L3 -128 Z" fill="${g}"/>`;
}

function humanHead(u, s, back) { const h = humanHeadParts(u, s, back); return back ? h.main : h.behind + h.main; }
function humanHeadParts(u, s, back) {
  const hairC = s.older ? '#5a5050' : '#140c0a';
  const face = `url(#${u}-face)`;
  const rak = s.head === 'rakshasa' || s.head === 'rakshasi';
  let behind = '', front = '', top = '';
  const longHair = `<path d="M-24 -50 C -34 -10, -34 30, -26 60 L 26 60 C 34 30, 34 -10, 24 -50 Z" fill="${hairC}"/>`;
  switch (s.head) {
    case 'jata':
      behind = longHair.replace('60 L 26 60', '40 L 26 40');
      top = `<path d="M-22 -48 C -24 -64 -14 -72 0 -72 C 14 -72 24 -64 22 -48 C 16 -58 -16 -58 -22 -48Z" fill="${hairC}"/><ellipse cx="0" cy="-82" rx="11" ry="13" fill="${hairC}"/><path d="M-11 -78 Q 0 -72 11 -78" stroke="#c8902a" stroke-width="2.4" fill="none"/>${s.orn ? `<circle cx="0" cy="-92" r="2.5" fill="${GOLD}"/>` : ''}`;
      break;
    case 'crown': behind = longHair; top = `<path d="M-22 -48 C -24 -60 -14 -66 0 -66 C 14 -66 24 -60 22 -48 C 16 -56 -16 -56 -22 -48Z" fill="${hairC}"/>` + crown(u); break;
    case 'crown-f': behind = longHair.replace('60 L 26 60', '120 L 26 120'); top = `<path d="M-22 -46 C -24 -62 -12 -68 0 -68 C 12 -68 24 -62 22 -46 Q 0 -60 -22 -46Z" fill="${hairC}"/>` + crown(u, null, true); break;
    case 'bun-f': behind = longHair.replace('60 L 26 60', '130 L 26 130') + `<circle cx="0" cy="-70" r="14" fill="${hairC}"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${Math.cos(i) * 14}" cy="${-70 + Math.sin(i) * 14}" r="2.6" fill="${i % 2 ? '#f8f0f0' : '#e8507a'}"/>`).join('')}`; top = `<path d="M-22 -46 C -24 -62 -12 -68 0 -68 C 12 -68 24 -62 22 -46 Q 6 -58 0 -60 Q -6 -58 -22 -46Z" fill="${hairC}"/><path d="M0 -68 L0 -58" stroke="#d81020" stroke-width="2"/>`; break;
    case 'sage': {
      const c = s.beard === 'white' ? '#ecebe6' : s.beard === 'grey' ? '#a8a4a0' : '#2a2220';
      behind = `<path d="M-24 -50 C -32 -20, -30 10, -24 30 L 24 30 C 30 10, 32 -20, 24 -50 Z" fill="${c}"/>`;
      top = `<path d="M-22 -48 C -24 -62 -14 -68 0 -68 C 14 -68 24 -62 22 -48 C 16 -56 -16 -56 -22 -48Z" fill="${c}"/><path d="M-10 -66 C -14 -86 -6 -100 0 -104 C 6 -100 14 -86 10 -66Z" fill="${c}"/><path d="M-10 -80 Q 0 -76 10 -80" stroke="#6a4a2a" stroke-width="2" fill="none"/>`;
      break;
    }
    case 'sage-f': behind = longHair.replace('60 L 26 60', '90 L 26 90').replace(hairC, '#d8d4cc'); top = `<path d="M-22 -46 C -24 -62 -12 -68 0 -68 C 12 -68 24 -62 22 -46 Q 0 -58 -22 -46Z" fill="#d8d4cc"/><circle cx="0" cy="-72" r="11" fill="#d8d4cc"/>`; break;
    case 'flame': behind = `<path d="M-26 -50 C -40 -80 -20 -90 -18 -110 C -8 -96 -4 -120 2 -132 C 8 -110 14 -104 20 -118 C 24 -96 40 -82 26 -50 Z" fill="#ff8a1a"/><path d="M-16 -54 C -22 -80 -6 -86 0 -104 C 6 -86 22 -80 16 -54 Z" fill="#ffe060"/>`; break;
    case 'shiva':
      behind = longHair.replace('60 L 26 60', '70 L 26 70');
      top = `<path d="M-22 -48 C -24 -62 -14 -68 0 -68 C 14 -68 24 -62 22 -48 C 16 -56 -16 -56 -22 -48Z" fill="#2a1e1a"/><path d="M-14 -64 C -18 -96 -8 -116 0 -120 C 8 -116 18 -96 14 -64Z" fill="#2a1e1a"/><path d="M-8 -104 A 9 9 0 1 0 6 -98 A 7 7 0 1 1 -8 -104Z" fill="#f8f4e0"/><path d="M6 -110 C 16 -118 22 -100 14 -90" stroke="#9ad8ff" stroke-width="2.2" fill="none"/>`;
      front = `<path d="M0 -52 C -2 -48 2 -46 0 -42" stroke="#c82020" stroke-width="2" fill="none"/><path d="M-26 -2 C -18 10, 18 10, 26 -2 C 30 -10 24 -14 20 -8" stroke="#3a7a4a" stroke-width="5" fill="none"/><circle cx="21" cy="-9" r="3.5" fill="#3a7a4a"/>`;
      break;
    case 'rakshasa':
      behind = `<path d="M-26 -50 C -44 -30, -42 20, -30 50 L 30 50 C 42 20, 44 -30, 26 -50 Z" fill="#0e0808"/>`;
      top = `<path d="M-24 -46 C -28 -64 -14 -72 0 -72 C 14 -72 28 -64 24 -46 C 16 -56 -16 -56 -24 -46Z" fill="#0e0808"/>` + (s.crown ? crown(u, s.crown) : '') + (s.horns ? `<path d="M-18 -60 C -30 -76 -30 -92 -22 -100 C -22 -86 -16 -76 -10 -66Z M18 -60 C 30 -76 30 -92 22 -100 C 22 -86 16 -76 10 -66Z" fill="#e8dcc0" stroke="${INK}"/>` : '');
      break;
    case 'rakshasi':
      behind = `<path d="M-28 -50 C -50 -20, -46 40, -36 90 L 36 90 C 46 40, 50 -20, 28 -50 Z" fill="#120a0a"/>`;
      top = `<path d="M-24 -46 C -30 -66 -14 -74 0 -74 C 14 -74 30 -66 24 -46 C 12 -60 -12 -60 -24 -46Z" fill="#120a0a"/>${[...Array(6)].map((_, i) => `<path d="M${-24 + i * 9} -66 l -4 -14 l 8 8" stroke="#120a0a" stroke-width="3" fill="none"/>`).join('')}`;
      break;
    case 'eagle': {
      const f = '#e8b040';
      const main = `<g class="headv"><path d="M-26 -10 C -34 -50 -20 -74 0 -76 C 22 -76 32 -54 26 -14 C 14 -2 -14 -2 -26 -10Z" fill="${f}" stroke="${INK}" stroke-width="1.4"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-22 + i * 11} -14 l 4 12 l 4 -12" fill="${shade(f, -.2)}"/>`).join('')}<path d="M8 -44 C 34 -46 40 -28 30 -14 C 26 -24 18 -28 6 -30Z" fill="#f4e4a8" stroke="${INK}"/><circle cx="-2" cy="-46" r="4.5" fill="#fff4c0" stroke="${INK}"/><circle cx="-1" cy="-46" r="2.2" fill="#1a0e08"/><path d="M-16 -54 Q -6 -60 6 -52" stroke="${INK}" stroke-width="2.4" fill="none"/>${crown(u)}</g>`;
      return { behind: '', main };
    }
    case 'band':
      behind = longHair.replace('60 L 26 60', '30 L 26 30');
      top = `<path d="M-22 -48 C -24 -62 -14 -68 0 -68 C 14 -68 24 -62 22 -48 C 16 -56 -16 -56 -22 -48Z" fill="${hairC}"/><path d="M-23 -54 Q 0 -64 23 -54" stroke="url(#${u}-gold)" stroke-width="4" fill="none"/><circle cx="0" cy="-60" r="3" fill="#c8102a"/>`;
      break;
    default: top = `<path d="M-22 -48 C -24 -62 -14 -68 0 -68 C 14 -68 24 -62 22 -48 C 16 -56 -16 -56 -22 -48Z" fill="${hairC}"/>`;
  }
  if (back) {
    // Back of the head: hair mass only.
    const hair = s.head === 'sage' ? (s.beard === 'white' ? '#ecebe6' : '#a8a4a0') : s.head === 'flame' ? '#ff8a1a' : hairC;
    return { behind: '', main: `<g class="headv">${behind}<ellipse cx="0" cy="-34" rx="23" ry="28" fill="${hair}"/>${top}</g>` };
  }
  let beard = '';
  if (s.beard === 'moustache' || rak && s.beard !== 'grey') beard = `<path d="M-14 -21 C -8 -26 -2 -24 0 -22 C 2 -24 8 -26 14 -21 C 18 -18 20 -24 18 -26 M-14 -21 C -18 -18 -20 -24 -18 -26" stroke="#120a08" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  if (s.beard === 'grey' || s.beard === 'white' || s.beard === 'black') {
    const c = s.beard === 'white' ? '#f0eee8' : s.beard === 'grey' ? '#b0aca6' : '#1a1210';
    beard = `<path d="M-20 -28 C -22 6, -10 ${s.head === 'sage' ? 40 : 18}, 0 ${s.head === 'sage' ? 52 : 24} C 10 ${s.head === 'sage' ? 40 : 18}, 22 6, 20 -28 C 14 -18, 6 -22, 0 -20 C -6 -22, -14 -18, -20 -28Z" fill="${c}"/><path d="M-12 -24 C -6 -28 6 -28 12 -24" stroke="${c}" stroke-width="4" fill="none"/>`;
  }
  const fangs = (s.fangs || rak) ? `<path d="M-6 -17 l2 7 l2 -7 M2 -17 l2 7 l2 -7" fill="#fff" stroke="${INK}" stroke-width=".6"/>` : '';
  const earR = s.orn ? `<circle cx="-23" cy="-26" r="4" fill="url(#${u}-gold)" stroke="${INK}" stroke-width=".8"/><circle cx="23" cy="-26" r="4" fill="url(#${u}-gold)" stroke="${INK}" stroke-width=".8"/>` : '';
  const faceEl = `<path d="M-21 -40 C -22 -62, 22 -62, 21 -40 C 21 -20, 10 -6, 0 -6 C -10 -6, -21 -20, -21 -40Z" fill="${face}" stroke="${INK}" stroke-width="1.4"/>
    <path d="M-23 -38 q -5 4 -1 12 M23 -38 q 5 4 1 12" fill="${face}" stroke="${INK}" stroke-width="1.2"/>`;
  return { behind: `<g class="headv">${behind}</g>`, main: `<g class="headv">${earR}${faceEl}${eyes(s, rak)}
    <path d="M0 -36 C -2 -28 -4 -26 -1 -24" stroke="${shade(s.skin || '#c8906a', -.45)}" stroke-width="1.4" fill="none"/>
    <path d="M-6 -17 Q 0 -13 6 -17" stroke="#8a2a2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${fangs}${beard}${tilak(s.tilak || (s.sex === 'f' ? 'b' : ''))}${top}${front}</g>` };
}

function vanaraHead(u, s, back) {
  const fur = s.fur, face = `url(#${u}-face)`;
  if (back) return `<g class="headv"><circle cx="0" cy="-36" r="30" fill="${shade(fur, -.15)}"/>${s.head === 'crown' ? crown(u) : `<path d="M-26 -56 Q 0 -70 26 -56" stroke="url(#${u}-gold)" stroke-width="4" fill="none"/>`}</g>`;
  const mane = Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2; return `${Math.cos(a) * (30 + (i % 2) * 6)},${-36 + Math.sin(a) * (32 + (i % 2) * 6)}`; }).join(' ');
  return `<g class="headv">
    <polygon points="${mane}" fill="${shade(fur, -.12)}"/>
    <circle cx="-30" cy="-36" r="9" fill="${s.face}" stroke="${INK}"/><circle cx="30" cy="-36" r="9" fill="${s.face}" stroke="${INK}"/>
    <ellipse cx="0" cy="-36" rx="25" ry="27" fill="${fur}" stroke="${INK}" stroke-width="1.2"/>
    <path d="M-17 -44 C -18 -54 18 -54 17 -44 C 22 -30 16 -10 0 -8 C -16 -10 -22 -30 -17 -44Z" fill="${face}" stroke="${INK}" stroke-width="1"/>
    <path d="M-15 -46 Q 0 -54 15 -46" stroke="${shade(fur, -.4)}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="-7" cy="-40" r="3" fill="#1a0e08"/><circle cx="7" cy="-40" r="3" fill="#1a0e08"/><circle cx="-6" cy="-41" r="1" fill="#fff"/><circle cx="8" cy="-41" r="1" fill="#fff"/>
    <ellipse cx="0" cy="-22" rx="12" ry="9" fill="${shade(s.face, .15)}" stroke="${INK}" stroke-width="1"/>
    <circle cx="-3" cy="-26" r="1.3" fill="${INK}"/><circle cx="3" cy="-26" r="1.3" fill="${INK}"/>
    <path d="M-7 -18 Q 0 -14 7 -18" stroke="${INK}" stroke-width="1.6" fill="none"/>
    ${s.beard === 'white' ? `<path d="M-14 -14 Q 0 6 14 -14" fill="#f0eee8"/>` : ''}
    ${tilak(s.tilak)}
    ${s.head === 'crown' ? crown(u) : s.head === 'crown-f' ? crown(u, null, true) : `<path d="M-24 -54 Q 0 -68 24 -54" stroke="url(#${u}-gold)" stroke-width="4" fill="none"/><circle cx="0" cy="-61" r="3" fill="#c8102a"/>`}
    ${s.orn ? `<circle cx="-30" cy="-28" r="4" fill="url(#${u}-gold)"/><circle cx="30" cy="-28" r="4" fill="url(#${u}-gold)"/>` : ''}
  </g>`;
}

function bearHead(u, s, back) {
  const fur = s.fur;
  if (back) return `<g class="headv"><circle cx="0" cy="-36" r="32" fill="${fur}"/>${s.head === 'crown' ? crown(u) : ''}</g>`;
  return `<g class="headv">
    <circle cx="-24" cy="-62" r="10" fill="${fur}" stroke="${INK}"/><circle cx="24" cy="-62" r="10" fill="${fur}" stroke="${INK}"/>
    <circle cx="-24" cy="-62" r="5" fill="${s.face}"/><circle cx="24" cy="-62" r="5" fill="${s.face}"/>
    <ellipse cx="0" cy="-38" rx="31" ry="30" fill="${fur}" stroke="${INK}" stroke-width="1.2"/>
    <ellipse cx="0" cy="-22" rx="15" ry="12" fill="${s.face}" stroke="${INK}"/>
    <ellipse cx="0" cy="-29" rx="6" ry="4.5" fill="#0a0606"/>
    <circle cx="-11" cy="-44" r="3" fill="#f0c040"/><circle cx="11" cy="-44" r="3" fill="#f0c040"/><circle cx="-11" cy="-44" r="1.4" fill="#000"/><circle cx="11" cy="-44" r="1.4" fill="#000"/>
    <path d="M-8 -15 Q 0 -11 8 -15" stroke="#0a0606" stroke-width="2" fill="none"/>
    ${s.horns ? `<path d="M-22 -60 C -40 -70 -44 -92 -34 -104 C -32 -88 -24 -78 -14 -70Z M22 -60 C 40 -70 44 -92 34 -104 C 32 -88 24 -78 14 -70Z" fill="#d8ccb0" stroke="${INK}"/>` : ''}
    ${s.head === 'crown' ? `<g transform="translate(0,-4)">${crown(u)}</g>` : ''}
  </g>`;
}

/* ───────── human-form body (also vanaras, bears) ───────── */
function buildHumanoid(u, s, back) {
  const fem = s.sex === 'f';
  const skin = `url(#${u}-skin)`, cloth = `url(#${u}-cloth)`, drape = `url(#${u}-drape)`, g = `url(#${u}-gold)`;
  const sw = fem ? 36 : (s.kind === 'bear' ? 54 : s.armor || s.kind === 'vanara' ? 50 : 46), ww = fem ? 23 : (s.kind === 'bear' ? 38 : 30);
  const aw = fem ? .85 : s.kind === 'bear' ? 1.6 : s.armor || s.kind === 'vanara' ? 1.45 : 1.25;
  const furTufts = (s.kind === 'vanara' || s.kind === 'bear') ? Array.from({ length: 7 }, (_, i) => `<path d="M${-sw + 2} ${-286 + i * 12} l -6 4 l 6 3" fill="${s.fur}"/><path d="M${sw - 2} ${-286 + i * 12} l 6 4 l -6 3" fill="${s.fur}"/>`).join('') : '';

  // arm: upper arm + forearm + hand + weapon
  const arm = (side, wpn) => `
    <g class="${side}" transform="translate(${side === 'armR' ? sw - 4 : -(sw - 4)},-284)">${side === 'armL' ? '<g transform="scale(-1,1)">' : '<g>'}
      <g class="rot">
        <circle cx="0" cy="2" r="${fem ? 8 : 11}" fill="${s.armor ? `url(#${u}-armor)` : skin}" stroke="${INK}" stroke-width="1.2"/>
        <path d="M${-9 * aw} 0 C ${-12 * aw} 26 ${-10 * aw} 55 ${-7 * aw} 72 L ${7 * aw} 72 C ${10 * aw} 55 ${12 * aw} 26 ${9 * aw} 0 Z" fill="${skin}" stroke="${INK}" stroke-width="1.2"/>
        ${s.orn ? `<rect x="${-11 * aw}" y="34" width="${22 * aw}" height="6" rx="2" fill="${g}" stroke="${INK}" stroke-width=".8"/>` : ''}
        ${s.armor ? `<path d="M-14 -6 C -16 14 14 14 14 -6 C 8 -14 -8 -14 -14 -6Z" fill="url(#${u}-armor)" stroke="${GOLD}" stroke-width="1.5"/>` : ''}
        <g class="fore" transform="translate(0,72)"><g class="rot">
          <path d="M${-7 * aw} 0 C ${-8 * aw} 22 ${-6 * aw} 50 ${-5 * aw} 62 L ${5 * aw} 62 C ${6 * aw} 50 ${8 * aw} 22 ${7 * aw} 0 Z" fill="${skin}" stroke="${INK}" stroke-width="1.2"/>
          ${s.orn ? `<rect x="${-7 * aw}" y="50" width="${14 * aw}" height="${fem ? 10 : 7}" rx="2" fill="${g}" stroke="${INK}" stroke-width=".7"/>` : s.valkala ? `<path d="M-6 52 h12 M-6 56 h12" stroke="#6a3a1a" stroke-width="1.6"/>` : ''}
          <g class="hand" transform="translate(0,70)">
            ${wpn ? weapon(wpn, u) : ''}
            <ellipse cx="0" cy="0" rx="${fem ? 6 : 7.5}" ry="${fem ? 8 : 10}" fill="${skin}" stroke="${INK}" stroke-width="1.1"/>
          </g>
        </g></g>
      </g></g>
    </g>`;

  // legs: dhoti-trouser + ankle + foot
  const leg = (side) => {
    const x = side === 'legR' ? 17 : -17;
    const dh = s.kind === 'bear' ? s.dhoti : (s.valkala ? '#8a6238' : s.dhoti);
    return `<g class="${side}" transform="translate(${x},-192)"><g class="rot">
      <path d="M-17 0 C -24 40 -21 110 -13 166 L 13 166 C 19 110 23 40 17 0 Z" fill="${s.tiger ? '#e09a3a' : (dh ? cloth : skin)}" stroke="${INK}" stroke-width="1.2"/>
      ${s.tiger ? '<path d="M-14 30 l10 6 M-12 70 l12 5 M-10 110 l10 6 M6 50 l10 -4 M4 90 l12 -4 M4 130 l10 -4" stroke="#1a1008" stroke-width="3"/>' : ''}
      ${s.valkala ? '<path d="M-12 30 l8 4 M-10 70 l10 3 M2 50 l10 -3 M0 110 l10 -3" stroke="#5a3a18" stroke-width="2"/>' : `<path d="M-8 20 C -10 70 -8 120 -6 160" stroke="${shade(dh || '#888', -.35)}" stroke-width="1.4" fill="none" opacity=".6"/><line x1="-13" y1="160" x2="13" y2="160" stroke="${GOLD}" stroke-width="3"/>`}
      <path d="M-7 164 L 7 164 L 7 182 L -7 182 Z" fill="${skin}" stroke="${INK}" stroke-width="1"/>
      ${s.orn ? `<rect x="-8" y="172" width="16" height="4" rx="2" fill="${g}"/>` : ''}
      <ellipse cx="${x > 0 ? 4 : -4}" cy="186" rx="13" ry="6.5" fill="${skin}" stroke="${INK}" stroke-width="1.1"/>
    </g></g>`;
  };

  // torso
  const torsoPath = `M-12 -302 C -30 -300 -${sw} -296 -${sw} -280 C -${sw - 2} -268 -${sw - 6} -262 -${sw - 8} -258 C -${ww + 4} -232 -${ww} -214 -${ww} -200 L ${ww} -200 C ${ww} -214 ${ww + 4} -232 ${sw - 8} -258 C ${sw - 6} -262 ${sw - 2} -268 ${sw} -280 C ${sw} -296 30 -300 12 -302 Z`;
  let torso = `<path d="${torsoPath}" fill="${skin}" stroke="${INK}" stroke-width="1.4"/>`;
  if (!back) {
    if (!fem) torso += `<path d="M-30 -262 Q -16 -248 -2 -260 M2 -260 Q 16 -248 30 -262" stroke="${shade(s.skin || s.fur || '#888', -.35)}" stroke-width="1.4" fill="none" opacity=".7"/><path d="M0 -250 L0 -214 M-12 -236 h24 M-12 -222 h24" stroke="${shade(s.skin || s.fur || '#888', -.3)}" stroke-width="1" opacity=".35"/><circle cx="0" cy="-210" r="1.6" fill="${INK}" opacity=".5"/>`;
    if (s.kind === 'vanara' || s.kind === 'bear') torso += `<path d="M-22 -270 C -26 -230 -18 -206 0 -204 C 18 -206 26 -230 22 -270 Q 0 -260 -22 -270Z" fill="${s.face}" opacity=".55"/>`;
    if (s.armor) torso += `<path d="M-${sw - 6} -284 C -${sw - 4} -240 -${ww} -220 -${ww} -204 L ${ww} -204 C ${ww} -220 ${sw - 4} -240 ${sw - 6} -284 Q 0 -270 -${sw - 6} -284Z" fill="url(#${u}-armor)" stroke="${GOLD}" stroke-width="2"/><path d="M-20 -262 Q 0 -246 20 -262 M0 -270 L0 -206" stroke="${GOLD}" stroke-width="1.6" fill="none"/><circle cx="0" cy="-256" r="6" fill="#a8102a" stroke="${GOLD}" stroke-width="2"/>`;
    if (fem) torso += `<path d="M-${sw - 4} -282 C -30 -262 -24 -244 -20 -240 L 20 -240 C 24 -244 30 -262 ${sw - 4} -282 Q 0 -290 -${sw - 4} -282Z" fill="${drape}" stroke="${INK}" stroke-width="1"/><path d="M-20 -240 Q 0 -236 20 -240" stroke="${GOLD}" stroke-width="2.4" fill="none"/>`;
    // sacred thread / necklaces
    if (!fem && s.kind === 'human' && !s.armor) torso += `<path d="M-30 -290 C -10 -260 10 -230 26 -200" stroke="#f6f0e0" stroke-width="1.6" fill="none"/>`;
    if (s.orn >= 1) torso += `<path d="M-16 -296 Q 0 -278 16 -296" stroke="${g}" stroke-width="3" fill="none"/>`;
    if (s.orn >= 2) torso += `<path d="M-22 -296 Q 0 -262 22 -296" stroke="${g}" stroke-width="2.4" fill="none"/><path d="M0 -268 l -4 6 l 4 6 l 4 -6 Z" fill="#c8102a" stroke="${GOLD}"/>`;
    if (s.orn >= 3) torso += `<path d="M-26 -294 Q 0 -238 26 -294" stroke="#c88a2a" stroke-width="1.6" stroke-dasharray="2 3" fill="none"/>`;
    if (s.orn === 0 && s.kind === 'human' && s.head !== 'rakshasa') torso += `<path d="M-18 -296 Q 0 -266 18 -296" stroke="#5a2a14" stroke-width="2.4" stroke-dasharray="3 2" fill="none"/>`;
  }
  // uttariya (stole) or deerskin
  let stole = '';
  if (!fem && (s.uttariya || s.valkala)) {
    const c = s.valkala ? '#c8a070' : drape;
    stole = back
      ? `<path d="M-${sw - 4} -290 C -10 -280 10 -250 ${ww + 2} -206 L ${ww - 8} -200 C 0 -240 -20 -268 -${sw - 2} -278Z" fill="${c}" stroke="${INK}" stroke-width="1"/>`
      : `<path d="M-${sw - 6} -292 C -${sw - 14} -270 -6 -238 ${ww + 2} -206 L ${ww - 10} -198 C -14 -230 -${sw - 4} -262 -${sw} -282Z" fill="${c}" stroke="${INK}" stroke-width="1.1"/>${s.valkala ? '' : `<path d="M-${sw - 8} -286 C -16 -250 4 -228 ${ww} -204" stroke="${GOLD}" stroke-width="1.6" fill="none"/>`}`;
  }
  // waist: belt + kaccha panel / saree
  let lower = '';
  if (fem) {
    lower = `<path d="M-${ww + 2} -206 C -40 -150 -50 -60 -52 -6 L 52 -6 C 50 -60 40 -150 ${ww + 2} -206 Z" fill="${cloth}" stroke="${INK}" stroke-width="1.3"/>
      ${back ? '' : `<path d="M-6 -200 C -10 -140 -14 -70 -16 -8 M0 -200 L0 -8 M6 -200 C 10 -140 14 -70 16 -8" stroke="${shade(s.saree || '#888', -.3)}" stroke-width="1.2" fill="none"/>`}
      <path d="M-51 -12 L 51 -12" stroke="${GOLD}" stroke-width="5"/>
      <path class="pallu" d="M${back ? '' : '-'}${sw - 4} -290 C ${back ? '-' : ''}${sw + 6} -230 ${back ? '-' : ''}${sw + 10} -160 ${back ? '-' : ''}${sw + 4} -90 L ${back ? '-' : ''}${sw - 10} -96 C ${back ? '-' : ''}${sw - 6} -160 ${back ? '-' : ''}${sw - 10} -230 ${back ? '' : '-'}${sw - 14} -284Z" fill="${drape}" stroke="${INK}" stroke-width="1"/>
      ${back ? '' : `<path d="M-${sw - 2} -290 C -10 -260 10 -230 ${ww + 4} -210 L ${ww - 4} -200 C 0 -226 -20 -250 -${sw - 6} -282Z" fill="${drape}" stroke="${INK}" stroke-width="1"/><path d="M-${sw - 4} -288 C -10 -256 8 -228 ${ww + 2} -206" stroke="${GOLD}" stroke-width="2.2" fill="none"/>`}
      <rect x="-${ww + 3}" y="-210" width="${(ww + 3) * 2}" height="8" rx="3" fill="${g}" stroke="${INK}" stroke-width=".8"/>
      <ellipse cx="-12" cy="-3" rx="10" ry="5" fill="${skin}" stroke="${INK}"/><ellipse cx="12" cy="-3" rx="10" ry="5" fill="${skin}" stroke="${INK}"/>`;
  } else {
    lower = `${back ? '' : `<path class="kaccha" d="M-12 -200 C -14 -150 -8 -90 0 -60 C 8 -90 14 -150 12 -200 Z" fill="${s.tiger ? '#e09a3a' : cloth}" stroke="${INK}" stroke-width="1"/><path d="M-4 -196 L-2 -80 M4 -196 L2 -80" stroke="${shade(s.dhoti || '#8a6238', -.35)}" stroke-width="1"/>`}
      <rect x="-${ww + 4}" y="-208" width="${(ww + 4) * 2}" height="11" rx="4" fill="${s.valkala ? '#6a4a22' : (s.uttariya ? drape : cloth)}" stroke="${INK}" stroke-width="1"/>
      ${s.orn ? `<rect x="-${ww + 4}" y="-206" width="${(ww + 4) * 2}" height="4" fill="${g}"/>` : ''}
      ${s.valkala ? '' : `<path d="M${ww} -200 C ${ww + 10} -170 ${ww + 6} -140 ${ww + 12} -120 L ${ww + 2} -118 C ${ww - 2} -140 ${ww - 4} -170 ${ww - 6} -198Z" fill="${drape}" stroke="${INK}" stroke-width=".9"/>`}`;
  }
  // quiver (behind)
  const quiver = s.quiver ? `<g transform="translate(-${sw - 12},-300) rotate(-24)"><rect x="-9" y="0" width="18" height="96" rx="6" fill="#7a3e18" stroke="${INK}" stroke-width="1.2"/><rect x="-9" y="8" width="18" height="6" fill="${g}"/><rect x="-9" y="70" width="18" height="6" fill="${g}"/>${[-5, 0, 5].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="-26" stroke="#d8c8a0" stroke-width="1.4"/><path d="M${x} -26 l -3 -8 l 3 2 l 3 -2 z" fill="#c82a2a"/>`).join('')}</g>` : '';
  const tail = s.kind === 'vanara' ? `<g class="tail" transform="translate(${back ? 0 : -10},-214)"><path class="tailp" d="M0 0 C -40 20 -70 -10 -76 -60 C -80 -100 -60 -130 -40 -126" fill="none" stroke="${s.fur}" stroke-width="10" stroke-linecap="round"/><path d="M-40 -126 C -30 -128 -26 -118 -34 -114" stroke="${shade(s.fur, -.3)}" stroke-width="12" stroke-linecap="round" fill="none"/></g>` : '';
  const hunch = s.hunch ? `<ellipse cx="-8" cy="-290" rx="34" ry="20" fill="${drape}" stroke="${INK}"/>` : '';
  // extra arms (four-armed deities)
  let extra = '';
  if (s.arms === 4 && !back) {
    const items = s.weapon === 'chakra' ? ['chakra', 'conch'] : s.id === 'brahma' ? ['book', 'rosary'] : ['lotus', 'mace'];
    const xa = (side, item) => `<g transform="translate(${side * (sw - 8)},-280) rotate(${side * -135})"><path d="M-8 0 C -9 30 -8 56 -6 70 L 6 70 C 8 56 9 30 8 0 Z" fill="${skin}" stroke="${INK}"/><g transform="translate(0,78) rotate(${side * 135})">${item === 'conch' ? `<path d="M-10 -6 C -14 -24 12 -28 14 -10 C 16 4 0 10 -10 -6Z" fill="#f8f4ec" stroke="${INK}"/>` : item === 'book' ? `<rect x="-12" y="-16" width="24" height="18" fill="#c8402a" stroke="${GOLD}"/>` : item === 'rosary' ? `<circle r="12" fill="none" stroke="#8a4a2a" stroke-width="3" stroke-dasharray="2 2"/>` : weapon(item, u)}<ellipse rx="7" ry="9" fill="${skin}" stroke="${INK}"/></g></g>`;
    extra = xa(1, items[0]) + xa(-1, items[1]);
  }
  // heads
  const parts = s.kind === 'human' ? humanHeadParts(u, s, back) : null;
  const headFn = s.kind === 'vanara' ? vanaraHead : s.kind === 'bear' ? bearHead : (uu, ss, bk) => parts.main;
  const hairBack = parts && !back ? `<g class="hairback" transform="translate(0,-304)">${parts.behind}</g>` : '';
  const wings = s.wings ? [1, -1].map(side => `<g transform="translate(${side * 20},-282) scale(${side},1)"><g class="${side > 0 ? 'wingF' : 'wingB'}"><g class="rot"><path d="M0 0 C 40 -90 140 -130 210 -110 C 180 -90 176 -70 196 -56 C 160 -50 150 -32 170 -16 C 130 -14 116 0 130 16 C 90 12 50 30 0 40 Z" fill="${s.wings}" stroke="${INK}" stroke-width="1.4"/>${[40, 80, 120, 160].map(x => `<path d="M${x} ${-50 - x * .2} C ${x + 14} ${-20 - x * .1} ${x} 8 ${x - 14} 24" stroke="${shade(s.wings, .3)}" stroke-width="1.6" fill="none"/>`).join('')}</g></g></g>`).join('') : '';
  let heads = '';
  if (s.heads === 10) {
    // Daśānana: the crowned central head plus nine more — five on one side, four on the other.
    const pos = [-170, -136, -102, -68, -34, 34, 68, 102, 136].map(x => back ? -x : x);
    heads = pos.sort((a, b) => Math.abs(b) - Math.abs(a)).map(x => `<g transform="translate(${x},${Math.abs(x) * .06 + 4}) scale(.84)">${humanHeadParts(u, { ...s, crown: 'spiky' }, back).main}</g>`).join('');
  }
  if (s.heads === 4 && !back) heads = [-34, 34].map(x => `<g transform="translate(${x},4) scale(.86)">${humanHeadParts(u, s).main}</g>`).join('');
  const head = `<g class="head" transform="translate(0,-304)"><g class="rot">${heads}${headFn(u, s, back)}</g></g>`;
  const neck = `<path d="M-9 -314 L 9 -314 L 10 -296 L -10 -296 Z" fill="${skin}" stroke="${INK}" stroke-width="1"/>`;

  const wR = back ? null : (s.weapon && s.weapon !== 'none' && s.weapon !== 'chakra' ? s.weapon : null);
  const wChakra = s.weapon === 'chakra' && !back ? 'lotus' : null;
  // back view: draw arms behind body? In back view, arms are on the same sides; weapons hidden behind body.
  return `${wings}${quiver}${tail}${extra}${hairBack}
    <g class="legs">${fem ? '' : leg('legL') + leg('legR')}</g>
    <g class="lower">${lower}</g>
    <g class="torso">${torso}${stole}${hunch}</g>
    ${neck}
    ${arm('armL', back ? null : (s.weapon === 'veena' ? null : null))}
    ${arm('armR', wR || wChakra)}
    ${head}`;
}

/* ───────── non-human rigs ───────── */
function buildBird(u, s) {
  const crownSvg = s.crown ? `<g transform="translate(64,-236) scale(.6)">${crown(u)}</g>` : '';
  const wing = (cls, flip) => `<g class="${cls}" transform="translate(${flip ? -18 : 18},-170)"><g class="rot"><g transform="scale(${flip ? -1 : 1},1)">
    ${s.wingless ? `<path d="M0 0 C 20 -6 30 6 26 20 C 14 14 6 12 0 10Z" fill="${s.wing}" stroke="${INK}"/>` :
      `<path d="M0 0 C 50 -60 130 -70 200 -40 C 170 -30 160 -18 180 -8 C 150 -6 140 4 156 16 C 120 14 100 22 112 34 C 70 28 40 30 0 24 Z" fill="${s.wing}" stroke="${INK}" stroke-width="1.4"/>
      ${[30, 60, 90, 120, 150].map(x => `<path d="M${x} ${-30 + x * .1} C ${x + 10} ${-10 + x * .08} ${x} 10 ${x - 10} 22" stroke="${shade(s.wing, .25)}" stroke-width="1.5" fill="none"/>`).join('')}`}
  </g></g></g>`;
  return `${wing('wingB', true)}
    <g class="legs"><path d="M-12 -70 L -16 -6 M10 -70 L 14 -6" stroke="#c8a040" stroke-width="5"/><path d="M-26 0 L-16 -6 L-6 0 M4 0 L14 -6 L24 0" stroke="#c8a040" stroke-width="4" fill="none"/></g>
    <path d="M-60 -110 L -100 -70 L -90 -96 L -110 -86 L -70 -128Z" fill="${shade(s.wing, -.2)}" stroke="${INK}"/>
    <ellipse class="torso" cx="0" cy="-130" rx="56" ry="70" fill="${s.body}" stroke="${INK}" stroke-width="1.5"/>
    <path d="M-30 -170 C -10 -150 10 -150 34 -176 C 30 -140 10 -110 -20 -100 Z" fill="${shade(s.body, .25)}" opacity=".5"/>
    <g class="head" transform="translate(36,-196)"><g class="rot">
      <path d="M-30 30 C -20 -6 0 -20 16 -24 C 26 -6 20 20 0 36Z" fill="${s.ruff || shade(s.body, .4)}" stroke="${INK}"/>
      <circle cx="14" cy="-34" r="20" fill="${s.head}" stroke="${INK}" stroke-width="1.4"/>
      <path d="M30 -38 C 52 -38 58 -26 50 -14 C 46 -22 40 -24 30 -26Z" fill="${s.beak}" stroke="${INK}"/>
      <circle cx="18" cy="-38" r="4" fill="#f0c020" stroke="${INK}"/><circle cx="19" cy="-38" r="1.8" fill="#000"/>
    </g></g>
    ${crownSvg}
    ${wing('wingF', false)}`;
}
function buildDeer(u, s) {
  const leg = (cls, x) => `<g class="${cls}" transform="translate(${x},-80)"><g class="rot"><path d="M-5 0 L-4 74 L4 74 L5 0Z" fill="${s.body}" stroke="${INK}"/><rect x="-5" y="72" width="10" height="8" fill="#2a1a10"/></g></g>`;
  return `${leg('legB1', -48)}${leg('legB2', 44)}
    <ellipse class="torso" cx="0" cy="-100" rx="74" ry="34" fill="${s.body}" stroke="${INK}" stroke-width="1.4"/>
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="${-56 + (i % 8) * 15}" cy="${-110 + Math.floor(i / 8) * 16 + (i % 2) * 4}" r="3.5" fill="${s.spots}"/>`).join('')}
    <path d="M-72 -110 C -86 -120 -88 -104 -76 -100Z" fill="${s.body}" stroke="${INK}"/>
    <g class="head" transform="translate(62,-120)"><g class="rot">
      <path d="M-10 10 C 0 -30 10 -50 18 -66 L 34 -60 C 26 -40 18 -10 14 14Z" fill="${s.body}" stroke="${INK}"/>
      <ellipse cx="34" cy="-70" rx="22" ry="12" fill="${s.body}" stroke="${INK}"/>
      <circle cx="34" cy="-74" r="3" fill="#000"/><ellipse cx="54" cy="-68" rx="4" ry="3" fill="#2a1a10"/>
      <path d="M22 -80 C 14 -110 0 -120 -6 -130 M14 -100 L 0 -104 M28 -82 C 30 -110 44 -124 52 -132 M34 -104 L 48 -108" stroke="${shade(s.antler, -.3)}" stroke-width="3" fill="none"/>
      <circle cx="-6" cy="-130" r="3.5" fill="${s.antler}"/><circle cx="52" cy="-132" r="3.5" fill="${s.antler}"/>
      <path d="M18 -82 l -12 -8 l 6 12Z" fill="${s.body}" stroke="${INK}"/>
    </g></g>
    ${leg('legF1', -36)}${leg('legF2', 56)}`;
}
function buildKabandha(u, s) {
  const arm = (cls, side) => `<g class="${cls}" transform="translate(${side * 60},-170)"><g class="rot"><g transform="scale(${side},1)"><path d="M0 0 C 60 -20 140 -10 220 10 L 216 26 C 140 10 60 10 0 24Z" fill="${s.skin}" stroke="${INK}" stroke-width="1.4"/><path d="M214 6 l 22 -8 l -6 14 l 14 4 l -26 8Z" fill="${shade(s.skin, .2)}" stroke="${INK}"/></g></g></g>`;
  return `${arm('armL', -1)}<path class="torso" d="M-80 -20 C -100 -120 -70 -230 0 -236 C 70 -230 100 -120 80 -20 Z" fill="url(#${u}-skin)" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="0" cy="-170" rx="24" ry="18" fill="#f8f0e0" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="-170" r="10" fill="#c82010"/><circle cx="0" cy="-170" r="4" fill="#000"/>
    <path d="M-40 -90 Q 0 -40 40 -90 Q 0 -70 -40 -90Z" fill="#3a0a0a" stroke="${INK}" stroke-width="2"/>${[-30, -18, -6, 6, 18, 30].map(x => `<path d="M${x} -86 l 4 10 l 4 -10" fill="#fff"/>`).join('')}
    ${arm('armR', 1)}`;
}
function buildCrow() {
  return `<g class="torso"><ellipse cx="0" cy="-30" rx="26" ry="16" fill="#141418" stroke="#000"/><circle cx="24" cy="-40" r="11" fill="#1a1a20"/><path d="M33 -42 L 48 -38 L 33 -36Z" fill="#3a3a3a"/><circle cx="27" cy="-42" r="2.2" fill="#fff"/><path d="M-24 -30 L -44 -22 L -40 -34Z" fill="#141418"/></g>
    <g class="wingF" transform="translate(0,-36)"><g class="rot"><path d="M0 0 C 10 -30 40 -40 60 -30 C 40 -20 20 -6 0 4Z" fill="#202028" stroke="#000"/></g></g>
    <path d="M-4 -16 L -6 0 M4 -16 L 6 0" stroke="#3a3a3a" stroke-width="2"/>`;
}
function buildSerpent(u, s) {
  return `<path class="torso" d="M-120 -10 C -60 -40 60 -40 100 -12 C 60 10 -60 10 -120 -10Z M60 -20 C 90 -80 40 -150 0 -200 C -20 -230 -10 -270 20 -290" fill="none" stroke="${s.body}" stroke-width="36" stroke-linecap="round"/>
    <g class="head" transform="translate(20,-300)"><g class="rot"><path d="M-60 10 C -70 -40 -30 -80 0 -80 C 30 -80 70 -40 60 10 C 30 -10 -30 -10 -60 10Z" fill="${s.hood}" stroke="${INK}" stroke-width="2"/><path d="M-20 -40 Q 0 -60 20 -40" stroke="#f0d060" stroke-width="3" fill="none"/><ellipse cx="0" cy="-10" rx="18" ry="22" fill="${s.body}" stroke="${INK}"/><circle cx="-7" cy="-16" r="3" fill="#f0e020"/><circle cx="7" cy="-16" r="3" fill="#f0e020"/><path class="jaw" d="M-10 4 Q 0 14 10 4" stroke="#8a1a1a" stroke-width="3" fill="none"/></g></g>`;
}

/* ───────── public API ───────── */
export function specFor(id) {
  const s = CAST[id] || CAST[id.replace(/\d+$/, '')] || CAST[id.split('.')[0]] || CAST[id.split('.')[0].replace(/\d+$/, '')];
  return s ? { id: id.split('.')[0].replace(/\d+$/, ''), ...s } : { id, kind: 'human', sex: 'm', skin: '#b8865a', head: 'band', dhoti: '#c8a070', uttariya: '#7a4a2a', orn: 1 };
}

// SVG markup for a puppet (for standalone thumbnails / turntables).
export function puppetMarkup(id, { back = false } = {}) {
  const s = specFor(id), u = `pp${++UID}`;
  const body = s.kind === 'bird' ? buildBird(u, s) : s.kind === 'deer' ? buildDeer(u, s) : s.kind === 'kabandha' ? buildKabandha(u, s) : s.kind === 'crow' ? buildCrow() : s.kind === 'serpent' ? buildSerpent(u, s) : buildHumanoid(u, s, back);
  return `${defs(u, s)}<g class="pp-root"><ellipse class="pp-aura" cx="0" cy="-200" rx="170" ry="230" fill="url(#${u}-aura)" opacity="${s.aura ? .55 : 0}"/><ellipse cx="0" cy="2" rx="60" ry="10" fill="#000" opacity=".35"/><g class="pp-body">${body}</g></g>`;
}

// A standalone <svg> element showing a character (used for cards and turntables).
export function puppetSVG(id, { back = false, pad = 40 } = {}) {
  const s = specFor(id);
  const sc = s.scale || 1;
  const h = s.kind === 'crow' ? 80 : s.kind === 'deer' ? 260 : s.kind === 'bird' ? 300 : 440;
  const w = s.kind === 'deer' || s.kind === 'bird' ? 360 : s.heads === 10 ? 420 : 300;
  return `<svg class="pp-svg" viewBox="${-w / 2} ${-h - pad} ${w} ${h + pad + 20}" preserveAspectRatio="xMidYMax meet"><g transform="scale(${Math.min(1, 1 / Math.max(1, sc * .9))})">${puppetMarkup(id, { back })}</g></svg>`;
}

// Live puppet bound to animation state.
export function createPuppet(id, parent) {
  const s = specFor(id);
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', `puppet kind-${s.kind}`);
  g.innerHTML = puppetMarkup(id);
  parent.appendChild(g);
  const q = sel => g.querySelector(sel);
  const parts = {
    body: q('.pp-body'), aura: q('.pp-aura'), torso: q('.torso'),
    armL: q('.armL .rot'), foreL: q('.armL .fore .rot'), armR: q('.armR .rot'), foreR: q('.armR .fore .rot'),
    legL: q('.legL .rot') || q('.legB1 .rot'), legR: q('.legR .rot') || q('.legF2 .rot'),
    legL2: q('.legF1 .rot'), legR2: q('.legB2 .rot'),
    head: q('.head .rot'), tail: q('.tail'), lower: q('.lower'), wingF: q('.wingF .rot'), wingB: q('.wingB .rot'),
    handR: q('.armR .hand'), handL: q('.armL .hand'), chakra: q('.spin')
  };
  const state = { x: 0, y: 0, sc: 1, flip: 1, rot: 0, op: 1, glow: s.aura ? .5 : 0, bob: 0, lean: 0, head: 0,
    armL: 8, foreL: -6, armR: 8, foreR: -6, legL: 0, legR: 0, crouch: 0, sit: 0,
    phase: 0, gait: 0, breath: 0, flap: 0, wing: 0, hit: 0 };
  const base = s.scale || 1;
  const p = { id, spec: s, el: g, parts, state, base };
  p.render = () => {
    const S = state, k = base * S.sc;
    const sw = Math.sin(S.phase), g2 = S.gait;
    g.setAttribute('transform', `translate(${S.x},${S.y}) scale(${k * S.flip},${k}) rotate(${S.rot},0,${S.rot ? -20 : 0})`);
    g.style.opacity = S.op;
    if (parts.aura) parts.aura.setAttribute('opacity', S.glow);
    const bob = S.bob - Math.abs(sw) * 10 * g2 + S.crouch * 70 + S.sit * (s.sex === 'f' ? 124 : 176);
    const breath = 1 + Math.sin(S.breath) * .012;
    parts.body.setAttribute('transform', `translate(0,${bob}) rotate(${S.lean},0,-200) scale(1,${breath})`);
    if (S.hit) g.style.filter = `brightness(${1 + S.hit * 1.6}) saturate(${1 - S.hit * .5})`; else g.style.filter = '';
    const rot = (el, a) => el && el.setAttribute('transform', `rotate(${a})`);
    if (s.kind === 'deer') {
      rot(parts.legL, sw * 30 * g2); rot(parts.legR, -sw * 30 * g2); rot(parts.legL2, -sw * 26 * g2); rot(parts.legR2, sw * 26 * g2);
      rot(parts.head, S.head + Math.sin(S.breath) * 3); return;
    }
    if (s.wings) { const f = Math.sin(S.phase * 2.2) * 30 * S.flap; rot(parts.wingF, -f); rot(parts.wingB, -f); }
    if (s.kind === 'bird' || s.kind === 'crow') {
      const f = Math.sin(S.phase * 2.2) * 40 * S.flap;
      rot(parts.wingF, S.wing - f); rot(parts.wingB, S.wing - f * .9); rot(parts.head, S.head); return;
    }
    const legSq = 1 - S.crouch * .45;
    const legT = (el, a, side) => el && el.setAttribute('transform', `rotate(${a + S.sit * 84 * side}) scale(1,${legSq - S.sit * .6})`);
    if (parts.lower) parts.lower.setAttribute('transform', S.sit ? `translate(0,-200) scale(1,${1 - .62 * S.sit}) translate(0,200)` : '');
    legT(parts.legL, S.legL + sw * 14 * g2, 1); legT(parts.legR, S.legR - sw * 14 * g2, -1);
    rot(parts.armL, S.armL - sw * 18 * g2); rot(parts.foreL, S.foreL);
    rot(parts.armR, S.armR + sw * 18 * g2); rot(parts.foreR, S.foreR);
    rot(parts.head, S.head + Math.sin(S.breath * .5) * 1.5);
    if (parts.tail) parts.tail.setAttribute('transform', `translate(-10,-214) rotate(${Math.sin(S.breath * .7) * 8 + g2 * sw * 10})`);
    if (parts.chakra) parts.chakra.setAttribute('transform', `rotate(${S.breath * 40})`);
  };
  p.render();
  return p;
}

/* ───────── actions ─────────
   Each returns a GSAP timeline. `ctx` gives access to stage helpers (projectiles etc.). */
export function startIdle(p) {
  const gsap = window.gsap;
  p.idleTween?.kill();
  p.idleTween = gsap.to(p.state, { breath: '+=' + Math.PI * 2, duration: 3.4, repeat: -1, ease: 'none', onUpdate: p.render });
}

export function act(p, name, opt = {}) {
  const gsap = window.gsap, S = p.state, R = p.render;
  const tl = gsap.timeline({ onUpdate: R });
  const dir = S.flip;
  const kind = p.spec.kind;
  const isBird = kind === 'bird' || kind === 'crow';
  switch (name) {
    case 'walk': case 'run': {
      const fast = name === 'run';
      const to = opt.to ?? S.x + dir * 200;
      if (to !== S.x) S.flip = to > S.x ? 1 : -1;
      const dist = Math.abs(to - S.x), dur = opt.dur || Math.max(.8, dist / (fast ? 420 : 180));
      if (isBird) { tl.to(S, { flap: 1, y: S.y - 60, duration: .3 }).to(S, { x: to, phase: `+=${dur * 14}`, duration: dur, ease: 'sine.inOut' }, 0).to(S, { flap: 0, y: S.y, duration: .4 }, '>-.3'); break; }
      tl.to(S, { gait: fast ? 1.6 : 1, duration: .25 })
        .to(S, { x: to, phase: `+=${dur * (fast ? 16 : 9)}`, lean: fast ? 8 : 2, duration: dur, ease: 'none' }, 0)
        .to(S, { gait: 0, lean: 0, duration: .3 }, '>-.25');
      break;
    }
    case 'fly': case 'leap': {
      const to = opt.to ?? S.x + dir * 300, ty = opt.toY ?? S.y, h = opt.h ?? 220;
      if (to !== S.x) S.flip = to > S.x ? 1 : -1;
      const dur = opt.dur || 1.6, sx = S.x, sy = S.y;
      if (name === 'leap' && !isBird) tl.to(S, { crouch: .8, duration: .35, ease: 'power2.in' });
      const o = { k: 0 };
      tl.to(o, { k: 1, duration: dur, ease: 'sine.inOut', onUpdate: () => { S.x = sx + (to - sx) * o.k; S.y = sy + (ty - sy) * o.k - Math.sin(o.k * Math.PI) * h; R(); } });
      if (isBird) tl.to(S, { flap: 1, phase: `+=${dur * 12}`, duration: dur }, '<');
      else tl.to(S, { crouch: 0, armR: -165, armL: -165, foreR: 0, foreL: 0, lean: 30, legL: -20, legR: 20, duration: .3 }, '<')
        .to(S, { armR: 8, armL: 8, lean: 0, legL: 0, legR: 0, duration: .4 }, '>-.35');
      if (isBird) tl.to(S, { flap: 0, duration: .3 });
      break;
    }
    case 'shoot': {
      tl.to(S, { armR: -86, foreR: -4, armL: -84, foreL: -150, lean: -4, duration: .45, ease: 'power2.out' })
        .to(S, { armL: -78, foreL: -158, duration: .35 })
        .call(() => opt.onRelease?.(p))
        .to(S, { armL: -100, foreL: -60, duration: .12 })
        .to(S, { armR: 8, foreR: -6, armL: 8, foreL: -6, lean: 0, duration: .6, ease: 'power2.inOut' }, '+=.35');
      break;
    }
    case 'strike': case 'throw': {
      const lunge = opt.to != null ? (opt.to - S.x) * .5 : dir * 50, x0 = S.x;
      tl.to(S, { armR: -170, foreR: -30, lean: -6, duration: .35, ease: 'power2.out' })
        .to(S, { armR: -40, foreR: -10, lean: 10, x: x0 + lunge, duration: .18, ease: 'power3.in' })
        .call(() => opt.onRelease?.(p))
        .to(S, { armR: 8, foreR: -6, lean: 0, x: name === 'throw' ? x0 : x0 + lunge, duration: .6, ease: 'power2.inOut' }, '+=.2');
      break;
    }
    case 'sad': tl.to(S, { head: 14, lean: 4, duration: .8 }); break;
    case 'lift': tl.to(S, { armR: -168, foreR: -10, armL: -168, foreL: -10, duration: .6 }); break;
    case 'talk': tl.to(S, { foreR: -110, armR: 14, duration: .35 }).to(S, { head: 4, duration: .3, yoyo: true, repeat: 3 }).to(S, { foreR: -6, armR: 8, head: 0, duration: .5 }); break;
    case 'bow': case 'namaste': case 'pray':
      tl.to(S, { armR: 22, foreR: 150, armL: 22, foreL: 150, lean: name === 'bow' ? 10 : 0, head: name === 'bow' ? 10 : -2, duration: .6 });
      if (name === 'pray') tl.to(S, { glow: .8, duration: 1 }, '<');
      break;
    case 'bless': tl.to(S, { armR: -30, foreR: 158, duration: .6 }).to(S, { glow: .9, duration: .8 }, '<'); break;
    case 'kneel': tl.to(S, { crouch: 1, armR: 22, foreR: 150, armL: 22, foreL: 150, duration: .7 }); break;
    case 'sit': tl.to(S, { sit: 1, armR: 20, foreR: 60, armL: 20, foreL: 60, duration: .8 }); break;
    case 'stand': tl.to(S, { sit: 0, crouch: 0, armR: 8, foreR: -6, armL: 8, foreL: -6, lean: 0, head: 0, rot: 0, duration: .7 }); break;
    case 'weep': tl.to(S, { head: 16, armL: -20, foreL: 150, lean: 8, duration: .7 }).to(S, { bob: 3, duration: .18, yoyo: true, repeat: 7 }); break;
    case 'roar': tl.to(S, { head: -12, sc: S.sc * 1.06, armR: -60, armL: -60, foreR: -60, foreL: -60, duration: .4 }).to(S, { x: S.x + 3, duration: .05, yoyo: true, repeat: 9 }).to(S, { head: 0, sc: S.sc, armR: 8, armL: 8, foreR: -6, foreL: -6, duration: .6 }); break;
    case 'fall': {
      tl.to(S, { hit: 1, duration: .08 }).to(S, { hit: 0, duration: .3 })
        .to(S, { rot: -dir * 84, y: S.y - 10, duration: .7, ease: 'power2.in' }, '<')
        .to(S, { op: opt.fade ? .5 : 1, glow: 0, duration: .6 });
      break;
    }
    case 'hit': tl.to(S, { hit: 1, x: S.x - dir * 24, duration: .08 }).to(S, { hit: 0, x: S.x, duration: .4 }); break;
    case 'rise': tl.to(S, { rot: 0, op: 1, y: opt.y ?? S.y, sit: 0, crouch: 0, duration: .8 }); break;
    case 'grow': tl.to(S, { sc: opt.to || S.sc * 1.8, duration: opt.dur || 1.6, ease: 'power2.inOut' }); break;
    case 'shrink': tl.to(S, { sc: opt.to || S.sc * .35, duration: opt.dur || 1, ease: 'power2.inOut' }); break;
    case 'appear': S.op = 0; tl.to(S, { op: 1, glow: Math.max(.6, S.glow), duration: 1.2 }); break;
    case 'vanish': tl.to(S, { op: 0, glow: 1, duration: 1 }); break;
    case 'glow': tl.to(S, { glow: 1, duration: .8 }); break;
    case 'turn': tl.call(() => { S.flip *= -1; }); break;
    case 'flap': tl.to(S, { flap: 1, phase: '+=20', duration: 1.5 }).to(S, { flap: 0, duration: .4 }); break;
  }
  return tl;
}

// Approximate world position of a puppet's right hand (bow hand) inside the stage <svg>.
export function handPoint(p, svg) {
  const el = p.parts.handR || p.parts.torso || p.el;
  const m = el.getCTM(); const svgM = svg.getCTM();
  if (!m) return { x: p.state.x, y: p.state.y - 200 };
  const pt = svg.createSVGPoint(); pt.x = 0; pt.y = 0;
  const r = pt.matrixTransform(svgM ? svgM.inverse().multiply(m) : m);
  return { x: r.x, y: r.y };
}
export function centerPoint(p) { const k = p.base * p.state.sc; return { x: p.state.x, y: p.state.y - 200 * k }; }
