// The Rāmāyaṇa Today (js/data/today.js): the places of the epic as they are now — each card can show its place on the
// Journey map above — the festivals of the year, the epic's tellings across the world, and the words it left behind.
import { PLACES_TODAY, FESTIVALS, WORLD, WORDS } from './data/today.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const img = src => `assets/scenes/${src}`;

export function initToday({ showPlace } = {}) {
  const sec = $('#today'); if (!sec) return;
  $('#td-places', sec).innerHTML = PLACES_TODAY.map((p, i) => `
    <article class="td-place" data-place="${p.id}">
      <figure><img src="${img(p.img)}" alt="" loading="lazy" decoding="async"><figcaption><span lang="sa">${p.dev}</span></figcaption></figure>
      <div class="td-body">
        <div class="td-then">${String(i + 1).padStart(2, '0')} · ${esc(p.then)}</div>
        <div class="td-now"><b>Today</b>${esc(p.now)}</div>
        <p>${esc(p.text)}</p>
        <button class="td-map" type="button" data-show="${p.id}">Show on the map ↑</button>
      </div>
    </article>`).join('');
  $('#td-fest', sec).innerHTML = FESTIVALS.map(f => `
    <article class="td-fest">
      <figure><img src="${img(f.img)}" alt="" loading="lazy" decoding="async"></figure>
      <div class="td-when">${esc(f.when)}</div>
      <h4>${esc(f.name)}<span lang="sa">${f.dev}</span></h4>
      <p>${esc(f.text)}</p>
    </article>`).join('');
  $('#td-world', sec).innerHTML = WORLD.map(w => `
    <article class="td-land"><div class="td-l">${esc(w.land)}</div><h4>${esc(w.name)}</h4><p>${esc(w.text)}</p></article>`).join('');
  $('#td-words', sec).innerHTML = WORDS.map(w => `
    <div class="td-word"><b>${esc(w.w)}</b><span lang="sa">${w.dev}</span><i>${esc(w.m)}</i></div>`).join('');
  // the rail of places: arrows and a gentle reveal
  const rail = $('#td-places', sec);
  sec.querySelectorAll('.td-arrow').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: (b.dataset.dir === 'l' ? -1 : 1) * rail.clientWidth * .8, behavior: 'smooth' })));
  sec.addEventListener('click', e => { const b = e.target.closest('[data-show]'); if (b) showPlace?.(b.dataset.show); });
  const gsap = window.gsap;
  if (gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const sel of ['.td-place', '.td-fest', '.td-land', '.td-word'])
      gsap.from(sec.querySelectorAll(sel), { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'power3.out', clearProps: 'transform,opacity',
        scrollTrigger: { trigger: sec.querySelector(sel).parentElement, start: 'top 88%', once: true } });
  }
}
