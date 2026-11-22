// The Great Duels of the Epic, staged as fights (2026-11-22): each duel in its own place — Tāṭakā's forest at dusk, the
// altar at Siddhāśrama by night, the sky over Daṇḍaka, the rocks of Kiṣkindhā, the Aśoka grove, the field before Laṅkā
// with the two armies at war behind the duel — and each round acted out as its text tells it: arrows, boulders, fire,
// blows, illusion, the astra that ends it, and the fall. Nothing is wounded on screen: blows and astras land as light,
// and the vanquished fall. Drawn on the painted stage of the Dharma Yuddha (js/fight2d.js) with js/astra-fx.js.
import { Stage2D, V } from './fight2d.js';

const gsap = window.gsap;
const wait = s => new Promise(r => setTimeout(r, s * 1000));
const PROXY = { virupaksha: 'khara', mahodara: 'prahasta', narantaka: 'subahu', mahaparshva: 'prahasta' };

// where each duel is fought
const SET = {
  'rama-tataka': 'dandaka/dusk', 'rama-subahu': 'yajna/night', 'jatayu-ravana': 'sky/storm', 'rama-khara': 'dandaka/dusk',
  'vali-sugriva': 'rocks/dusk', 'hanuman-aksha': 'ashoka/day', 'nila-prahasta': 'field', 'rama-kumbhakarna': 'field/dusk',
  'lakshmana-atikaya': 'field', 'lakshmana-indrajit': 'field/night', 'rama-ravana': 'field/dusk'
};
// the hosts at war behind the duel (the shapes of the vānara and rākṣasa warriors, never a named hero in the light)
const VANARAS = ['angada', 'nala', 'jambavan', 'nila', 'sugriva'], RAKSHASAS = ['dushana', 'viradha', 'sumali', 'subahu', 'khara'];
const WAR = {
  'nila-prahasta': [VANARAS, RAKSHASAS], 'rama-kumbhakarna': [VANARAS, RAKSHASAS], 'lakshmana-atikaya': [VANARAS, RAKSHASAS],
  'lakshmana-indrajit': [VANARAS, RAKSHASAS], 'rama-ravana': [VANARAS, RAKSHASAS], 'rama-khara': [[], ['dushana', 'viradha', 'sumali', 'subahu']]
};
const SIZE = { kumbhakarna: 1.5, ravana: 1.1, atikaya: 1.12, tataka: 1.12, khara: 1.05, jatayu: 1.04 };
const COLOR = {
  rama: '#ffd36b', lakshmana: '#9fd7ff', hanuman: '#ffb040', sugriva: '#ffcf6a', nila: '#ff7a3a', jatayu: '#ffe290',
  ravana: '#ff521a', atikaya: '#ff5e1e', indrajit: '#b45cff', kumbhakarna: '#ff7828', subahu: '#ff5a1a',
  prahasta: '#ff5e1e', khara: '#ff6420', tataka: '#ff7028', akshakumara: '#ff8a36', vali: '#ffb844', mareecha: '#e07a32'
};

// each round, as its text tells it: [who, what, at whom]
const CHOREO = {
  'rama-tataka': [
    [['tataka', 'roar'], ['tataka', 'rocks', 'rama']],
    [['tataka', 'vanish', 'rama'], ['rama', 'volley', 'tataka']],
    [['rama', 'arrow', 'tataka']]],
  'rama-subahu': [
    [['mareecha', 'leap', 'rama'], ['subahu', 'fire', 'rama']],
    [['rama', 'manava', 'mareecha']],
    [['rama', 'astra:agneyastra', 'subahu']]],
  'jatayu-ravana': [
    [['jatayu', 'roar'], ['ravana', 'roar'], ['jatayu', 'sky-clash', 'ravana']],
    [['jatayu', 'leap', 'ravana'], ['jatayu', 'sky-clash', 'ravana'], ['jatayu', 'charge', 'ravana']],
    [['ravana', 'fire', 'jatayu'], ['ravana', 'sky-clash', 'jatayu'], ['ravana', 'charge', 'jatayu']]],
  'rama-khara': [
    [['khara', 'roar'], ['rama', 'glow']],
    [['rama', 'circle', 'khara']],
    [['khara', 'rocks', 'rama'], ['rama', 'astra:aindrastra', 'khara']]],
  'vali-sugriva': [
    [['vali', 'charge', 'sugriva'], ['sugriva', 'charge', 'vali'], ['vali', 'charge', 'sugriva']],
    [['sugriva', 'roar'], ['vali', 'roar']],
    [['vali', 'charge', 'sugriva'], ['@rama', 'arrow', 'vali']]],
  'hanuman-aksha': [
    [['akshakumara', 'volley', 'hanuman']],
    [['hanuman', 'leap', 'akshakumara'], ['akshakumara', 'volley', 'hanuman'], ['hanuman', 'charge', 'akshakumara']],
    [['hanuman', 'whirl', 'akshakumara']]],
  'nila-prahasta': [
    [['prahasta', 'volley', 'nila']],
    [['nila', 'glow'], ['nila', 'rocks', 'prahasta']],
    [['prahasta', 'charge', 'nila'], ['nila', 'boulder', 'prahasta']]],
  'rama-kumbhakarna': [
    [['kumbhakarna', 'roar'], ['kumbhakarna', 'charge', 'rama']],
    [['kumbhakarna', 'hurt'], ['kumbhakarna', 'roar']],
    [['rama', 'volley', 'kumbhakarna'], ['rama', 'gust', 'kumbhakarna']],
    [['rama', 'astra:aindrastra', 'kumbhakarna']]],
  'lakshmana-atikaya': [
    [['atikaya', 'roar'], ['atikaya', 'volley', 'lakshmana']],
    [['lakshmana', 'astra:agneyastra', 'atikaya'], ['atikaya', 'shield']],
    [['lakshmana', 'astra:brahmastra', 'atikaya']]],
  'lakshmana-indrajit': [
    [['lakshmana', 'charge', 'indrajit']],
    [['indrajit', 'fire', 'lakshmana'], ['lakshmana', 'astra:agneyastra', 'indrajit']],
    [['lakshmana', 'volley', 'indrajit'], ['indrajit', 'vanish', 'lakshmana']],
    [['lakshmana', 'astra:aindrastra', 'indrajit']]],
  'rama-ravana': [
    [['ravana', 'fire', 'rama'], ['rama', 'volley', 'ravana']],
    [['rama', 'chant']],
    [['rama', 'volley', 'ravana'], ['ravana', 'fire', 'rama'], ['rama', 'volley', 'ravana']],
    [['rama', 'astra:brahmastra', 'ravana']]]
};

export class DuelTheatre {
  constructor(el, { sound, art }) {
    this.el = el; this.sound = sound;
    const host = document.createElement('div'); host.className = 'dl-stage';
    const fx = document.createElement('canvas'); fx.className = 'dl-fx';
    el.prepend(fx); el.prepend(host);
    this.stage = new Stage2D(host, fx, { sound }); this.stage.art = art; this.stage.proxy = PROXY;
    this.fx = this.stage.fx;
  }
  async open(d) {
    this.d = d; this.busy = true; this.stage.fx.clear();
    const arena = SET[d.id] || 'field';
    const isSky = arena === 'sky/storm';
    // on an upright screen the two stand closer, so both are seen whole
    const up = this.stage.W < this.stage.H, L = up ? 38 : (isSky ? 24 : 28), R = up ? 62 : (d.rightAlt ? 66 : (isSky ? 76 : 72)), R2 = up ? 72 : 82;
    const cast = `${d.left}@${L} ${d.right}@${R}${d.rightAlt ? ` ${d.rightAlt}@${R2}` : ''}`;
    this.stage.envKey = null;
    await this.stage.play({ script: `${arena} | ${cast} |` });
    for (const [id, a] of this.stage.actors) {
      a.state.sc = SIZE[id] || 1; a.color = COLOR[id] || '#ffd36b';
      a.face(id === d.left ? 'R' : 'L'); a.home = a.state.x; a.homeY = 0;
      if (isSky) {
        a.state.fly = true;
        a.homeY = a.state.y = id === 'jatayu' ? .5 : .42;
        if (id === 'ravana') a.state.fireAura = 1;
      }
    }
    const hasWar = !!WAR[d.id];
    const isField = arena.startsWith('field');
    this.stage.setWar({ intensity: isSky ? 1.1 : (isField ? 1.15 : (hasWar ? .85 : .68)), storm: true, fires: !isSky });
    await this.stage.war(hasWar ? [WAR[d.id][0].filter(id => id !== d.left), WAR[d.id][1].filter(id => id !== d.right && id !== d.rightAlt)] : null);
    this.fit(0); this.stage.start(); this.busy = false;
  }
  close() { this.stage.stop(); this.stage.ranks = []; }
  A(id) { return this.stage.actors.get(id); }
  // the camera holds every warrior (full eagle wingspan & full golden chariot!) in view with zero HUD/text overlap
  fit(dur = .6) {
    const xs = [...this.stage.actors.values()].filter(a => a.state.op > .05 || dur === 0).map(a => a.state.x);
    if (!xs.length) return;
    const lo = Math.min(...xs), hi = Math.max(...xs), aspect = this.stage.W / this.stage.H, air = this.stage.isAir;
    const tall = Math.max(...[...this.stage.actors.values()].map(a => a.height * a.state.sc + (a.homeY || 0) * .55));
    const up = aspect < 1, padX = up ? 2.4 : (air ? 6.4 : 3.5);
    const zoom = Math.max(up ? .34 : .44, Math.min(air ? .94 : 1.18, aspect * 4.6 / (hi - lo + padX), (air ? .64 : .7) * 4.6 / (tall + .3)));
    const c = this.stage.cam; gsap.killTweensOf(c);
    if (!dur) Object.assign(c, { x: (lo + hi) / 2, zoom }); else gsap.to(c, { x: (lo + hi) / 2, zoom, duration: dur, ease: 'power2.inOut' });
  }
  chest(a, k = .58) { return new V(a.state.x, a.state.y + a.height * a.state.sc * k, 0); }
  hitFlash(t, color = '#ffd8a0', heavy = false) {
    if (!t) return; const S = t.state;
    gsap.fromTo(S, { flash: 1 }, { flash: 0, duration: .4 });
    const pt = this.chest(t);
    this.stage.vfx.burst(pt, color, heavy ? 96 : 46, heavy ? 7.0 : 4.4);
    if (t.id === 'jatayu') this.stage.vfx.feathers(pt, heavy ? 22 : 12, heavy ? 280 : 180);
    if (heavy) {
      const [sx, sy] = this.stage.toScreen(pt);
      if (!this.stage.isAir) this.fx.debris(sx, sy, 14, 420, this.stage.floorY);
      this.stage.vfx.flare(pt, color, 2.5, .4);
      if (!this.stage.isAir) this.stage.scorch(new V(S.x, 0, 0), color, 1.35);
      this.stage.aberr(.6);
    }
    this.stage.shake(heavy ? 1.05 : .45);
    // a recoil, and back to where they stood (or hovered in aerial combat)
    const home = t.home ?? S.x; gsap.timeline().to(S, { x: home + (t.dir < 0 ? .38 : -.38), lean: t.dir * -.09, duration: .12, ease: 'power2.out' }).to(S, { x: home, lean: 0, duration: .5, ease: 'power2.inOut' });
    this.sound?.sfx?.(heavy ? 'boom' : 'impact', heavy ? .8 : 1);
  }
  async round(i) {
    this.busy = true;
    for (const step of (CHOREO[this.d.id] || [])[i] || []) { await this.step(...step); await wait(.25); }
    this.busy = false;
  }
  async step(who, what, at) {
    const st = this.stage, vfx = st.vfx, fx = this.fx, t = this.A(at);
    if (who === '@rama') {                                  // an arrow from beyond the frame (Rāma among the trees)
      const c = st.cam, from = new V(c.x - st.W / st.ppm / 2 - .5, 1.6, 0);
      this.sound?.sfx?.('twang');
      await new Promise(res => vfx.projectile({ from, to: this.chest(t), kind: 'arrow', color: '#ffe9a8', dur: .5, onHit: () => { this.hitFlash(t, '#fff1c1', true); fx.hit(.3, '255,236,190', 1); res(); } }));
      return;
    }
    const a = this.A(who); if (!a) return; const S = a.state, dir = a.dir, homeY = a.homeY || 0;
    switch (what) {
      case 'roar': {
        this.sound?.sfx?.('roar'); st.shake(.5);
        if (a.poses?.attack) S.pose = 'attack';
        if (a.id === 'jatayu') vfx.feathers(this.chest(a), 14, 190);
        await new Promise(res => gsap.timeline({ onComplete: () => { S.pose = 'idle'; res(); } }).to(S, { squash: 1.06, glow: .65, weaponGlow: .9, duration: .3 }).to(S, { squash: 1, glow: 0, weaponGlow: 0, duration: .6 }));
        break;
      }
      case 'glow': { this.sound?.sfx?.('chime'); vfx.rune(new V(S.x, 0, 0), a.color, 3, 1.6); await new Promise(res => gsap.to(S, { glow: .8, duration: .6, yoyo: true, repeat: 1, onComplete: res })); break; }
      case 'chant': {                                       // the Ādityahṛdayam: the sun's light gathers round Rāma
        this.sound?.chantHit?.(); vfx.rune(new V(S.x, 0, 0), '#ffd36b', 3.6, 3);
        const [x, y] = st.toScreen(this.chest(a, .7));
        fx.add(u => { const e = Math.sin(Math.PI * Math.min(1, u / 2.6)); fx.sunAt(x, y, 300 * fx.k * (.6 + .4 * e), e * .8, u * .2); }, 2.6);
        await new Promise(res => gsap.to(S, { glow: 1, duration: 1.2, yoyo: true, repeat: 1, onComplete: res }));
        break;
      }
      case 'sky-clash': {                                   // aerial storm collision: Jaṭāyu & Rāvaṇa's blazing chariot collide mid-sky!
        const T = t.state, midX = (a.home + t.home) / 2, midY = Math.max(homeY, t.homeY || 0) + .24;
        this.sound?.sfx?.('whoosh');
        S.weaponCol = a.color; T.weaponCol = t.color;
        if (a.poses?.attack) S.pose = 'attack';
        if (t.poses?.attack) T.pose = 'attack';
        await new Promise(res => gsap.timeline({ onComplete: () => { S.pose = 'idle'; T.pose = 'idle'; res(); } })
          .to(S, { x: midX - dir * .95, y: midY + .18, lean: dir * .2, weaponGlow: 1, duration: .38, ease: 'power3.in' }, 0)
          .to(T, { x: midX + dir * .95, y: midY, lean: -dir * .16, weaponGlow: 1, duration: .38, ease: 'power3.in' }, 0)
          .call(() => {
            const pt = new V(midX, midY + 1.05, 0);
            vfx.clash(pt, '#ffd670', '#c070ff', 1.45, true);
            vfx.slash(pt, dir, a.color, 1.55, 1);
            vfx.slash(pt, -dir, t.color, 1.55, 1);
            vfx.feathers(pt, 28, 320);
            this.sound?.sfx?.('thunder'); this.sound?.sfx?.('boom', .85);
            st.shake(1.35); st.aberr(.75);
            gsap.fromTo(T, { flash: .9 }, { flash: 0, duration: .35 });
            gsap.fromTo(S, { flash: .65 }, { flash: 0, duration: .3 });
          })
          .to(S, { x: a.home, y: homeY, lean: 0, weaponGlow: 0, duration: .58, ease: 'power2.out' }, '+=.16')
          .to(T, { x: t.home, y: t.homeY || 0, lean: 0, weaponGlow: 0, duration: .58, ease: 'power2.out' }, '<'));
        break;
      }
      case 'charge': {                                      // rushes in and strikes, and falls back
        const to = t.state.x - dir * (st.isAir ? 1.85 : (1.15 + (t.state.sc - 1) * .6));
        this.sound?.sfx?.('whoosh'); S.weaponCol = a.color;
        if (a.poses?.attack) S.pose = 'attack';
        await new Promise(res => gsap.timeline({ onComplete: () => { S.pose = 'idle'; res(); } })
          .to(S, { x: to, y: (t.homeY || 0), lean: dir * .14, gait: S.fly ? 0 : 1, weaponGlow: 1, duration: .45, ease: 'power2.in', onUpdate: () => { if (!S.fly) S.phase += .5; } })
          .to(S, { lean: -dir * .1, squash: .96, duration: .1 })
          .to(S, { lean: dir * .24, squash: 1.04, duration: .08, onComplete: () => { vfx.slash(this.chest(a, .62).add(new V(dir * (st.isAir ? .7 : .4), 0, 0)), dir, a.color, 1.38 * S.sc, 1); this.hitFlash(t, a.color, true); } })
          .to(S, { lean: 0, squash: 1, gait: 0, weaponGlow: 0, duration: .2 })
          .to(S, { x: a.home, y: homeY, duration: .6, ease: 'power2.inOut' }, '+=.15'));
        break;
      }
      case 'leap': {                                        // up into the air and down upon the foe
        this.sound?.sfx?.('whoosh'); S.weaponCol = a.color;
        if (a.poses?.attack) S.pose = 'attack';
        await new Promise(res => gsap.timeline({ onComplete: () => { S.pose = 'idle'; res(); } })
          .to(S, { y: homeY + (st.isAir ? 1.05 : 1.65), x: (S.x + t.state.x) / 2, lean: dir * .18, weaponGlow: 1, duration: .42, ease: 'power2.out' })
          .to(S, { y: (t.homeY || 0) + .22, x: t.state.x - dir * (st.isAir ? 1.6 : 1), lean: dir * .24, duration: .3, ease: 'power2.in', onComplete: () => { vfx.slash(this.chest(a).add(new V(dir * (st.isAir ? .65 : .32), 0, 0)), dir, a.color, 1.42, 1); this.hitFlash(t, a.color, true); if (!st.isAir) vfx.dust(new V(S.x, 0, 0), 18); } })
          .to(S, { y: homeY, lean: 0, weaponGlow: 0, duration: .18 }).to(S, { x: a.home, duration: .6, ease: 'power2.inOut' }, '+=.2'));
        break;
      }
      case 'vanish': {                                      // gone by sorcery, and striking from another side
        this.sound?.sfx?.('chime');
        await new Promise(res => gsap.timeline({ onComplete: res })
          .to(S, { dissolve: 1, duration: .35, onComplete: () => { S.x = t.state.x + t.dir * 1.2; S.y = .8; } })
          .to(S, { dissolve: 0, duration: .3 })
          .call(() => { vfx.slash(this.chest(a), -dir, a.color, 1.25, 1); this.hitFlash(t, '#d9a0ff'); })
          .to(S, { y: homeY, duration: .2 }).to(S, { dissolve: 1, duration: .3, onComplete: () => { S.x = a.home; } }).to(S, { dissolve: 0, duration: .35 }));
        break;
      }
      case 'volley': case 'circle': {                       // arrows (Rāma's circle of fire: a storm of them, into the host too)
        const n = what === 'circle' ? 14 : 4; this.sound?.sfx?.('draw');
        S.weaponCol = a.color; if (a.poses?.draw) S.pose = 'draw';
        gsap.to(S, { glow: .55, aimArrow: 1, weaponGlow: .85, duration: .28 });
        for (let k = 0; k < n; k++) {
          await wait(what === 'circle' ? .07 : .14); this.sound?.sfx?.('twang', .5);
          const into = what === 'circle' && k % 2 && st.ranks.length ? st.ranks[(Math.random() * st.ranks.length) | 0] : null;
          const to = into ? new V(into.x, 1 + into.depth, 0) : this.chest(t, .45 + Math.random() * .25);
          vfx.projectile({ from: this.chest(a, .62).add(new V(dir * .35, 0, 0)), to, kind: 'arrow', color: a.color, onHit: () => { if (!into) this.hitFlash(t, a.color); else vfx.burst(to, '#ffd36b', 16, 3); } });
        }
        await wait(.55); S.pose = 'idle'; gsap.to(S, { glow: 0, aimArrow: 0, weaponGlow: 0, duration: .45 });
        break;
      }
      case 'rocks': case 'boulder': {
        const n = what === 'boulder' ? 1 : 3; this.sound?.sfx?.('swing');
        for (let k = 0; k < n; k++) {
          await new Promise(res => { gsap.to(S, { squash: .92, lean: -dir * .1, duration: .2, yoyo: true, repeat: 1 });
            vfx.projectile({ from: this.chest(a, .9), to: this.chest(t, .5), kind: 'rock', dur: what === 'boulder' ? .8 : .6, onHit: () => { this.hitFlash(t, '#e0c8a0', what === 'boulder'); vfx.dust(new V(t.state.x, 0, 0), what === 'boulder' ? 40 : 16); res(); } }); });
        }
        break;
      }
      case 'fire': {
        this.sound?.sfx?.('fire'); S.weaponCol = '#ff6a2a'; gsap.to(S, { weaponGlow: 1, duration: .35 });
        vfx.charge(this.chest(a, .62), '#ff6a2a', .4); await wait(.4);
        await fx.play('fireball', st.toScreen(this.chest(a, .62)), st.toScreen(this.chest(t)), { onHit: () => this.hitFlash(t, '#ff6a2a', true) });
        gsap.to(S, { weaponGlow: 0, duration: .35 });
        break;
      }
      case 'arrow': {                                       // the one arrow that ends it
        this.sound?.sfx?.('draw'); S.weaponCol = '#ffe9a8';
        if (a.poses?.draw) S.pose = 'draw';
        await new Promise(res => gsap.to(S, { glow: 1, aimArrow: 1, astraHalo: .85, lean: -dir * .05, duration: .65, onComplete: res }));
        vfx.charge(this.chest(a, .62), '#ffe9a8', .48); await wait(.48); this.sound?.sfx?.('twang');
        gsap.to(S, { aimArrow: 0, astraHalo: 0, duration: .2 });
        await new Promise(res => vfx.projectile({ from: this.chest(a, .62).add(new V(dir * .35, 0, 0)), to: this.chest(t), kind: 'astra', color: '#ffe9a8', dur: .42, onHit: () => { this.hitFlash(t, '#fff1c1', true); fx.hit(.35, '255,236,190', 1.2); vfx.flare(this.chest(t), '#ffd36b', 5, .8); res(); } }));
        S.pose = 'idle';
        gsap.to(S, { glow: a.id === 'rama' ? .2 : 0, lean: 0, duration: .8 });
        break;
      }
      case 'manava': {                                      // the Mānavāstra: Mārīca is hurled far away, alive
        this.sound?.sfx?.('astra'); S.weaponCol = '#bfe4ff';
        if (a.poses?.draw) S.pose = 'draw';
        gsap.to(S, { aimArrow: 1, astraHalo: .8, duration: .4 });
        vfx.charge(this.chest(a, .62), '#bfe4ff', .6); await wait(.6);
        gsap.to(S, { aimArrow: 0, astraHalo: 0, duration: .2 });
        await new Promise(res => vfx.projectile({ from: this.chest(a, .62), to: this.chest(t), kind: 'astra', color: '#bfe4ff', dur: .4, onHit: () => { this.hitFlash(t, '#bfe4ff', true); res(); } }));
        S.pose = 'idle';
        await new Promise(res => gsap.to(t.state, { x: t.state.x + 14, y: 3, tilt: 2, op: 0, duration: 1.1, ease: 'power2.in', onComplete: res }));
        this.fit(.8);
        break;
      }
      case 'whirl': {                                       // Hanumān seizes the prince, whirls him and dashes him down
        const T = t.state;
        await new Promise(res => gsap.timeline({ onComplete: res })
          .to(S, { x: T.x - dir * 1, duration: .35, ease: 'power2.in' })
          .to(T, { y: 1.6, duration: .3 })
          .to(T, { tilt: dir * 6.283 * 2, duration: .9, ease: 'none' })
          .to(T, { y: 0, tilt: 0, duration: .18, ease: 'power3.in', onComplete: () => { this.hitFlash(t, '#ffb040', true); vfx.dust(new V(T.x, 0, 0), 50, '#8a7258', 2.2); vfx.shockwave(new V(T.x, 0, 0), '#ffd27a', 5); this.stage.shake(1.4); } })
          .to(S, { x: a.home, duration: .7 }, '+=.3'));
        break;
      }
      case 'gust': {                                        // the Vāyavyāstra: the wind of Vāyu
        this.sound?.sfx?.('whoosh'); vfx.shockwave(new V(S.x, 0, 0), '#cfe8ff', 9, 1);
        for (let k = 0; k < 8; k++) vfx.projectile({ from: this.chest(a, .4 + k * .05), to: this.chest(t, .3 + k * .07), kind: 'arrow', color: '#cfe8ff', dur: .35 + k * .03 });
        await wait(.55); this.hitFlash(t, '#cfe8ff', true); await wait(.4);
        break;
      }
      case 'hurt': { this.hitFlash(a, '#ffd36b', true); vfx.burst(this.chest(a, .9), '#ffb040', 40, 4); await wait(.5); break; }
      case 'shield': {                                      // Brahmā's armour turns the astra aside
        const [x, y] = st.toScreen(this.chest(a)); this.sound?.sfx?.('chime');
        fx.add(u => { const e = 1 - u / 1.1; fx.glow(x, y, 160 * fx.k * (1 + u * .3), 'gold', e * .7); fx.ring(x, y, 130 * fx.k, '255,214,120', e, 16, 1, u); }, 1.1);
        await wait(1);
        break;
      }
      default:
        if (what.startsWith('astra:')) {
          const kind = what.slice(6); this.sound?.sfx?.(kind === 'aindrastra' ? 'thunder' : 'astra'); this.sound?.chantHit?.();
          S.weaponCol = kind === 'brahmastra' ? '#ffd36b' : (kind === 'aindrastra' ? '#9fd7ff' : '#ff6a2a');
          if (a.poses?.draw) S.pose = 'draw';
          vfx.rune(new V(S.x, 0, 0), S.weaponCol, 3.4, 2.6);
          gsap.to(S, { glow: 1, aimArrow: 1, astraHalo: 1, weaponGlow: 1, duration: .48 }); await wait(.52);
          gsap.to(S, { aimArrow: 0, astraHalo: 0, duration: .25 });
          await fx.play(kind, st.toScreen(this.chest(a, .62).add(new V(dir * .35, 0, 0))), st.toScreen(this.chest(t)), { onHit: () => { this.hitFlash(t, S.weaponCol, true); if (!st.isAir) vfx.shockwave(new V(t.state.x, 0, 0), S.weaponCol, 7.2); } });
          S.pose = 'idle';
          gsap.to(S, { glow: a.id === 'rama' ? .2 : 0, weaponGlow: 0, duration: 1 }); await wait(.6);
        }
    }
  }
  // the end of the duel: the vanquished collapse to the ground and ascend in golden light; the victor stands bathed in a golden heavenly sunbeam
  async outcome(fallen, dharma) {
    const vfx = this.stage.vfx;
    for (const id of fallen) {
      const a = this.A(id); if (!a || a.state.op < .05) continue;
      const S = a.state;
      S.fly = false;
      this.sound?.sfx?.('thud');
      if (id === 'jatayu') vfx.feathers(this.chest(a), 32, 240);
      gsap.timeline()
        .to(S, { tilt: -1.15, collapse: 1, squash: .92, y: 0, duration: .78, ease: 'power2.in', onComplete: () => { if (!this.stage.isAir) vfx.dust(new V(S.x, 0, 0), 38, '#7a6a52', 1.9); this.stage.shake(.75); } })
        .to(S, { glow: 1, duration: .65 }, '+=.4')
        .call(() => { vfx.flare(this.chest(a, .6), '#fff1c1', 4, 1.2); vfx.burst(this.chest(a, .7), '#ffe2a0', 90, 3, { gravity: -1 }); vfx.pillar(new V(S.x, 0, 0), '#ffe2a0', 22, 1.8); })
        .to(S, { dissolve: 1, duration: 1.4, ease: 'sine.inOut' });
      await wait(.4);
    }
    if (dharma) {
      const hero = this.A(this.d.left);
      if (hero && !this.stage.isAir) { hero.state.victorious = true; gsap.to(hero.state, { glow: .55, duration: .7 }); }
      await wait(1.3); vfx.ambient.petals = 1.8; this.sound?.sfx?.('petals');
    }
  }
}
