// The Divine Astras, as in the reference film (~/Downloads/astra.mp4): the two armies facing each other before the
// temples of Laṅkā, one painted battlefield (assets/theme/astras.webp, lifted from the film by tools/video_plates.py)
// breathing through the depth shader, and over it each astra loosed as light by the warrior who wielded it in
// Vālmīki (js/astra-fx.js).
import { ASTRAS } from './data/duels.js';
import { AstraFX } from './astra-fx.js';
import { LITE } from './calm.js';

const $ = (s, el = document) => el.querySelector(s);
// where the figures stand in the painting (0–1 of its width and height), measured on assets/theme/astras.webp
export const POS = {
  hanuman: [.18, .5], rama: [.285, .5], lakshmana: [.35, .52], ranks: [.605, .58], ravana: [.74, .5], kumbhakarna: [.87, .5]
};
// who looses each astra at whom, and where the light leaves the bow
const PLAN = {
  brahmastra: { from: 'rama', to: 'ravana', bow: [.025, -.02], say: 'Rāma looses the Brahmāstra at Rāvaṇa' },
  agneyastra: { from: 'rama', to: 'ranks', bow: [.025, -.02], say: 'Rāma looses the Āgneyāstra upon the rākṣasa ranks' },
  aindrastra: { from: 'lakshmana', to: 'kumbhakarna', bow: [.022, -.03], say: 'Indra’s weapon falls upon Kumbhakarṇa' },
  nagapasha: { from: 'ranks', to: ['rama', 'lakshmana'], bow: [0, -.05], say: 'Indrajit’s serpents bind Rāma and Lakṣmaṇa — until Garuḍa comes' }
};

export async function initAstras(root, { sound } = {}) {
  root.innerHTML = `
    <div class="as-scene">
      <canvas class="as-plate"></canvas>
      <canvas class="as-fx"></canvas>
      <div class="as-shade"></div>
    </div>
    <header class="as-head"><small>The</small><h2>The Divine Astras</h2><span lang="sa">दिव्यास्त्र</span></header>
    <div class="as-bar">${ASTRAS.map(a => `<button class="as-btn" data-astra="${a.id}" style="--ac:${a.color}"><i class="fl l"></i><span class="d" lang="sa">${a.dev}</span><span class="n">${a.name}</span><i class="fl r"></i></button>`).join('')}</div>
    <p class="as-desc">Choose an astra.</p>`;
  const scene = $('.as-scene', root), plateCv = $('.as-plate', root), cv = $('.as-fx', root), desc = $('.as-desc', root);
  // the battlefield at 4K on a large screen, lighter on a phone or a modest machine
  const src = LITE ? 'assets/theme/astras-sm.webp' : 'assets/theme/astras.webp', depth = 'assets/theme/astras-depth.png';
  plateCv.style.background = `#120a05 url("${src}") center / cover no-repeat`;
  const meta = await fetch('assets/theme/manifest.json').then(r => r.json()).catch(() => ({}));
  import('./intro.js').then(({ land }) => land(plateCv, { src, depth: meta.astrasDepth ? depth : src, light: meta.astrasLight || [.5, .2] })).then(st => { if (st) { st.rays = .55; st.drift = .7; } });
  const fx = new AstraFX(cv, { max: 1.5, onShake: (x, y) => { scene.style.translate = `${x}px ${y}px`; } });
  // a place in the painting → a point on the screen (the painting covers the scene, centred)
  let img = { w: 1920, h: 1088 };
  const probe = new Image(); probe.onload = () => { img = { w: probe.naturalWidth, h: probe.naturalHeight }; }; probe.src = src;
  const pt = (id, off = [0, 0]) => {
    const W = cv.clientWidth, H = cv.clientHeight, s = Math.max(W / img.w, H / img.h), ox = (W - img.w * s) / 2, oy = (H - img.h * s) / 2, [u, v] = POS[id];
    return [ox + (u + off[0]) * img.w * s, oy + (v + off[1]) * img.h * s];
  };
  let busy = false;
  const fire = async id => {
    if (busy) return; busy = true;
    const a = ASTRAS.find(x => x.id === id), p = PLAN[id];
    root.querySelectorAll('.as-btn').forEach(b => b.classList.toggle('on', b.dataset.astra === id));
    desc.innerHTML = `<b>${p.say}.</b> ${a.desc}`;
    sound?.sfx?.(id === 'aindrastra' ? 'thunder' : id === 'nagapasha' ? 'hiss' : 'astra');
    const from = pt(p.from, p.bow), to = Array.isArray(p.to) ? p.to.map(t => pt(t, [0, -.06])) : pt(p.to, [0, -.04]);
    await fx.play(id, from, to, { onHit: () => { sound?.boom?.(); if (id === 'nagapasha') sound?.sfx?.('chime'); } });
    setTimeout(() => { busy = false; }, id === 'nagapasha' ? 1600 : 900);
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-astra]'); if (b) fire(b.dataset.astra); });
  return { fire, stop() { fx.clear(); } };
}
