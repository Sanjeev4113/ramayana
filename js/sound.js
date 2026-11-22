// Generated temple soundscape — no audio files needed.
// Three channels with independent switches: music (tanpura drone),
// ambience (forest, ocean, battle…) and effects (bow twang, arrows, page turns…).

const LS = 'ramayana3d.sound';
function loadPrefs() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } }
function savePrefs(p) { try { localStorage.setItem(LS, JSON.stringify(p)); } catch { /* storage unavailable */ } }

export class Sound {
  constructor() {
    const p = loadPrefs();
    this.ctx = null;
    this.musicOn = p.music ?? true; this.sfxOn = p.sfx ?? true; this.narrateOn = p.narrate ?? true; this.chantOn = p.chant ?? false;
    this.narrMan = null; fetch('assets/audio/narration/manifest.json').then(r => r.ok ? r.json() : null).then(m => { this.narrMan = m; }).catch(() => {});
    this.ambName = null; this.ambNodes = []; this.ambTimers = [];
    this.listeners = new Set();
  }
  get on() { return this.musicOn || this.sfxOn; }
  onChange(fn) { this.listeners.add(fn); }
  emit() { savePrefs({ music: this.musicOn, sfx: this.sfxOn, narrate: this.narrateOn, chant: this.chantOn }); this.listeners.forEach(f => f(this)); }

  async start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.gain.value = .9; this.master.connect(c.destination);
      this.reverb = c.createConvolver(); this.reverb.buffer = this.impulse(4, 2.6);
      const wet = c.createGain(); wet.gain.value = .5; this.reverb.connect(wet).connect(this.master);
      this.music = c.createGain(); this.music.gain.value = 0; this.music.connect(this.master); this.music.connect(this.reverb);
      this.fxBus = c.createGain(); this.fxBus.gain.value = this.sfxOn ? .8 : 0; this.fxBus.connect(this.master); this.fxBus.connect(this.reverb);
      this.ambBus = c.createGain(); this.ambBus.gain.value = this.sfxOn ? .7 : 0; this.ambBus.connect(this.master);
      this.noise = this.makeNoise();
      this.startDrone();
      if (this.pendingAmb) { const a = this.pendingAmb; this.pendingAmb = null; this.ambience(a); }
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.setMusic(this.musicOn); this.setSfx(this.sfxOn);
    if (this.chantOn && !this.chantT) this.setChant(true);
  }
  setMusic(on) { this.musicOn = on; if (this.ctx) this.ramp(this.music.gain, on ? .2 : 0, on ? 2.5 : .6); this.emit(); }
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

  /* ── tanpura drone (Pa – Sa' – Sa' – Sa) ── */
  pluck(freq, t) {
    const c = this.ctx, g = c.createGain(); this.env(g, t, .04, .3, 5.4);
    const f = this.filt('lowpass', freq * 14, 6); f.frequency.setValueAtTime(freq * 14, t); f.frequency.exponentialRampToValueAtTime(freq * 2.2, t + 4.5);
    [0, 3.5].forEach(det => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det; o.connect(f); o.start(t); o.stop(t + 5.6); });
    f.connect(g).connect(this.music);
  }
  startDrone() {
    const SA = 130.81, seq = [SA * .75, SA * 2, SA * 2, SA]; let i = 0, next = this.ctx.currentTime + .1;
    const sched = () => { while (next < this.ctx.currentTime + 1.5) { if (this.musicOn) this.pluck(seq[i % 4], next); next += i % 4 === 3 ? 1.6 : .95; i++; } setTimeout(sched, 400); };
    sched();
  }

  /* ── one-shot effects ── */
  sfx(name, vol = 1) {
    if (!this.ctx || !this.sfxOn) return;
    const c = this.ctx, t = c.currentTime, out = c.createGain(); out.gain.value = vol; out.connect(this.fxBus);
    const noiseBurst = (type, f, q, a, peak, d, sweepTo) => { const n = this.noiseSrc(), fl = this.filt(type, f, q), g = c.createGain(); if (sweepTo) fl.frequency.exponentialRampToValueAtTime(sweepTo, t + a + d * .6); this.env(g, t, a, peak, d); n.connect(fl).connect(g).connect(out); n.start(t); n.stop(t + a + d + .1); };
    const tone = (type, f, a, peak, d, fTo, delay = 0) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t + delay); if (fTo) o.frequency.exponentialRampToValueAtTime(fTo, t + delay + a + d); g.gain.setValueAtTime(0, t + delay); g.gain.linearRampToValueAtTime(peak, t + delay + a); g.gain.exponentialRampToValueAtTime(.0001, t + delay + a + d); o.connect(g).connect(out); o.start(t + delay); o.stop(t + delay + a + d + .1); };
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
      case 'bell': this.bell(); break;
    }
  }

  bell(vol = .6) {
    if (!this.ctx || !(this.sfxOn || this.musicOn)) return;
    const c = this.ctx, t = c.currentTime, out = c.createGain(); out.gain.value = vol * .35; out.connect(this.master); out.connect(this.reverb);
    [[1, 1, 6], [2, .5, 4], [2.76, .38, 3.2], [5.4, .22, 2], [8.93, .12, 1.2], [.5, .5, 7]].forEach(([r, a, d]) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 523.25 * r; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(out); o.start(t); o.stop(t + d + .1); });
  }
  boom() { this.sfx('boom'); }

  /* ── ambience beds ── */
  ambience(name) {
    if (!this.ctx) { this.pendingAmb = name; return; }
    if (name === this.ambName) return;
    this.ambName = name;
    const c = this.ctx, t = c.currentTime;
    this.ambNodes.forEach(n => { try { n.g.gain.linearRampToValueAtTime(0, t + 1.2); n.s.stop(t + 1.3); } catch { /* already stopped */ } });
    this.ambTimers.forEach(clearInterval); this.ambNodes = []; this.ambTimers = [];
    if (!name) return;
    const bed = (type, f, q, vol, lfoRate = 0, lfoDepth = 0) => {
      const s = this.noiseSrc(true), fl = this.filt(type, f, q), g = c.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 1.5);
      if (lfoRate) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = lfoRate; lg.gain.value = lfoDepth; l.connect(lg).connect(g.gain); l.start(); }
      s.connect(fl).connect(g).connect(this.ambBus); s.start(); this.ambNodes.push({ s, g });
    };
    const every = (ms, fn) => this.ambTimers.push(setInterval(() => this.sfxOn && fn(), ms));
    const out = this.ambBus;
    const cricket = () => { const o = c.createOscillator(), g = c.createGain(), tt = c.currentTime; o.frequency.value = 4300 + Math.random() * 400; for (let i = 0; i < 3; i++) { g.gain.setValueAtTime(0, tt + i * .06); g.gain.linearRampToValueAtTime(.025, tt + i * .06 + .01); g.gain.linearRampToValueAtTime(0, tt + i * .06 + .04); } o.connect(g).connect(out); o.start(tt); o.stop(tt + .25); };
    const drum = () => { const tt = c.currentTime; [0, .3, .45].forEach(d => { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(90, tt + d); o.frequency.exponentialRampToValueAtTime(45, tt + d + .3); g.gain.setValueAtTime(.35, tt + d); g.gain.exponentialRampToValueAtTime(.0001, tt + d + .4); o.connect(g).connect(out); o.start(tt + d); o.stop(tt + d + .5); }); };
    switch (name) {
      case 'river': bed('bandpass', 900, .6, .05, .3, .015); every(4000, () => this.sfx('birds', .4)); break;
      case 'ocean': bed('lowpass', 480, .7, .07, .11, .05); break;
      case 'wind': bed('bandpass', 420, .8, .045, .13, .025); break;
      case 'forest': bed('bandpass', 380, .6, .025, .1, .01); every(2600, () => Math.random() < .7 && this.sfx('birds', .5)); break;
      case 'forest-night': case 'night': case 'night-in': case 'city-night': bed('lowpass', 300, .6, .02); every(name === 'night-in' ? 2600 : 900, cricket); break;
      case 'city': bed('lowpass', 320, .5, .025); every(9000, () => this.bell(.25)); break;
      case 'palace': every(12000, () => this.bell(.2)); break;
      case 'yajna': bed('lowpass', 500, .5, .02); every(700, () => this.sfx('fire', .25)); break;
      case 'battle': bed('lowpass', 220, .5, .08, .2, .03); every(1600, drum); every(2300, () => this.sfx('swing', .3)); break;
      case 'cave': bed('lowpass', 140, .5, .05); every(3000, () => this.sfx('chime', .15)); break;
      case 'divine': every(5000, () => this.sfx('chime', .35)); break;
      case 'rain': bed('highpass', 1200, .5, .08); break;
    }
  }

  /* ── the "Rām" chant: a temple choir built from deep voices ── */
  async loadChant() {
    if (this.chantBufs) return this.chantBufs;
    // A chant recording of your own: assets/audio/chant/ram-custom.mp3 (or .m4a / .wav) is used as-is.
    for (const ext of ['mp3', 'm4a', 'wav']) {
      try { const r = await fetch(`assets/audio/chant/ram-custom.${ext}`); if (r.ok) { this.customChant = await this.ctx.decodeAudioData(await r.arrayBuffer()); break; } } catch { /* not present */ }
    }
    const files = { ram: ['am_onyx', 'am_michael', 'am_fenrir', 'am_adam', 'bm_george', 'am_echo'], jai: ['am_onyx', 'am_michael'] };
    const load = async f => { try { const r = await fetch(`assets/audio/chant/${f}.m4a`); return await this.ctx.decodeAudioData(await r.arrayBuffer()); } catch { return null; } };
    this.chantBufs = { ram: (await Promise.all(files.ram.map(v => load('ram-' + v)))).filter(Boolean), jai: (await Promise.all(files.jai.map(v => load('jai-' + v)))).filter(Boolean) };
    if (!this.chantIR) this.chantIR = this.impulse(6, 2.2);
    return this.chantBufs;
  }
  chant(kind = 'ram', vol = 1) {
    const c = this.ctx; if (!c || !this.chantBufs) return;
    if (this.customChant) {
      // your own recording, played exactly as recorded (it is already mixed, so no hall reverb on top),
      // brought to a steady level, with a short fade so a clip cut off mid-sound does not click
      const b = this.customChant;
      if (this.customPeak == null) { let p = 0; for (let ch = 0; ch < b.numberOfChannels; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < d.length; i += 4) p = Math.max(p, Math.abs(d[i])); } this.customPeak = p || 1; }
      const t = c.currentTime + .02, lvl = Math.min(2.2, .85 / this.customPeak) * vol;
      const s = c.createBufferSource(), g = c.createGain(); s.buffer = b;
      g.gain.setValueAtTime(lvl, t); g.gain.setValueAtTime(lvl, t + Math.max(0, b.duration - .08)); g.gain.linearRampToValueAtTime(0, t + b.duration);
      s.connect(g).connect(this.master); s.start(t); return;
    }
    const bufs = this.chantBufs[kind]; if (!bufs?.length) return;
    const t = c.currentTime + .05;
    const out = c.createGain(); out.gain.value = .9 * vol;
    const verb = c.createConvolver(); verb.buffer = this.chantIR; const wet = c.createGain(); wet.gain.value = .85;
    const lows = c.createBiquadFilter(); lows.type = 'lowshelf'; lows.frequency.value = 160; lows.gain.value = 7;
    const cut = c.createBiquadFilter(); cut.type = 'lowpass'; cut.frequency.value = 3800;
    lows.connect(cut); cut.connect(out); cut.connect(verb); verb.connect(wet).connect(out); out.connect(this.master);
    // the choir: every voice, pitched down and spread in time, plus an octave-low ghost
    bufs.slice(0, 4).forEach((b, i) => {
      for (const [rate, g, d] of [[.9 + (i % 3) * .02, .32, i * .022]]) {
        const s = c.createBufferSource(); s.buffer = b; s.playbackRate.value = rate * (kind === 'jai' ? 1.05 : 1);
        const gg = c.createGain(); gg.gain.value = g; const pan = c.createStereoPanner(); pan.pan.value = (i / Math.max(1, bufs.length - 1) - .5) * 1.4;
        s.connect(gg).connect(pan).connect(lows); s.start(t + d);
      }
    });
    // sub-bass swell and a deep drum under the word
    const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(65, t); o.frequency.exponentialRampToValueAtTime(41, t + 2.2);
    og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.22 * vol, t + .12); og.gain.exponentialRampToValueAtTime(.0001, t + 2.6); o.connect(og).connect(this.master); o.start(t); o.stop(t + 2.7);
    const n = this.noiseSrc(), nf = this.filt('bandpass', 200, .8), ng = c.createGain(); nf.frequency.setValueAtTime(200, t - .6 > 0 ? t - .6 : t); ng.gain.setValueAtTime(0, Math.max(0, t - .5)); ng.gain.linearRampToValueAtTime(.18 * vol, t); ng.gain.exponentialRampToValueAtTime(.0001, t + .5); n.connect(nf).connect(ng).connect(verb); n.start(Math.max(0, t - .5)); n.stop(t + .6);
  }
  async setChant(on) {
    this.chantOn = on; this.emit(); clearTimeout(this.chantT); this.chantT = null;
    if (!on) return;
    if (!this.ctx) return; // starts on the next user gesture via start()
    await this.loadChant();
    let n = 0;
    const gap = () => (this.customChant ? this.customChant.duration * 1000 + 6000 : 11000 + Math.random() * 5000);
    const loop = () => { if (!this.chantOn) return; n++; if (this.customChant || n % 4) { this.chant('ram'); if (!this.customChant && n % 2) setTimeout(() => this.chantOn && this.chant('ram', .8), 2600); } else this.chant('jai'); this.chantT = setTimeout(loop, gap()); };
    loop();
  }
  chantHit() { if (this.chantOn && this.chantBufs) this.chant('ram', 1.1); }

  /* ── narration: pre-rendered neural voice, with the best browser voice as fallback ── */
  duck(on) { if (!this.ctx) return; this.ramp(this.music.gain, on ? .05 : (this.musicOn ? .2 : 0), .6); this.ramp(this.ambBus.gain, on ? .22 : (this.sfxOn ? .7 : 0), .6); }
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
