// धर्म युद्ध · DHARMA YUDDHA — a one-on-one fighting game on the cinematic 3D stage.
// The hero is always on the side of dharma; each hero faces the foes he meets in Vālmīki.
import { Stage2D, V } from '../fight2d.js';

const gsap = window.gsap;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ARENA = 4.9;

export const HEROES = {
  rama:      { name: 'Śrī Rāma', dev: 'श्रीराम', hp: 120, speed: 3.1, power: 1.1, weapon: 'bow', color: '#ffd36b',
               special: { name: 'Bāṇa-varṣa', kind: 'volley', dmg: 13 }, astra: { name: 'Brahmāstra', kind: 'astra', color: '#ffd36b', dmg: 42 } },
  lakshmana: { name: 'Lakṣmaṇa', dev: 'लक्ष्मण', hp: 110, speed: 3.3, power: 1.0, weapon: 'bow', color: '#9fd7ff',
               special: { name: 'Bāṇa-varṣa', kind: 'volley', dmg: 12 }, astra: { name: 'Aindrāstra', kind: 'astra', color: '#9fd7ff', dmg: 40 } },
  hanuman:   { name: 'Hanumān', dev: 'हनुमान्', hp: 135, speed: 3.6, power: 1.25, weapon: 'mace', color: '#ffb040',
               special: { name: 'Gadā-prahāra', kind: 'slam', dmg: 15 }, astra: { name: 'Virāṭ Rūpa', kind: 'giant', color: '#ffb040', dmg: 38 } },
  sugriva:   { name: 'Sugrīva', dev: 'सुग्रीव', hp: 120, speed: 3.4, power: 1.1, weapon: 'mace', color: '#ffcf6a',
               special: { name: 'Śilā-prahāra', kind: 'boulder', dmg: 13 }, astra: { name: 'Śaila-varṣa', kind: 'rockrain', color: '#e8c890', dmg: 36 } },
  angada:    { name: 'Aṅgada', dev: 'अङ्गद', hp: 118, speed: 3.5, power: 1.1, weapon: 'mace', color: '#ffcf6a',
               special: { name: 'Śilā-prahāra', kind: 'boulder', dmg: 13 }, astra: { name: 'Pada-sthambha', kind: 'slamwave', color: '#ffe2a0', dmg: 36 } },
  nila:      { name: 'Nīla', dev: 'नील', hp: 116, speed: 3.4, power: 1.1, weapon: 'mace', color: '#ff7a3a',
               special: { name: 'Agni-putra', kind: 'fireball', dmg: 13 }, astra: { name: 'Agni-jvālā', kind: 'firewave', color: '#ff6a2a', dmg: 38 } }
};
// Opponents (ids that have no portrait are drawn as rim-lit shadow warriors).
export const FOES = {
  tataka:      { name: 'Tāṭakā', hp: 100, arena: 'dandaka/dusk', moves: ['strike', 'boulder'], speed: 2.4, power: 1.1 },
  subahu:      { name: 'Subāhu', hp: 100, arena: 'yajna/night', moves: ['strike', 'fireball'], speed: 2.8, power: 1 },
  khara:       { name: 'Khara', hp: 130, arena: 'forest/dusk', moves: ['strike', 'strike', 'slam'], speed: 2.9, power: 1.15 },
  kumbhakarna: { name: 'Kumbhakarṇa', hp: 210, arena: 'field', moves: ['slam', 'strike', 'slam'], speed: 1.8, power: 1.5, giant: 1.55 },
  ravana:      { name: 'Rāvaṇa', hp: 240, arena: 'field/dusk', moves: ['strike', 'fireball', 'strike', 'volley', 'astra'], speed: 3, power: 1.4, boss: true },
  indrajit:    { name: 'Indrajit', hp: 200, arena: 'field/night', moves: ['volley', 'nagapasha', 'vanish', 'strike'], speed: 3.2, power: 1.3, boss: true },
  atikaya:     { name: 'Atikāya', hp: 170, arena: 'field', moves: ['volley', 'strike', 'slam'], speed: 2.2, power: 1.35, giant: 1.3 },
  akshakumara: { name: 'Akṣakumāra', hp: 110, arena: 'ashoka/day', moves: ['volley', 'strike'], speed: 3.4, power: 1 },
  prahasta:    { name: 'Prahasta', hp: 150, arena: 'field', moves: ['strike', 'slam', 'volley'], speed: 2.8, power: 1.2 },
  virupaksha:  { name: 'Virūpākṣa', hp: 120, arena: 'field', moves: ['strike', 'volley'], speed: 2.8, power: 1.1 },
  mahodara:    { name: 'Mahodara', hp: 130, arena: 'field/dusk', moves: ['strike', 'slam'], speed: 2.6, power: 1.2 },
  narantaka:   { name: 'Narāntaka', hp: 120, arena: 'field', moves: ['strike', 'volley'], speed: 3.2, power: 1.1 },
  mahaparshva: { name: 'Mahāpārśva', hp: 140, arena: 'field/dusk', moves: ['strike', 'slam'], speed: 2.6, power: 1.2 }
};
// Each hero's path through Vālmīki's battles.
export const LADDER = {
  rama: ['tataka', 'subahu', 'khara', 'kumbhakarna', 'ravana'],
  lakshmana: ['atikaya', 'indrajit'],
  hanuman: ['akshakumara', 'ravana'],
  sugriva: ['virupaksha', 'mahodara', 'kumbhakarna'],
  angada: ['narantaka', 'mahaparshva'],
  nila: ['prahasta']
};
// What Vālmīki says happened — shown after each victory, so the game never contradicts the epic.
const TRUTH = {
  'rama-ravana': 'As in Vālmīki, Rāma’s Brahmāstra pierces Rāvaṇa’s heart. Dharma triumphs.',
  'hanuman-ravana': 'In Vālmīki, Hanumān’s blow sends Rāvaṇa reeling — but the final victory over Rāvaṇa belongs to Rāma alone.',
  'sugriva-kumbhakarna': 'In Vālmīki, Sugrīva escapes Kumbhakarṇa’s grip by biting off his ears and nose; it is Rāma who slays the giant.',
  'rama-kumbhakarna': 'As in Vālmīki, Rāma cuts down Kumbhakarṇa with the arrows of Vāyu and Indra.',
  'lakshmana-indrajit': 'As in Vālmīki, Lakṣmaṇa’s Aindrāstra beheads Indrajit at Nikumbhilā.',
  'lakshmana-atikaya': 'As in Vālmīki, Vāyu whispers the secret, and Lakṣmaṇa’s Brahmāstra pierces Brahmā’s armour.',
  'nila-prahasta': 'As in Vālmīki, Nīla, son of Agni, crushes Prahasta with a great rock.',
  'hanuman-akshakumara': 'As in Vālmīki, Hanumān seizes the young prince and dashes him to the ground.',
  'rama-tataka': 'As in Vālmīki, a single arrow from young Rāma frees the forest of Tāṭakā.',
  'rama-subahu': 'As in Vālmīki, the Āgneyāstra consumes Subāhu at Siddhāśrama.',
  'rama-khara': 'As in Vālmīki, Rāma alone destroys the fourteen thousand and slays Khara with Indra’s arrow.',
  'sugriva-virupaksha': 'As in Vālmīki, Sugrīva slays Virūpākṣa with a blow of his palm.',
  'sugriva-mahodara': 'As in Vālmīki, Sugrīva takes Mahodara’s own sword and strikes off his head.',
  'angada-narantaka': 'As in Vālmīki, Aṅgada slays Narāntaka with a blow of his fist.',
  'angada-mahaparshva': 'As in Vālmīki, Aṅgada slays Mahāpārśva with a blow of his fist.'
};
const FOE_PROXY = { virupaksha: 'khara', mahodara: 'prahasta', narantaka: 'subahu', mahaparshva: 'prahasta' };

export class DharmaYuddha {
  constructor(root, { sound, art, onExit }) {
    this.root = root; this.sound = sound; this.art = art; this.onExit = onExit;
    root.innerHTML = `
      <div class="fy-stage"></div>
      <canvas class="fy-fx"></canvas>
      <div class="fy-hud" hidden>
        <div class="fy-bar l"><img class="fy-ico"><div><b class="fy-n"></b><div class="fy-hp"><i></i><em></em></div><div class="fy-sh"><i></i><span>शक्ति</span></div></div></div>
        <div class="fy-timer">∞</div>
        <div class="fy-bar r"><div><b class="fy-n"></b><div class="fy-hp"><i></i><em></em></div><div class="fy-sh"><i></i><span>शक्ति</span></div></div><img class="fy-ico"></div>
      </div>
      <div class="fy-banner"></div>
      <div class="fy-combo"></div>
      <div class="fy-help" hidden>
        <span><kbd>A</kbd><kbd>D</kbd> move</span><span><kbd>W</kbd> jump</span><span><kbd>S</kbd> guard</span>
        <span><kbd>J</kbd> strike</span><span><kbd>K</kbd> heavy</span><span><kbd>L</kbd> special</span><span><kbd>Space</kbd> astra</span>
      </div>
      <div class="fy-touch" hidden>
        <div class="pad"><button data-k="left">◀</button><button data-k="up">▲</button><button data-k="down">▼</button><button data-k="right">▶</button></div>
        <div class="acts"><button data-k="light">J</button><button data-k="heavy">K</button><button data-k="special">L</button><button data-k="astra">अस्त्र</button></div>
      </div>
      <div class="fy-select"></div>
      <div class="fy-rotate">⟳ Turn your phone sideways for the best battle view</div>
      <button class="fy-close" aria-label="Close">✕</button>`;
    this.$ = s => root.querySelector(s);
    this.$('.fy-close').addEventListener('click', () => this.exit());
    this.keys = {}; this.pressed = {};
    this.onKey = e => { const k = this.mapKey(e.code); if (!k) return; if (e.type === 'keydown') { if (!this.keys[k]) this.pressed[k] = true; this.keys[k] = true; } else this.keys[k] = false; if (this.active) e.preventDefault(); };
    root.querySelectorAll('.fy-touch button').forEach(b => {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', e => { e.preventDefault(); this.keys[k] = true; this.pressed[k] = true; });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, () => { this.keys[k] = false; }));
    });
    // the painted field (js/fight2d.js): the battlefield painting, the warriors' own art, every blow and astra in light
    this.stage = new Stage2D(this.$('.fy-stage'), this.$('.fy-fx'), { sound });
    this.stage.art = art; this.stage.proxy = FOE_PROXY;
    this.fx = this.stage.fx;
    this.open();
  }
  open() {
    addEventListener('keydown', this.onKey); addEventListener('keyup', this.onKey);
    this.keys = {}; this.pressed = {};
    this.stage.start();
    this.showSelect();
  }
  mapKey(c) { return { KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyJ: 'light', KeyK: 'heavy', KeyL: 'special', Space: 'astra', KeyU: 'astra' }[c]; }
  portrait(id) { const a = this.art[id] || this.art[FOE_PROXY[id]]; return a?.views?.front?.src || ''; }

  /* ── hero select ── */
  showSelect() {
    this.active = false; this.$('.fy-hud').hidden = true; this.$('.fy-help').hidden = true; this.$('.fy-touch').hidden = true;
    const sel = this.$('.fy-select'); sel.hidden = false;
    sel.innerHTML = `<div class="fy-title"><small>धर्म युद्ध</small>DHARMA YUDDHA</div><p class="fy-sub">Choose your warrior. Every battle follows Vālmīki.</p>
      <div class="fy-roster">${Object.entries(HEROES).map(([id, h]) => `<button class="fy-hero" data-id="${id}" style="--hc:${h.color}"><img src="${this.portrait(id)}" alt=""><span class="fy-hd">${h.dev}</span><span class="fy-hn">${h.name}</span><span class="fy-ladder">${LADDER[id].map(f => FOES[f].name).join(' → ')}</span></button>`).join('')}</div>`;
    sel.querySelectorAll('.fy-hero').forEach(b => {
      b.addEventListener('mouseenter', () => this.sound?.sfx('swing', .4));
      b.addEventListener('click', () => { this.sound?.sfx('boom'); this.startLadder(b.dataset.id); });
    });
    this.stage.play({ script: 'field | | embers dust |', kanda: 'Dharma Yuddha', title: '' });
    this.camTo({ x: 0, zoom: .8 }, 0); this.camLock = false;
  }
  startLadder(hero) { this.hero = hero; this.stageIdx = 0; this.$('.fy-select').hidden = true; this.match(); }

  /* ── a match ── */
  async match() {
    const heroId = this.hero, foeId = LADDER[heroId][this.stageIdx], H = HEROES[heroId], F = FOES[foeId];
    this.foeId = foeId;
    await this.stage.play({ script: `${F.arena} | ${heroId}@22 ${foeId}@78 | embers |`, book: 'yuddha', kanda: 'Dharma Yuddha', title: '' });
    const A = this.stage.actors;
    this.p = this.fighter(A.get(heroId), { ...H, id: heroId, side: -1, isHero: true });
    this.e = this.fighter(A.get(foeId), { ...F, id: foeId, side: 1, isHero: false });
    if (F.giant) { this.e.a.state.sc = F.giant; }
    await Promise.all([this.p.a.ready, this.e.a.ready]);
    this.p.a.face('R'); this.e.a.face('L');
    const hud = this.$('.fy-hud'); hud.hidden = false; const touch = matchMedia('(pointer: coarse)').matches || innerWidth < 700; this.$('.fy-help').hidden = touch; this.$('.fy-touch').hidden = !touch;
    hud.querySelector('.l .fy-n').textContent = H.name; hud.querySelector('.r .fy-n').textContent = F.name;
    hud.querySelector('.l .fy-ico').src = this.portrait(heroId); hud.querySelector('.r .fy-ico').src = this.portrait(foeId);
    this.$('.fy-timer').textContent = `${this.stageIdx + 1}/${LADDER[heroId].length}`;
    this.updateHud(true);
    this.over = false; this.combo = 0; this.hitStop = 0; this.slow = 1;
    await this.banner(`<small>युद्ध ${this.stageIdx + 1}</small>${H.name} <i>vs</i> ${F.name}`, 1.8);
    this.sound?.sfx('conch');
    await this.banner('<b>युद्धम्!</b><small>FIGHT</small>', .9, true);
    this.active = true; this.last = performance.now();
    cancelAnimationFrame(this.raf); this.loop();
  }
  fighter(a, o) {
    a.color = o.color; return { a, ...o, hpMax: o.hp, hpNow: o.hp, sh: o.isHero ? 30 : 20, vx: 0, vy: 0, y: 0, x: a.state.x, state: 'idle', t: 0, cd: 0, guard: false, dir: o.side < 0 ? 1 : -1, combo: 0, ai: { think: 0, plan: null }, buff: 0 };
  }

  /* ── main loop ── */
  loop() {
    this.raf = requestAnimationFrame(() => this.loop());
    const now = performance.now(); let dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
    if (this.hitStop > 0) { this.hitStop -= dt; this.pressed = {}; return; }
    dt *= this.slow;
    if (!this.active) return;
    this.control(this.p, dt); this.think(this.e, dt);
    for (const f of [this.p, this.e]) this.physics(f, dt);
    this.camera(dt);
    this.pressed = {};
  }
  control(f, dt) {
    const k = this.keys, P = this.pressed;
    f.cd = Math.max(0, f.cd - dt); f.t += dt;
    if (f.state === 'ko' || f.state === 'hit' || f.state === 'cast') return;
    f.guard = !!k.down && f.y <= 0;
    if (f.state === 'attack') return;
    let mv = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    if (f.guard) mv = 0;
    f.vx = mv * f.speed;
    if (P.up && f.y <= 0) { f.vy = 6.2; this.sound?.sfx('whoosh', .5); }
    if (P.astra && f.sh >= 100) return this.astra(f, this.e);
    if (P.special && f.cd <= 0 && f.sh >= 25) { f.sh -= 25; return this.special(f, this.e); }
    if (P.heavy && f.cd <= 0) return this.attack(f, this.e, 'heavy');
    if (P.light && f.cd <= 0) return this.attack(f, this.e, 'light');
  }
  think(f, dt) {
    f.cd = Math.max(0, f.cd - dt); f.t += dt;
    if (f.state === 'ko' || f.state === 'hit' || f.state === 'cast' || f.state === 'attack') { f.vx = 0; return; }
    const tgt = this.p, dist = Math.abs(tgt.x - f.x), lvl = .55 + this.stageIdx * .12 + (f.boss ? .15 : 0);
    f.ai.think -= dt; f.guard = false;
    if (f.ai.think > 0) { if (f.ai.plan === 'block' && tgt.state === 'attack') f.guard = true; return; }
    f.ai.think = rand(.25, .55) / lvl;
    const towards = Math.sign(tgt.x - f.x);
    if (tgt.state === 'attack' && dist < 2 && Math.random() < .35 * lvl) { f.ai.plan = 'block'; f.guard = true; f.vx = 0; return; }
    if (f.sh >= 100 && f.moves.includes('astra') && Math.random() < .5) return this.astra(f, tgt);
    const ranged = f.moves.filter(m => ['volley', 'fireball', 'boulder', 'nagapasha'].includes(m));
    if (dist > 2.6) {
      if (ranged.length && f.cd <= 0 && Math.random() < .45 * lvl) return this.special(f, tgt, ranged[(Math.random() * ranged.length) | 0]);
      if (f.moves.includes('vanish') && f.cd <= 0 && Math.random() < .15) return this.special(f, tgt, 'vanish');
      f.vx = towards * f.speed; f.ai.plan = 'close'; return;
    }
    if (dist > 1.55) { f.vx = towards * f.speed * .8; return; }
    f.vx = 0;
    if (f.cd > 0) { if (Math.random() < .3) f.vx = -towards * f.speed * .6; return; }
    const r = Math.random();
    if (r < .18 && f.moves.includes('slam')) return this.special(f, tgt, 'slam');
    if (r < .55) return this.attack(f, tgt, 'light');
    if (r < .8) return this.attack(f, tgt, 'heavy');
    f.vx = -towards * f.speed * .5;
  }
  physics(f, dt) {
    const S = f.a.state, o = f === this.p ? this.e : this.p;
    if (f.state !== 'ko') {
      f.x = clamp(f.x + f.vx * dt, -ARENA, ARENA);
      const gap = (f.a.height * S.sc * .17) + (o.a.height * o.a.state.sc * .17);
      if (Math.abs(f.x - o.x) < gap && f.y <= .3 && o.y <= .3) f.x = o.x - Math.sign(o.x - f.x || f.side) * gap;
      f.vy -= 16 * dt; f.y = Math.max(0, f.y + f.vy * dt); if (f.y === 0) f.vy = 0;
      const want = o.x > f.x ? 1 : -1;
      if (want !== f.dir && f.state !== 'attack') { f.dir = want; f.a.face(want > 0 ? 'R' : 'L'); }
    }
    S.x = f.x; S.y = f.y;
    S.gait = Math.abs(f.vx) > .1 && f.y === 0 ? 1.2 : 0; if (S.gait) S.phase += dt * 14;
    if (f.guard) { S.lean = -f.dir * .05; S.glow = Math.max(S.glow, .25); } else if (f.state === 'idle') S.lean += (Math.sin(f.t * 2.2) * .015 - S.lean) * .2;
    if (f.buff > 0) { f.buff -= dt; if (f.buff <= 0) gsap.to(S, { sc: 1, duration: .6 }); }
  }

  scr(v) { return this.stage.toScreen(v); }
  /* ── combat ── */
  attack(f, o, kind) {
    const heavy = kind === 'heavy', S = f.a.state, dir = f.dir;
    f.state = 'attack'; f.vx = 0; f.cd = heavy ? .62 : .36;
    const wind = heavy ? .2 : .09, reach = (heavy ? 1.85 : 1.55) * (S.sc || 1);
    this.sound?.sfx('swing', heavy ? 1 : .7);
    const tl = gsap.timeline({ onComplete: () => { if (f.state === 'attack') f.state = 'idle'; } });
    tl.to(S, { lean: -dir * (heavy ? .14 : .07), squash: .96, duration: wind, ease: 'power2.out' })
      .to(S, { lean: dir * (heavy ? .2 : .11), squash: 1.04, duration: .08, ease: 'power4.in', onStart: () => { f.x += dir * (heavy ? .5 : .28); } })
      .call(() => {
        const hp = new V(f.x + dir * f.a.height * S.sc * .3, f.y + f.a.height * S.sc * (heavy ? .62 : .55), .25);
        this.stage.vfx.slash(hp, dir, f.color || '#ffe2a0', (heavy ? 1.25 : .95) * S.sc, heavy ? .5 : 0);
        if (Math.abs(o.x - f.x) <= reach && Math.abs(o.y - f.y) < 1.4) this.hit(f, o, (heavy ? 10 : 5.5) * f.power * (f.buff > 0 ? 1.6 : 1), heavy ? 2.6 : 1.1, heavy);
      })
      .to(S, { lean: 0, squash: 1, duration: heavy ? .3 : .18, ease: 'power2.out' });
  }
  special(f, o, kind) {
    kind = kind || f.special.kind;
    const S = f.a.state, dir = f.dir, st = this.stage;
    f.state = 'attack'; f.vx = 0; f.cd = .9;
    const done = () => { if (f.state === 'attack') f.state = 'idle'; };
    const from = () => new V(f.x + dir * .45 * S.sc, f.y + f.a.height * S.sc * .62, .2);
    const at = () => new V(o.x, o.y + o.a.height * o.a.state.sc * .55, 0);
    const proj = (k, color, dmg, opt = {}) => st.vfx.projectile({ from: from(), to: at(), kind: k, color, dur: opt.dur, onHit: p => { if (Math.abs(p.x - o.x) < 1.2 && o.state !== 'ko') this.hit(f, o, dmg, 1.4, false, color); st.vfx.burst(p, color, 50, 4); } });
    switch (kind) {
      case 'volley': {
        this.sound?.sfx('draw'); const col = f.id === 'indrajit' ? '#7aff9a' : (f.color || '#ffe08a');
        gsap.timeline({ onComplete: done }).to(S, { lean: -dir * .05, duration: .25 }).call(() => { for (let i = 0; i < 3; i++) setTimeout(() => { this.sound?.sfx('twang', .6); proj('arrow', col, (f.isHero ? f.special.dmg : 7 * f.power) / 3); }, i * 110); }).to(S, { lean: 0, duration: .3 }, '+=.35');
        break;
      }
      case 'fireball': {
        this.sound?.sfx('fire'); st.vfx.charge(from(), '#ff6a2a', .45);
        gsap.timeline({ onComplete: done }).to(S, { lean: -dir * .06, duration: .45 }).call(() => {
          this.sound?.sfx('whoosh');
          this.fx.play('fireball', this.scr(from()), this.scr(at()), { onHit: () => { if (Math.abs(at().x - o.x) < 1.4 && o.state !== 'ko') this.hit(f, o, f.isHero ? f.special.dmg : 9 * f.power, 1.4, false, '#ff6a2a'); } });
        }).to(S, { lean: 0, duration: .3 });
        break;
      }
      case 'boulder': {
        gsap.timeline({ onComplete: done }).to(S, { squash: .9, lean: -dir * .1, duration: .3 }).call(() => { this.sound?.sfx('swing'); st.vfx.projectile({ from: from().add(new V(0, .5, 0)), to: at(), kind: 'rock', onHit: p => { if (Math.abs(p.x - o.x) < 1.3 && o.state !== 'ko') this.hit(f, o, f.isHero ? f.special.dmg : 9 * f.power, 2, true, '#e0c8a0'); st.vfx.dust(p, 16, '#8a7258', 1.4); } }); }).to(S, { squash: 1, lean: 0, duration: .3 });
        break;
      }
      case 'slam': {
        f.vy = 5.5; this.sound?.sfx('whoosh');
        gsap.timeline({ onComplete: done }).to(S, { squash: 1.08, duration: .25 }).to({}, { duration: .3 }).call(() => {
          const p = new V(f.x + dir * .6, 0, 0); this.sound?.sfx('boom'); st.shake(1.2); st.vfx.shockwave(p, '#ffd27a', 4.5, .7); st.vfx.dust(p, 40, '#8a7258', 2.4); st.vfx.burst(p.clone().setY(.3), '#ffe2a0', 70, 6);
          if (Math.abs(o.x - p.x) < 2.8 && o.y < .5) this.hit(f, o, f.isHero ? f.special.dmg : 11 * f.power, 3, true);
        }).to(S, { squash: 1, duration: .25 });
        break;
      }
      case 'nagapasha': {
        this.sound?.sfx('hiss');
        this.fx.nagapasha(this.scr(from()), [this.scr(new V(o.x, o.y + o.a.height * o.a.state.sc * .45, 0))], { free: false, onHit: () => { if (o.state !== 'ko') this.hit(f, o, 12 * f.power, .6, false, '#5dff9a'); } });
        setTimeout(done, 900);
        break;
      }
      case 'vanish': {
        this.sound?.sfx('chime'); gsap.to(S, { dissolve: 1, duration: .35, onComplete: () => { f.x = clamp(o.x - o.dir * 1.4, -ARENA, ARENA); gsap.to(S, { dissolve: 0, duration: .35, onComplete: () => { done(); this.attack(f, o, 'heavy'); } }); } });
        break;
      }
      default: done();
    }
  }
  astra(f, o) {
    const st = this.stage, S = f.a.state, dir = f.dir, A = f.astra || { name: 'Agneyāstra', kind: 'astra', color: '#ff4a1a', dmg: 30 };
    f.sh = 0; f.state = 'cast'; f.vx = 0; this.updateHud();
    this.sound?.sfx('astra'); this.sound?.chantHit?.();
    this.slow = .35; st.vfx.rune(new V(f.x, 0, 0), A.color || '#ffd36b', 3.6, 2.4); gsap.to(S, { glow: 1, duration: .5 });
    this.banner(`<small>${f.isHero ? 'अस्त्र' : 'राक्षस अस्त्र'}</small>${A.name}`, 1.1, true);
    this.camTo({ x: f.x + dir * .6, zoom: 1.35 }, .5);
    const finish = () => { f.state = 'idle'; this.slow = 1; this.camLock = false; gsap.to(S, { glow: f.isHero && (f.id === 'rama') ? .2 : 0, duration: 1 }); };
    setTimeout(() => {
      if (A.kind === 'giant') { gsap.to(S, { sc: 1.75, duration: .8, ease: 'back.out(1.6)' }); f.buff = 7; st.vfx.burst(new V(f.x, .3, 0), '#ffb040', 120, 6, { gravity: -1 }); this.sound?.sfx('swell'); st.shake(1.4); setTimeout(() => { finish(); this.attack(f, o, 'heavy'); }, 900); return; }
      if (A.kind === 'rockrain') { for (let i = 0; i < 9; i++) setTimeout(() => st.vfx.projectile({ from: new V(o.x + rand(-3, 1), 7, -1), to: new V(o.x + rand(-.8, .8), .4, 0), kind: 'rock', dur: .7, onHit: p => { st.vfx.dust(p, 18, '#8a7258', 1.6); st.shake(.5); if (i % 3 === 2 && o.state !== 'ko') this.hit(f, o, A.dmg / 3, 1, true); } }), i * 120); setTimeout(finish, 1300); return; }
      if (A.kind === 'slamwave' || A.kind === 'firewave') {
        const col = A.color; f.vy = 7;
        if (A.kind === 'firewave') {                           // Nīla, son of Agni: the fire of his father
          this.camFit(.25).then(() => this.fx.play('agneyastra', this.scr(new V(f.x + dir * .5, f.y + 1.2, .2)), this.scr(new V(o.x, o.y + 1, 0)), { onHit: () => { st.vfx.dust(new V(o.x, 0, 0), 40, '#8a7258', 3); this.sound?.sfx('boom'); if (o.state !== 'ko') this.hit(f, o, A.dmg, 3.5, true, col); finish(); } }));
          return;
        }
        setTimeout(() => { const p = new V(f.x + dir, 0, 0); st.vfx.shockwave(p, col, 9, 1); st.vfx.pillar(new V(o.x, 0, 0), col, 24, 1.4); st.vfx.dust(p, 50, '#8a7258', 3); st.flash(col, .7); st.shake(1.8); this.sound?.sfx('boom'); if (o.state !== 'ko') this.hit(f, o, A.dmg, 3.5, true, col); finish(); }, 600);
        return;
      }
      const hp = new V(f.x + dir * .28, f.y + f.a.height * S.sc * .62, .2);
      const kind = /brahm/i.test(A.name) ? 'brahmastra' : /aindr/i.test(A.name) ? 'aindrastra' : 'agneyastra';
      setTimeout(() => {
        this.sound?.sfx(kind === 'aindrastra' ? 'thunder' : 'twang');
        // the camera frames both and holds still, so the light leaves the bow and strikes the foe where they stand
        this.camFit(.28).then(() => {
          const tgt = new V(o.x, o.y + o.a.height * o.a.state.sc * .55, 0);
          this.fx.play(kind, this.scr(hp), this.scr(tgt), { onHit: () => {
            st.vfx.shockwave(new V(o.x, 0, 0), A.color, 7); st.aberr(.8); this.sound?.sfx('boom');
            if (o.state !== 'ko') this.hit(f, o, A.dmg, 4, true, A.color);
            finish();
          } });
        });
      }, 650);
    }, 650);
  }
  hit(f, o, dmg, kb, heavy, color = '#ffd8a0') {
    if (o.state === 'ko' || this.over) return;
    const st = this.stage, oS = o.a.state, p = new V(o.x, o.y + o.a.height * oS.sc * .58, .3);
    if (o.guard && Math.sign(f.x - o.x) === o.dir) {
      dmg *= .18; kb *= .3; st.vfx.burst(p, '#9fd0ff', 22, 3); this.sound?.sfx('impact', .4); o.sh = Math.min(100, o.sh + 4);
    } else {
      st.vfx.burst(p, color, heavy ? 80 : 40, heavy ? 6 : 4); st.vfx.flare(p, color, heavy ? 2.4 : 1.4, .3);
      gsap.fromTo(oS, { flash: 1 }, { flash: 0, duration: .35 });
      this.sound?.sfx(heavy ? 'boom' : 'impact', heavy ? .8 : 1); st.shake(heavy ? .9 : .35);
      if (heavy) st.aberr(.6);
      this.hitStop = heavy ? .09 : .05;
      o.state = 'hit'; o.vx = 0; gsap.delayedCall(heavy ? .42 : .22, () => { if (o.state === 'hit') o.state = 'idle'; });
      if (f.isHero) { this.combo = (performance.now() - (this.lastHit || 0) < 1100) ? this.combo + 1 : 1; this.lastHit = performance.now(); if (this.combo > 1) this.showCombo(this.combo); }
      f.sh = Math.min(100, f.sh + dmg * 1.6); o.sh = Math.min(100, o.sh + dmg * .8);
    }
    o.x = clamp(o.x + f.dir * kb * .32, -ARENA, ARENA);
    o.hpNow = Math.max(0, o.hpNow - dmg);
    this.updateHud();
    if (o.hpNow <= 0) this.ko(f, o);
  }
  async ko(f, o) {
    this.over = true; o.state = 'ko'; const st = this.stage, oS = o.a.state;
    this.slow = .25; this.camTo({ x: o.x, zoom: 1.25 }, .4);
    this.sound?.sfx('thunder');
    gsap.to(oS, { tilt: -1.45, y: 0, duration: 1.2, ease: 'power3.in', onComplete: () => { st.vfx.dust(new V(o.x, 0, 0), 40, '#7a6a52', 2); st.shake(.8); this.sound?.sfx('thud'); } });
    await new Promise(r => setTimeout(r, 1100));
    this.slow = 1; this.active = false;
    if (o.isHero) {
      await this.banner('<small>दृढो भव</small>RISE AGAIN', 1.6);
      return this.retry();
    }
    st.vfx.ambient.petals = 1.5; this.sound?.sfx('petals'); this.sound?.sfx('conch');
    const last = this.stageIdx === LADDER[this.hero].length - 1;
    const truth = TRUTH[`${this.hero}-${o.id}`] || '';
    await this.banner(`<small>धर्म विजय</small>DHARMA VIJAYA`, 1.6, true);
    this.panel(`<h3>${last ? 'The path is complete' : `${FOES[o.id].name} falls`}</h3><p>${truth}</p>
      <div class="fy-btns">${last ? '<button data-a="select">Choose another warrior</button>' : '<button data-a="next">Next battle ▶</button>'}<button data-a="exit">Leave the field</button></div>`);
  }
  retry() { this.panel(`<h3>The battle is not yet won</h3><p>Even Rāma and Lakṣmaṇa fell to Indrajit’s arrows, and rose again. Gather your strength.</p><div class="fy-btns"><button data-a="retry">Fight again ▶</button><button data-a="select">Choose another warrior</button></div>`); }
  panel(html) {
    const s = this.$('.fy-select'); s.hidden = false; s.innerHTML = `<div class="fy-panel">${html}</div>`;
    s.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
      const a = b.dataset.a; s.hidden = true;
      if (a === 'next') { this.stageIdx++; this.match(); }
      if (a === 'retry') this.match();
      if (a === 'select') this.showSelect();
      if (a === 'exit') this.exit();
    }));
  }

  /* ── presentation ── */
  camera(dt) {
    if (this.camLock) return;
    const c = this.stage.cam, mid = (this.p.x + this.e.x) / 2, dist = Math.abs(this.p.x - this.e.x);
    const tall = Math.max(this.p.a.height * this.p.a.state.sc, this.e.a.height * this.e.a.state.sc), aspect = this.stage.W / this.stage.H;
    // the screen spans M = 4.6 m of height at zoom 1: both warriors fit across with 1.6 m to spare on each side, and the
    // tallest stands within 70% of the height
    const z = clamp(Math.min(aspect * 4.6 / (dist + 3.2), .7 * 4.6 / (tall + .3)), .55, 1.35);
    const k = 1 - Math.pow(.03, dt);
    c.x += (mid - c.x) * k; c.zoom += (z - c.zoom) * k;
  }
  // frame both warriors (as camera() would) and hold the camera there until released
  camFit(dur = .3) {
    const mid = (this.p.x + this.e.x) / 2, dist = Math.abs(this.p.x - this.e.x), aspect = this.stage.W / this.stage.H;
    const tall = Math.max(this.p.a.height * this.p.a.state.sc, this.e.a.height * this.e.a.state.sc);
    const zoom = clamp(Math.min(aspect * 4.6 / (dist + 3.2), .7 * 4.6 / (tall + .3)), .55, 1.35);
    const c = this.stage.cam; gsap.killTweensOf(c); clearTimeout(this._camT); this.camLock = true;
    return new Promise(res => gsap.to(c, { x: mid, zoom, duration: dur, ease: 'power2.out', onComplete: res }));
  }
  camTo(t, dur = .6) {
    const c = this.stage.cam; gsap.killTweensOf(c);
    if (!t) { this.camLock = false; return; }
    this.camLock = true; if (dur === 0) Object.assign(c, t); else gsap.to(c, { ...t, duration: dur, ease: 'power2.out' });
    if (this.active) clearTimeout(this._camT), this._camT = setTimeout(() => { this.camLock = false; }, 1800);
  }
  updateHud(instant) {
    const set = (side, f) => {
      const bar = this.$(`.${side} .fy-hp i`), ghost = this.$(`.${side} .fy-hp em`), sh = this.$(`.${side} .fy-sh i`);
      const v = (f.hpNow / f.hpMax * 100).toFixed(1) + '%';
      if (instant) { bar.style.transition = ghost.style.transition = 'none'; requestAnimationFrame(() => { bar.style.transition = ghost.style.transition = ''; }); }
      bar.style.width = v; ghost.style.width = v; sh.style.width = f.sh + '%'; sh.parentElement.classList.toggle('full', f.sh >= 100);
    };
    set('l', this.p); set('r', this.e);
  }
  showCombo(n) { const el = this.$('.fy-combo'); el.innerHTML = `<b>${n}</b> HITS`; gsap.fromTo(el, { scale: 1.6, opacity: 1 }, { scale: 1, duration: .25, ease: 'back.out(2)' }); gsap.to(el, { opacity: 0, duration: .5, delay: .9 }); }
  banner(html, hold = 1.2, big) {
    const el = this.$('.fy-banner'); el.className = 'fy-banner' + (big ? ' big' : ''); el.innerHTML = html;
    return new Promise(res => gsap.timeline({ onComplete: res }).fromTo(el, { opacity: 0, scale: 2.4, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: .35, ease: 'power3.out' }).to(el, { opacity: 0, scale: .9, duration: .3 }, `+=${hold}`));
  }
  exit() {
    this.active = false; cancelAnimationFrame(this.raf);
    removeEventListener('keydown', this.onKey); removeEventListener('keyup', this.onKey);
    this.stage.stop(); this.onExit?.();
  }
}
