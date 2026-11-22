// The director: turns a narrated paragraph into a sequence of film shots, the way a
// cinematic retelling is cut. Each sentence of the narration gets its own shot, chosen
// from who the sentence is about: a close-up for a speaker or a lone figure, a two-shot
// for an exchange, a wide for the setting. Hard cuts between subjects, a slow drift within
// a shot, focus pulled to the subject, and a subtitle in the reader's language.
import * as THREE from 'three';
import { CHARACTERS, MINOR_NAMES } from '../data/characters.js';

const gsap = window.gsap;
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const HUMAN_H = 2.05;

// names and epithets by which Vālmīki refers to a figure
const EPITHETS = {
  rama: ['raghava', 'kakutstha', 'dasharathi', 'dasarathi', 'raghunandana', 'raghunatha', 'son of dasaratha', 'son of dasharatha'],
  sita: ['vaidehi', 'janaki', 'maithili', 'daughter of janaka', 'princess of mithila'],
  lakshmana: ['saumitri'], hanuman: ['maruti', 'anjaneya', 'son of the wind', 'son of vayu', 'vayu putra'],
  ravana: ['dasagriva', 'dashagriva', 'dasanana', 'dashanana', 'ten-headed', 'lord of lanka', 'king of the rakshasas', 'king of lanka'],
  indrajit: ['meghanada'], vali: ['valin'], vishwamitra: ['kausika', 'kaushika'], dasharatha: ['the old king'], jatayu: ['the vulture king'],
  kumbhakarna: [], vibhishana: [], sugriva: ['king of the vanaras'], kaikeyi: [], kausalya: [], bharata: [], shatrughna: []
};
let ALIAS = null;
function aliases() {
  if (ALIAS) return ALIAS;
  ALIAS = [];
  const add = (name, id) => { const n = norm(name).replace(/[^a-z\s-]/g, '').trim(); if (n.length > 2) ALIAS.push([new RegExp(`\\b${n.replace(/\s+/g, '\\s+')}\\b`), id]); };
  for (const c of CHARACTERS) { add(c.name, c.id); if (c.name.includes(' ')) add(c.name.split(' ')[0], c.id); }
  for (const [id, n] of Object.entries(MINOR_NAMES || {})) add(n, id);
  for (const [id, list] of Object.entries(EPITHETS)) list.forEach(n => add(n, id));
  return ALIAS;
}

// split a passage into sentences (Latin and Indic full stops; a quotation stays with its sentence)
export function sentences(text) {
  const parts = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?।॥](?:["”’']+)?)\s+(?=[^a-z])/u).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) { if (out.length && p.length < 16) out[out.length - 1] += ' ' + p; else out.push(p); }
  return out.length ? out : [text];
}
// a long sentence is shown as several subtitle cards of about two lines, split at its commas
function cards(sentence, max = 96) {
  if (sentence.length <= max) return [sentence];
  const parts = sentence.split(/(?<=[,;:،])\s+/); const out = [];
  for (const p of parts) { if (out.length && (out[out.length - 1] + ' ' + p).length <= max) out[out.length - 1] += ' ' + p; else out.push(p); }
  return out.flatMap(c => { if (c.length <= max * 1.25) return [c]; const w = c.split(' '), h = Math.ceil(w.length / 2); return [w.slice(0, h).join(' '), w.slice(h).join(' ')]; });
}
const cumulative = list => { const w = list.map(s => Math.max(8, s.length)), tot = w.reduce((a, b) => a + b, 0); let acc = 0; return w.map(x => { const s = acc / tot; acc += x; return s; }); };

const GRIEF = /\b(wept|weep|weeping|grief|griev|sorrow|lament|tears|mourn|despair|fainted|swoon|died|death of)\b/i;
const VALOUR = /\b(roar|battle|fought|fight|struck|slew|killed|astra|arrow|charged|leapt|leap|rage|fury|war|vow|bow)\b/i;
const QUOTE = /[“"]/;
const PRONOUN = /^(?:[“"‘]?\s*)(he|she|his|her|him|they|their|them|it)\b/i;
const GROUP = /\b(assembly|citizens|people|crowd|army|armies|host|vanaras|monkeys|rakshasas|sages|kings|court|city|forest|ocean|sky|all of them|everyone)\b/i;

export class Director {
  constructor(stage) {
    this.stage = stage; this.active = false; this.shot = null; this.subsOn = true;
    try { this.subsOn = localStorage.getItem('ramayana3d.subs') !== '0'; } catch { }
    const root = stage.root;
    this.subEl = document.createElement('div'); this.subEl.className = 's3-sub'; this.subEl.innerHTML = '<span></span>';
    this.card = document.createElement('div'); this.card.className = 's3-chapter'; root.append(this.card);
    this.cc = document.createElement('button'); this.cc.className = 's3-cc'; this.cc.textContent = 'CC'; this.cc.title = 'Subtitles';
    root.append(this.subEl, this.cc);
    root.classList.toggle('no-subs', !this.subsOn);
    this.cc.addEventListener('click', () => { this.subsOn = !this.subsOn; root.classList.toggle('no-subs', !this.subsOn); try { localStorage.setItem('ramayana3d.subs', this.subsOn ? '1' : '0'); } catch { } });
    this.v = new THREE.Vector3(); this.cam = { x: 0, y: 0, z: 0, lx: 0, ly: 0, lz: 0 };
    this.focus = { x: .5, y: .5, rx: .3, ry: .4, k: 0 };
    this.bars();
    new ResizeObserver(() => this.bars()).observe(root);
  }
  // letterbox to 16:9 inside the stage, at most 22% of the height per bar
  bars() {
    const w = this.stage.root.clientWidth || 900, h = this.stage.root.clientHeight || 760;
    // in full screen the lower bar always keeps room for two lines of subtitles
    const min = this.stage.root.closest('.is-max') ? Math.max(64, h * .105) : 30;
    const bar = Math.max(min, Math.min(h * .22, (h - w / (16 / 9)) / 2));
    this.stage.root.style.setProperty('--bar', `${Math.round(bar)}px`);
  }

  /* ── a paragraph begins ── */
  start(beat, handle, { camera = true } = {}) {
    this.stop(true);
    this.camera = camera;
    const read = sentences(beat.text || beat.en || ''), en = sentences(beat.en || beat.text || '');
    this.read = read; this.en = en;
    this.readAt = handle?.starts?.length === read.length && handle.duration ? handle.starts.map(s => s / handle.duration) : cumulative(read);
    this.enAt = cumulative(en);
    this.handle = handle;
    // without narration, the shots follow a comfortable reading pace
    this.est = Math.max(handle ? 7 : 11, (beat.text || '').length / (handle ? 13 : 14));
    this.t0 = performance.now(); this.active = true; this.ended = false;
    this.cur = -1; this.enCur = -1; this._cards = []; this.subjects = []; this.shot = null; this.override = null;
    this.beat = beat; this.sentCur = -1; this.readCur = -1;
    this.stage.root.classList.add('katha', 'show-title');
    // a new episode opens with a chapter card, as a film's chapters do
    if (beat.k === 0 && beat.title) {
      this.card.innerHTML = `<small>${beat.kanda || ''}</small><b>${beat.title}</b><i></i>`;
      gsap.killTweensOf(this.card);
      gsap.timeline().fromTo(this.card, { opacity: 0, scale: 1.04, filter: 'blur(6px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' })
        .fromTo(this.card.querySelector('i'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.out' }, '-=.6')
        .to(this.card, { opacity: 0, filter: 'blur(4px)', duration: 1, ease: 'power2.in' }, '+=1.6');
    }
    clearTimeout(this._tt); this._tt = setTimeout(() => this.stage.root.classList.remove('show-title'), 3800);
    gsap.killTweensOf(this.stage.cam);
  }
  stop(quiet) {
    if (!this.active) return;
    this.active = false; this.shot = null; this.override = null;
    const span = this.subEl.firstChild; span.classList.remove('on');
    gsap.to(this.focus, { k: 0, duration: .8 });
    if (!quiet) {
      this.stage.root.classList.remove('katha');
      const W = this.stage.wide; if (W) gsap.to(this.stage.cam, { ...W.target, y: W.B.y, ...W.mv.to, duration: 2.6, ease: 'power2.inOut' });
    }
  }
  progress() {
    const h = this.handle;
    if (h) { const p = h.progress?.(); if (p != null && isFinite(p)) return Math.min(1, Math.max(0, p)); if (h.done) return 1; }
    return Math.min(1, (performance.now() - this.t0) / 1000 / this.est);
  }
  // a line of dialogue: cut to the speaker for as long as they speak
  onSay(a, hold) {
    if (!this.active || !a || !this.camera) return;
    this.override = { kind: 'mcu', subjects: [a], t: performance.now(), hold: hold * 1000, side: a.state.x > 0 ? -1 : 1, cut: true };
  }

  /* ── which figures a sentence is about ── */
  subjectsOf(sentence) {
    const s = norm(sentence), found = [];
    for (const [re, id] of aliases()) {
      const m = s.match(re); if (!m) continue;
      const a = this.stage.actors.get(id); if (a && !found.some(f => f.a === a)) found.push({ a, at: m.index });
    }
    return found.sort((x, y) => x.at - y.at).map(f => f.a).filter(a => a.state.op > .3);
  }
  plan(i) {
    const s = this.en[i] || '';
    let subj = this.subjectsOf(s);
    const quote = QUOTE.test(s), group = GROUP.test(s);
    // "he", "she", "his": stay with the last subject; a crowd or a setting: go wide; otherwise cut away (B-roll)
    if (!subj.length && i > 0) {
      if (PRONOUN.test(s) || quote) subj = this.subjects;
      else if (!group) {
        const others = [...this.stage.actors.values()].filter(a => a.state.op > .3 && a.isArt !== undefined && !this.subjects.includes(a));
        const named = others.filter(a => a.mode === 'art' && !/\d$/.test(a.key)); const pool = named.length ? named : others;
        if (pool.length && i % 2) subj = [pool[(i * 7) % pool.length]];
      }
    }
    if (subj.length) this.subjects = subj;
    const last = i === this.en.length - 1 && this.en.length > 2;
    const mood = GRIEF.test(s) ? 'grief' : VALOUR.test(s) ? 'valour' : '';
    let kind = 'wide';
    if (i === 0 && this.en.length > 1 && !quote) kind = 'wide';
    else if (group && !quote) kind = 'wide';
    else if (subj.length === 1) kind = quote || mood === 'grief' || i % 2 ? 'mcu' : 'medium';
    else if (subj.length >= 2) kind = 'two';
    if (last && !quote && kind !== 'mcu') kind = 'pull';
    const prev = this.shot;
    const same = prev && prev.kind === kind && prev.subjects.length === subj.length && prev.subjects.every((a, k) => a === subj[k]);
    return { kind, subjects: subj.slice(0, 3), mood, side: (i % 2 ? -1 : 1) * (subj[0]?.state.x > 1.5 ? -1 : 1), cut: !same && !!prev, i };
  }

  /* ── camera pose for a shot at drift u ∈ [0,1] ── */
  pose(shot, u, out) {
    const st = this.stage, B = st.base || { x: 0, y: 1.6, z: 7.4, ly: 1.3 };
    const e = u * u * (3 - 2 * u);
    if (shot.kind === 'wide' || shot.kind === 'pull' || !shot.subjects.length) {
      const W = st.wide; if (!W) return false;
      const from = shot.kind === 'pull' ? W.mv.to : W.mv.from, to = shot.kind === 'pull' ? { ...W.mv.to, z: (W.mv.to.z || B.z) + 1.6, y: (W.mv.to.y ?? B.y) + .5 } : W.mv.to;
      const tight = shot.kind === 'pull' ? 1 : .84;
      out.x = lerp(from.x ?? 0, to.x ?? 0, e); out.z = lerp(from.z ?? B.z, to.z ?? B.z, e) * tight; out.y = lerp(from.y ?? B.y, to.y ?? B.y, e) - (1 - tight) * .8;
      out.lx = W.target.lx; out.ly = W.target.ly; out.lz = 0;
      return true;
    }
    const subs = shot.subjects;
    const hk = Math.sqrt(Math.max(...subs.map(a => a.height)) / HUMAN_H);
    const xs = subs.map(a => a.state.x), mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const zMid = subs.reduce((s, a) => s + a.state.z, 0) / subs.length;
    const head = Math.max(...subs.map(a => a.pos.y + a.height * .8));
    const angle = shot.mood === 'grief' ? .55 : shot.mood === 'valour' ? -.42 : .05;
    if (shot.kind === 'mcu') {
      const d = 3.5 * hk;
      out.x = mid + shot.side * (.55 - .3 * e); out.z = zMid + d + .35 - .45 * e; out.y = head - .1 + angle;
      out.lx = mid + shot.side * -.05; out.ly = head - .28; out.lz = zMid;
    } else if (shot.kind === 'medium') {
      const d = 5.6 * hk, a = subs[0];
      out.x = mid + shot.side * (1.1 - .5 * e); out.z = zMid + d - .5 * e; out.y = a.pos.y + a.height * .62 + angle * .8;
      out.lx = mid; out.ly = a.pos.y + a.height * .55; out.lz = zMid;
    } else {
      const cam = st.camera, hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect);
      const half = (Math.max(...xs) - Math.min(...xs)) / 2 + Math.max(...subs.map(a => (a.width || 1) * .5)) + .8;
      const d = Math.max(4.4 * hk, half / Math.tan(hfov / 2));
      out.x = mid + shot.side * (.8 - .5 * e); out.z = zMid + d + .3 - .4 * e; out.y = head - .35 + angle * .6;
      out.lx = mid; out.ly = head - .65; out.lz = zMid;
    }
    return true;
  }

  // where the subject sits on screen, for the focus pull
  frame(shot) {
    if (!shot || !shot.subjects.length || shot.kind === 'wide' || shot.kind === 'pull') return null;
    const cam = this.stage.camera; let x0 = 1, x1 = 0, y0 = 1, y1 = 0;
    for (const a of shot.subjects) {
      for (const [dx, dy] of [[-.5, 0], [.5, 0], [-.5, 1], [.5, 1]]) {
        this.v.set(a.pos.x + dx * (a.width || a.height * .5), a.pos.y + dy * a.height * a.state.sc, a.pos.z).project(cam);
        const u = (this.v.x + 1) / 2, v = (this.v.y + 1) / 2;
        x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, v); y1 = Math.max(y1, v);
      }
    }
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, rx: Math.max(.12, (x1 - x0) * .62), ry: Math.max(.2, (y1 - y0) * .58) };
  }

  update() {
    if (!this.active) return;
    const st = this.stage, p = this.progress();
    // which sentence is being spoken
    let i = 0; while (i + 1 < this.readAt.length && p >= this.readAt[i + 1]) i++;
    // a motion clip may belong to this sentence; clips are listed by English sentence, so a translated reading maps
    // its progress onto the English sentences (their counts can differ)
    if (i !== this.readCur) { this.readCur = i; st.onRead?.(this.beat, i); }   // the book highlights the line being read
    let en = i;
    if (this.beat && this.beat.text !== this.beat.en) { en = 0; while (en + 1 < this.enAt.length && p >= this.enAt[en + 1]) en++; }
    if (en !== this.sentCur) {
      this.sentCur = en;
      // how long this sentence will be on screen, so its shot can be paced to fill it
      const total = this.handle?.duration || this.est;
      const dur = en === i ? ((this.readAt[i + 1] ?? 1) - this.readAt[i]) * total : ((this.enAt[en + 1] ?? 1) - this.enAt[en]) * total;
      st.onSentence?.(this.beat, en, dur);
    }
    const cs =this._cards?.[i] || (this._cards ||= [])[i] || (this._cards[i] = cards(this.read[i] || ''));
    const t0 = this.readAt[i], t1 = this.readAt[i + 1] ?? 1, fr = Math.min(.999, Math.max(0, (p - t0) / Math.max(.001, t1 - t0)));
    const w = cumulative(cs); let ci = 0; while (ci + 1 < w.length && fr >= w[ci + 1]) ci++;
    const id = i * 100 + ci;
    if (id !== this.cur) {
      this.cur = id;
      const span = this.subEl.firstChild; span.classList.remove('on');
      clearTimeout(this._st); this._st = setTimeout(() => { span.textContent = cs[ci] || ''; span.classList.add('on'); }, 140);
    }
    if (!this.camera) { if (p >= 1 && !this.ended) { this.ended = true; clearTimeout(this._end); this._end = setTimeout(() => { if (this.ended) this.stop(); }, 3500); } return; }
    let j = 0; while (j + 1 < this.enAt.length && p >= this.enAt[j + 1]) j++;
    if (j !== this.enCur) { this.enCur = j; const s = this.plan(j); s.t0 = p; s.t1 = this.enAt[j + 1] ?? 1; this.shot = s; }
    // the active shot (a spoken line overrides the narration's shot for a moment)
    let shot = this.shot, u = (p - shot.t0) / Math.max(.001, shot.t1 - shot.t0);
    if (this.override) { const o = this.override, el = performance.now() - o.t; if (el > o.hold) { this.override = null; this.shot.cut = true; } else { shot = o; u = el / o.hold; } }
    const c = st.cam;
    if (this.pose(shot, Math.min(1, Math.max(0, u)), this.cam)) {
      if (shot.cut) { Object.assign(c, this.cam); shot.cut = false; }
      else { const k = .06; for (const key of ['x', 'y', 'z', 'lx', 'ly', 'lz']) c[key] += (this.cam[key] - c[key]) * k; }
    }
    const f = this.frame(shot);
    if (f) { const k = .12; this.focus.x += (f.x - this.focus.x) * k; this.focus.y += (f.y - this.focus.y) * k; this.focus.rx += (f.rx - this.focus.rx) * k; this.focus.ry += (f.ry - this.focus.ry) * k; this.focus.k += (1 - this.focus.k) * .05; }
    else this.focus.k += (0 - this.focus.k) * .05;
    if (p >= 1 && !this.ended) { this.ended = true; clearTimeout(this._end); this._end = setTimeout(() => { if (this.ended) this.stop(); }, 3500); }
  }
}
const lerp = (a, b, t) => a + (b - a) * t;
