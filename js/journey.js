// The Journey: the land of Bhārata as it is seen from the heavens (NASA Blue Marble, public domain), with the sacred
// places pinned in gold and each journey of the epic drawn across it as a road of light that a comet travels.
import { PLACES, JOURNEYS } from './data/places.js';
import { PROLOGUE, KANDAS } from './data/story.js';

const gsap = window.gsap;
const $ = (s, el = document) => el.querySelector(s);
const PLACE = Object.fromEntries(PLACES.map(p => [p.id, p]));
const BOOKS = [PROLOGUE, ...KANDAS];
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
// assets/theme/india-wide.webp: 3200 × 1800 px, longitude 52–108° E, latitude 39–1.5° N (equirectangular, flattened to
// 16:9 as if seen from high above the south: the whole land from the Himālaya to Laṅkā fills one screen)
const W = 3200, H = 1800, xy = p => [(p.lon - 52) / 56 * W, (39 - p.lat) / 37.5 * H];
// names that would run into a neighbour's pin are written on the pin's left
const LEFT = new Set(['ayodhya']);
// the places that carry a name on the map; the rest are pins that name themselves on hover
const NAMED = new Set(['ayodhya', 'mithila', 'chitrakoot', 'panchavati', 'kishkindha', 'rameswaram', 'lanka', 'himalaya']);

// a smooth road through the places (Catmull-Rom as cubic Béziers)
function road(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map(v => v.toFixed(1)).join(' ')} ${c2.map(v => v.toFixed(1)).join(' ')} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function initJourney({ openBook }) {
  const svg = $('#jr-svg'), list = $('#jr-list'), card = $('#jr-card');
  const used = new Set(JOURNEYS.flatMap(j => j.path));
  const pins = PLACES.filter(p => used.has(p.id) || NAMED.has(p.id));
  svg.innerHTML = `<defs>
      <filter id="jrGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <linearGradient id="pinGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset=".5" stop-color="#e9b452"/><stop offset="1" stop-color="#9a6216"/></linearGradient>
    </defs>
    <g class="routes">${JOURNEYS.map(j => `<path class="route faint" data-j="${j.id}" d="${road(j.path.map(id => PLACE[id]).filter(Boolean).map(xy))}" style="stroke:${j.color}"/>`).join('')}</g>
    <path class="route live" d="" />
    <circle class="comet" r="14" cx="-99" cy="-99"/>
    <g class="pins">${pins.map(p => { const [x, y] = xy(p), major = NAMED.has(p.id); return major
      ? `<g class="pin major" data-p="${p.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1.15)">
        <path d="M0 0 C-14 -22 -22 -32 -22 -44 A22 22 0 1 1 22 -44 C22 -32 14 -22 0 0Z"/><circle cy="-44" r="8"/>
        <text ${LEFT.has(p.id) && innerWidth > 760 ? 'x="-28" text-anchor="end"' : 'x="28"'} y="-36">${esc(p.name.split(' (')[0])}</text></g>`
      : `<g class="pin minor" data-p="${p.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle class="hit" r="24" fill="transparent"/><circle class="gem" r="10"/><circle class="core" r="4"/>
        <title>${esc(p.name)}</title></g>`; }).join('')}</g>`;
  const live = $('.route.live', svg), comet = $('.comet', svg);
  list.innerHTML = `<h5><span lang="sa">भूगोल</span>The Journey</h5>${JOURNEYS.map(j => `<button data-j="${j.id}" style="--jc:${j.color}"><i></i>${esc(j.name)}</button>`).join('')}<button class="jr-all" data-all>▶ The Whole Journey</button>`;

  let tl = null;
  function play(id, then) {
    const j = JOURNEYS.find(x => x.id === id); if (!j) return;
    tl?.kill();
    list.querySelectorAll('[data-j]').forEach(b => b.classList.toggle('on', b.dataset.j === id));
    svg.querySelectorAll('.pin').forEach(g => { const on = j.path.includes(g.dataset.p) || g.dataset.p === 'ayodhya' || g.dataset.p === 'lanka'; g.classList.toggle('dim', !on); g.classList.toggle('off', !on && !NAMED.has(g.dataset.p)); });
    live.setAttribute('d', svg.querySelector(`.routes [data-j="${id}"]`).getAttribute('d')); live.style.stroke = j.color;
    const L = live.getTotalLength(), st = { t: 0 };
    live.style.strokeDasharray = L; live.style.strokeDashoffset = L;
    tl = gsap.timeline({ onComplete: then });
    tl.to(st, { t: 1, duration: Math.min(7, 2 + L / 900), ease: 'sine.inOut', onUpdate: () => {
      live.style.strokeDashoffset = L * (1 - st.t);
      const pt = live.getPointAtLength(L * st.t); comet.setAttribute('cx', pt.x); comet.setAttribute('cy', pt.y);
    } });
    tl.to(comet, { attr: { r: 30 }, opacity: 0, duration: .8 }).set(comet, { attr: { r: 12 }, opacity: 1, cx: -99, cy: -99 });
  }
  list.addEventListener('click', e => {
    if (e.target.closest('[data-all]')) { let k = 0; const next = () => { if (k < JOURNEYS.length) play(JOURNEYS[k++].id, () => setTimeout(next, 600)); }; next(); return; }
    const b = e.target.closest('[data-j]'); if (b) play(b.dataset.j);
  });
  function place(id) {
    const p = PLACE[id]; if (!p) return;
    const ep = (() => { for (const b of BOOKS) { const i = b.episodes.findIndex(e => e.place === id); if (i >= 0) return { b, i, e: b.episodes[i] }; } return null; })();
    card.innerHTML = `<button class="x" aria-label="Close">✕</button><div class="dev">${p.dev || ''}</div><h3>${esc(p.name)}</h3><div class="mod"><b class="today">Today</b> ${esc(p.modern || '')}</div><p>${esc(p.desc || '')}</p>
      ${ep ? `<a class="go" href="#odyssey" data-read="${ep.b.id}:${ep.i}">Read in the Kathā: ${esc(ep.e.title)} ›</a>` : ''}`;
    if (document.querySelector(`.td-place[data-place="${id}"]`)) card.insertAdjacentHTML('beforeend', `<a class="go see" href="#today" data-today="${id}">The ${esc(p.name.split(' (')[0])} of today ↓</a>`);
    card.hidden = false; gsap.fromTo(card, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .6, ease: 'power3.out' });
  }
  svg.addEventListener('click', e => { const g = e.target.closest('.pin'); if (g) place(g.dataset.p); });
  card.addEventListener('click', e => {
    if (e.target.closest('.x')) { card.hidden = true; return; }
    const td = e.target.closest('[data-today]'); if (td) { e.preventDefault(); e.stopPropagation(); const el = document.querySelector(`.td-place[data-place="${td.dataset.today}"]`); window.__lenis ? window.__lenis.scrollTo('#today', { offset: -20 }) : document.getElementById('today').scrollIntoView(); setTimeout(() => el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }), 1300); return; }
    const r = e.target.closest('[data-read]'); if (r) { e.preventDefault(); const [b, i] = r.dataset.read.split(':'); openBook?.(b, +i); }
  });
  // the first journey draws itself when the map comes into view
  window.ScrollTrigger.create({ trigger: '#journey', start: 'top 60%', once: true, onEnter: () => play('exile') });
  // the land settles as it comes into view: the picture and its roads and pins move as one layer
  gsap.fromTo('.jr-map', { scale: 1.06 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#journey', start: 'top bottom', end: 'top top', scrub: .6 } });
  return { play, place };
}
