// The Divine Astras: an all-out live world-war battlefield before the burning walls of Laṅkā.
// The 4K painted battlefield breathes through the depth-and-fire shader while relentless flaming arrow barrages,
// distant siege explosions, rolling war-smoke, front-line clashes, wind-blown embers, and storm lightning rage
// continuously — until you unleash the four celestial astras across the sky (js/astra-fx.js).
import { ASTRAS } from './data/duels.js';
import { AstraFX } from './astra-fx.js';
import { LITE } from './calm.js';

const $ = (s, el = document) => el.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);

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
    <header class="as-head"><small>The</small><h2>Divine Astras</h2><span lang="sa">दिव्यास्त्र</span></header>
    <div class="as-bar">${ASTRAS.map(a => `<button class="as-btn" data-astra="${a.id}" style="--ac:${a.color}"><i class="fl l"></i><span class="d" lang="sa">${a.dev}</span><span class="n">${a.name}</span><i class="fl r"></i></button>`).join('')}</div>
    <p class="as-desc">The armies of dharma and Laṅkā clash beneath burning skies — choose a celestial astra to unleash.</p>`;
  const scene = $('.as-scene', root), plateCv = $('.as-plate', root), cv = $('.as-fx', root), desc = $('.as-desc', root);
  const src = LITE ? 'assets/theme/astras-sm.webp' : 'assets/theme/astras.webp', depth = 'assets/theme/astras-depth.png';
  plateCv.style.background = `#120a05 url("${src}") center / cover no-repeat`;
  const meta = await fetch('assets/theme/manifest.json').then(r => r.json()).catch(() => ({}));
  import('./intro.js').then(({ land }) => land(plateCv, { src, depth: meta.astrasDepth ? depth : src, light: meta.astrasLight || [.5, .2], war: 1 })).then(st => { if (st) { st.rays = .75; st.drift = .85; st.war = 1; } });
  const fx = new AstraFX(cv, { max: 1.5, onShake: (x, y) => { scene.style.translate = `${x}px ${y}px`; } });

  // a place in the painting → a point on the screen (the painting covers the scene, centred)
  let img = { w: 1920, h: 1088 };
  const probe = new Image(); probe.onload = () => { img = { w: probe.naturalWidth, h: probe.naturalHeight }; }; probe.src = src;
  const pt = (id, off = [0, 0]) => {
    const W = cv.clientWidth || innerWidth, H = cv.clientHeight || innerHeight;
    const s = Math.max(W / img.w, H / img.h), ox = (W - img.w * s) / 2, oy = (H - img.h * s) / 2, [u, v] = POS[id];
    return [ox + (u + off[0]) * img.w * s, oy + (v + off[1]) * img.h * s];
  };
  const ptUV = (u, v) => {
    const W = cv.clientWidth || innerWidth, H = cv.clientHeight || innerHeight;
    const s = Math.max(W / img.w, H / img.h), ox = (W - img.w * s) / 2, oy = (H - img.h * s) / 2;
    return [ox + u * img.w * s, oy + v * img.h * s];
  };

  /* ── continuous all-out world-war battlefield ambience ── */
  let warRunning = false, warRaf = 0, lastT = 0;
  let cdVolley = .25, cdBoom = .7, cdClash = .4, cdSmoke = .1, cdEmber = 0, cdStorm = 2.8;
  const warStep = now => {
    warRaf = 0;
    if (!warRunning || document.hidden) return;
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    const W = cv.clientWidth || innerWidth, H = cv.clientHeight || innerHeight, k = fx.k;
    const t = now / 1000;

    // 1. flickering burning Laṅkā battlements & horizon war-fire glow (drawn softly on bg pass)
    if (cdSmoke <= 0) {
      cdSmoke = LITE ? .45 : .24;
      const sx = rnd(W * .04, W * .96), sy = rnd(H * .44, H * .72);
      fx.smoke(sx, sy, rnd(20, 52) * k, rnd(-36, -12) * k, rnd(2.2, 4.2), rnd(34, 72) * k, { a: rnd(.18, .34), grow: 1.5, ash: Math.random() < .45 });
    }
    cdSmoke -= dt;

    // 2. wind-swept blazing battlefield embers streaking continuously across the frame
    cdEmber -= dt;
    if (cdEmber <= 0) {
      cdEmber = LITE ? .08 : .035;
      fx.spark(rnd(-30, W + 30), rnd(H * .55, H + 15), rnd(40, 145) * k * (Math.random() < .82 ? 1 : -1), rnd(-145, -45) * k, rnd(1.0, 2.2), rnd(1.4, 3.2) * k, Math.random() < .4 ? 'sun' : Math.random() < .7 ? 'ember' : 'fire', { drag: .99, g: -12 * k, streak: 1.15, a: rnd(.55, .95) });
    }

    // 3. relentless flaming arrow barrages crossing between the Vānara and Rākṣasa armies
    cdVolley -= dt;
    if (cdVolley <= 0) {
      cdVolley = rnd(.95, 1.85);
      const fromLeft = Math.random() < .52;
      const from = fromLeft ? ptUV(rnd(.08, .34), rnd(.44, .56)) : ptUV(rnd(.62, .9), rnd(.44, .56));
      const to = fromLeft ? ptUV(rnd(.56, .88), rnd(.48, .64)) : ptUV(rnd(.1, .42), rnd(.48, .64));
      fx.arrowVolley(from, to, {
        count: LITE ? 5 : Math.round(rnd(6, 12)),
        color: fromLeft ? '255,216,134' : '255,98,46',
        glowCol: fromLeft ? 'gold' : 'fire',
        spread: 68, arc: rnd(95, 190), dur: rnd(.72, 1.15)
      });
    }

    // 4. distant siege impacts, catapult boulders & fiery blasts along the battlements and mid-field
    cdBoom -= dt;
    if (cdBoom <= 0) {
      cdBoom = rnd(1.4, 2.7);
      const [bx, by] = ptUV(rnd(.14, .88), rnd(.42, .64));
      const sc = rnd(.45, .86);
      const fiery = Math.random() < .78;
      fx.explosion(bx, by, { scale: sc, color: fiery ? 'fire' : 'gold', rgb: fiery ? '255,104,28' : '255,212,120', floorY: by + 28 * k, shake: sc * .32, flare: sc > .62 });
    }

    // 5. front-line blade & mace spark clashes along the battle line
    cdClash -= dt;
    if (cdClash <= 0) {
      cdClash = rnd(.45, 1.05);
      const [cx, cy] = ptUV(rnd(.38, .64), rnd(.52, .64));
      fx.burst(cx, cy, LITE ? 10 : 18, 250, ['gold', 'white', 'ember'], { life: .48, size: .75, g: 260 * k, streak: 1.4 });
      fx.glow(cx, cy, 24 * k, 'sun', .7);
    }

    // 6. occasional distant war-storm lightning tearing through the upper smoke clouds
    cdStorm -= dt;
    if (cdStorm <= 0) {
      cdStorm = rnd(3.2, 6.2);
      const lx = rnd(W * .12, W * .88), ly = rnd(H * .24, H * .48);
      const main = fx.bolt(lx, -15, lx + rnd(-90, 90) * k, ly, .32, 5);
      const br = fx.bolt(main[7][0], main[7][1], main[7][0] + rnd(-110, 110) * k, main[7][1] + rnd(40, 110) * k, .36, 4);
      fx.add(a => { const fa = 1 - a / .2; fx.strokeBolt(main, '190,220,255', 2.0 * k, fa * .78); fx.strokeBolt(br, '160,195,255', 1.1 * k, fa * .56); }, .21);
      fx.hit(.08, '210,232,255', .14);
    }

    // persistent soft horizon fire-flicker glow across Laṅkā's burning walls
    if (((t * 20) | 0) % 2 === 0) {
      fx.add(a => {
        const flick = .45 + .55 * Math.sin(t * 6.5);
        const [f1x, f1y] = ptUV(.24, .54), [f2x, f2y] = ptUV(.76, .52);
        fx.glow(f1x, f1y, 140 * k, 'fire', .055 * flick);
        fx.glow(f2x, f2y, 175 * k, 'fire', .07 * (1.2 - flick * .4));
      }, .12);
    }

    warRaf = requestAnimationFrame(warStep);
  };

  function startWar() {
    if (warRunning) return;
    warRunning = true;
    lastT = performance.now();
    cdVolley = .15; cdBoom = .55; cdClash = .3; cdSmoke = 0; cdEmber = 0;
    warRaf = requestAnimationFrame(warStep);
  }
  function stopWar() {
    warRunning = false;
    cancelAnimationFrame(warRaf); warRaf = 0;
    fx.clear();
  }

  let busy = false;
  const fire = async id => {
    if (busy) return; busy = true;
    const a = ASTRAS.find(x => x.id === id), p = PLAN[id];
    root.querySelectorAll('.as-btn').forEach(b => b.classList.toggle('on', b.dataset.astra === id));
    desc.innerHTML = `<b>${p.say}.</b> ${a.desc}`;
    sound?.sfx?.(id === 'aindrastra' ? 'thunder' : id === 'nagapasha' ? 'hiss' : 'astra');
    const from = pt(p.from, p.bow), to = Array.isArray(p.to) ? p.to.map(t => pt(t, [0, -.06])) : pt(p.to, [0, -.04]);
    await fx.play(id, from, to, { onHit: () => { sound?.boom?.(); if (id === 'nagapasha') sound?.sfx?.('chime'); } });
    setTimeout(() => { busy = false; }, id === 'nagapasha' ? 1200 : 700);
  };
  root.addEventListener('click', e => { const b = e.target.closest('[data-astra]'); if (b) fire(b.dataset.astra); });
  startWar();
  return { fire, start: startWar, stop: stopWar };
}
