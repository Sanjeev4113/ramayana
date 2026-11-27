// The site's sound. Three channels with independent switches:
//  music     — an ālāp on the bansuri by Pandit Hariprasad Chaurasia over the concert's own tanpura (tools/music_bed.py),
//  ambience  — forest, river, ocean, night, battle…,
//  effects   — bow twang, arrows, astras, the conch, page turns…
import { LITE } from './calm.js';
const MUSIC = .2, MUSIC_UNDER_VOICE = .06;

const LS = 'ramayana3d.sound';
function loadPrefs() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } }
function savePrefs(p) { try { localStorage.setItem(LS, JSON.stringify(p)); } catch { /* storage unavailable */ } }

export class Sound {
  constructor() {
    const p = loadPrefs();
    this.ctx = null;
    this.musicOn = p.music ?? true; this.sfxOn = p.sfx ?? true; this.narrateOn = p.narrate ?? true;
    this.narrMan = null; fetch('assets/audio/narration/manifest.json').then(r => r.ok ? r.json() : null).then(m => { this.narrMan = m; }).catch(() => {});
    this.ambName = null; this.ambNodes = []; this.ambTimers = [];
    this.listeners = new Set();
  }
  get on() { return this.musicOn || this.sfxOn; }
  onChange(fn) { this.listeners.add(fn); }
  emit() { savePrefs({ music: this.musicOn, sfx: this.sfxOn, narrate: this.narrateOn }); this.listeners.forEach(f => f(this)); }

  async start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.gain.value = .9; this.master.connect(c.destination);
      this.reverb = c.createConvolver(); this.reverb.buffer = this.impulse(4, 2.6);
      const wet = c.createGain(); wet.gain.value = .5; this.reverb.connect(wet).connect(this.master);
      this.music = c.createGain(); this.music.gain.value = 0; this.music.connect(this.master);
      this.fxBus = c.createGain(); this.fxBus.gain.value = this.sfxOn ? .8 : 0; this.fxBus.connect(this.master); this.fxBus.connect(this.reverb);
      this.ambBus = c.createGain(); this.ambBus.gain.value = this.sfxOn ? .7 : 0; this.ambBus.connect(this.master);
      this.noise = this.makeNoise();
      this.startMusic(); this.preloadShots();
      if (this.pendingAmb) { const a = this.pendingAmb; this.pendingAmb = null; this.ambience(a); }
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.setMusic(this.musicOn); this.setSfx(this.sfxOn);
  }
  setMusic(on) {
    this.musicOn = on;
    if (this.ctx) { this.ramp(this.music.gain, on ? (this.speaking ? MUSIC_UNDER_VOICE : MUSIC) : 0, on ? 2.5 : .6); this.playBed(); }
    this.emit();
  }
  setSfx(on) { this.sfxOn = on; if (this.ctx) { this.ramp(this.fxBus.gain, on ? .8 : 0, .4); this.ramp(this.ambBus.gain, on ? .7 : 0, .8); } this.emit(); }
  setNarrate(on) { this.narrateOn = on; if (!on) speechSynthesis?.cancel(); this.emit(); }
  async toggle() { const any = this.musicOn || this.sfxOn; await this.start(); this.setMusic(!any); this.setSfx(!any); }
  ramp(param, v, t) { const n = this.ctx.currentTime; param.cancelScheduledValues(n); param.setValueAtTime(param.value, n); param.linearRampToValueAtTime(v, n + t); }

  impulse(sec, decay) {
    const c = this.ctx, len = c.sampleRate * sec, b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  makeNoise() { const c = this.ctx, len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return b; }
  noiseSrc(loop = false) { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = loop; return s; }
  filt(type, f, q = 1) { const x = this.ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; }
  env(g, t, a, peak, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }

  /* ── music: the bansuri ālāp, streamed (an <audio> element, so a phone never holds minutes of decoded sound) ── */
  startMusic() {
    const a = this.bed = new Audio(`assets/audio/music/bansuri-alap${LITE ? '-lite' : ''}.m4a`);
    a.loop = true; a.preload = 'none';
    try {
      const src = this.ctx.createMediaElementSource(a), send = this.ctx.createGain(); send.gain.value = .18;
      src.connect(this.music); src.connect(send).connect(this.reverb);           // a breath of the hall, no more: it is a real room already
    } catch { a.volume = MUSIC; }
    document.addEventListener('visibilitychange', () => this.playBed());
  }
  // playing only while the music is on and the page is in view; paused (not just silent) otherwise
  playBed() {
    const a = this.bed; if (!a) return;
    clearTimeout(this.bedT);
    if (this.musicOn && !document.hidden) { if (a.paused) a.play().catch(() => {}); }
    else this.bedT = setTimeout(() => { if (!this.musicOn || document.hidden) a.pause(); }, 700);
  }

  /* ── one-shot effects ── */
  sfx(name, vol = 1) {
    if (!this.ctx || !this.sfxOn) return;
    const c = this.ctx, t = c.currentTime, out = c.createGain(); out.gain.value = vol; out.connect(this.fxBus);
    const noiseBurst = (type, f, q, a, peak, d, sweepTo) => { const n = this.noiseSrc(), fl = this.filt(type, f, q), g = c.createGain(); if (sweepTo) fl.frequency.exponentialRampToValueAtTime(sweepTo, t + a + d * .6); this.env(g, t, a, peak, d); n.connect(fl).connect(g).connect(out); n.start(t); n.stop(t + a + d + .1); };
    const tone = (type, f, a, peak, d, fTo, delay = 0) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t + delay); if (fTo) o.frequency.exponentialRampToValueAtTime(fTo, t + delay + a + d); g.gain.setValueAtTime(0, t + delay); g.gain.linearRampToValueAtTime(peak, t + delay + a); g.gain.exponentialRampToValueAtTime(.0001, t + delay + a + d); o.connect(g).connect(out); o.start(t + delay); o.stop(t + delay + a + d + .1); };
    // a real recording (tools/ambience.py) when it has arrived; otherwise the synthesised sound below
    if (name === 'clash') { if (this.shot('clash' + (1 + Math.floor(Math.random() * 3)), vol)) return; name = 'impact'; }
    if ((name === 'conch' || name === 'thunder') && this.shot(name, vol)) return;
    switch (name) {
      case 'page': noiseBurst('bandpass', 2600, .8, .02, .35, .22, 900); setTimeout(() => this.ctx && noiseBurst('highpass', 3000, .5, .01, .12, .15), 140); break;
      case 'steps': for (let i = 0; i < 4; i++) { const n = this.noiseSrc(), f = this.filt('lowpass', 260), g = c.createGain(); this.env(g, t + i * .36, .005, .25, .09); n.connect(f).connect(g).connect(out); n.start(t + i * .36); n.stop(t + i * .36 + .15); } break;
      case 'whoosh': case 'swing': noiseBurst('bandpass', 300, 1.2, name === 'swing' ? .08 : .2, .35, name === 'swing' ? .25 : .5, 2200); break;
      case 'draw': noiseBurst('bandpass', 900, 6, .4, .08, .1, 1800); break;
      case 'twang': tone('sawtooth', 120, .002, .35, .5, 90); tone('triangle', 240, .002, .2, .3); noiseBurst('highpass', 2000, .7, .001, .2, .08); break;
      case 'impact': tone('sine', 90, .002, .7, .35, 40); noiseBurst('lowpass', 1200, .7, .002, .5, .18); break;
      case 'thud': tone('sine', 70, .005, .8, .5, 35); noiseBurst('lowpass', 400, .7, .005, .4, .3); break;
      case 'roar': { const o = c.createOscillator(), g = c.createGain(), fl = this.filt('lowpass', 500, 2); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(110, t + .4); o.frequency.linearRampToValueAtTime(55, t + 1.3); this.env(g, t, .15, .5, 1.2); o.connect(fl).connect(g).connect(out); o.start(t); o.stop(t + 1.6); noiseBurst('bandpass', 350, 1, .15, .4, 1.1); break; }
      case 'chime': case 'petals': [1, 2.0, 2.76, 5.4].forEach((r, i) => tone('sine', 880 * r * (name === 'petals' ? 1.2 : 1), .005, .22 / (i + 1), 2.2 - i * .3, null, i * (name === 'petals' ? .12 : 0))); break;
      case 'swell': tone('sine', 220, 1.2, .25, 1.2, 440); tone('sine', 330, 1.2, .18, 1.2, 660); break;
      case 'fire': for (let i = 0; i < 24; i++) { const n = this.noiseSrc(), f = this.filt('bandpass', 1500 + Math.random() * 3000, 3), g = c.createGain(), tt = t + Math.random() * 1.6; this.env(g, tt, .002, .25 * Math.random(), .04); n.connect(f).connect(g).connect(out); n.start(tt); n.stop(tt + .08); } noiseBurst('lowpass', 500, .5, .3, .25, 1.4); break;
      case 'blaze': noiseBurst('lowpass', 700, .5, .6, .6, 3); this.sfx('fire'); break;
      case 'astra': tone('sine', 300, .6, .3, .4, 1600); tone('sawtooth', 150, .6, .08, .4, 800); noiseBurst('bandpass', 800, 2, .6, .2, .4, 4000); break;
      case 'boom': tone('sine', 110, .002, .9, 1.4, 38); noiseBurst('lowpass', 900, .7, .002, .5, .7); break;
      case 'thunder': noiseBurst('lowpass', 300, .5, .05, .9, 3.2, 80); tone('sine', 50, .1, .5, 2.5, 30); break;
      case 'hiss': noiseBurst('highpass', 3500, .7, .2, .25, 1.2); break;
      case 'birds': for (let i = 0; i < 4; i++) tone('sine', 2400 + Math.random() * 800, .01, .07, .09, 4200, i * .18 + Math.random() * .05); break;
      case 'conch': { const o = c.createOscillator(), g = c.createGain(), fl = this.filt('bandpass', 700, 3), lfo = c.createOscillator(), lg = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(196, t); o.frequency.linearRampToValueAtTime(220, t + .5); lfo.frequency.value = 5; lg.gain.value = 3; lfo.connect(lg).connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.4, t + .5); g.gain.setValueAtTime(.4, t + 2); g.gain.exponentialRampToValueAtTime(.0001, t + 3); o.connect(fl).connect(g).connect(out); out.connect(this.reverb); o.start(t); lfo.start(t); o.stop(t + 3.1); lfo.stop(t + 3.1); break; }
    }
  }

  boom() { this.sfx('boom'); }

  // decoded recordings, fetched once (at most a few beds kept, so a phone does not hold them all)
  buf(path) {
    this.bufs ||= new Map();
    if (!this.bufs.has(path)) {
      this.bufs.set(path, fetch(path).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && this.ctx.decodeAudioData(b)).catch(() => null));
      const beds = [...this.bufs.keys()].filter(k => k.includes('/amb/'));
      if (beds.length > 3) this.bufs.delete(beds[0]);
    }
    return this.bufs.get(path);
  }
  preloadShots() { ['conch', 'thunder', 'clash1', 'clash2', 'clash3'].forEach(n => this.buf(`assets/audio/sfx/${n}.m4a`).then(b => { (this.shots ||= {})[n] = b; })); }
  shot(n, vol = 1) {
    const b = this.shots?.[n]; if (!b || !this.sfxOn) return !!b;
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = b; g.gain.value = vol * (n === 'conch' ? .9 : n === 'thunder' ? 1 : .55);
    s.connect(g).connect(this.fxBus); if (n === 'conch') g.connect(this.reverb);
    s.playbackRate.value = n.startsWith('clash') ? .92 + Math.random() * .16 : 1; s.start();
    return true;
  }

  /* ── ambience beds ── */
  ambience(name) {
    if (!this.ctx) { this.pendingAmb = name; return; }
    if (name === this.ambName) return;
    this.ambName = name;
    const c = this.ctx, t = c.currentTime;
    this.ambNodes.forEach(n => { try { this.ramp(n.g.gain, 0, 1.2); n.s?.stop(t + 1.3); n.dead = true; } catch { /* already stopped */ } });
    this.ambTimers.forEach(clearInterval); this.ambNodes = []; this.ambTimers = [];
    if (!name) return;
    const bed = (type, f, q, vol, lfoRate = 0, lfoDepth = 0) => {
      const s = this.noiseSrc(true), fl = this.filt(type, f, q), g = c.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 1.5);
      if (lfoRate) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = lfoRate; lg.gain.value = lfoDepth; l.connect(lg).connect(g.gain); l.start(); }
      s.connect(fl).connect(g).connect(this.ambBus); s.start(); this.ambNodes.push({ s, g });
    };
    const every = (ms, fn) => this.ambTimers.push(setInterval(() => this.sfxOn && fn(), ms));
    // a field recording, looped without a seam, from a random point so it never starts the same way twice
    const rec = (file, vol) => {
      const g = c.createGain(); g.gain.value = 0; g.connect(this.ambBus); const node = { s: null, g }; this.ambNodes.push(node);
      this.buf(`assets/audio/amb/${file}.m4a`).then(b => {
        if (!b || node.dead) return;
        const s = node.s = c.createBufferSource(); s.buffer = b; s.loop = true; s.connect(g); s.start(c.currentTime, Math.random() * b.duration);
        this.ramp(g.gain, vol, 2.2);
      });
    };
    const out = this.ambBus;
    const drum = () => { const tt = c.currentTime; [0, .3, .45].forEach(d => { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(90, tt + d); o.frequency.exponentialRampToValueAtTime(45, tt + d + .3); g.gain.setValueAtTime(.35, tt + d); g.gain.exponentialRampToValueAtTime(.0001, tt + d + .4); o.connect(g).connect(out); o.start(tt + d); o.stop(tt + d + .5); }); };
    switch (name) {
      case 'river': rec('river', .42); rec('forest', .22); break;
      case 'ocean': rec('ocean', .55); break;
      case 'wind': rec('wind', .35); break;
      case 'forest': rec('forest', .5); break;
      case 'forest-night': case 'night': rec('night', .36); break;
      case 'night-in': rec('night', .16); break;
      case 'city-night': rec('night', .22); bed('lowpass', 300, .6, .015); break;
      case 'city': bed('lowpass', 320, .5, .025); break;
      case 'yajna': bed('lowpass', 500, .5, .02); every(700, () => this.sfx('fire', .25)); break;
      case 'battle': bed('lowpass', 220, .5, .08, .2, .03); every(1600, drum); every(2300, () => this.sfx('swing', .3)); break;
      case 'cave': bed('lowpass', 140, .5, .05); break;
      case 'rain': rec('rain', .5); break;
    }
  }

  /* ── narration: pre-rendered neural voice, with the best browser voice as fallback ── */
  duck(on) { this.speaking = on; if (!this.ctx) return; this.ramp(this.music.gain, this.musicOn ? (on ? MUSIC_UNDER_VOICE : MUSIC) : 0, on ? .5 : 1.4); this.ramp(this.ambBus.gain, on ? .22 : (this.sfxOn ? .7 : 0), .6); }
  // The language whose recorded narration to use ('en', 'hi', 'te', …); Hindi (Roman) listens to Hindi.
  setLang(l) {
    this.lang = l || 'en'; this.narrMans ||= {}; this.narrWait ||= {};
    const L = this.lang;
    if (L !== 'en' && !(L in this.narrMans)) {
      this.narrMans[L] = null;
      this.narrWait[L] = fetch(`assets/audio/narration/${L}/manifest.json`).then(r => r.ok ? r.json() : {}).catch(() => ({})).then(m => { this.narrMans[L] = m; });
    }
  }
  // Resolves once the current language's narration list has arrived (at most `ms` later), so the first
  // paragraph is not read by a fallback voice while the list is still on its way.
  ready(ms = 4000) {
    const w = this.lang === 'en' ? null : this.narrWait?.[this.lang];
    return w ? Promise.race([w, new Promise(r => setTimeout(r, ms))]) : Promise.resolve();
  }
  // Narrate one paragraph. Returns a handle the stage's director follows (progress 0…1, sentence start times),
  // or false when nothing will be spoken.
  narrate(id, text, onEnd, opt = {}) {
    if (!this.narrateOn) { onEnd && setTimeout(onEnd, 0); return false; }
    this.stopSpeaking();
    const L = this.lang || 'en', key = id.replace(/:/g, '-');
    const man = L === 'en' ? this.narrMan : this.narrMans?.[L];
    const entry = man?.[key];
    if (entry) {
      const dur = typeof entry === 'number' ? entry : entry.d;
      const a = this.narrAudio = new Audio(L === 'en' ? `assets/audio/narration/${key}.m4a` : `assets/audio/narration/${L}/${key}.m4a`);
      const h = { kind: 'audio', duration: dur, starts: entry.s || null, done: false, progress: () => (a.currentTime || 0) / (a.duration || dur) };
      a.volume = 1; let done = false; const fin = () => { if (done) return; done = true; h.done = true; this.duck(false); onEnd?.(); };
      const fallback = () => { if (done) return; done = true; const s = this.speak(opt.speech || text, onEnd, L); if (s) Object.assign(h, s); else { h.done = true; onEnd?.(); } };
      a.onended = fin; a.onerror = fallback;
      this.duck(true); a.play().catch(fallback);
      return h;
    }
    return this.speak(opt.speech || text, onEnd, L);
  }
  bestVoice(lang = 'en') {
    const v = speechSynthesis.getVoices(); if (!v.length) return null;
    const code = lang.split('-')[0];
    const pool = v.filter(x => x.lang?.toLowerCase().startsWith(code)); if (code !== 'en' && !pool.length) return null;
    const score = x => (/natural|neural|online/i.test(x.name) ? 50 : 0) + (/premium|enhanced|siri/i.test(x.name) ? 30 : 0) + (/google/i.test(x.name) ? 15 : 0) + (/-IN/i.test(x.lang) ? 12 : /en-GB/i.test(x.lang) ? 8 : 5) + (x.localService ? 0 : 3);
    return (pool.length ? pool : v.filter(x => /^en/i.test(x.lang))).slice().sort((a, b) => score(b) - score(a))[0] || null;
  }
  speak(text, onEnd, lang = 'en') {
    if (!this.narrateOn || !window.speechSynthesis) { onEnd && setTimeout(onEnd, 0); return false; }
    const voice = this.bestVoice(lang);
    if (lang !== 'en' && !voice) { onEnd && setTimeout(onEnd, 0); return false; }   // no voice for this language on this device
    speechSynthesis.cancel();
    const clean = lang === 'en' ? text.replace(/[\u0900-\u097F।॥]+/g, ' ').replace(/ś|ṣ/g, 'sh').replace(/Ś|Ṣ/g, 'Sh').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;
    const u = new SpeechSynthesisUtterance(clean);
    u.voice = voice; u.lang = voice?.lang || lang; u.rate = .92; u.pitch = 1;
    const t0 = performance.now(), est = clean.length / (lang === 'en' ? 13.5 : 11);
    const h = { kind: 'tts', done: false, char: -1, progress: () => h.done ? 1 : h.char >= 0 ? h.char / clean.length : Math.min(.98, (performance.now() - t0) / 1000 / est) };
    u.onboundary = e => { if (e.charIndex != null) h.char = e.charIndex; };
    u.onend = () => { h.done = true; this.duck(false); onEnd?.(); }; u.onerror = () => { h.done = true; this.duck(false); onEnd?.(); };
    this.duck(true); speechSynthesis.speak(u);
    return h;
  }
  stopSpeaking() { window.speechSynthesis?.cancel(); if (this.narrAudio) { this.narrAudio.onended = null; this.narrAudio.pause(); this.narrAudio = null; } this.duck(false); }
}
