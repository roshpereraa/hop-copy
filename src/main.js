import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createMascot } from './mascot.js';

gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFGHJKLMNPQRSTUVWXYZ$%';

document.body.classList.add('loading');

/* ---------------- smooth scroll ---------------- */
const lenis = new Lenis({ lerp: 0.09, smoothWheel: !reduced });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  if (id.length > 1 && $(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -60, duration: 1.6 }); }
}));

/* ---------------- decorative builders ---------------- */
$$('[data-plus]').forEach((field) => {
  const n = +field.dataset.plus;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.className = 'plus';
    p.style.left = `${(Math.round(Math.random() * 12) / 12) * 96 + 2}%`;
    p.style.top = `${(Math.round(Math.random() * 8) / 8) * 90 + 5}%`;
    field.appendChild(p);
  }
});

const TICKS = [
  ['dot--green', '25-min sprints'], ['dot--blue', 'Deep work · 90'], ['sep', '/'], ['dot--lime', 'Squad sessions'],
  ['dot--white', 'Ambient mixer'], ['sep', '/'], ['dot--green', 'Focus shield'], ['dot--blue', 'Weekly flight log'],
  ['sep', '/'], ['dot--lime', 'No ads'], ['dot--white', 'Works offline'], ['sep', '/'],
];
const marquee = $('#marquee');
const tickHTML = TICKS.map(([c, t]) => c === 'sep'
  ? `<span class="tick-item sep">${t}</span>`
  : `<span class="tick-item"><i class="dot ${c}"></i>${t}</span>`).join('');
marquee.innerHTML = tickHTML.repeat(4);

const hex = $('#hexdump');
const hexLine = () => Array.from({ length: 12 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')).join(' ');
setInterval(() => { hex.textContent = Array.from({ length: 7 }, hexLine).join('\n'); }, 120);

/* ---------------- text effects ---------------- */
// Typewriter: reveals characters with a trailing block cursor of glyphs
function typeIn(el, { speed = 28, delay = 0 } = {}) {
  const text = el.dataset.text ?? el.textContent;
  el.dataset.text = text;
  el.textContent = '';
  let i = 0;
  return new Promise((res) => setTimeout(function step() {
    i++;
    const tail = i < text.length ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : '';
    el.textContent = text.slice(0, i) + tail;
    if (i < text.length) setTimeout(step, speed); else res();
  }, delay));
}

// Scramble-in title: per-char spans drop in, cycle glyphs, settle (keeps <em> colour)
function prepScramble(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...c.textContent].forEach((ch) => {
          const s = document.createElement('span');
          s.className = 'sc';
          s.dataset.ch = ch;
          s.textContent = ch === ' ' ? ' ' : ch;
          s.style.display = 'inline-block';
          s.style.whiteSpace = 'pre';
          frag.appendChild(s);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
  };
  walk(el);
  gsap.set($$('.sc', el), { opacity: 0, y: () => gsap.utils.random(-18, 18), color: '#8f889c' });
}
function playScramble(el) {
  const chars = $$('.sc', el);
  chars.forEach((s, i) => {
    const final = s.dataset.ch;
    if (final === ' ') { gsap.set(s, { opacity: 1, y: 0 }); return; }
    const start = i * 0.035;
    gsap.to(s, { opacity: 1, y: 0, duration: 0.5, delay: start, ease: 'power3.out' });
    gsap.to(s, { color: '', duration: 0.4, delay: start + 0.45, clearProps: 'color' });
    let n = 0;
    const id = setInterval(() => {
      s.textContent = ++n > 6 ? final : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      if (n > 6) clearInterval(id);
    }, 45 + Math.random() * 20);
    setTimeout(() => {}, start * 1000);
  });
}
$$('[data-scramble-in]').forEach((el) => {
  prepScramble(el);
  ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: () => playScramble(el) });
});

// Hover scramble for links
$$('[data-scramble]').forEach((a) => {
  const orig = a.textContent;
  let id;
  a.addEventListener('mouseenter', () => {
    let frame = 0;
    clearInterval(id);
    id = setInterval(() => {
      a.textContent = [...orig].map((c, i) => (i < frame / 2 || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
      if (++frame > orig.length * 2) { clearInterval(id); a.textContent = orig; }
    }, 22);
  });
});

// generic fade-up reveals
$$('.reveal').filter((el) => !el.closest('.hero')).forEach((el) => {
  gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
});

/* ---------------- announcement ---------------- */
$('#announceClose').addEventListener('click', () => $('#announce').classList.add('hide'));

/* ---------------- contract address ---------------- */
const caBtn = $('#caBtn'), caText = $('#caText');
const ca = caBtn.dataset.ca;
const caShort = ca.length > 12 ? `${ca.slice(0, 4)}…${ca.slice(-4)}` : ca;
caText.textContent = caShort;
caBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(ca); caText.textContent = 'Copied!'; }
  catch { caText.textContent = 'Copy failed'; }
  caBtn.classList.add('copied');
  setTimeout(() => { caText.textContent = caShort; caBtn.classList.remove('copied'); }, 1600);
});

/* ---------------- mobile menu ---------------- */
const burger = $('#burger'), navLinks = $('#navLinks');
const setMenu = (open) => { navLinks.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); };
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
$$('a', navLinks).forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
lenis.on('scroll', () => { if (navLinks.classList.contains('open')) setMenu(false); });

/* ---------------- 3D mascot + story ---------------- */
const mascot = createMascot($('#stage'));
if (import.meta.env.DEV) Object.assign(window, { __mascot: mascot, __ST: ScrollTrigger, __lenis: lenis });
const story = $('.story');
const hero = $('#hero');

ScrollTrigger.create({
  trigger: hero, start: 'top top', endTrigger: story, end: 'bottom bottom', scrub: true,
  onUpdate: (self) => mascot.setProgress(self.progress),
});
// mascot canvas off-screen further down — skip rendering
// hard-hide once the story ends so a lagging (smoothed) mascot never overlaps later sections
const stage = $('#stage');
const showStage = (v) => { mascot.setVisible(v); stage.style.visibility = v ? 'visible' : 'hidden'; };
ScrollTrigger.create({ trigger: story, start: 'top top', end: 'bottom 60%', onLeave: () => showStage(false), onEnterBack: () => showStage(true) });

// hero copy drifts up as the dive starts
gsap.to('.hero__copy, .hero__scroll', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true } });

// Story beats — each fades/blur-in at centre, then slides left and dissolves
const beats = $$('.story [data-beat]');
const storyTl = gsap.timeline({ scrollTrigger: { trigger: story, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
const slot = 1;
beats.forEach((b, i) => {
  const isCaption = b.classList.contains('caption');
  const at = i * slot + 0.35;
  if (isCaption) {
    storyTl.fromTo(b, { autoAlpha: 0, x: b.classList.contains('caption--right') ? 40 : -40 },
      { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power2.out', onStart: () => { const p = $('p', b); if (p && !p.dataset.typed) { p.dataset.typed = 1; typeIn(p, { speed: 14 }); } } }, at);
    storyTl.to(b, { autoAlpha: 0, y: -30, duration: 0.25, ease: 'power2.in' }, at + 0.62);
  } else {
    storyTl.fromTo(b, { autoAlpha: 0, xPercent: -50, yPercent: -50, x: '8vw', scale: 0.92, filter: 'blur(12px)' },
      { autoAlpha: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, at);
    storyTl.to(b, { x: '-42vw', autoAlpha: 0, filter: 'blur(6px)', duration: 0.4, ease: 'power1.in' }, at + 0.55);
    const icon = $('.beat__icon', b);
    if (icon) storyTl.fromTo(icon, { rotate: -90, scale: 0.4 }, { rotate: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, at);
  }
});
storyTl.to({}, { duration: 0.4 });
storyTl.fromTo('#streak', { opacity: 0, x: '30vw' }, { opacity: 1, x: '-10vw', duration: 3, ease: 'none' }, 0.2);
storyTl.to('#streak', { opacity: 0.3, x: '-40vw', rotate: 22, duration: 3, ease: 'none' }, 3.2);
storyTl.to('#streak', { opacity: 0, duration: 1.5 }, 6.5);
storyTl.fromTo('.ghost', { y: 120 }, { y: -260, duration: beats.length * slot, ease: 'none', stagger: 0.2 }, 0);
storyTl.to('#hexdump', { opacity: 1, duration: 0.3 }, 5.2);

/* ---------------- glitch mask ---------------- */
const shards = $('#shards');
const shardEls = Array.from({ length: 26 }, () => {
  const s = document.createElement('i');
  s.className = 'shard';
  const w = gsap.utils.random(6, 26), h = gsap.utils.random(6, 20);
  Object.assign(s.style, { width: `${w}px`, height: `${h}px`, clipPath: `polygon(${gsap.utils.random(0, 40)}% 0, 100% ${gsap.utils.random(0, 50)}%, ${gsap.utils.random(50, 100)}% 100%, 0 ${gsap.utils.random(30, 100)}%)` });
  shards.appendChild(s);
  return s;
});
const face = $('.mask__face');
const maskTl = gsap.timeline({ scrollTrigger: { trigger: '.mask-sec', start: 'top 75%', end: 'bottom 25%', scrub: 0.8,
  onToggle: (s) => face.classList.toggle('glitch', s.isActive) } });
maskTl.fromTo(face, { scale: 0.3, rotate: -25, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1, ease: 'back.out(1.6)' });
shardEls.forEach((s) => {
  const ang = Math.random() * Math.PI * 2, dist = gsap.utils.random(110, 260);
  maskTl.fromTo(s, { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.2 },
    { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, rotate: gsap.utils.random(-360, 360), opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0.2);
});
maskTl.to(shardEls, { opacity: 0, duration: 0.6, stagger: 0.01 }, 1.6);
maskTl.to('.mask', { y: -80, duration: 1.2 }, 1);
// occasional hard glitch bursts
setInterval(() => {
  if (!face.classList.contains('glitch')) return;
  gsap.fromTo(face, { x: gsap.utils.random(-12, 12), skewX: gsap.utils.random(-20, 20) }, { x: 0, skewX: 0, duration: 0.18, ease: 'steps(3)' });
}, 900);

/* ---------------- floating radio ---------------- */
gsap.to('.radio__body', { y: -14, rotate: -3, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
gsap.to('.radio__antenna', { rotate: 18, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
gsap.fromTo('#radio', { rotate: -8, x: 40 }, { rotate: 6, x: -20, ease: 'none', scrollTrigger: { trigger: '.post', start: 'top bottom', end: 'bottom top', scrub: true } });
gsap.fromTo('.wave-blob', { y: 120, scale: 0.8 }, { y: -40, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.post', start: 'top bottom', end: 'bottom top', scrub: true } });

/* ---------------- cockpit (features) carousel ---------------- */
const CARDS = [
  ['Focus Timer', 'Sprints, deep sessions or a custom length. One tap to start, and the timer keeps running even if you lock the screen.', 'rings'],
  ['Focus Shield', 'Notifications wait politely until you land. Pick which people or apps are allowed to break through.', 'shield'],
  ['Squad Sessions', 'Start a session with friends and fly in formation. If one person leaves early, the whole squad loses a little lift.', 'burst'],
  ['Flight Streaks', 'Streaks that forgive a missed day. Take one rest day a week without losing the distance you have built.', 'bars'],
  ['Calendar Sync', 'Leap Gate reads your calendar, spots the empty blocks and suggests a session before a meeting eats the afternoon.', 'grid'],
  ['Ambient Mixer', 'Blend up to three soundscapes — rain, café murmur, brown noise — and save the mix for next time.', 'wave'],
  ['Weekly Flight Log', 'A calm Sunday recap of where your attention went, which hours worked best and how far Pip travelled.', 'spiral'],
  ['Offline Mode', 'No signal, no problem. Sessions record locally and sync quietly once you are back online.', 'coil'],
];
const CARD_LINKS = ['/app/#/timer', '/app/#/settings?section=focus', '/app/#/squads', '/app/#/log', '/app/#/settings?section=integrations', '/app/#/sounds', '/app/#/log?range=7', '/app/#/devices'];
const track = $('#hoodTrack');
track.innerHTML = CARDS.map(([t, d], i) => `
  <article class="card${i === 1 ? ' is-hot' : ''}">
    <h3>${t}</h3>
    <canvas data-art="${CARDS[i][2]}"></canvas>
    <div class="card__plus"><i class="plus"></i><i class="plus"></i></div>
    <p>${d}</p>
    <a class="card__cta" href="${CARD_LINKS[i]}">Try it</a>
  </article>`).join('');

const perView = () => (innerWidth <= 900 ? 1 : 3);
let hoodIdx = 0;
function hoodGo(d) {
  const max = CARDS.length - perView();
  hoodIdx = (hoodIdx + d + max + 1) % (max + 1);
  track.style.transform = `translateX(-${(100 / perView()) * hoodIdx}%)`;
  $('#hoodCount').textContent = `[${hoodIdx + 1}/${max + 1}]`;
  const bar = $('#hoodBar');
  bar.style.width = `${100 / (max + 1)}%`;
  bar.style.marginLeft = `${(hoodIdx / (max + 1)) * 100}%`;
  $$('.card', track).forEach((c, i) => c.classList.toggle('is-hot', i === hoodIdx + Math.floor(perView() / 2)));
}
$('#hoodPrev').onclick = () => hoodGo(-1);
$('#hoodNext').onclick = () => hoodGo(1);

// neon canvas art
const G = '#39ff7a', B = '#4d8dff';
const arts = $$('canvas[data-art]').map((c) => ({ c, ctx: c.getContext('2d'), kind: c.dataset.art }));
function sizeArts() {
  const dpr = Math.min(devicePixelRatio, 2);
  arts.forEach((a) => { a.c.width = a.c.clientWidth * dpr; a.c.height = a.c.clientHeight * dpr; a.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); });
}
function neonStroke(ctx, w, col = G) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.lineWidth = w; ctx.stroke();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#eafff1'; ctx.lineWidth = w * 0.35; ctx.stroke();
}
function drawArt({ c, ctx, kind }, t) {
  const W = c.clientWidth, H = c.clientHeight, cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (kind === 'shield') {
    const pulse = Math.sin(t * 2) * 0.5 + 0.5;
    ctx.beginPath(); ctx.moveTo(cx, cy - 70); ctx.lineTo(cx + 56, cy - 48); ctx.lineTo(cx + 50, cy + 16);
    ctx.quadraticCurveTo(cx + 36, cy + 56, cx, cy + 74); ctx.quadraticCurveTo(cx - 36, cy + 56, cx - 50, cy + 16);
    ctx.lineTo(cx - 56, cy - 48); ctx.closePath(); neonStroke(ctx, 5);
    for (let i = 0; i < 3; i++) {
      const r = 20 + ((t * 30 + i * 30) % 90);
      ctx.beginPath(); ctx.arc(cx, cy, r, -2.4, -0.7); ctx.globalAlpha = Math.max(0, 1 - r / 110); neonStroke(ctx, 3, B); ctx.globalAlpha = 1;
    }
    ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx - 4, cy + 16); ctx.lineTo(cx + 24, cy - 16); neonStroke(ctx, 5 + pulse * 2, '#b8ff3c');
  } else if (kind === 'burst') {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + t * 0.4, r1 = 20, r2 = 70 + Math.sin(t * 3 + i) * 18;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a + 0.2) * (r2 * 0.6), cy + Math.sin(a + 0.2) * (r2 * 0.6));
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); neonStroke(ctx, 3, i % 2 ? B : G);
    }
    for (let i = 0; i < 10; i++) {
      const a = i * 2.4 + t * 0.2, r = 26 + (i % 3) * 8;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6, 12 + (i % 4) * 3, 0, 7);
      ctx.fillStyle = '#0a1a40'; ctx.fill();
    }
  } else if (kind === 'coil') {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 14; a += 0.1) {
      const r = 18 + a * 1.9, x = cx + Math.cos(a + t) * r * 0.9, y = cy + Math.sin(a * 1.02 + t) * r * 0.55;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineWidth = 2.2; ctx.strokeStyle = G; ctx.shadowColor = G; ctx.shadowBlur = 10; ctx.stroke();
  } else if (kind === 'rings') {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(cx, cy, 70 - i * 16, 22 + i * 6, t * (0.5 + i * 0.3) + i, 0, Math.PI * 2); neonStroke(ctx, 4, i === 1 ? B : G);
    }
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.fillStyle = '#fff'; ctx.shadowColor = G; ctx.shadowBlur = 30; ctx.fill();
  } else if (kind === 'wave') {
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let x = 20; x < W - 20; x += 4) { const y = cy + Math.sin(x * 0.03 + t * 2 + k) * (30 - k * 8) * Math.sin(x / W * Math.PI); x === 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      neonStroke(ctx, 3.5 - k, k === 1 ? B : G);
    }
  } else if (kind === 'bars') {
    for (let i = 0; i < 7; i++) {
      const h = 30 + (Math.sin(t * 2 + i * 0.9) * 0.5 + 0.5) * 90, x = cx - 84 + i * 28;
      ctx.beginPath(); ctx.moveTo(x, cy + 70); ctx.lineTo(x, cy + 70 - h); neonStroke(ctx, 9, i === 3 ? '#ffffff' : G);
    }
  } else if (kind === 'spiral') {
    for (let i = 0; i < 5; i++) {
      const y = cy + 60 - i * 30, w = 30 + i * 14 + Math.sin(t * 2 + i) * 6;
      ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); neonStroke(ctx, 6, i === 4 ? '#fff' : G);
    }
    ctx.beginPath(); ctx.moveTo(cx - 16, cy - 84); ctx.lineTo(cx, cy - 104 - Math.sin(t * 3) * 6); ctx.lineTo(cx + 16, cy - 84); neonStroke(ctx, 4, B);
  } else if (kind === 'grid') {
    for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) {
      const p = Math.sin(t * 3 - Math.hypot(i, j)) * 0.5 + 0.5;
      ctx.beginPath(); ctx.rect(cx + i * 26 - 8, cy + j * 26 - 8, 16, 16);
      ctx.fillStyle = `rgba(57,255,122,${0.15 + p * 0.85})`; ctx.shadowColor = G; ctx.shadowBlur = p * 18; ctx.fill();
    }
  }
  ctx.restore();
}
sizeArts();
addEventListener('resize', () => { sizeArts(); hoodGo(0); });
let hoodVisible = false;
ScrollTrigger.create({ trigger: '.hood', start: 'top bottom', end: 'bottom top', onToggle: (s) => (hoodVisible = s.isActive) });
gsap.ticker.add((time) => { if (hoodVisible) arts.forEach((a) => drawArt(a, time)); });
gsap.from('.card', { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.hood__wrap', start: 'top 85%' } });

/* ---------------- expanding preview ---------------- */
gsap.fromTo('#previewScreen', { width: () => (innerWidth <= 900 ? '78vw' : '30vw') }, {
  width: '100vw', ease: 'power2.inOut',
  scrollTrigger: { trigger: '.preview', start: 'top top', end: 'bottom bottom', scrub: 0.5 },
});
gsap.fromTo('.preview__device', { rotateX: 30, y: '12cqw' }, { rotateX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.preview', start: 'top top', end: 'bottom bottom', scrub: 0.5 } });

/* ---------------- partners carousel ---------------- */
const partTrack = $('#partTrack');
const partCount = $$('.partner', partTrack).length;
let partIdx = 0;
function partGo(d) {
  const max = partCount - perView();
  partIdx = (partIdx + d + max + 1) % (max + 1);
  partTrack.style.transform = `translateX(-${(100 / perView()) * partIdx}%)`;
}
$('#partPrev').onclick = () => partGo(-1);
$('#partNext').onclick = () => partGo(1);
gsap.from('.partner__logo', { scale: 0, rotate: -30, stagger: 0.12, duration: 0.9, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.partners', start: 'top 80%' } });

/* ---------------- footer lockup ---------------- */
gsap.fromTo('.lockup .mark', { yPercent: 60, rotate: -14 }, { yPercent: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.lockup', start: 'top bottom', end: 'center center', scrub: true } });
gsap.fromTo('.lockup span', { yPercent: 45 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.lockup', start: 'top bottom', end: 'center center', scrub: true } });
gsap.from('.badge', { opacity: 0, y: 16, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: '.badges', start: 'top 90%' } });

/* ---------------- loader → intro ---------------- */
const bar = $('#loaderBar');
let pct = 0;
const load = setInterval(() => {
  pct = Math.min(100, pct + Math.random() * 22);
  bar.style.width = `${pct}%`;
  if (pct >= 100) {
    clearInterval(load);
    setTimeout(start, 250);
  }
}, 110);

async function start() {
  $('#loader').classList.add('done');
  document.body.classList.remove('loading');
  lenis.start();
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
  // deep links like /#download (e.g. from the app) land on their section after the loader
  const target = location.hash.length > 1 && $(location.hash);
  if (target) setTimeout(() => lenis.scrollTo(target, { offset: -60, immediate: true }), 50);
  gsap.from('.nav', { y: -50, opacity: 0, duration: 0.9, ease: 'power3.out' });
  gsap.from('#stage', { opacity: 0, duration: 1.6, ease: 'power2.out' });
  gsap.from('.marquee', { opacity: 0, y: 30, duration: 1, delay: 0.4 });
  const [l1, l2] = $$('.hero__title [data-type]');
  await typeIn(l1, { speed: 34, delay: 300 });
  await typeIn(l2, { speed: 34 });
  gsap.to('.hero .reveal', { opacity: 1, y: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out' });
}
