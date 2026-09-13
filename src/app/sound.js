// Procedural ambient soundscapes (Web Audio). No audio files needed.
let ctx, master;
const channels = {};
export const LAYERS = {
  rain: { label: 'Rain', desc: 'Soft rain on a tin roof' },
  cafe: { label: 'Café murmur', desc: 'Distant chatter and clinks' },
  brown: { label: 'Brown noise', desc: 'Deep, steady rumble' },
  train: { label: 'Night train', desc: 'Low rumble with rhythmic clacks' },
};

function ensure() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function noiseBuffer(type) {
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else if (type === 'pink') { b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0527; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11; }
    else d[i] = w * 0.5;
  }
  return buf;
}

function build(name) {
  const out = ctx.createGain(); out.gain.value = 0; out.connect(master);
  const src = ctx.createBufferSource(); src.loop = true;
  const nodes = [src];
  if (name === 'rain') {
    src.buffer = noiseBuffer('white');
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    const trem = ctx.createGain(); trem.gain.value = 0.7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.15; const lfoG = ctx.createGain(); lfoG.gain.value = 0.25;
    lfo.connect(lfoG).connect(trem.gain); lfo.start();
    src.connect(hp).connect(lp).connect(trem).connect(out); nodes.push(lfo);
  } else if (name === 'cafe') {
    src.buffer = noiseBuffer('pink');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 0.8;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.4; const lfoG = ctx.createGain(); lfoG.gain.value = 250;
    lfo.connect(lfoG).connect(bp.frequency); lfo.start();
    src.connect(bp).connect(out); nodes.push(lfo);
    // occasional cup clinks
    const clink = setInterval(() => {
      if (!channels.cafe) return clearInterval(clink);
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = 2200 + Math.random() * 1800;
      g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      o.connect(g).connect(out); o.start(); o.stop(ctx.currentTime + 0.4);
    }, 2600 + Math.random() * 2000);
  } else if (name === 'brown') {
    src.buffer = noiseBuffer('brown');
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    src.connect(lp).connect(out);
  } else if (name === 'train') {
    src.buffer = noiseBuffer('brown');
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
    const pulse = ctx.createGain(); pulse.gain.value = 0.8;
    // clack-clack rhythm
    const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 1.6; const lfoG = ctx.createGain(); lfoG.gain.value = 0.25;
    lfo.connect(lfoG).connect(pulse.gain); lfo.start();
    src.connect(lp).connect(pulse).connect(out); nodes.push(lfo);
  }
  src.start();
  return { out, nodes };
}

export function play(name, volume = 0.5) {
  ensure();
  if (!channels[name]) channels[name] = build(name);
  channels[name].out.gain.setTargetAtTime(volume * 0.9, ctx.currentTime, 0.3);
}
export function setVolume(name, volume) { if (channels[name]) channels[name].out.gain.setTargetAtTime(volume * 0.9, ctx.currentTime, 0.1); }
export function stop(name) {
  const ch = channels[name]; if (!ch) return;
  ch.out.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  delete channels[name];
  setTimeout(() => { ch.nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }); ch.out.disconnect(); }, 900);
}
export const isPlaying = (name) => Boolean(channels[name]);
export const anyPlaying = () => Object.keys(channels).length > 0;
export function stopAll() { Object.keys(channels).forEach(stop); }

// short chime when a session lands
export function chime() {
  ensure();
  [660, 880, 1320].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.14;
    o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.9);
  });
}
