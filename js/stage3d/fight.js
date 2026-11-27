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
               special: { name: 'Agni-putra', kind: 'fireball', dmg: 13 }, astra: { name: 'Agni-jvālā', kind: 'firewave', color: '#ff6a2a', dmg: 38 } },
  jatayu:    { name: 'Jaṭāyu', dev: 'जटायु', hp: 125, speed: 3.9, power: 1.15, weapon: 'talon', color: '#ffe07a', fly: true,
               special: { name: 'Garuḍa-vega', kind: 'swoop', dmg: 15 }, astra: { name: 'Pakṣirāja Prāhāra', kind: 'skyastra', color: '#ffd36b', dmg: 42 } }
};
// Opponents (ids that have no portrait are drawn as rim-lit shadow warriors).
export const FOES = {
  tataka:      { name: 'Tāṭakā', hp: 100, arena: 'dandaka/dusk', moves: ['strike', 'boulder'], speed: 2.4, power: 1.1, color: '#ff6e24' },
  subahu:      { name: 'Subāhu', hp: 100, arena: 'yajna/night', moves: ['strike', 'fireball'], speed: 2.8, power: 1, color: '#ff5218' },
  khara:       { name: 'Khara', hp: 130, arena: 'forest/dusk', moves: ['strike', 'strike', 'slam'], speed: 2.9, power: 1.15, color: '#ff5e1e' },
  kumbhakarna: { name: 'Kumbhakarṇa', hp: 210, arena: 'field', moves: ['slam', 'strike', 'slam'], speed: 1.8, power: 1.5, giant: 1.55, color: '#ff7828' },
  ravana:      { name: 'Rāvaṇa', hp: 240, arena: 'field/dusk', moves: ['strike', 'fireball', 'strike', 'volley', 'astra'], speed: 3, power: 1.4, boss: true, color: '#ff4e1a' },
  ravana_sky:  { name: 'Rāvaṇa', hp: 185, arena: 'sky/storm', moves: ['strike', 'fireball', 'strike', 'volley'], speed: 3.1, power: 1.25, boss: true, fly: true, color: '#ff521a' },
  indrajit:    { name: 'Indrajit', hp: 200, arena: 'field/night', moves: ['volley', 'nagapasha', 'vanish', 'strike'], speed: 3.2, power: 1.3, boss: true, color: '#b45cff' },
  atikaya:     { name: 'Atikāya', hp: 170, arena: 'field', moves: ['volley', 'strike', 'slam'], speed: 2.2, power: 1.35, giant: 1.12, color: '#ff5c1c' },
  akshakumara: { name: 'Akṣakumāra', hp: 110, arena: 'ashoka/day', moves: ['volley', 'strike'], speed: 3.4, power: 1, color: '#ff7a2a' },
  prahasta:    { name: 'Prahasta', hp: 150, arena: 'field', moves: ['strike', 'slam', 'volley'], speed: 2.8, power: 1.2, color: '#ff5a1a' },
  virupaksha:  { name: 'Virūpākṣa', hp: 120, arena: 'field', moves: ['strike', 'volley'], speed: 2.8, power: 1.1, color: '#ff5e1e' },
  mahodara:    { name: 'Mahodara', hp: 130, arena: 'field/dusk', moves: ['strike', 'slam'], speed: 2.6, power: 1.2, color: '#ff6420' },
  narantaka:   { name: 'Narāntaka', hp: 120, arena: 'field', moves: ['strike', 'volley'], speed: 3.2, power: 1.1, color: '#ff5e1e' },
  mahaparshva: { name: 'Mahāpārśva', hp: 140, arena: 'field/dusk', moves: ['strike', 'slam'], speed: 2.6, power: 1.2, color: '#ff6420' }
};
// Each hero's path through Vālmīki's battles.
export const LADDER = {
  rama: ['tataka', 'subahu', 'khara', 'kumbhakarna', 'ravana'],
  lakshmana: ['atikaya', 'indrajit'],
  hanuman: ['akshakumara', 'ravana'],
  sugriva: ['virupaksha', 'mahodara', 'kumbhakarna'],
  angada: ['narantaka', 'mahaparshva'],
  nila: ['prahasta'],
  jatayu: ['ravana_sky']
};
// What Vālmīki says happened — shown after each victory, so the game never contradicts the epic.
const TRUTH = {
  'rama-ravana': 'As in Vālmīki, Rāma’s Brahmāstra pierces Rāvaṇa’s heart. Dharma triumphs.',
  'jatayu-ravana_sky': 'In Vālmīki, the aged vulture-king Jaṭāyu shatters Rāvaṇa’s golden chariot and bow in mid-air before Rāvaṇa’s sword strikes his wings — dying in Rāma’s arms with eternal honour.',
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
const FOE_PROXY = { virupaksha: 'khara', mahodara: 'prahasta', narantaka: 'subahu', mahaparshva: 'prahasta', ravana_sky: 'ravana' };
const VANARAS = ['angada', 'nala', 'jambavan', 'nila', 'sugriva'];
const RAKSHASAS = ['dushana', 'viradha', 'sumali', 'subahu', 'khara'];

const MANDALA_SVG = `<svg class="fy-mandala" viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="100" cy="100" r="88" stroke-width="1.1" opacity=".45"/><circle cx="100" cy="100" r="72" stroke-width="1.4" opacity=".68"/><circle cx="100" cy="100" r="56" stroke-width="1.2" opacity=".55"/>${Array.from({ length: 16 }, (_, i) => {
  const a = (i * 22.5) * Math.PI / 180, a1 = ((i + .5) * 22.5) * Math.PI / 180;
  const x1 = (100 + Math.cos(a) * 56).toFixed(1), y1 = (100 + Math.sin(a) * 56).toFixed(1);
  const x2 = (100 + Math.cos(a) * 95).toFixed(1), y2 = (100 + Math.sin(a) * 95).toFixed(1);
  const px = (100 + Math.cos(a1) * 86).toFixed(1), py = (100 + Math.sin(a1) * 86).toFixed(1);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="1.3" opacity=".75"/><circle cx="${px}" cy="${py}" r="2.2" fill="currentColor" stroke="none" opacity=".82"/>`;
}).join('')}</g></svg>`;

export class DharmaYuddha {
  constructor(root, { sound, art, onExit }) {
    this.root = root; this.sound = sound; this.art = art; this.onExit = onExit;
    root.innerHTML = `
      <div class="fy-stage"></div>
      <canvas class="fy-fx"></canvas>
      <div class="fy-hud" hidden>
        <div class="fy-bar l"><span class="fy-ico-wrap"><img class="fy-ico" alt=""></span><div class="fy-gauges"><b class="fy-n"></b><div class="fy-hp"><i></i><em></em></div><div class="fy-sh"><i></i><span>शक्ति</span></div></div></div>
        <div class="fy-center">${MANDALA_SVG}<div class="fy-timer"><span>∞</span></div></div>
        <div class="fy-bar r"><div class="fy-gauges"><b class="fy-n"></b><div class="fy-hp"><i></i><em></em></div><div class="fy-sh"><i></i><span>शक्ति</span></div></div><span class="fy-ico-wrap"><img class="fy-ico" alt=""></span></div>
      </div>
      <div class="fy-status" hidden></div>
      <div class="fy-banner"></div>
      <div class="fy-combo"></div>
      <button type="button" class="fy-astra-cta" data-k="astra" hidden><kbd>SPACE</kbd><span>ASTRA</span></button>
      <div class="fy-help" hidden>
        <button type="button" class="fy-key" data-k="left"><kbd>A</kbd><span>LEFT</span></button>
        <button type="button" class="fy-key" data-k="right"><kbd>D</kbd><span>RIGHT</span></button>
        <button type="button" class="fy-key" data-k="up"><kbd>W</kbd><span>JUMP</span></button>
        <button type="button" class="fy-key" data-k="down"><kbd>S</kbd><span>GUARD</span></button>
        <button type="button" class="fy-key" data-k="light"><kbd>J</kbd><span>STRIKE</span></button>
        <button type="button" class="fy-key" data-k="heavy"><kbd>K</kbd><span>HEAVY</span></button>
        <button type="button" class="fy-key" data-k="special"><kbd>L</kbd><span>SPECIAL</span></button>
        <button type="button" class="fy-key astra" data-k="astra"><kbd>SPACE</kbd><span>ASTRA</span></button>
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
    this.setKeyUi = (k, on) => root.querySelectorAll(`.fy-key[data-k="${k}"], .fy-astra-cta[data-k="${k}"]`).forEach(el => el.classList.toggle('active', !!on));
    this.onKey = e => {
      const k = this.mapKey(e.code); if (!k) return;
      if (e.type === 'keydown') {
        if (!this.keys[k]) this.pressed[k] = true;
        this.keys[k] = true; this.setKeyUi(k, true);
      } else {
        this.keys[k] = false; this.setKeyUi(k, false);
      }
      if (this.active) e.preventDefault();
    };
    root.querySelectorAll('.fy-touch button, .fy-help button[data-k], .fy-astra-cta[data-k]').forEach(b => {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); b.classList.add('down'); this.setKeyUi(k, true);
        if (k === 'astra' && this.active && !this.over && this.p && this.p.sh >= 100 && this.p.state !== 'cast' && this.p.state !== 'ko') {
          this.astra(this.p, this.e); return;
        }
        this.keys[k] = true; this.pressed[k] = true;
      });
      if (k === 'astra') {
        b.addEventListener('click', e => {
          e.preventDefault();
          if (this.active && !this.over && this.p && this.p.sh >= 100 && this.p.state !== 'cast' && this.p.state !== 'ko') this.astra(this.p, this.e);
        });
      }
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, () => { b.classList.remove('down'); this.setKeyUi(k, false); this.keys[k] = false; }));
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
  cardArt(id) {
    if (id === 'jatayu') return 'assets/characters/cut/jatayu-fly.webp';
    if (id === 'lakshmana') return 'assets/characters/cut/lakshmana-combat.webp';
    return this.portrait(id);
  }

  /* ── hero select ── */
  showSelect() {
    this.active = false; this.$('.fy-hud').hidden = true; this.$('.fy-help').hidden = true; this.$('.fy-touch').hidden = true;
    this.$('.fy-hud').classList.remove('is-astra', 'is-victory');
    this.$('.fy-status').hidden = true; this.$('.fy-astra-cta').hidden = true;
    const sel = this.$('.fy-select'); sel.className = 'fy-select'; sel.hidden = false;
    sel.innerHTML = `<div class="fy-title"><small>धर्म युद्ध</small>DHARMA YUDDHA</div><p class="fy-sub">Choose your warrior. Every battle follows Vālmīki.</p>
      <div class="fy-roster">${Object.entries(HEROES).map(([id, h]) => `<button class="fy-hero" data-id="${id}" style="--hc:${h.color}"><img src="${this.cardArt(id)}" alt=""><div class="fy-info"><span class="fy-hd">${h.dev}</span><span class="fy-hn">${h.name}</span><span class="fy-ladder">${LADDER[id].map(f => FOES[f].name).join(' → ')}</span></div></button>`).join('')}</div>`;
    sel.querySelectorAll('.fy-hero').forEach(b => {
      b.addEventListener('mouseenter', () => this.sound?.sfx('swing', .4));
      b.addEventListener('click', () => { this.sound?.sfx('boom'); this.startLadder(b.dataset.id); });
    });
    this.stage.play({ script: 'field/dusk | | embers dust |', kanda: 'Dharma Yuddha', title: '' }).then(() => {
      this.stage.setWar({ intensity: 1.05, storm: true, fires: true });
      this.stage.war([VANARAS, RAKSHASAS]);
    });
    this.camTo({ x: 0, zoom: .8 }, 0); this.camLock = false;
  }
  startLadder(hero) {
    if (!HEROES[hero] || !LADDER[hero]) return this.showSelect();
    this.hero = hero; this.stageIdx = 0; this.$('.fy-select').hidden = true; this.match();
  }

  /* ── a match ── */
  async match() {
    const heroId = this.hero, foeId = LADDER[heroId][this.stageIdx], H = HEROES[heroId], F = FOES[foeId];
    this.foeId = foeId;
    const isAir = F.arena === 'sky/storm';
    this.isAir = isAir;
    // Match Vālmīki exactly: Lakṣmaṇa defeats Atikāya with Brahmāstra (Yuddha 6.71) and Indrajit with Aindrāstra
    const heroCfg = (heroId === 'lakshmana' && foeId === 'atikaya')
      ? { ...H, astra: { name: 'Brahmāstra', kind: 'astra', color: '#ffd36b', dmg: 42 } }
      : H;
    await this.stage.play({ script: `${F.arena} | ${heroId}@${isAir ? 22 : 24} ${foeId}@${isAir ? 78 : 76} | embers |`, book: 'yuddha', kanda: 'Dharma Yuddha', title: '' });
    const isField = F.arena.startsWith('field');
    this.stage.setWar({ intensity: isAir ? 1.15 : (isField ? 1.15 : .78), storm: isAir || isField || /dusk|night/.test(F.arena), fires: !isAir });
    await this.stage.war(isAir ? null : (isField
      ? [VANARAS.filter(x => x !== heroId), RAKSHASAS.filter(x => x !== foeId)]
      : [[], RAKSHASAS.filter(x => x !== foeId)]));
    const A = this.stage.actors;
    this.p = this.fighter(A.get(heroId), { ...heroCfg, id: heroId, side: -1, isHero: true, baseY: isAir ? .52 : 0 });
    this.e = this.fighter(A.get(foeId), { ...F, id: foeId, side: 1, isHero: false, baseY: isAir ? .46 : 0 });
    if (F.giant) { this.e.a.state.sc = F.giant; }
    if (isAir) {
      this.p.a.state.fly = true; this.e.a.state.fly = true;
      this.p.y = this.p.a.state.y = this.p.baseY;
      this.e.y = this.e.a.state.y = this.e.baseY;
      this.e.a.state.fireAura = 1;
    }
    await Promise.all([this.p.a.ready, this.e.a.ready]);
    this.p.a.face('R'); this.e.a.face('L');
    this.camFit(0); this.camLock = false;
    const hud = this.$('.fy-hud'); hud.hidden = false; hud.classList.remove('is-astra', 'is-victory');
    this.$('.fy-status').hidden = true;
    const touch = matchMedia('(pointer: coarse)').matches || innerWidth < 700; this.$('.fy-help').hidden = touch; this.$('.fy-touch').hidden = !touch;
    hud.querySelector('.l .fy-n').textContent = H.name; hud.querySelector('.r .fy-n').textContent = F.name;
    hud.querySelector('.l .fy-ico').src = this.portrait(heroId); hud.querySelector('.r .fy-ico').src = this.portrait(foeId);
    this.$('.fy-timer span').textContent = `${this.stageIdx + 1}/${LADDER[heroId].length}`;
    this.updateHud(true);
    this.over = false; this.combo = 0; this.hitStop = 0; this.slow = 1;
    await this.banner(`<small>युद्ध ${this.stageIdx + 1}</small>${H.name} <i>vs</i> ${F.name}`, 1.6);
    this.sound?.sfx('conch');
    await this.banner('<b>युद्धम्!</b><small>FIGHT</small>', .8, true);
    this.active = true; this.last = performance.now();
    cancelAnimationFrame(this.raf); this.loop();
  }
  fighter(a, o) {
    a.color = o.color || '#ffd36b';
    return { a, ...o, hpMax: o.hp, hpNow: o.hp, sh: o.isHero ? 35 : 20, vx: 0, vy: 0, y: o.baseY || 0, baseY: o.baseY || 0, x: a.state.x, state: 'idle', t: 0, cd: 0, guard: false, dir: o.side < 0 ? 1 : -1, combo: 0, ai: { think: 0, plan: null }, buff: 0 };
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
    if (P.astra && f.sh >= 100) return this.astra(f, this.e);
    f.guard = !!k.down && f.y <= f.baseY + .08;
    if (f.state === 'attack') return;
    let mv = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    if (f.guard) mv = 0;
    f.vx = mv * f.speed;
    if (P.up && f.y <= f.baseY + .15) { f.vy = this.isAir ? 4.6 : 6.4; this.sound?.sfx('whoosh', .5); }
    if (P.special && f.cd <= 0 && f.sh >= 25) { f.sh -= 25; this.updateHud(); return this.special(f, this.e); }
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
    if (tgt.state === 'attack' && dist < (this.isAir ? 2.8 : 2) && Math.random() < .35 * lvl) { f.ai.plan = 'block'; f.guard = true; f.vx = 0; return; }
    if (f.sh >= 100 && f.moves.includes('astra') && Math.random() < .5) return this.astra(f, tgt);
    const ranged = f.moves.filter(m => ['volley', 'fireball', 'boulder', 'nagapasha'].includes(m));
    if (dist > (this.isAir ? 3.2 : 2.6)) {
      if (ranged.length && f.cd <= 0 && Math.random() < .45 * lvl) return this.special(f, tgt, ranged[(Math.random() * ranged.length) | 0]);
      if (f.moves.includes('vanish') && f.cd <= 0 && Math.random() < .15) return this.special(f, tgt, 'vanish');
      f.vx = towards * f.speed; f.ai.plan = 'close'; return;
    }
    if (dist > (this.isAir ? 2.15 : 1.55)) { f.vx = towards * f.speed * .8; return; }
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
      const gap = this.isAir ? 1.55 : ((f.a.height * S.sc * .17) + (o.a.height * o.a.state.sc * .17));
      if (Math.abs(f.x - o.x) < gap && Math.abs(f.y - o.y) <= .45) f.x = o.x - Math.sign(o.x - f.x || f.side) * gap;
      const wasAir = f.y > f.baseY + .15;
      f.vy -= (this.isAir ? 11 : 16) * dt;
      f.y = Math.max(f.baseY, f.y + f.vy * dt);
      if (f.y === f.baseY) {
        if (!this.isAir && wasAir && f.vy < -3) this.stage.vfx.dust(new V(f.x, 0, 0), 10, '#8a7258', .9);
        f.vy = 0;
      }
      const want = o.x > f.x ? 1 : -1;
      if (want !== f.dir && f.state !== 'attack') { f.dir = want; f.a.face(want > 0 ? 'R' : 'L'); }
    }
    S.x = f.x; S.y = f.y; S.guard = f.guard && f.state !== 'ko'; S.shaktiFull = f.sh >= 100 && f.state !== 'ko';
    S.gait = !this.isAir && Math.abs(f.vx) > .1 && f.y === 0 ? 1.2 : 0; if (S.gait) S.phase += dt * 14;
    if (f.guard) { S.lean = -f.dir * .05; S.glow = Math.max(S.glow, .25); } else if (f.state === 'idle') S.lean += (Math.sin(f.t * 2.2) * .015 - S.lean) * .2;
    if (f.buff > 0) { f.buff -= dt; if (f.buff <= 0) gsap.to(S, { sc: 1, duration: .6 }); }
  }

  scr(v) { return this.stage.toScreen(v); }
  /* ── combat ── */
  attack(f, o, kind) {
    const heavy = kind === 'heavy', S = f.a.state, dir = f.dir;
    const col = f.color || (f.isHero ? '#ffd36b' : '#ff5a1a');
    f.state = 'attack'; f.vx = 0; f.cd = heavy ? .62 : .36;
    const wind = heavy ? .19 : .09, reach = (this.isAir ? (heavy ? 2.85 : 2.4) : (heavy ? 1.95 : 1.6)) * (S.sc || 1);
    this.sound?.sfx('swing', heavy ? 1 : .7);
    S.weaponCol = col;
    if (f.a.poses?.attack) S.pose = 'attack';
    gsap.fromTo(S, { weaponGlow: heavy ? 1 : .75 }, { weaponGlow: 0, duration: heavy ? .55 : .36 });
    const tl = gsap.timeline({ onComplete: () => { if (f.state === 'attack') f.state = 'idle'; if (S.pose === 'attack') S.pose = 'idle'; } });
    tl.to(S, { lean: -dir * (heavy ? .15 : .08), squash: .95, duration: wind, ease: 'power2.out' })
      .to(S, { lean: dir * (heavy ? .22 : .12), squash: 1.05, duration: .08, ease: 'power4.in', onStart: () => { f.x = clamp(f.x + dir * (heavy ? .58 : .34), -ARENA, ARENA); } })
      .call(() => {
        const hp = new V(f.x + dir * f.a.height * S.sc * (this.isAir ? .52 : .34), f.y + f.a.height * S.sc * (heavy ? .62 : .55), .25);
        this.stage.vfx.slash(hp, dir, col, (heavy ? 1.38 : 1.06) * S.sc, heavy ? 1 : 0);
        if (f.id === 'jatayu') this.stage.vfx.feathers(hp, heavy ? 18 : 10, 240);
        if (Math.abs(o.x - f.x) <= reach && Math.abs(o.y - f.y) < 1.55) {
          // Dramatic mid-air / melee weapon clash when both warriors swing together!
          if (o.state === 'attack' && o.state !== 'ko' && Math.abs(o.x - f.x) <= reach * 1.1) {
            const mid = new V((f.x + o.x) / 2, Math.max(f.y, o.y) + 1.05, .3);
            this.stage.vfx.clash(mid, f.isHero ? '#ffd36b' : col, o.isHero ? '#ffd36b' : (this.isAir ? '#c070ff' : '#9fd7ff'), heavy ? 1.28 : 1.0, this.isAir);
            if (this.isAir) this.stage.vfx.feathers(mid, 22, 280);
            this.sound?.sfx('thunder', .55); this.stage.shake(1.1); this.stage.aberr(.65);
            this.hitStop = .095;
            f.x = clamp(f.x - dir * .55, -ARENA, ARENA); o.x = clamp(o.x + dir * .55, -ARENA, ARENA);
            f.sh = Math.min(100, f.sh + 12); o.sh = Math.min(100, o.sh + 10);
            this.updateHud();
            return;
          }
          this.hit(f, o, (heavy ? 10 : 5.5) * f.power * (f.buff > 0 ? 1.6 : 1), heavy ? 2.6 : 1.1, heavy, col);
        }
      })
      .to(S, { lean: 0, squash: 1, duration: heavy ? .3 : .18, ease: 'power2.out' });
  }
  special(f, o, kind) {
    kind = kind || f.special.kind;
    const S = f.a.state, dir = f.dir, st = this.stage;
    f.state = 'attack'; f.vx = 0; f.cd = .9;
    const done = () => { if (f.state === 'attack') f.state = 'idle'; S.pose = 'idle'; };
    const from = () => new V(f.x + dir * .48 * S.sc, f.y + f.a.height * S.sc * .62, .2);
    const at = () => new V(o.x, o.y + o.a.height * o.a.state.sc * .55, 0);
    const proj = (k, color, dmg, opt = {}) => st.vfx.projectile({ from: from(), to: at(), kind: k, color, dur: opt.dur, onHit: p => { if (Math.abs(p.x - o.x) < 1.35 && o.state !== 'ko') this.hit(f, o, dmg, 1.4, false, color); st.vfx.burst(p, color, 52, 4.4); } });
    switch (kind) {
      case 'swoop': {
        // Jaṭāyu's supersonic Garuḍa-Vega aerial dive & blinding lightning sky-clash!
        this.sound?.sfx('whoosh');
        if (f.a.poses?.attack) S.pose = 'attack';
        S.weaponCol = '#ffd670';
        const targetX = clamp(o.x - dir * 1.45, -ARENA, ARENA);
        gsap.timeline({ onComplete: done })
          .to(f, { y: f.baseY + 1.15, x: clamp(f.x - dir * .55, -ARENA, ARENA), duration: .24, ease: 'power2.out' })
          .to(f, { y: o.y + .15, x: targetX, duration: .26, ease: 'power3.in', onStart: () => { S.lean = dir * .26; } })
          .call(() => {
            const pt = new V((f.x + o.x) / 2, o.y + 1.05, .2);
            st.vfx.clash(pt, '#ffd670', '#c070ff', 1.32, true);
            st.vfx.slash(pt, dir, '#ffe07a', 1.48, 1);
            st.vfx.feathers(pt, 24, 290);
            this.sound?.sfx('thunder', .7);
            if (Math.abs(o.x - f.x) < 2.9 && o.state !== 'ko') this.hit(f, o, f.special.dmg * f.power, 2.8, true, '#ffd670');
          })
          .to(S, { lean: 0, duration: .24 });
        break;
      }
      case 'volley': {
        this.sound?.sfx('draw'); const col = f.id === 'indrajit' ? '#7aff9a' : (f.isHero ? '#ffe48a' : (f.color || '#ff7a30'));
        S.weaponCol = col;
        if (f.a.poses?.draw) S.pose = 'draw';
        gsap.timeline({ onComplete: done })
          .to(S, { lean: -dir * .05, aimArrow: 1, weaponGlow: .85, duration: .26, ease: 'power2.out' })
          .call(() => {
            for (let i = 0; i < 3; i++) setTimeout(() => { this.sound?.sfx('twang', .6); proj('arrow', col, (f.isHero ? f.special.dmg : 7 * f.power) / 3); }, i * 110);
          })
          .to(S, { lean: 0, aimArrow: 0, weaponGlow: 0, duration: .32 }, '+=.34');
        break;
      }
      case 'fireball': {
        this.sound?.sfx('fire'); st.vfx.charge(from(), '#ff6a2a', .45);
        S.weaponCol = '#ff6a2a';
        gsap.timeline({ onComplete: done }).to(S, { lean: -dir * .06, weaponGlow: 1, duration: .45 }).call(() => {
          this.sound?.sfx('whoosh');
          this.fx.play('fireball', this.scr(from()), this.scr(at()), { onHit: () => { if (Math.abs(at().x - o.x) < 1.5 && o.state !== 'ko') this.hit(f, o, f.isHero ? f.special.dmg : 9 * f.power, 1.4, false, '#ff6a2a'); } });
        }).to(S, { lean: 0, weaponGlow: 0, duration: .3 });
        break;
      }
      case 'boulder': {
        gsap.timeline({ onComplete: done }).to(S, { squash: .9, lean: -dir * .1, duration: .3 }).call(() => { this.sound?.sfx('swing'); st.vfx.projectile({ from: from().add(new V(0, .5, 0)), to: at(), kind: 'rock', onHit: p => { if (Math.abs(p.x - o.x) < 1.3 && o.state !== 'ko') this.hit(f, o, f.isHero ? f.special.dmg : 9 * f.power, 2, true, '#e0c8a0'); st.vfx.dust(p, 16, '#8a7258', 1.4); } }); }).to(S, { squash: 1, lean: 0, duration: .3 });
        break;
      }
      case 'slam': {
        f.vy = 5.5; this.sound?.sfx('whoosh');
        gsap.timeline({ onComplete: done }).to(S, { squash: 1.08, weaponGlow: 1, duration: .25 }).to({}, { duration: .3 }).call(() => {
          const p = new V(f.x + dir * .6, 0, 0); this.sound?.sfx('boom'); st.shake(1.2); st.vfx.shockwave(p, '#ffd27a', 4.5, .7); st.vfx.dust(p, 40, '#8a7258', 2.4); st.vfx.burst(p.clone().setY(.3), '#ffe2a0', 70, 6);
          if (Math.abs(o.x - p.x) < 2.8 && o.y < .5) this.hit(f, o, f.isHero ? f.special.dmg : 11 * f.power, 3, true);
        }).to(S, { squash: 1, weaponGlow: 0, duration: .25 });
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
  showStatus(html, mode = 'astra') {
    const el = this.$('.fy-status'), hud = this.$('.fy-hud');
    el.className = `fy-status ${mode}`;
    el.innerHTML = html;
    el.hidden = false;
    hud.classList.toggle('is-astra', mode === 'astra');
    hud.classList.toggle('is-victory', mode === 'victory');
    gsap.fromTo(el, { opacity: 0, y: -10, scale: .92 }, { opacity: 1, y: 0, scale: 1, duration: .42, ease: 'power3.out' });
  }
  hideStatus() {
    const el = this.$('.fy-status'), hud = this.$('.fy-hud');
    hud.classList.remove('is-astra');
    if (el.classList.contains('astra')) gsap.to(el, { opacity: 0, duration: .35, onComplete: () => { if (el.classList.contains('astra')) el.hidden = true; } });
  }
  astra(f, o) {
    const st = this.stage, S = f.a.state, dir = f.dir, A = f.astra || { name: 'Agneyāstra', kind: 'astra', color: '#ff4a1a', dmg: 30 };
    f.sh = 0; f.state = 'cast'; f.vx = 0; this.updateHud();
    this.sound?.sfx('astra');
    this.slow = .35;
    if (!this.isAir) st.vfx.rune(new V(f.x, 0, 0), A.color || '#ffd36b', 3.6, 2.4);
    S.weaponCol = A.color || '#ffd36b';
    const isBow = f.weapon === 'bow' || A.kind === 'astra';
    if (isBow && f.a.poses?.draw) S.pose = 'draw';
    if (A.kind === 'skyastra' && f.a.poses?.attack) S.pose = 'attack';
    gsap.to(S, { glow: 1, aimArrow: isBow ? 1 : 0, astraHalo: isBow ? 1 : 0, weaponGlow: 1, duration: .48 });
    this.showStatus(`<i></i><span>ASTRA ACTIVATED — <b>${A.name}</b></span><i></i>`, 'astra');
    this.camTo({ x: f.x + dir * .5, zoom: this.isAir ? .96 : 1.22 }, .48);
    const finish = () => {
      f.state = 'idle'; this.slow = 1; this.camLock = false;
      this.hideStatus();
      S.pose = 'idle';
      gsap.to(S, { glow: f.isHero && (f.id === 'rama') ? .2 : 0, aimArrow: 0, astraHalo: 0, weaponGlow: 0, duration: .85 });
    };
    setTimeout(() => {
      if (A.kind === 'skyastra') {
        // Jaṭāyu's Pakṣirāja Prāhāra: soaring golden lightning dive-clash shattering the stormy sky!
        this.camFit(.3).then(() => {
          const mid = new V((f.x + o.x) / 2, Math.max(f.y, o.y) + 1.0, .2);
          gsap.timeline()
            .to(f, { x: clamp(o.x - dir * 1.4, -ARENA, ARENA), y: o.y + .25, duration: .32, ease: 'power3.in' })
            .call(() => {
              st.vfx.clash(mid, '#ffd670', '#c470ff', 1.75, true);
              st.vfx.slash(mid, dir, '#ffe280', 1.85, 1);
              st.vfx.feathers(mid, 38, 340);
              this.fx.play('aindrastra', this.scr(new V(f.x, f.y + 1.1, 0)), this.scr(new V(o.x, o.y + 1.0, 0)), {
                onHit: () => {
                  st.aberr(.9); this.sound?.sfx('boom');
                  if (o.state !== 'ko') this.hit(f, o, A.dmg, 3.8, true, A.color);
                  finish();
                }
              });
            });
        });
        return;
      }
      if (A.kind === 'giant') { gsap.to(S, { sc: 1.75, duration: .8, ease: 'back.out(1.6)' }); f.buff = 7; st.vfx.shockwave(new V(f.x, 0, 0), '#ffb040', 6.5, .9); st.vfx.burst(new V(f.x, .3, 0), '#ffb040', 160, 7, { gravity: -1 }); this.sound?.sfx('swell'); st.shake(1.6); setTimeout(() => { finish(); this.attack(f, o, 'heavy'); }, 900); return; }
      if (A.kind === 'rockrain') { for (let i = 0; i < 10; i++) setTimeout(() => st.vfx.projectile({ from: new V(o.x + rand(-3.5, 1.5), 7.2, -1), to: new V(o.x + rand(-.9, .9), .35, 0), kind: 'rock', dur: .62, onHit: p => { const [sx, sy] = this.scr(p); this.fx.explosion(sx, sy, { scale: .85, color: 'ember', rgb: '255,170,76', floorY: st.floorY, shake: .55, flare: i % 3 === 0 }); st.scorch(p, '#ff9840', 1.2); if (i % 3 === 2 && o.state !== 'ko') this.hit(f, o, A.dmg / 3, 1.1, true); } }), i * 110); setTimeout(finish, 1350); return; }
      if (A.kind === 'slamwave' || A.kind === 'firewave') {
        const col = A.color; f.vy = 7;
        if (A.kind === 'firewave') {                           // Nīla, son of Agni: the fire of his father
          this.camFit(.25).then(() => this.fx.play('agneyastra', this.scr(new V(f.x + dir * .5, f.y + 1.2, .2)), this.scr(new V(o.x, o.y + 1, 0)), { onHit: () => { st.scorch(new V(o.x, 0, 0), '#ff6a2a', 2.4); st.vfx.dust(new V(o.x, 0, 0), 46, '#8a7258', 3); this.sound?.sfx('boom'); if (o.state !== 'ko') this.hit(f, o, A.dmg, 3.5, true, col); finish(); } }));
          return;
        }
        setTimeout(() => { const p = new V(f.x + dir, 0, 0); const [sx, sy] = this.scr(new V(o.x, .8, 0)); this.fx.explosion(sx, sy, { scale: 1.5, color: 'gold', rgb: '255,216,130', floorY: st.floorY, shake: 1.9, flare: true }); st.vfx.shockwave(p, col, 10, 1.1); st.vfx.pillar(new V(o.x, 0, 0), col, 24, 1.4); st.vfx.dust(p, 56, '#8a7258', 3.2); st.flash(col, .75); st.shake(2.0); this.sound?.sfx('boom'); if (o.state !== 'ko') this.hit(f, o, A.dmg, 3.5, true, col); finish(); }, 600);
        return;
      }
      const hp = new V(f.x + dir * .45, f.y + f.a.height * S.sc * .66, .2);
      const kind = /brahm/i.test(A.name) ? 'brahmastra' : /aindr/i.test(A.name) ? 'aindrastra' : 'agneyastra';
      setTimeout(() => {
        this.sound?.sfx(kind === 'aindrastra' ? 'thunder' : 'twang');
        // frame both warriors cleanly so the radiant arrow / lotus-mandala blasts across the whole arena
        this.camFit(.28).then(() => {
          gsap.to(S, { aimArrow: 0, astraHalo: 0, duration: .25 });
          const tgt = new V(o.x, o.y + o.a.height * o.a.state.sc * .55, 0);
          this.fx.play(kind, this.scr(hp), this.scr(tgt), { onHit: () => {
            if (!this.isAir) st.vfx.shockwave(new V(o.x, 0, 0), A.color, 7.5);
            st.aberr(.85); this.sound?.sfx('boom');
            if (o.state !== 'ko') this.hit(f, o, A.dmg, 4, true, A.color);
            finish();
          } });
        });
      }, 550);
    }, 520);
  }
  hit(f, o, dmg, kb, heavy, color = '#ffd8a0') {
    if (o.state === 'ko' || this.over) return;
    const st = this.stage, oS = o.a.state, p = new V(o.x, o.y + o.a.height * oS.sc * .58, .3);
    if (o.guard && Math.sign(f.x - o.x) === o.dir) {
      dmg *= .18; kb *= .3; st.vfx.burst(p, '#9fd0ff', 32, 4.2); const [gx, gy] = this.scr(p); this.fx.add(a => this.fx.shockRing(gx, gy, (16 + 74 * (a / .25)) * this.fx.k, '159,208,255', (1 - a / .25) * .85, 2), .26); this.sound?.sfx('clash', .8); o.sh = Math.min(100, o.sh + 4);
    } else {
      st.vfx.burst(p, color, heavy ? 96 : 48, heavy ? 6.8 : 4.4); st.vfx.flare(p, color, heavy ? 2.8 : 1.5, .36);
      if (o.id === 'jatayu' || f.id === 'jatayu') st.vfx.feathers(p, heavy ? 18 : 9, 250);
      if (heavy) { const [hx, hy] = this.scr(p); if (!this.isAir) { this.fx.debris(hx, hy, 12, 380, st.floorY); st.scorch(new V(o.x, 0, 0), color, 1.3); } }
      gsap.fromTo(oS, { flash: 1 }, { flash: 0, duration: .35 });
      this.sound?.sfx(heavy ? 'boom' : 'impact', heavy ? .85 : 1); st.shake(heavy ? 1.05 : .4);
      if (heavy) st.aberr(.7);
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
    this.over = true; o.state = 'ko'; const st = this.stage, oS = o.a.state, fS = f.a.state;
    // Clear live controls immediately so nothing can overlap the Victory / Retry panel
    this.$('.fy-astra-cta').hidden = true;
    this.$('.fy-help').hidden = true;
    this.$('.fy-touch').hidden = true;
    this.slow = .28; this.camTo({ x: (f.x + o.x) / 2, zoom: this.isAir ? .85 : 1.05 }, .45);
    this.sound?.sfx('thunder');
    oS.fly = false;
    gsap.to(oS, { tilt: -1.35, collapse: 1, y: 0, duration: 1.05, ease: 'power3.in', onComplete: () => { if (!this.isAir) st.vfx.dust(new V(o.x, 0, 0), 46, '#7a6a52', 2.2); st.shake(.9); this.sound?.sfx('thud'); } });
    await new Promise(r => setTimeout(r, 1050));
    this.slow = 1; this.active = false;
    if (o.isHero) {
      await this.banner('<small>दृढो भव</small>RISE AGAIN', 1.6);
      return this.retry();
    }
    // Cinematic On-Field Victory Ceremony (matching reference video 00:09):
    // heavenly golden sunbeam + ground halo on hero, collapsed foe, embossed VICTORY + glowing HUD mandala!
    this.camFit(.65);
    fS.victorious = !this.isAir; fS.aimArrow = 0; fS.astraHalo = 0; fS.pose = 'idle';
    gsap.to(fS, { glow: .55, lean: 0, duration: .7 });
    this.showStatus(`<span class="fy-vic-word">VICTORY</span>`, 'victory');
    st.vfx.ambient.petals = 1.8; this.sound?.sfx('petals'); this.sound?.sfx('conch');
    await new Promise(r => setTimeout(r, 2000));
    const last = this.stageIdx === LADDER[this.hero].length - 1;
    const truth = TRUTH[`${this.hero}-${o.id}`] || '';
    this.panel(`<h3>${last ? 'The path is complete' : `${FOES[o.id].name} falls`}</h3><p>${truth}</p>
      <div class="fy-btns">${last ? '<button data-a="select">Choose another warrior</button>' : '<button data-a="next">Next battle ▶</button>'}<button data-a="exit">Leave the field</button></div>`, true);
  }
  retry() { this.panel(`<h3>The battle is not yet won</h3><p>Even Rāma and Lakṣmaṇa fell to Indrajit’s arrows, and rose again. Gather your strength.</p><div class="fy-btns"><button data-a="retry">Fight again ▶</button><button data-a="select">Choose another warrior</button></div>`); }
  panel(html, compact = false) {
    const s = this.$('.fy-select');
    s.className = compact ? 'fy-select compact' : 'fy-select';
    s.hidden = false; s.innerHTML = `<div class="fy-panel">${html}</div>`;
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
    const tall = Math.max(this.p.a.height * this.p.a.state.sc, this.e.a.height * this.e.a.state.sc) + (this.isAir ? .55 : 0);
    const aspect = this.stage.W / this.stage.H;
    const padX = this.isAir ? 4.8 : 3.4;
    const z = clamp(Math.min(aspect * 4.6 / (dist + padX), (this.isAir ? .62 : .68) * 4.6 / (tall + .3)), .5, this.isAir ? .98 : 1.28);
    const k = 1 - Math.pow(.03, dt);
    c.x += (mid - c.x) * k; c.zoom += (z - c.zoom) * k;
  }
  // frame both warriors (as camera() would) and hold the camera there until released
  camFit(dur = .3) {
    const mid = (this.p.x + this.e.x) / 2, dist = Math.abs(this.p.x - this.e.x), aspect = this.stage.W / this.stage.H;
    const tall = Math.max(this.p.a.height * this.p.a.state.sc, this.e.a.height * this.e.a.state.sc) + (this.isAir ? .55 : 0);
    const padX = this.isAir ? 4.8 : 3.4;
    const zoom = clamp(Math.min(aspect * 4.6 / (dist + padX), (this.isAir ? .62 : .68) * 4.6 / (tall + .3)), .5, this.isAir ? .98 : 1.28);
    const c = this.stage.cam; gsap.killTweensOf(c); clearTimeout(this._camT); this.camLock = true;
    if (!dur) { Object.assign(c, { x: mid, zoom }); return Promise.resolve(); }
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
    const armed = !!(this.p && this.p.sh >= 100 && !this.over && this.p.state !== 'cast');
    this.$('.fy-help .fy-key.astra')?.classList.toggle('ready', armed);
    this.$('.fy-touch [data-k="astra"]')?.classList.toggle('ready', armed);
    const cta = this.$('.fy-astra-cta');
    if (cta) {
      const wasHidden = cta.hidden;
      cta.hidden = !armed;
      if (armed && wasHidden) gsap.fromTo(cta, { opacity: 0, y: 12, scale: .88 }, { opacity: 1, y: 0, scale: 1, duration: .35, ease: 'back.out(1.7)' });
    }
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
