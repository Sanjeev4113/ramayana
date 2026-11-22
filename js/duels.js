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
  'rama-tataka': 'dandaka/dusk', 'rama-subahu': 'yajna/night', 'jatayu-ravana': 'forest/dusk', 'rama-khara': 'dandaka/dusk',
  'vali-sugriva': 'rocks/dusk', 'hanuman-aksha': 'ashoka/day', 'nila-prahasta': 'field', 'rama-kumbhakarna': 'field/dusk',
  'lakshmana-atikaya': 'field', 'lakshmana-indrajit': 'field/night', 'rama-ravana': 'field/dusk'
};
// the hosts at war behind the duel (the shapes of the vānara and rākṣasa warriors, never a named hero in the light)
const VANARAS = ['sushena', 'nala', 'jambavan', 'angada'], RAKSHASAS = ['dushana', 'viradha', 'sumali', 'subahu', 'khara'];
const WAR = {
  'nila-prahasta': [VANARAS, RAKSHASAS], 'rama-kumbhakarna': [VANARAS, RAKSHASAS], 'lakshmana-atikaya': [VANARAS, RAKSHASAS],
  'lakshmana-indrajit': [VANARAS, RAKSHASAS], 'rama-ravana': [VANARAS, RAKSHASAS], 'rama-khara': [[], ['dushana', 'viradha', 'sumali', 'subahu']]
};
const SIZE = { kumbhakarna: 1.5, ravana: 1.12, atikaya: 1.22, tataka: 1.12, khara: 1.05, jatayu: 1.05 };
const COLOR = { rama: '#ffd36b', lakshmana: '#9fd7ff', hanuman: '#ffb040', sugriva: '#ffcf6a', nila: '#ff7a3a', jatayu: '#ffe2a0' };

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
    [['jatayu', 'roar'], ['ravana', 'roar']],
    [['jatayu', 'leap', 'ravana'], ['jatayu', 'charge', 'ravana']],
    [['ravana', 'charge', 'jatayu']]],
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
    // on an upright screen the two stand closer, so both are seen whole
    const up = this.stage.W < this.stage.H, L = up ? 38 : 28, R = up ? 62 : (d.rightAlt ? 66 : 72), R2 = up ? 72 : 82;
    const cast = `${d.left}@${L} ${d.right}@${R}${d.rightAlt ? ` ${d.rightAlt}@${R2}` : ''}`;
    this.stage.envKey = null;
    await this.stage.play({ script: `${SET[d.id] || 'field'} | ${cast} |` });
    for (const [id, a] of this.stage.actors) {
      a.state.sc = SIZE[id] || 1; a.color = COLOR[id] || '#ffd36b';
      a.face(id === d.left ? 'R' : 'L'); a.home = a.state.x;
    }
    await this.stage.war(WAR[d.id] ? [WAR[d.id][0], WAR[d.id][1]] : null);
    this.fit(0); this.stage.start(); this.busy = false;
  }
  close() { this.stage.stop(); this.stage.ranks = []; }
  A(id) { return this.stage.actors.get(id); }
  // the camera holds every warrior in view, with room around them
  fit(dur = .6) {
    const xs = [...this.stage.actors.values()].filter(a => a.state.op > .05 || dur === 0).map(a => a.state.x);
    if (!xs.length) return;
    const lo = Math.min(...xs), hi = Math.max(...xs), aspect = this.stage.W / this.stage.H;
    const tall = Math.max(...[...this.stage.actors.values()].map(a => a.height * a.state.sc));
    const up = aspect < 1, zoom = Math.max(up ? .34 : .5, Math.min(1.25, aspect * 4.6 / (hi - lo + (up ? 2.2 : 3.4)), .72 * 4.6 / (tall + .3)));
    const c = this.stage.cam; gsap.killTweensOf(c);
    if (!dur) Object.assign(c, { x: (lo + hi) / 2, zoom }); else gsap.to(c, { x: (lo + hi) / 2, zoom, duration: dur, ease: 'power2.inOut' });
  }
  chest(a, k = .58) { return new V(a.state.x, a.state.y + a.height * a.state.sc * k, 0); }
  hitFlash(t, color = '#ffd8a0', heavy = false) {
    if (!t) return; const S = t.state;
    gsap.fromTo(S, { flash: 1 }, { flash: 0, duration: .4 });
    this.stage.vfx.burst(this.chest(t), color, heavy ? 70 : 36, heavy ? 6 : 4); this.stage.shake(heavy ? .9 : .4);
    // a recoil, and back to where they stood (a host of blows never drives anyone off the field)
    const home = t.home ?? S.x; gsap.timeline().to(S, { x: home + (t.dir < 0 ? .35 : -.35), lean: t.dir * -.08, duration: .12, ease: 'power2.out' }).to(S, { x: home, lean: 0, duration: .5, ease: 'power2.inOut' });
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
    const a = this.A(who); if (!a) return; const S = a.state, dir = a.dir;
    switch (what) {
      case 'roar': {
        this.sound?.sfx?.('roar'); st.shake(.5);
        await new Promise(res => gsap.timeline({ onComplete: res }).to(S, { squash: 1.06, glow: .6, duration: .3 }).to(S, { squash: 1, glow: 0, duration: .6 }));
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
      case 'charge': {                                      // rushes in and strikes, and falls back
        const to = t.state.x - dir * (1.15 + (t.state.sc - 1) * .6);
        this.sound?.sfx?.('whoosh');
        await new Promise(res => gsap.timeline({ onComplete: res })
          .to(S, { x: to, lean: dir * .12, gait: 1, duration: .45, ease: 'power2.in', onUpdate: () => { S.phase += .5; } })
          .to(S, { lean: -dir * .1, squash: .96, duration: .1 })
          .to(S, { lean: dir * .22, squash: 1.04, duration: .08, onComplete: () => { vfx.slash(this.chest(a, .62).add(new V(dir * .4, 0, 0)), dir, a.color, 1.2 * S.sc); this.hitFlash(t, a.color, true); } })
          .to(S, { lean: 0, squash: 1, gait: 0, duration: .2 })
          .to(S, { x: a.home, duration: .6, ease: 'power2.inOut' }, '+=.15'));
        break;
      }
      case 'leap': {                                        // up into the air and down upon the foe
        this.sound?.sfx?.('whoosh');
        await new Promise(res => gsap.timeline({ onComplete: res })
          .to(S, { y: 1.8, x: (S.x + t.state.x) / 2, duration: .45, ease: 'power2.out' })
          .to(S, { y: .3, x: t.state.x - dir * 1, duration: .3, ease: 'power2.in', onComplete: () => { vfx.slash(this.chest(a).add(new V(dir * .3, 0, 0)), dir, a.color, 1.3); this.hitFlash(t, a.color, true); vfx.dust(new V(S.x, 0, 0), 18); } })
          .to(S, { y: 0, duration: .15 }).to(S, { x: a.home, duration: .6, ease: 'power2.inOut' }, '+=.2'));
        break;
      }
      case 'vanish': {                                      // gone by sorcery, and striking from another side
        this.sound?.sfx?.('chime');
        await new Promise(res => gsap.timeline({ onComplete: res })
          .to(S, { dissolve: 1, duration: .35, onComplete: () => { S.x = t.state.x + t.dir * 1.2; S.y = .8; } })
          .to(S, { dissolve: 0, duration: .3 })
          .call(() => { vfx.slash(this.chest(a), -dir, a.color, 1.1); this.hitFlash(t, '#d9a0ff'); })
          .to(S, { y: 0, duration: .2 }).to(S, { dissolve: 1, duration: .3, onComplete: () => { S.x = a.home; } }).to(S, { dissolve: 0, duration: .35 }));
        break;
      }
      case 'volley': case 'circle': {                       // arrows (Rāma's circle of fire: a storm of them, into the host too)
        const n = what === 'circle' ? 14 : 4; this.sound?.sfx?.('draw'); gsap.to(S, { glow: .5, duration: .3 });
        for (let k = 0; k < n; k++) {
          await wait(what === 'circle' ? .07 : .14); this.sound?.sfx?.('twang', .5);
          const into = what === 'circle' && k % 2 && st.ranks.length ? st.ranks[(Math.random() * st.ranks.length) | 0] : null;
          const to = into ? new V(into.x, 1 + into.depth, 0) : this.chest(t, .45 + Math.random() * .25);
          vfx.projectile({ from: this.chest(a, .62).add(new V(dir * .3, 0, 0)), to, kind: 'arrow', color: a.color, onHit: () => { if (!into) this.hitFlash(t, a.color); else vfx.burst(to, '#ffd36b', 16, 3); } });
        }
        await wait(.6); gsap.to(S, { glow: 0, duration: .5 });
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
        this.sound?.sfx?.('fire'); vfx.charge(this.chest(a, .62), '#ff6a2a', .4); await wait(.4);
        await fx.play('fireball', st.toScreen(this.chest(a, .62)), st.toScreen(this.chest(t)), { onHit: () => this.hitFlash(t, '#ff6a2a', true) });
        break;
      }
      case 'arrow': {                                       // the one arrow that ends it
        this.sound?.sfx?.('draw'); await new Promise(res => gsap.to(S, { glow: 1, lean: -dir * .05, duration: .7, onComplete: res }));
        vfx.charge(this.chest(a, .62), '#ffe9a8', .5); await wait(.5); this.sound?.sfx?.('twang');
        await new Promise(res => vfx.projectile({ from: this.chest(a, .62).add(new V(dir * .3, 0, 0)), to: this.chest(t), kind: 'astra', color: '#ffe9a8', dur: .42, onHit: () => { this.hitFlash(t, '#fff1c1', true); fx.hit(.35, '255,236,190', 1.2); vfx.flare(this.chest(t), '#ffd36b', 5, .8); res(); } }));
        gsap.to(S, { glow: a.id === 'rama' ? .2 : 0, lean: 0, duration: .8 });
        break;
      }
      case 'manava': {                                      // the Mānavāstra: Mārīca is hurled far away, alive
        this.sound?.sfx?.('astra'); vfx.charge(this.chest(a, .62), '#bfe4ff', .6); await wait(.6);
        await new Promise(res => vfx.projectile({ from: this.chest(a, .62), to: this.chest(t), kind: 'astra', color: '#bfe4ff', dur: .4, onHit: () => { this.hitFlash(t, '#bfe4ff', true); res(); } }));
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
          vfx.rune(new V(S.x, 0, 0), a.color, 3.4, 2.6); gsap.to(S, { glow: 1, duration: .5 }); await wait(.5);
          await fx.play(kind, st.toScreen(this.chest(a, .62).add(new V(dir * .28, 0, 0))), st.toScreen(this.chest(t)), { onHit: () => { this.hitFlash(t, a.color, true); vfx.shockwave(new V(t.state.x, 0, 0), a.color, 7); } });
          gsap.to(S, { glow: a.id === 'rama' ? .2 : 0, duration: 1 }); await wait(.6);
        }
    }
  }
  // the end of the duel: the vanquished sink to the ground and go in a rising golden light (as Rāvaṇa's spirit merged
  // into Rāma, as Jaṭāyu was freed); when dharma wins, flowers fall from the sky
  async outcome(fallen, dharma) {
    const vfx = this.stage.vfx;
    for (const id of fallen) {
      const a = this.A(id); if (!a || a.state.op < .05) continue;
      const S = a.state;
      this.sound?.sfx?.('thud');
      gsap.timeline()
        .to(S, { tilt: -.35, squash: .9, y: 0, duration: .7, ease: 'power2.in', onComplete: () => { vfx.dust(new V(S.x, 0, 0), 34, '#7a6a52', 1.8); this.stage.shake(.7); } })
        .to(S, { glow: 1, duration: .6 }, '+=.3')
        .call(() => { vfx.flare(this.chest(a, .6), '#fff1c1', 4, 1.2); vfx.burst(this.chest(a, .7), '#ffe2a0', 90, 3, { gravity: -1 }); vfx.pillar(new V(S.x, 0, 0), '#ffe2a0', 22, 1.8); })
        .to(S, { dissolve: 1, duration: 1.4, ease: 'sine.inOut' });
      await wait(.4);
    }
    if (dharma) { await wait(1.6); vfx.ambient.petals = 1.6; this.sound?.sfx?.('petals'); }
  }
}
