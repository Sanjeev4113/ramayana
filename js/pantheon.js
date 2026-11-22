// The Pantheon: one figure at a time stands on a carved pedestal ringed with light, the others wait in medallions on
// either side; choosing one sends a trail of gold to the pedestal and the figure changes. Beside: a painting of them
// in the kathā and their lore.
import { CHARACTERS, FACTIONS } from './data/characters.js';
import { PROLOGUE, KANDAS } from './data/story.js';

const gsap = window.gsap;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const BOOKS = [PROLOGUE, ...KANDAS];
const CHAR = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const FEATURED = ['rama', 'sita', 'lakshmana', 'hanuman', 'ravana', 'bharata', 'dasharatha', 'vibhishana'];
const ORDER = { raghu: 0, divine: 1, mithila: 2, vanara: 3, rishi: 4, rakshasa: 5 };

export function initPantheon({ cut = {}, openBook, openChar }) {
  const views = id => { const v = cut[id]?.views; return v ? ['front', 'left', 'right', 'back'].filter(k => v[k]).map(k => v[k].src) : (CHAR[id]?.views || []); };
  const has = id => views(id).length > 0;
  const tabs = $('#pt-tabs'), colL = $('.pt-col.l'), colR = $('.pt-col.r'), fig = $('#pt-figure'), lore = $('#pt-lore'), scene = $('#pt-scene');
  let group = 'featured', who = 'rama', page = 0;
  const groups = { featured: { label: 'The Heroes', dev: 'नायक' }, ...Object.fromEntries(Object.entries(FACTIONS).sort((a, b) => (ORDER[a[0]] ?? 9) - (ORDER[b[0]] ?? 9)).map(([k, f]) => [k, { label: f.label, dev: f.dev }])) };
  const members = g => g === 'featured' ? FEATURED.filter(has) : CHARACTERS.filter(c => c.faction === g && has(c.id)).map(c => c.id);
  tabs.innerHTML = Object.entries(groups).map(([k, g]) => `<button class="pt-tab${k === group ? ' on' : ''}" data-g="${k}"><span class="d">${g.dev || ''}</span>${g.label}</button>`).join('');
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; group = b.dataset.g; page = 0; $$('.pt-tab', tabs).forEach(t => t.classList.toggle('on', t === b)); ring(); const m = members(group); if (m.length && !m.includes(who)) choose(m[0], null); });

  // the medallions: up to four on each side; the arrows page through larger groups
  function medal(id) { const v = views(id)[0]; return `<button class="face${id === who ? ' on' : ''}" data-char="${id}"><span class="ring"><img src="${v}" alt="" loading="lazy"></span><b>${esc(CHAR[id].name.replace('Śrī ', ''))}</b></button>`; }
  function ring() {
    const m = members(group).filter(id => id !== who), per = 8, pages = Math.max(1, Math.ceil(m.length / per));
    page = (page + pages) % pages;
    const vis = m.slice(page * per, page * per + per);
    colL.innerHTML = vis.slice(0, 4).map(medal).join('') + (pages > 1 ? '<button class="face more" data-page="-1"><span class="ring" style="display:grid;place-items:center;font-size:24px;color:var(--gold)">‹</span></button>' : '');
    colR.innerHTML = vis.slice(4).map(medal).join('') + (pages > 1 ? '<button class="face more" data-page="1"><span class="ring" style="display:grid;place-items:center;font-size:24px;color:var(--gold)">›</span></button>' : '');
    gsap.fromTo($$('.pt-col .face'), { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .7, stagger: .05, ease: 'back.out(1.6)' });
  }
  $('#pt-ring').addEventListener('click', e => {
    const p = e.target.closest('[data-page]'); if (p) { page += +p.dataset.page; ring(); return; }
    const f = e.target.closest('.pt-col [data-char]'); if (f) choose(f.dataset.char, f);
  });

  // the figure on the pedestal: four views, turned by dragging
  let turnIdx = 0, tw = null;
  function stand(id) {
    const v = views(id); turnIdx = 0;
    fig.innerHTML = v.map((src, i) => `<img src="${src}" alt="${esc(CHAR[id].name)}" draggable="false" style="opacity:${i ? 0 : 1}">`).join('');
    $('.pt-turn').style.display = v.length > 1 ? '' : 'none';
  }
  const ORDER4 = [0, 2, 3, 1];          // front → right → back → left
  function turn(d) { const imgs = $$('img', fig); if (imgs.length < 4) return; turnIdx = (turnIdx + d + 4) % 4; imgs.forEach((im, i) => { im.style.opacity = i === ORDER4[turnIdx] ? 1 : 0; }); }
  let drag = null;
  fig.addEventListener('pointerdown', e => { drag = { x: e.clientX }; fig.setPointerCapture?.(e.pointerId); fig.style.cursor = 'grabbing'; });
  fig.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 50) { turn(dx > 0 ? -1 : 1); drag.x = e.clientX; } });
  const up = () => { drag = null; fig.style.cursor = ''; };
  fig.addEventListener('pointerup', up); fig.addEventListener('pointercancel', up);
  fig.addEventListener('dblclick', () => openChar?.(who));

  // a painting of the figure in the kathā, and their lore
  function appearances(id) { const out = []; BOOKS.forEach(b => b.episodes.forEach((ep, i) => { if (ep.chars?.includes(id)) out.push({ b, i, ep }); })); return out; }
  function side(id) {
    const c = CHAR[id], f = FACTIONS[c.faction], apps = appearances(id), a = apps[Math.min(apps.length - 1, Math.floor(apps.length / 3))];
    if (a) {
      const img = $('img', scene); img.src = `assets/scenes/ill/${a.b.id}-${a.i}-0-0.webp`;
      $('figcaption', scene).innerHTML = `In the Kathā<small>${esc(a.ep.title)}</small>`;
      scene.onclick = () => openBook?.(a.b.id, a.i);
      scene.style.visibility = '';
    } else scene.style.visibility = 'hidden';
    lore.innerHTML = `<h4>Lore Summary</h4><div class="dev">${c.dev}</div><div class="nm">${esc(c.name)}</div><div class="tt">${esc(c.title)}</div>
      <div class="stats">${c.lineage ? `<div><b>Lineage</b>${esc(c.lineage)}</div>` : ''}${c.weapon ? `<div><b>Arms &amp; Powers</b>${esc(c.weapon)}</div>` : ''}<div><b>Belongs to</b>${esc(f.label)}</div></div>
      ${c.bio.slice(0, 2).map(p => `<p>${esc(p)}</p>`).join('')}
      ${c.moments?.length ? `<h4 style="text-align:left;margin-top:12px">Defining Moments</h4><ul>${c.moments.slice(0, 6).map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : ''}
      ${a ? `<a class="go" href="#odyssey" data-read="${a.b.id}:${apps[0].i}">Read their story ›</a>` : ''}`;
  }
  lore.addEventListener('click', e => { const r = e.target.closest('[data-read]'); if (!r) return; e.preventDefault(); e.stopPropagation(); const [b, i] = r.dataset.read.split(':'); openBook?.(b, +i); });

  // the trail of gold from a medallion to the pedestal
  const cv = $('#pt-trail'), cx = cv.getContext('2d'); let parts = [], raf = 0;
  const sprite = (() => { const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(.25, 'rgba(255,210,120,.9)'); gr.addColorStop(1, 'rgba(255,150,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return s; })();
  function trail(from) {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); cv.width = r.width * dpr; cv.height = r.height * dpr;
    const a = from.getBoundingClientRect(), b = fig.getBoundingClientRect();
    const p0 = [(a.left + a.width / 2 - r.left) * dpr, (a.top + a.height / 2 - r.top) * dpr], p2 = [(b.left + b.width / 2 - r.left) * dpr, (b.top + b.height * .45 - r.top) * dpr];
    const p1 = [(p0[0] + p2[0]) / 2, Math.min(p0[1], p2[1]) - 140 * dpr];
    const head = { t: 0 };
    gsap.to(head, { t: 1, duration: .9, ease: 'power2.inOut', onUpdate: () => {
      const t = head.t, u = 1 - t, x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
      for (let i = 0; i < 9; i++) parts.push({ x: x + (Math.random() - .5) * 8 * dpr, y: y + (Math.random() - .5) * 8 * dpr, vx: (Math.random() - .5) * 60 * dpr, vy: (Math.random() - .5) * 60 * dpr, l: .5 + Math.random() * .8, m: 1.3, s: (1 + Math.random() * 2.6) * dpr });
      parts.push({ x, y, vx: 0, vy: 0, l: .12, m: .12, s: 10 * dpr });
    }, onComplete: () => { for (let i = 0; i < 160; i++) { const g = Math.random() * 6.283, v = (80 + Math.random() * 380) * dpr; parts.push({ x: p2[0], y: p2[1], vx: Math.cos(g) * v, vy: Math.sin(g) * v, l: .6 + Math.random(), m: 1.6, s: (1 + Math.random() * 3) * dpr }); } } });
    if (!raf) { let last = performance.now(); const loop = t => { const dt = Math.min(.05, (t - last) / 1000); last = t; cx.clearRect(0, 0, cv.width, cv.height); cx.globalCompositeOperation = 'lighter';
      parts = parts.filter(p => (p.l -= dt) > 0); for (const p of parts) { p.vx *= .96; p.vy *= .96; p.x += p.vx * dt; p.y += p.vy * dt; cx.globalAlpha = Math.min(1, p.l / p.m * 1.5); cx.drawImage(sprite, p.x - p.s * 2, p.y - p.s * 2, p.s * 4, p.s * 4); }
      raf = parts.length ? requestAnimationFrame(loop) : 0; }; raf = requestAnimationFrame(loop); }
  }
  function choose(id, from) {
    if (!CHAR[id]) return;
    const go = () => {
      who = id; stand(id); side(id); ring();
      gsap.fromTo(fig, { opacity: 0, scale: .9, filter: 'brightness(3) blur(6px)' }, { opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)', duration: 1, ease: 'power3.out' });
      gsap.fromTo('.pt-halo', { scale: .6, opacity: 1.4 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' });
    };
    if (from) { trail(from); gsap.to(fig, { opacity: 0, scale: .94, duration: .5, delay: .35, onComplete: go }); } else go();
  }
  // the codex: every figure of the kathā in a four-column grid, by family; choosing one sets them on the pedestal
  window.__codex = () => {
    const box = $('#codex'); if (!box || box.childElementCount) return;
    const fams = Object.entries(FACTIONS).sort((a, b) => (ORDER[a[0]] ?? 9) - (ORDER[b[0]] ?? 9));
    box.innerHTML = fams.map(([k, f]) => { const ids = members(k); return ids.length ? `<section class="cx-fam"><h3><span class="d">${f.dev || ''}</span>${esc(f.label)}<small>${ids.length}</small></h3>
      <div class="cx-grid">${ids.map(id => `<button class="cx-card" data-char="${id}"><span class="cx-art"><img src="${views(id)[0]}" alt="" loading="lazy" decoding="async"></span><b>${esc(CHAR[id].name)}</b><small>${esc((CHAR[id].title || '').split(/\s[—–]\s/)[0])}</small></button>`).join('')}</div></section>` : ''; }).join('');
    box.addEventListener('click', e => {
      const c = e.target.closest('.cx-card'); if (!c) return;
      $('#codex-ov [data-ov-close]').click();
      window.__lenis ? window.__lenis.scrollTo('#pantheon', { duration: 1.2 }) : $('#pantheon').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => api.show(c.dataset.char), 300);
    });
  };
  fetch('assets/theme/manifest.json').then(r => r.json()).then(m => { if (m.pedestal) $('.pt-pedestal img').src = m.pedestal; }).catch(() => { });
  choose(who, null);
  const api = { show(id) { const c = CHAR[id]; if (!c) return; if (!members(group).includes(id)) { group = members('featured').includes(id) ? 'featured' : c.faction; $$('.pt-tab', tabs).forEach(t => t.classList.toggle('on', t.dataset.g === group)); } choose(id, null); } };
  return api;
}
