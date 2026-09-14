import * as S from './store.js';
import * as Audio from './sound.js';
import * as P from './pools.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = $('#root');
const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
const hrs = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

/* ---------------- icons ---------------- */
const I = {
  home: '<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6"/>',
  squads: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.5-4 3.2-6 6.5-6s6 2 6.5 6M15 14c3.3-.3 6 1.6 6.5 5"/>',
  log: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  pools: '<path d="M3 17l5-6 4 3 5-7 4 4"/><path d="M3 21h18"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M9 9.5c0-1.4 1.3-2 3-2s3 .7 3 2-1.3 1.8-3 2.3-3 1-3 2.4 1.3 2.3 3 2.3 3-.8 3-2M12 5.5v13"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13"/>',
  devices: '<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M6 18h6M9 14v4"/><rect x="17" y="8" width="5" height="12" rx="1.2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 4v16l13-8Z"/>',
  rain: '<path d="M16 13a4 4 0 0 0 0-8 6 6 0 0 0-11.3 2A4 4 0 0 0 5 15h11M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>',
  cafe: '<path d="M4 8h13v5a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6ZM17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>',
  brown: '<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l-2-4M15 21l2-4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 18h4"/>',
  desktop: '<rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8M12 16v5"/>',
  watch: '<rect x="6" y="6" width="12" height="12" rx="3.5"/><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 10v2l1.5 1"/>',
  browser: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20"/>',
};
const ico = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const mark = (cls = 'mark') => `<svg class="${cls}" aria-hidden="true"><use href="#mark"/></svg>`;

/* ---------------- toasts & modals ---------------- */
export function toast(msg, err = false) {
  const t = document.createElement('div');
  t.className = `toast${err ? ' err' : ''}`;
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}
function modal(html, bind) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  bg.addEventListener('click', (e) => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  $('#modal-root').appendChild(bg);
  bind?.(bg, close);
  setTimeout(() => $('input, button:not([data-close])', bg)?.focus(), 30);
  return close;
}
function confirmBox({ title, body, ok = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    const close = modal(`<h3>${title}</h3><p>${body}</p><div class="modal__actions"><button class="btn btn--ghost" data-close>Cancel</button><button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-ok>${ok}</button></div>`,
      (el, c) => { $('[data-ok]', el).onclick = () => { c(); resolve(true); }; $$('[data-close]', el).forEach((b) => b.addEventListener('click', () => resolve(false))); });
    void close;
  });
}
function confetti() {
  if (S.get().settings.reducedMotion) return;
  const colors = ['#39ff7a', '#4d8dff', '#b8ff3c', '#eaf3ff'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.className = 'spark';
    p.style.background = colors[i % 4];
    p.style.left = `${50 + (Math.random() - 0.5) * 20}vw`; p.style.top = '45vh';
    document.body.appendChild(p);
    const dx = (Math.random() - 0.5) * 900, dy = -Math.random() * 500 - 100;
    p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${dx}px, ${dy + 900}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1600 + Math.random() * 800, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => p.remove();
  }
}

/* ---------------- router ---------------- */
const PUBLIC = ['login', 'signup', 'forgot'];
function parse() {
  const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), query: Object.fromEntries(new URLSearchParams(qs || '')) };
}
export const go = (h) => { if (location.hash === h) render(); else location.hash = h; };

function render() {
  const { parts, query } = parse();
  const name = parts[0] || 'dashboard';
  const user = S.get().user;
  closeMenus();
  $('.scrim')?.remove(); // mobile sidebar overlay from the previous page
  if (!user && !PUBLIC.includes(name)) {
    const next = encodeURIComponent(location.hash.replace(/^#/, '') || '/dashboard');
    location.replace(`#/login?next=${next}`);
    return;
  }
  if (user && PUBLIC.includes(name)) { location.replace(`#${query.next ? decodeURIComponent(query.next) : '/dashboard'}`); return; }
  if (PUBLIC.includes(name)) return renderAuth(name, query);
  const pages = { dashboard: Dashboard, pools: parts[1] ? PoolDetail : Pools, timer: Timer, squads: parts[1] ? SquadDetail : Squads, log: Log, sounds: Sounds, devices: Devices, settings: Settings };
  const page = pages[name] || Lost;
  renderShell(name, page, { parts, query });
  window.scrollTo(0, 0);
}
addEventListener('hashchange', render);

/* ---------------- auth ---------------- */
function renderAuth(mode, query) {
  const next = query.next ? `?next=${encodeURIComponent(query.next)}` : '';
  document.title = `${mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset password' : 'Log in'} · Leap Gate`;
  const art = `
    <aside class="auth__art">
      <a href="/" class="auth__brand">${mark()}LEAP GATE</a>
      <svg class="auth__plane" aria-hidden="true"><use href="#mark"/></svg>
      <div class="auth__pitch">
        <h1>Log off.<br /><em>Lift off.</em></h1>
        <p>Your focus timer, squads, ambient sounds and flight log — all in one calm cockpit. Everything in this demo is stored only in your browser.</p>
      </div>
      <nav class="auth__foot" aria-label="Legal"><a href="/">Website</a><a href="/legal/#privacy">Privacy</a><a href="/legal/#terms">Terms</a><a href="/legal/#cookies">Cookies</a></nav>
    </aside>`;
  let panel;
  if (mode === 'forgot') {
    panel = `
      <a class="auth__back" href="#/login${next}">${ico('back', 'mark')} Back to log in</a>
      <h2>Reset password</h2>
      <p class="sub">Enter your email and we'll send you a reset link.</p>
      <div id="forgotOk" class="success-box" hidden><b>Check your inbox.</b><br /><span class="fine" style="margin:0">If an account exists for <span id="forgotEmail"></span>, a reset link is on its way (demo — no email is actually sent).</span></div>
      <form id="forgotForm" novalidate>
        <div class="field"><label for="fEmail">Email</label><input class="input" id="fEmail" type="email" autocomplete="email" required /><div class="field__err"></div></div>
        <button class="btn btn--primary btn--block btn--lg">Send reset link</button>
      </form>
      <p class="fine">Remembered it? <a class="link" href="#/login${next}">Log in</a></p>`;
  } else {
    const isUp = mode === 'signup';
    panel = `
      <a class="auth__back" href="/">${ico('back', 'mark')} Back to website</a>
      <h2>${isUp ? 'Create account' : 'Welcome back'}</h2>
      <p class="sub">${isUp ? 'Start free. Upgrade to Leap Gate+ any time.' : 'Log in to pick up where Pip landed.'}</p>
      <div class="tabs" role="tablist"><a href="#/login${next}" class="${isUp ? '' : 'on'}" role="tab" aria-selected="${!isUp}">Log in</a><a href="#/signup${next}" class="${isUp ? 'on' : ''}" role="tab" aria-selected="${isUp}">Sign up</a></div>
      <div class="social">
        <button class="btn btn--ghost btn--block" data-provider="google"><b>G</b>Continue with Google</button>
        <button class="btn btn--ghost btn--block" data-provider="apple"><b>A</b>Continue with Apple</button>
      </div>
      <div class="divider">or with email</div>
      <form id="authForm" novalidate>
        ${isUp ? '<div class="field"><label for="aName">Name</label><input class="input" id="aName" autocomplete="name" required /><div class="field__err"></div></div>' : ''}
        <div class="field"><label for="aEmail">Email</label><input class="input" id="aEmail" type="email" autocomplete="email" required /><div class="field__err"></div></div>
        <div class="field"><label for="aPw">Password</label><div class="pw-wrap"><input class="input" id="aPw" type="password" autocomplete="${isUp ? 'new-password' : 'current-password'}" minlength="8" required /><button type="button" class="pw-toggle" id="pwToggle" aria-label="Show password">Show</button></div><div class="field__err"></div></div>
        <div class="row-between">
          ${isUp ? '<label class="check"><input type="checkbox" id="aTerms" /> I agree to the <a class="link" href="/legal/#terms" target="_blank" rel="noopener">Terms</a></label>' : '<label class="check"><input type="checkbox" checked /> Remember me</label><a class="link" href="#/forgot' + next + '">Forgot password?</a>'}
        </div>
        <button class="btn btn--primary btn--block btn--lg">${isUp ? 'Create account' : 'Log in'}</button>
      </form>
      <div class="divider">or</div>
      <button class="btn btn--ghost btn--block" id="guest">Explore as guest</button>
      <p class="fine">Demo sign-in: social buttons and email create a local profile only — no password is stored.</p>
      <p class="fine">${isUp ? 'Already flying with us? <a class="link" href="#/login' + next + '">Log in</a>' : 'New here? <a class="link" href="#/signup' + next + '">Create an account</a>'}</p>`;
  }
  root.innerHTML = `<div class="auth">${art}<main class="auth__panel"><div class="auth__card">${panel}</div></main></div>`;

  const finish = (user) => {
    S.signIn(user);
    toast(`Welcome${mode === 'signup' ? '' : ' back'}, ${S.get().user.name.split(' ')[0]}!`);
    location.hash = query.next ? decodeURIComponent(query.next) : '/dashboard';
  };
  const setErr = (input, msg) => { input.classList.toggle('invalid', !!msg); input.closest('.field').querySelector('.field__err').textContent = msg || ''; return !msg; };

  if (mode === 'forgot') {
    $('#forgotForm').onsubmit = (e) => {
      e.preventDefault();
      const em = $('#fEmail');
      if (!setErr(em, /^\S+@\S+\.\S+$/.test(em.value) ? '' : 'Enter a valid email address')) return;
      $('#forgotEmail').textContent = em.value;
      $('#forgotOk').hidden = false;
      $('#forgotForm').hidden = true;
    };
    return;
  }
  $('#pwToggle').onclick = (e) => { const pw = $('#aPw'); const show = pw.type === 'password'; pw.type = show ? 'text' : 'password'; e.target.textContent = show ? 'Hide' : 'Show'; e.target.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); };
  $$('[data-provider]').forEach((b) => (b.onclick = () => {
    const p = b.dataset.provider;
    b.disabled = true; b.lastChild.textContent = 'Connecting…';
    setTimeout(() => finish({ name: 'Alex Rivera', email: `alex@${p === 'google' ? 'gmail' : 'icloud'}.com`, provider: p }), 700);
  }));
  $('#guest').onclick = () => finish({ name: 'Guest Pilot', email: 'guest@leapgate.app', provider: 'guest' });
  $('#authForm').onsubmit = (e) => {
    e.preventDefault();
    const em = $('#aEmail'), pw = $('#aPw'), nm = $('#aName');
    let ok = setErr(em, /^\S+@\S+\.\S+$/.test(em.value) ? '' : 'Enter a valid email address');
    ok = setErr(pw, pw.value.length >= 8 ? '' : 'Use at least 8 characters') && ok;
    if (nm) ok = setErr(nm, nm.value.trim() ? '' : 'Tell us what to call you') && ok;
    if (mode === 'signup' && !$('#aTerms').checked) { toast('Please accept the Terms to continue', true); ok = false; }
    if (!ok) return;
    finish({ name: nm?.value.trim(), email: em.value.trim(), provider: 'email' }); // password intentionally discarded
  };
}

/* ---------------- shell ---------------- */
const NAV = [
  ['dashboard', 'Dashboard', 'home'], ['pools', 'Pools', 'pools'], ['timer', 'Focus timer', 'timer'], ['squads', 'Squads', 'squads'],
  ['log', 'Flight log', 'log'], ['sounds', 'Sounds', 'sound'],
];
const NAV2 = [['devices', 'Devices', 'devices'], ['settings', 'Settings', 'settings']];
let cleanup = null;

function renderShell(name, page, ctx) {
  cleanup?.(); cleanup = null;
  const st = S.get(), u = st.user;
  const unread = st.notifications.filter((n) => !n.read).length;
  const { title, html, bind } = page(ctx);
  document.title = `${title} · Leap Gate`;
  const link = ([k, label, icon]) => `<a href="#/${k}" class="${k === name ? 'on' : ''}" ${k === name ? 'aria-current="page"' : ''}>${ico(icon)}${label}</a>`;
  root.innerHTML = `
  <div class="shell">
    <aside class="side" id="side">
      <a href="/" class="side__brand" title="Back to the Leap Gate website">${mark()}LEAP GATE</a>
      <nav class="side__nav" aria-label="App">${NAV.map(link).join('')}</nav>
      <div class="side__label">Account</div>
      <nav class="side__nav" aria-label="Account">${NAV2.map(link).join('')}</nav>
      <div class="side__foot">
        ${u.plan === 'plus' ? '<div class="side__upsell"><b>Leap Gate+</b>Squads unlimited. Thanks for flying with us.</div>' : '<div class="side__upsell"><b>Leap Gate+</b>Unlimited squads, custom sounds and yearly flight logs.<a class="btn btn--primary btn--sm btn--block" href="#/settings?section=plan">Upgrade</a></div>'}
        <a class="btn btn--ghost btn--sm btn--block" href="/">${ico('back', 'mark')} Back to website</a>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open navigation" aria-expanded="false">${ico('menu')}</button>
        <h1>${title}</h1>
        <div class="topbar__spacer"></div>
        <a class="btn btn--ghost btn--sm hide-sm" id="liveChip" href="#/timer" hidden></a>
        <a class="btn btn--ghost btn--sm points-chip" href="#/pools?status=mine" title="Lift points — earned from focus minutes, play points only">${ico('coin', 'mark')} <b id="pointsVal">${st.points.toLocaleString()}</b> LP</a>
        <a class="btn btn--primary btn--sm hide-sm" href="#/timer?autostart=1">${ico('play', 'mark')} Start session</a>
        <div class="dropdown" id="notifDd">
          <button class="icon-btn" aria-label="Notifications${unread ? ` (${unread} unread)` : ''}" aria-haspopup="true" aria-expanded="false">${ico('bell')}${unread ? '<i class="badge-dot"></i>' : ''}</button>
          <div class="dropdown__menu" style="width:320px">
            <div class="dropdown__head row-between" style="margin:0"><b>Notifications</b><button class="link" id="markAll" style="width:auto;padding:0">Mark all read</button></div>
            ${st.notifications.length ? st.notifications.slice(0, 6).map((n) => `<a href="${n.href}" class="notif ${n.read ? '' : 'unread'}" data-nid="${n.id}"><span>${esc(n.text)}</span><small>${S.ago(n.ts)}</small></a>`).join('') : '<div class="empty">You are all caught up.</div>'}
          </div>
        </div>
        <div class="dropdown" id="userDd">
          <button class="avatar" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">${S.initials(u.name)}</button>
          <div class="dropdown__menu">
            <div class="dropdown__head"><b>${esc(u.name)}</b>${esc(u.email)}</div>
            <a href="#/settings">${ico('settings', 'mark')} Profile &amp; settings</a>
            <a href="#/devices">${ico('devices', 'mark')} Get the apps</a>
            <a href="/">${ico('back', 'mark')} Leap Gate website</a>
            <button id="logout">${ico('out', 'mark')} Log out</button>
          </div>
        </div>
      </header>
      <main class="page" id="page">${html}</main>
    </div>
  </div>`;

  // sidebar (mobile)
  const side = $('#side'), menuBtn = $('#menuBtn');
  const setSide = (open) => {
    side.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open));
    $('.scrim')?.remove();
    if (open) { const s = document.createElement('div'); s.className = 'scrim'; s.onclick = () => setSide(false); document.body.appendChild(s); }
  };
  menuBtn.onclick = () => setSide(!side.classList.contains('open'));
  $$('a', side).forEach((a) => a.addEventListener('click', () => setSide(false)));
  const onEsc = (e) => { if (e.key === 'Escape' && side.classList.contains('open')) setSide(false); };
  document.addEventListener('keydown', onEsc);
  // dropdowns
  $$('.dropdown').forEach((dd) => {
    const btn = dd.firstElementChild;
    btn.onclick = (e) => { e.stopPropagation(); const open = !dd.classList.contains('open'); closeMenus(); dd.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
  });
  $$('[data-nid]').forEach((a) => a.addEventListener('click', () => S.markRead(a.dataset.nid)));
  $('#markAll').onclick = (e) => { e.stopPropagation(); S.markAllRead(); toast('All notifications marked as read'); render(); };
  $('#logout').onclick = async () => {
    if (timer.running && !(await confirmBox({ title: 'Log out?', body: 'Your running session will land early and be saved.', ok: 'Log out' }))) return;
    if (timer.running) finishSession(false);
    Audio.stopAll(); S.signOut(); toast('Logged out. See you in the air.'); location.hash = '/login';
  };
  updateLiveChip();
  const pageCleanup = bind?.($('#page'));
  cleanup = () => { document.removeEventListener('keydown', onEsc); pageCleanup?.(); };
}
function closeMenus() { $$('.dropdown.open').forEach((d) => { d.classList.remove('open'); d.firstElementChild.setAttribute('aria-expanded', 'false'); }); }
document.addEventListener('click', (e) => { if (!e.target.closest('.dropdown')) closeMenus(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });

/* ---------------- timer engine (persists across pages) ---------------- */
const timer = { mode: 'sprint', total: 25 * 60, remaining: 25 * 60, running: false, paused: false, endAt: 0, task: '', squadId: null, distractions: 0, hiddenAt: 0, id: 0 };
function timerMinutes(mode) { const st = S.get().settings; return mode === 'custom' ? st.customMinutes : S.MODES[mode].minutes; }
function setMode(mode) { if (timer.running) return; timer.mode = mode; timer.total = timer.remaining = timerMinutes(mode) * 60; }
function startSession() {
  if (!timer.running) { timer.distractions = 0; timer.remaining = timer.total; }
  timer.running = true; timer.paused = false; timer.endAt = Date.now() + timer.remaining * 1000;
  clearInterval(timer.id); timer.id = setInterval(tick, 250);
  tick();
}
function pauseSession() { if (!timer.running || timer.paused) return; timer.paused = true; timer.remaining = Math.max(0, (timer.endAt - Date.now()) / 1000); clearInterval(timer.id); tick(); }
function resetSession() { clearInterval(timer.id); Object.assign(timer, { running: false, paused: false, remaining: timer.total, distractions: 0 }); document.title = 'Focus timer · Leap Gate'; tick(); }
function finishSession(completed) {
  const elapsedMin = Math.round((timer.total - Math.max(0, timer.remaining)) / 60);
  clearInterval(timer.id);
  const squadId = timer.squadId;
  Object.assign(timer, { running: false, paused: false });
  if (elapsedMin >= 1 || completed) {
    const sess = S.addSession({ mode: timer.mode, minutes: completed ? Math.round(timer.total / 60) : elapsedMin, task: timer.task, completed, distractions: timer.distractions });
    if (squadId) { const sq = S.get().squads.find((s) => s.id === squadId); sq?.members.forEach((m) => (m.minutes += Math.round(sess.minutes / 2))); S.save(); }
    if (completed) { if (S.get().settings.sounds) Audio.chime(); confetti(); }
    toast(completed ? `Landed! +${S.distanceOf(sess.minutes, S.streak())} km for Pip` : `Landed early — ${sess.minutes} min saved to your log`);
  } else toast('Session cancelled — nothing logged');
  timer.remaining = timer.total; timer.squadId = null;
  document.title = 'Leap Gate';
  updateLiveChip();
  if (parse().parts[0] === 'timer' || parse().parts[0] === 'dashboard') render();
}
function tick() {
  if (timer.running && !timer.paused) {
    timer.remaining = Math.max(0, (timer.endAt - Date.now()) / 1000);
    document.title = `${fmt(timer.remaining)} · ${S.MODES[timer.mode].label} · Leap Gate`;
    if (timer.remaining <= 0) return finishSession(true);
  }
  updateLiveChip();
  const view = $('#timerView');
  if (!view) return;
  const pct = 1 - timer.remaining / timer.total, C = 2 * Math.PI * 150;
  $('#ringProg').style.strokeDashoffset = String(C * (1 - pct));
  $('#ringTime').textContent = fmt(Math.ceil(timer.remaining));
  $('#ringState').textContent = timer.running ? (timer.paused ? 'Paused — Pip is hovering' : 'In flight') : 'Ready for take-off';
  const ang = pct * 2 * Math.PI - Math.PI / 2;
  $('#ringPlane').style.transform = `translate(${Math.cos(ang) * 150 * (view.querySelector('.ring').clientWidth / 340)}px, ${Math.sin(ang) * 150 * (view.querySelector('.ring').clientWidth / 340)}px) rotate(${pct * 360 + 90}deg)`;
  $('#tDistance').textContent = `${S.distanceOf((timer.total - timer.remaining) / 60, S.streak()).toFixed(1)} km`;
  $('#tDistractions').textContent = timer.distractions;
  const ctl = $('#controls');
  const want = timer.running ? (timer.paused ? 'paused' : 'running') : 'idle';
  if (ctl.dataset.state !== want) {
    ctl.dataset.state = want;
    ctl.innerHTML = want === 'idle'
      ? '<button class="btn btn--primary btn--lg" data-act="start">Take off</button>'
      : `${want === 'running' ? '<button class="btn btn--ghost btn--lg" data-act="pause">Pause</button>' : '<button class="btn btn--primary btn--lg" data-act="resume">Resume</button>'}
         <button class="btn btn--ghost btn--lg" data-act="land">Land now</button><button class="btn btn--danger btn--lg" data-act="reset">Cancel</button>`;
    $$('.modes button').forEach((b) => (b.disabled = timer.running));
    $('#customMin') && ($('#customMin').disabled = timer.running);
    $('#taskInput').disabled = timer.running;
  }
}
function updateLiveChip() {
  const chip = $('#liveChip');
  if (!chip) return;
  const show = timer.running && parse().parts[0] !== 'timer';
  chip.hidden = !show;
  if (show) chip.textContent = `● ${fmt(Math.ceil(timer.remaining))} ${timer.paused ? 'paused' : 'in flight'}`;
}
document.addEventListener('visibilitychange', () => {
  if (!timer.running || timer.paused || !S.get().settings.shield) return;
  if (document.hidden) timer.hiddenAt = Date.now();
  else if (timer.hiddenAt) {
    const away = Math.round((Date.now() - timer.hiddenAt) / 1000);
    timer.hiddenAt = 0;
    if (away >= 10) { timer.distractions++; toast(`Focus Shield: you were away ${away}s — Pip dipped a little`, true); }
  }
});
addEventListener('beforeunload', (e) => { if (timer.running) { e.preventDefault(); e.returnValue = ''; } });

/* ---------------- pages ---------------- */
function statCards() {
  const st = S.get(), today = S.minutesOn(Date.now()), week = S.sessionsSince(7), weekMin = week.reduce((a, s) => a + s.minutes, 0);
  const streak = S.streak(), dist = week.reduce((a, s) => a + S.distanceOf(s.minutes, streak), 0);
  return `
  <div class="grid-4">
    <a class="card stat" href="#/timer"><span class="eyebrow">Today</span><span class="stat__val">${today}<small>/ ${st.settings.goal} min</small></span><div class="progress"><i style="width:${Math.min(100, (today / st.settings.goal) * 100)}%"></i></div><span class="stat__foot">${today >= st.settings.goal ? '<b>Goal reached</b> — nice flying' : `${st.settings.goal - today} min to your daily goal`}</span></a>
    <a class="card stat" href="#/log"><span class="eyebrow">Streak</span><span class="stat__val">${streak}<small>days</small></span><span class="stat__foot">One rest day a week is <b>forgiven</b></span></a>
    <a class="card stat" href="#/log?range=7"><span class="eyebrow">This week</span><span class="stat__val">${hrs(weekMin)}</span><span class="stat__foot"><b>${week.length}</b> sessions logged</span></a>
    <a class="card stat" href="#/log?range=7"><span class="eyebrow">Pip flew</span><span class="stat__val">${dist.toFixed(1)}<small>km</small></span><span class="stat__foot">Streak bonus <b>+${Math.min(streak, 10) * 3}%</b></span></a>
  </div>`;
}
function chart(days) {
  const data = S.range(days), goal = S.get().settings.goal, max = Math.max(goal, ...data.map((d) => d.minutes), 1);
  const lbl = (d) => (days <= 7 ? d.date.toLocaleDateString(undefined, { weekday: 'short' }) : days <= 14 ? d.date.getDate() : (d.date.getDate() % 5 === 0 ? d.date.getDate() : ''));
  return `<div class="chart" style="--n:${days}" role="img" aria-label="Focus minutes per day for the last ${days} days">${data.map((d) => `<div class="chart__col"><div class="chart__bar ${d.minutes >= goal ? 'goal' : ''}" style="height:${(d.minutes / max) * 100}%">${days <= 14 && d.minutes ? `<span>${d.minutes}</span>` : ''}</div><span class="chart__lbl">${lbl(d)}</span></div>`).join('')}</div>`;
}
const modeIcon = (m) => `<span class="mode-ico">${ico(m === 'deep' ? 'brown' : m === 'custom' ? 'settings' : 'timer')}</span>`;
function sessionRow(s) {
  return `<div class="list__row">${modeIcon(s.mode)}<div class="list__main"><b>${esc(s.task)}</b><small>${S.ago(s.ts)} · ${s.minutes} min${s.distractions ? ` · ${s.distractions} distraction${s.distractions > 1 ? 's' : ''}` : ''}</small></div><span class="pill pill--${S.MODES[s.mode].pill}">${s.completed ? S.MODES[s.mode].label : 'Landed early'}</span></div>`;
}
const faces = (members) => `<div class="faces">${members.slice(0, 4).map((m) => `<span class="avatar avatar--sm" title="${esc(m.name)}">${S.initials(m.name)}</span>`).join('')}</div>`;

function Dashboard() {
  const st = S.get(), first = st.user.name.split(' ')[0];
  const hour = new Date().getHours(), greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return {
    title: 'Dashboard',
    html: `
    <section class="hello">
      ${mark()}
      <div><h2>${greet}, ${esc(first)}.</h2><p>${timer.running ? `A ${S.MODES[timer.mode].label.toLowerCase()} session is in flight.` : 'Ready when you are. Pick a mode and Pip takes off.'}</p></div>
      <div class="quick">
        ${timer.running ? '<a class="btn btn--primary btn--lg" href="#/timer">Back to session</a>' : `
        <a class="btn btn--primary btn--lg" href="#/timer?mode=sprint&autostart=1">Sprint · 25</a>
        <a class="btn btn--ghost btn--lg" href="#/timer?mode=deep&autostart=1">Deep · 90</a>
        <a class="btn btn--ghost btn--lg" href="#/timer?mode=custom">Custom</a>`}
      </div>
    </section>
    ${statCards()}
    <section class="card"><div class="card__head"><h2>Live pools</h2><div class="quick"><span class="eyebrow" id="dashPoolsClose"></span><a class="btn btn--ghost btn--sm" href="#/pools">All pools</a></div></div><div class="pool-strip" id="dashPools"><div class="empty">Loading live prices…</div></div></section>
    <div class="grid-2">
      <section class="card"><div class="card__head"><h2>Last 7 days</h2><a class="btn btn--ghost btn--sm" href="#/log">Open flight log</a></div>${chart(7)}</section>
      <section class="card"><div class="card__head"><h2>Your squads</h2><a class="btn btn--ghost btn--sm" href="#/squads">All squads</a></div>
        <div class="list">${st.squads.length ? st.squads.slice(0, 3).map((sq) => `<a class="list__row" href="#/squads/${sq.id}"><span class="squad-emblem" style="background:${sq.color};width:38px;height:38px;font-size:18px">${esc(sq.name[0])}</span><div class="list__main"><b>${esc(sq.name)}</b><small>${sq.members.filter((m) => m.status === 'focus').length} focusing now</small></div>${faces(sq.members)}</a>`).join('') : '<div class="empty">No squads yet.<br /><a class="btn btn--primary btn--sm" href="#/squads?new=1">Create a squad</a></div>'}</div>
      </section>
    </div>
    <div class="grid-2">
      <section class="card"><div class="card__head"><h2>Recent sessions</h2><a class="btn btn--ghost btn--sm" href="#/log">View all</a></div>
        <div class="list">${st.sessions.length ? st.sessions.slice(0, 5).map(sessionRow).join('') : '<div class="empty">No sessions yet.<br /><a class="btn btn--primary btn--sm" href="#/timer?autostart=1">Start your first</a></div>'}</div>
      </section>
      <section class="card"><div class="card__head"><h2>Set the mood</h2><a class="btn btn--ghost btn--sm" href="#/sounds">Mixer</a></div>
        <div class="list">${Object.entries(Audio.LAYERS).map(([k, l]) => `<div class="list__row"><span class="mode-ico">${ico(k)}</span><div class="list__main"><b>${l.label}</b><small>${l.desc}</small></div><button class="btn btn--ghost btn--sm" data-quick-sound="${k}">${Audio.isPlaying(k) ? 'Stop' : 'Play'}</button></div>`).join('')}</div>
      </section>
    </div>`,
    bind(page) {
      let alive = true;
      P.settleDue(toast).then((n) => n && alive && render());
      P.loadMarkets().then(() => {
        if (!alive) return;
        const end = P.liveEnd();
        const top = P.poolsFor('live').map((x) => ({ ...x, c: P.crowd(x.id, x.end) })).filter((x) => P.coinFor(x.id)).sort((a, b) => b.c.participants - a.c.participants).slice(0, 4);
        $('#dashPools', page).innerHTML = top.map((x) => poolCard(x.id, x.end, x.c, true)).join('');
        $('#dashPoolsClose', page).dataset.countdown = end;
        startCountdowns(page);
      });
      const stopTick = () => { alive = false; clearInterval(countdownTimer); };
      $$('[data-quick-sound]', page).forEach((b) => (b.onclick = () => {
        const k = b.dataset.quickSound;
        if (Audio.isPlaying(k)) { Audio.stop(k); b.textContent = 'Play'; } else { Audio.play(k, 0.5); b.textContent = 'Stop'; toast(`${Audio.LAYERS[k].label} playing — fine-tune it in Sounds`); }
      }));
      return stopTick;
    },
  };
}

function Timer({ query }) {
  if (!timer.running) {
    if (query.mode && S.MODES[query.mode]) setMode(query.mode);
    else setMode(timer.mode || S.get().settings.defaultMode);
    if (query.squad) timer.squadId = query.squad;
  }
  const sq = S.get().squads.find((s) => s.id === timer.squadId);
  const C = 2 * Math.PI * 150;
  return {
    title: 'Focus timer',
    html: `
    <div class="timer-wrap" id="timerView">
      <section class="card timer-card">
        <div class="modes" role="radiogroup" aria-label="Mode">${Object.entries(S.MODES).map(([k, m]) => `<button role="radio" aria-checked="${k === timer.mode}" class="${k === timer.mode ? 'on' : ''}" data-mode="${k}">${m.label} · ${k === 'custom' ? S.get().settings.customMinutes : m.minutes}</button>`).join('')}</div>
        ${timer.mode === 'custom' ? `<div class="custom-row"><label for="customMin" class="eyebrow">Minutes</label><input class="input" id="customMin" type="number" min="1" max="180" value="${S.get().settings.customMinutes}" /></div>` : ''}
        <input class="input task-input" id="taskInput" placeholder="What are you focusing on?" value="${esc(timer.task)}" maxlength="60" />
        <div class="ring">
          <svg viewBox="0 0 340 340"><circle class="track" cx="170" cy="170" r="150"/><circle id="ringProg" class="prog" cx="170" cy="170" r="150" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
          <svg id="ringPlane" class="ring__plane" aria-hidden="true"><use href="#mark"/></svg>
          <div class="ring__inner"><span class="ring__time" id="ringTime">${fmt(timer.remaining)}</span><span class="ring__state" id="ringState"></span></div>
        </div>
        <div class="controls" id="controls"></div>
      </section>
      <aside style="display:grid;gap:16px;align-content:start">
        <section class="card"><div class="card__head"><h2>This flight</h2>${sq ? `<a class="pill pill--blue" href="#/squads/${sq.id}">Squad · ${esc(sq.name)}</a>` : ''}</div>
          <div class="kv"><span>Distance</span><b id="tDistance">0.0 km</b></div>
          <div class="kv"><span>Distractions</span><b id="tDistractions">0</b></div>
          <div class="kv"><span>Focus Shield</span><a class="link" href="#/settings?section=focus">${S.get().settings.shield ? 'On' : 'Off'}</a></div>
          <div class="kv"><span>Streak</span><b>${S.streak()} days</b></div>
        </section>
        <section class="card"><div class="card__head"><h2>Soundscape</h2><a class="btn btn--ghost btn--sm" href="#/sounds">Open mixer</a></div>
          <div class="list">${Object.entries(Audio.LAYERS).slice(0, 3).map(([k, l]) => `<div class="list__row"><span class="mode-ico">${ico(k)}</span><div class="list__main"><b>${l.label}</b></div><label class="switch"><input type="checkbox" data-snd="${k}" ${Audio.isPlaying(k) ? 'checked' : ''} aria-label="${l.label}"/><span></span></label></div>`).join('')}</div>
        </section>
        <section class="card"><div class="card__head"><h2>Squad</h2></div>
          ${sq ? `<p style="margin:0 0 12px;color:var(--muted)">Flying with ${sq.members.length} others in ${esc(sq.name)}.</p><a class="btn btn--ghost btn--block" href="#/squads/${sq.id}">View squad</a>` : `<p style="margin:0 0 12px;color:var(--muted)">Focus is easier together. Start from a squad to fly in formation.</p><a class="btn btn--ghost btn--block" href="#/squads">Choose a squad</a>`}
        </section>
      </aside>
    </div>`,
    bind(page) {
      $$('[data-mode]', page).forEach((b) => (b.onclick = () => { setMode(b.dataset.mode); go(`#/timer?mode=${b.dataset.mode}`); }));
      $('#customMin', page)?.addEventListener('change', (e) => {
        const v = Math.min(180, Math.max(1, Math.round(+e.target.value || 45)));
        e.target.value = v; S.updateSettings({ customMinutes: v }); setMode('custom'); tick();
      });
      $('#taskInput', page).addEventListener('input', (e) => (timer.task = e.target.value));
      $('#controls', page).addEventListener('click', async (e) => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'start' || act === 'resume') { startSession(); if (act === 'start') toast(`Take-off! ${Math.round(timer.total / 60)} minutes of ${S.MODES[timer.mode].label.toLowerCase()} focus`); }
        if (act === 'pause') pauseSession();
        if (act === 'land') { if (await confirmBox({ title: 'Land now?', body: 'Your progress so far will be saved to your flight log.', ok: 'Land' })) finishSession(false); }
        if (act === 'reset') { if (await confirmBox({ title: 'Cancel session?', body: 'Nothing from this session will be logged.', ok: 'Cancel session', danger: true })) { resetSession(); toast('Session cancelled'); } }
      });
      $$('[data-snd]', page).forEach((c) => (c.onchange = () => (c.checked ? Audio.play(c.dataset.snd, 0.5) : Audio.stop(c.dataset.snd))));
      $('#controls', page).dataset.state = '';
      tick();
      if (query.autostart && !timer.running) { startSession(); toast(`Take-off! ${Math.round(timer.total / 60)} minutes of ${S.MODES[timer.mode].label.toLowerCase()} focus`); history.replaceState(null, '', `#/timer?mode=${timer.mode}`); }
    },
  };
}

function Squads({ query }) {
  const st = S.get();
  return {
    title: 'Squads',
    html: `
    <section class="hello"><div><h2>Fly in formation.</h2><p>Start a session together and everyone gets extra lift. Leave early and the squad loses a little.</p></div>
      <div class="quick"><button class="btn btn--primary btn--lg" id="newSquad">${ico('plus', 'mark')} Create squad</button><button class="btn btn--ghost btn--lg" id="joinSquad">Join with code</button></div></section>
    ${st.squads.length ? `<div class="grid-3">${st.squads.map((sq) => `
      <article class="card squad-card">
        <a class="squad-card__top" href="#/squads/${sq.id}"><span class="squad-emblem" style="background:${sq.color}">${esc(sq.name[0])}</span><div><b style="font:800 22px/1 var(--display);text-transform:uppercase">${esc(sq.name)}</b><div class="eyebrow" style="margin-top:6px">${sq.members.length + 1} pilots · ${sq.owner ? 'Owner' : 'Member'}</div></div></a>
        <div class="row-between" style="margin:0">${faces(sq.members)}<span class="pill pill--green">${sq.members.filter((m) => m.status === 'focus').length} focusing</span></div>
        <div class="quick"><a class="btn btn--primary btn--sm" href="#/timer?squad=${sq.id}&autostart=1">Start squad session</a><a class="btn btn--ghost btn--sm" href="#/squads/${sq.id}">Open</a></div>
      </article>`).join('')}</div>` : '<section class="card empty"><h2 style="font:800 28px/1 var(--display)">NO SQUADS YET</h2><p>Create one and share the invite code with friends.</p></section>'}`,
    bind() {
      $('#newSquad').onclick = openCreateSquad;
      $('#joinSquad').onclick = openJoinSquad;
      if (query.new) { history.replaceState(null, '', '#/squads'); openCreateSquad(); }
      if (query.join && /^[A-Z0-9]{6}$/i.test(query.join)) { const sq = S.joinSquad(query.join.toUpperCase()); toast(`Welcome to ${sq.name}!`); location.replace(`#/squads/${sq.id}`); }
    },
  };
}
function openCreateSquad() {
  modal(`<h3>Create squad</h3><p>Give your squad a name and a colour. You'll get an invite code to share.</p>
    <form id="sqForm" novalidate><div class="field"><label for="sqName">Squad name</label><input class="input" id="sqName" maxlength="28" required /><div class="field__err"></div></div>
    <div class="field"><label>Colour</label><div class="swatches">${S.squadColors.map((c, i) => `<label style="background:${c}"><input type="radio" name="sqColor" value="${c}" ${i === 0 ? 'checked' : ''} aria-label="Colour ${i + 1}"/><i></i></label>`).join('')}</div></div>
    <div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary">Create squad</button></div></form>`,
  (el, close) => {
    $('#sqForm', el).onsubmit = (e) => {
      e.preventDefault();
      const name = $('#sqName', el).value.trim();
      if (!name) { $('#sqName', el).classList.add('invalid'); $('.field__err', el).textContent = 'Name your squad'; return; }
      const sq = S.createSquad(name, $('input[name=sqColor]:checked', el).value);
      close(); toast(`${sq.name} is ready — invite code ${sq.code}`); go(`#/squads/${sq.id}`);
    };
  });
}
function openJoinSquad() {
  modal(`<h3>Join a squad</h3><p>Enter the 6-character invite code a friend shared with you.</p>
    <form id="joinForm" novalidate><div class="field"><label for="joinCode">Invite code</label><input class="input" id="joinCode" maxlength="6" placeholder="e.g. K7Q2ZP" style="text-transform:uppercase;font-family:var(--mono);letter-spacing:.2em" required /><div class="field__err"></div></div>
    <div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary">Join squad</button></div></form>`,
  (el, close) => {
    $('#joinForm', el).onsubmit = (e) => {
      e.preventDefault();
      const c = $('#joinCode', el).value.trim().toUpperCase();
      if (!/^[A-Z0-9]{6}$/.test(c)) { $('#joinCode', el).classList.add('invalid'); $('.field__err', el).textContent = 'Codes are 6 letters or numbers'; return; }
      const sq = S.joinSquad(c); close(); toast(`Welcome to ${sq.name}!`); go(`#/squads/${sq.id}`);
    };
  });
}

function SquadDetail({ parts }) {
  const sq = S.get().squads.find((s) => s.id === parts[1]);
  if (!sq) return Lost();
  const u = S.get().user, myMin = S.sessionsSince(7).reduce((a, s) => a + s.minutes, 0);
  const board = [...sq.members.map((m) => ({ ...m })), { name: `${u.name} (you)`, status: timer.running && timer.squadId === sq.id ? 'focus' : 'idle', minutes: myMin }].sort((a, b) => b.minutes - a.minutes);
  const link = `${location.origin}/app/#/squads?join=${sq.code}`;
  return {
    title: sq.name,
    html: `
    <a class="auth__back" href="#/squads" style="margin:0">${ico('back', 'mark')} All squads</a>
    <section class="hello"><div style="display:flex;gap:16px;align-items:center"><span class="squad-emblem" style="background:${sq.color};width:64px;height:64px;font-size:30px">${esc(sq.name[0])}</span><div><h2>${esc(sq.name)}</h2><p>${board.length} pilots · ${sq.members.filter((m) => m.status === 'focus').length} in flight right now</p></div></div>
      <div class="quick"><a class="btn btn--primary btn--lg" href="#/timer?squad=${sq.id}&autostart=1">Start squad session</a></div></section>
    <div class="grid-2">
      <section class="card"><div class="card__head"><h2>Leaderboard · 7 days</h2><span class="eyebrow">minutes</span></div>
        ${board.map((m, i) => `<div class="member"><span class="eyebrow" style="width:18px">${i + 1}</span><span class="avatar avatar--sm">${S.initials(m.name)}</span><div class="list__main"><b>${esc(m.name)}</b><small><i class="status ${m.status}" style="display:inline-block;margin-right:6px"></i>${m.status === 'focus' ? 'Focusing' : m.status === 'break' ? 'On a break' : 'Idle'}</small></div><b>${m.minutes}</b></div>`).join('')}
      </section>
      <section class="card"><div class="card__head"><h2>Invite pilots</h2></div>
        <div class="field"><label for="inviteCode">Invite code</label><div class="code-box"><input class="input" id="inviteCode" value="${sq.code}" readonly /><button class="btn btn--ghost" data-copy="${sq.code}">Copy code</button></div></div>
        <div class="field"><label for="inviteLink">Invite link</label><div class="code-box"><input class="input" id="inviteLink" value="${esc(link)}" readonly /><button class="btn btn--ghost" data-copy="${esc(link)}">Copy link</button></div></div>
        <button class="btn btn--ghost btn--block" id="inviteEmail">Invite by email</button>
        <div class="divider">danger zone</div>
        <button class="btn btn--danger btn--block" id="leaveSquad">${sq.owner ? 'Delete squad' : 'Leave squad'}</button>
      </section>
    </div>`,
    bind(page) {
      $$('[data-copy]', page).forEach((b) => (b.onclick = async () => {
        try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copied to clipboard'); } catch { b.previousElementSibling.select(); toast('Press ⌘/Ctrl + C to copy', true); }
      }));
      $('#inviteEmail', page).onclick = () => modal(`<h3>Invite by email</h3><p>We'll send an invite with the code ${sq.code} (demo — nothing is actually sent).</p>
        <form id="invForm" novalidate><div class="field"><label for="invEmail">Friend's email</label><input class="input" id="invEmail" type="email" required /><div class="field__err"></div></div>
        <div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary">Send invite</button></div></form>`, (el, close) => {
        $('#invForm', el).onsubmit = (e) => {
          e.preventDefault(); const v = $('#invEmail', el).value;
          if (!/^\S+@\S+\.\S+$/.test(v)) { $('#invEmail', el).classList.add('invalid'); $('.field__err', el).textContent = 'Enter a valid email'; return; }
          S.notify(`Invite to ${sq.name} sent to ${v}`, `#/squads/${sq.id}`); S.save(); close(); toast(`Invite sent to ${v}`); render();
        };
      });
      $('#leaveSquad', page).onclick = async () => {
        if (!(await confirmBox({ title: sq.owner ? 'Delete squad?' : 'Leave squad?', body: sq.owner ? 'Everyone will be removed and the invite code stops working.' : `You can rejoin later with code ${sq.code}.`, ok: sq.owner ? 'Delete' : 'Leave', danger: true }))) return;
        S.leaveSquad(sq.id); toast(sq.owner ? `${sq.name} deleted` : `You left ${sq.name}`); go('#/squads');
      };
    },
  };
}

function Log({ query }) {
  const days = [7, 30, 90].includes(+query.range) ? +query.range : 14;
  const list = S.sessionsSince(days), total = list.reduce((a, s) => a + s.minutes, 0), done = list.filter((s) => s.completed).length;
  const streak = S.streak();
  return {
    title: 'Flight log',
    html: `
    <div class="row-between" style="margin:0;flex-wrap:wrap">
      <nav class="seg" aria-label="Range">${[7, 14, 30, 90].map((d) => `<a href="#/log?range=${d}" class="${d === days ? 'on' : ''}">${d} days</a>`).join('')}</nav>
      <div class="quick"><button class="btn btn--ghost btn--sm" id="exportCsv">Export CSV</button><a class="btn btn--primary btn--sm" href="#/timer?autostart=1">Log a new flight</a></div>
    </div>
    <div class="grid-4">
      <div class="card stat"><span class="eyebrow">Focus time</span><span class="stat__val">${hrs(total)}</span></div>
      <div class="card stat"><span class="eyebrow">Sessions</span><span class="stat__val">${list.length}</span><span class="stat__foot"><b>${list.length ? Math.round((done / list.length) * 100) : 0}%</b> landed on time</span></div>
      <div class="card stat"><span class="eyebrow">Distance</span><span class="stat__val">${list.reduce((a, s) => a + S.distanceOf(s.minutes, streak), 0).toFixed(1)}<small>km</small></span></div>
      <a class="card stat" href="#/settings?section=goals"><span class="eyebrow">Daily goal</span><span class="stat__val">${S.get().settings.goal}<small>min</small></span><span class="stat__foot">Change goal →</span></a>
    </div>
    <section class="card"><div class="card__head"><h2>Minutes per day</h2><span class="eyebrow">glowing bars hit your goal</span></div>${chart(Math.min(days, 30))}</section>
    <section class="card"><div class="card__head"><h2>Sessions</h2></div>
      ${list.length ? `<div class="table-wrap"><table><thead><tr><th>When</th><th>Task</th><th>Mode</th><th>Minutes</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>
      ${list.map((s) => `<tr><td>${new Date(s.ts).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td><td>${esc(s.task)}</td><td><span class="pill pill--${S.MODES[s.mode].pill}">${S.MODES[s.mode].label}</span></td><td>${s.minutes}</td><td>${s.completed ? 'Landed' : 'Early'}</td><td><button class="btn btn--ghost btn--sm" data-del="${s.id}">Delete</button></td></tr>`).join('')}
      </tbody></table></div>` : `<div class="empty">No flights in this range.<br /><a class="btn btn--primary btn--sm" href="#/timer?autostart=1">Start a session</a></div>`}
    </section>`,
    bind(page) {
      $$('[data-del]', page).forEach((b) => (b.onclick = async () => {
        if (!(await confirmBox({ title: 'Delete session?', body: 'This removes it from your log and stats.', ok: 'Delete', danger: true }))) return;
        S.deleteSession(b.dataset.del); toast('Session deleted'); render();
      }));
      $('#exportCsv', page).onclick = () => {
        const rows = [['date', 'task', 'mode', 'minutes', 'completed', 'distractions'], ...list.map((s) => [new Date(s.ts).toISOString(), `"${s.task.replace(/"/g, '""')}"`, s.mode, s.minutes, s.completed, s.distractions])];
        const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }));
        const a = Object.assign(document.createElement('a'), { href: url, download: `leap-gate-flight-log-${days}d.csv` });
        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        toast(`Exported ${list.length} sessions`);
      };
    },
  };
}

const mix = { rain: 0.5, cafe: 0.35, brown: 0.4, train: 0.4 };
function Sounds() {
  const st = S.get();
  return {
    title: 'Sounds',
    html: `
    <section class="hello"><div><h2>Set the mood.</h2><p>Layer up to four ambient sounds. Everything is generated live in your browser — no downloads.</p></div>
      <div class="quick"><button class="btn btn--ghost btn--lg" id="stopAll">Stop all</button><button class="btn btn--primary btn--lg" id="savePreset">Save as preset</button></div></section>
    <div class="grid-4">${Object.entries(Audio.LAYERS).map(([k, l]) => `
      <section class="card sound ${Audio.isPlaying(k) ? 'playing' : ''}" data-layer="${k}">
        <div class="sound__top"><span class="sound__ico">${ico(k)}</span><div class="list__main"><b>${l.label}</b><small style="color:var(--muted)">${l.desc}</small></div><div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
        <label class="eyebrow" for="vol-${k}">Volume</label><input type="range" id="vol-${k}" min="0" max="1" step="0.01" value="${mix[k]}" data-vol="${k}" />
        <button class="btn ${Audio.isPlaying(k) ? 'btn--ghost' : 'btn--primary'} btn--block" data-toggle="${k}">${Audio.isPlaying(k) ? 'Stop' : 'Play'}</button>
      </section>`).join('')}</div>
    <section class="card"><div class="card__head"><h2>Presets</h2><a class="btn btn--ghost btn--sm" href="#/timer?autostart=1">Start a session with this mix</a></div>
      ${st.presets.length ? `<div class="list">${st.presets.map((p) => `<div class="list__row"><span class="mode-ico">${ico('sound')}</span><div class="list__main"><b>${esc(p.name)}</b><small>${Object.entries(p.mix).filter(([, v]) => v > 0).map(([k, v]) => `${Audio.LAYERS[k].label} ${Math.round(v * 100)}%`).join(' · ') || 'Silence'}</small></div><button class="btn btn--primary btn--sm" data-load="${p.id}">Play</button><button class="btn btn--ghost btn--sm" data-rm="${p.id}">Delete</button></div>`).join('')}</div>` : '<div class="empty">No presets yet — build a mix and save it.</div>'}
    </section>`,
    bind(page) {
      const refresh = (k) => {
        const card = $(`[data-layer="${k}"]`, page), on = Audio.isPlaying(k), btn = $('[data-toggle]', card);
        card.classList.toggle('playing', on); btn.textContent = on ? 'Stop' : 'Play'; btn.className = `btn ${on ? 'btn--ghost' : 'btn--primary'} btn--block`;
      };
      $$('[data-toggle]', page).forEach((b) => (b.onclick = () => { const k = b.dataset.toggle; Audio.isPlaying(k) ? Audio.stop(k) : Audio.play(k, mix[k]); refresh(k); }));
      $$('[data-vol]', page).forEach((r) => (r.oninput = () => { const k = r.dataset.vol; mix[k] = +r.value; Audio.setVolume(k, mix[k]); }));
      $('#stopAll', page).onclick = () => { Audio.stopAll(); Object.keys(Audio.LAYERS).forEach(refresh); toast('All sounds stopped'); };
      $('#savePreset', page).onclick = () => {
        const active = Object.fromEntries(Object.keys(Audio.LAYERS).map((k) => [k, Audio.isPlaying(k) ? mix[k] : 0]));
        if (!Object.values(active).some(Boolean)) return toast('Play at least one sound before saving a preset', true);
        modal(`<h3>Save preset</h3><p>Name this mix so you can bring it back in one tap.</p><form id="pForm"><div class="field"><label for="pName">Preset name</label><input class="input" id="pName" maxlength="24" required value="My mix" /></div><div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary">Save preset</button></div></form>`,
          (el, close) => { $('#pForm', el).onsubmit = (e) => { e.preventDefault(); S.savePreset($('#pName', el).value.trim() || 'My mix', active); close(); toast('Preset saved'); render(); }; });
      };
      $$('[data-load]', page).forEach((b) => (b.onclick = () => {
        const p = S.get().presets.find((x) => x.id === b.dataset.load);
        Audio.stopAll();
        Object.entries(p.mix).forEach(([k, v]) => { mix[k] = v || mix[k]; if (v > 0) Audio.play(k, v); });
        toast(`Playing “${p.name}”`); setTimeout(render, 50);
      }));
      $$('[data-rm]', page).forEach((b) => (b.onclick = async () => { if (await confirmBox({ title: 'Delete preset?', body: 'This mix will be removed.', ok: 'Delete', danger: true })) { S.deletePreset(b.dataset.rm); toast('Preset deleted'); render(); } }));
    },
  };
}

const PLATFORMS = {
  phone: ['iPhone & Android', 'phone', 'Flip-to-focus, lock-screen timer and a widget that shows how far Pip flew today.'],
  desktop: ['Mac & Windows', 'desktop', 'A menu-bar timer that hides distracting sites and apps for exactly as long as you choose.'],
  watch: ['Watch', 'watch', 'A soft tap on your wrist when sessions start, breaks end and your squad takes off.'],
  browser: ['Browser extension', 'browser', 'Syncs with your running session and swaps endless feeds for a calm landing page.'],
};
function Devices({ query }) {
  return {
    title: 'Devices',
    html: `
    <section class="hello"><div><h2>Leap Gate, everywhere.</h2><p>You're using the web app right now. Send yourself a link to install on your other devices — your sessions sync automatically.</p></div>
      <div class="quick"><a class="btn btn--primary btn--lg" href="#/dashboard">Continue in web app</a></div></section>
    <div class="grid-4">${Object.entries(PLATFORMS).map(([k, [name, icon, desc]]) => `
      <section class="card device ${query.p === k ? 'on' : ''}" id="dev-${k}">
        ${ico(icon, 'device__ico')}<h3>${name}</h3><p>${desc}</p>
        <button class="btn btn--primary btn--block" data-send="${k}">Send me the link</button>
        <a class="btn btn--ghost btn--block" href="/#download">See on website</a>
      </section>`).join('')}</div>
    <section class="card"><div class="card__head"><h2>Signed-in devices</h2></div>
      <div class="list"><div class="list__row"><span class="mode-ico">${ico('browser')}</span><div class="list__main"><b>This browser</b><small>Active now</small></div><span class="pill pill--green">Current</span></div></div>
    </section>`,
    bind(page) {
      if (query.p) $(`#dev-${query.p}`, page)?.scrollIntoView({ block: 'center' });
      $$('[data-send]', page).forEach((b) => (b.onclick = () => {
        const [name] = PLATFORMS[b.dataset.send];
        modal(`<h3>Send link</h3><p>We'll email you a download link for ${name} (demo — nothing is actually sent).</p><form id="sForm" novalidate><div class="field"><label for="sEmail">Email</label><input class="input" id="sEmail" type="email" value="${esc(S.get().user.email)}" required /><div class="field__err"></div></div><div class="modal__actions"><button type="button" class="btn btn--ghost" data-close>Cancel</button><button class="btn btn--primary">Send link</button></div></form>`,
          (el, close) => { $('#sForm', el).onsubmit = (e) => { e.preventDefault(); const v = $('#sEmail', el).value; if (!/^\S+@\S+\.\S+$/.test(v)) { $('#sEmail', el).classList.add('invalid'); $('.field__err', el).textContent = 'Enter a valid email'; return; } S.notify(`Download link for ${name} sent to ${v}`, '#/devices'); S.save(); close(); toast(`Link for ${name} sent to ${v}`); render(); }; });
      }));
    },
  };
}

function Settings({ query }) {
  const st = S.get(), u = st.user, s = st.settings;
  const row = (key, title, desc) => `<div class="settings-row"><div><b>${title}</b><small>${desc}</small></div><label class="switch"><input type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''} aria-label="${title}"/><span></span></label></div>`;
  return {
    title: 'Settings',
    html: `
    <div class="grid-2">
      <section class="card" id="profile"><div class="card__head"><h2>Profile</h2><span class="pill">${esc(u.provider)} account</span></div>
        <form id="profileForm" novalidate>
          <div class="form-2"><div class="field"><label for="pfName">Name</label><input class="input" id="pfName" value="${esc(u.name)}" required /><div class="field__err"></div></div>
          <div class="field"><label for="pfEmail">Email</label><input class="input" id="pfEmail" type="email" value="${esc(u.email)}" required /><div class="field__err"></div></div></div>
          <button class="btn btn--primary">Save profile</button>
        </form>
      </section>
      <section class="card" id="plan"><div class="card__head"><h2>Plan</h2><span class="pill ${u.plan === 'plus' ? 'pill--green' : ''}">${u.plan === 'plus' ? 'Leap Gate+' : 'Free'}</span></div>
        ${u.plan === 'plus' ? '<p style="margin:0 0 14px;color:var(--muted)">Unlimited squads, custom sounds and yearly flight logs are unlocked.</p><button class="btn btn--ghost" id="downgrade">Switch back to Free</button>'
          : '<p style="margin:0 0 14px;color:var(--muted)">Upgrade for unlimited squads, custom sound presets and yearly flight logs. 14-day free trial, cancel any time.</p><button class="btn btn--primary" id="upgrade">Start free trial</button>'}
      </section>
    </div>
    <div class="grid-2">
      <section class="card" id="goals"><div class="card__head"><h2>Goals &amp; timer</h2></div>
        <div class="field"><label for="goal">Daily goal · <span id="goalVal">${s.goal}</span> min</label><input type="range" id="goal" min="15" max="480" step="15" value="${s.goal}" /></div>
        <div class="form-2">
          <div class="field"><label for="defMode">Default mode</label><select class="input" id="defMode">${Object.entries(S.MODES).map(([k, m]) => `<option value="${k}" ${k === s.defaultMode ? 'selected' : ''}>${m.label}</option>`).join('')}</select></div>
          <div class="field"><label for="custMin">Custom length (min)</label><input class="input" id="custMin" type="number" min="1" max="180" value="${s.customMinutes}" /></div>
        </div>
        <a class="btn btn--ghost btn--sm" href="#/timer">Open timer</a>
      </section>
      <section class="card" id="focus"><div class="card__head"><h2>Focus &amp; alerts</h2></div>
        ${row('shield', 'Focus Shield', 'Count a distraction when you leave the tab for 10s+')}
        ${row('notifications', 'Notifications', 'Squad take-offs and weekly recaps')}
        ${row('sounds', 'Landing chime', 'Play a chime when a session completes')}
        ${row('weeklyEmail', 'Weekly email recap', 'A Sunday summary of your flight log')}
      </section>
    </div>
    <div class="grid-2">
      <section class="card" id="integrations"><div class="card__head"><h2>Integrations</h2></div>
        ${row('calendar', 'Calendar sync', 'Suggest sessions in empty calendar blocks')}
        ${row('reducedMotion', 'Reduce motion', 'Turn off confetti and decorative animation')}
        <div class="settings-row"><div><b>Other devices</b><small>Phone, desktop, watch and browser</small></div><a class="btn btn--ghost btn--sm" href="#/devices">Manage</a></div>
      </section>
      <section class="card" id="data"><div class="card__head"><h2>Your data</h2></div>
        <div class="settings-row"><div><b>Export flight log</b><small>Download sessions as CSV</small></div><a class="btn btn--ghost btn--sm" href="#/log?range=90">Go to export</a></div>
        <div class="settings-row"><div><b>Reset demo data</b><small>Regenerate sample sessions and squads</small></div><button class="btn btn--ghost btn--sm" id="resetDemo">Reset</button></div>
        <div class="settings-row"><div><b>Legal</b><small>How we treat your data</small></div><a class="btn btn--ghost btn--sm" href="/legal/#privacy">Privacy policy</a></div>
        <div class="settings-row"><div><b>Delete account</b><small>Erase everything stored in this browser</small></div><button class="btn btn--danger btn--sm" id="deleteAcc">Delete</button></div>
        <div class="settings-row"><div><b>Log out</b><small>Signed in as ${esc(u.email)}</small></div><button class="btn btn--ghost btn--sm" id="logout2">Log out</button></div>
      </section>
    </div>`,
    bind(page) {
      if (query.section) setTimeout(() => $(`#${query.section}`, page)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      $('#profileForm', page).onsubmit = (e) => {
        e.preventDefault();
        const n = $('#pfName', page), em = $('#pfEmail', page);
        const bad = (el, m) => { el.classList.toggle('invalid', !!m); el.nextElementSibling.textContent = m; return !!m; };
        if (bad(n, n.value.trim() ? '' : 'Name is required') | bad(em, /^\S+@\S+\.\S+$/.test(em.value) ? '' : 'Enter a valid email')) return;
        S.updateUser({ name: n.value.trim(), email: em.value.trim() }); toast('Profile saved'); render();
      };
      $('#goal', page).oninput = (e) => ($('#goalVal', page).textContent = e.target.value);
      $('#goal', page).onchange = (e) => { S.updateSettings({ goal: +e.target.value }); toast(`Daily goal set to ${e.target.value} min`); };
      $('#defMode', page).onchange = (e) => { S.updateSettings({ defaultMode: e.target.value }); if (!timer.running) setMode(e.target.value); toast('Default mode updated'); };
      $('#custMin', page).onchange = (e) => { const v = Math.min(180, Math.max(1, Math.round(+e.target.value || 45))); e.target.value = v; S.updateSettings({ customMinutes: v }); toast(`Custom length set to ${v} min`); };
      $$('[data-set]', page).forEach((c) => (c.onchange = async () => {
        if (c.dataset.set === 'notifications' && c.checked && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch { /* ignore */ } }
        S.updateSettings({ [c.dataset.set]: c.checked }); toast(`${c.closest('.settings-row').querySelector('b').textContent} ${c.checked ? 'on' : 'off'}`);
      }));
      $('#upgrade', page)?.addEventListener('click', () => { S.updateUser({ plan: 'plus' }); S.notify('Your Leap Gate+ trial has started — 14 days free', '#/settings?section=plan'); S.save(); confetti(); toast('Welcome to Leap Gate+!'); render(); });
      $('#downgrade', page)?.addEventListener('click', async () => { if (await confirmBox({ title: 'Switch to Free?', body: 'You will keep your data but lose Leap Gate+ features.', ok: 'Switch to Free' })) { S.updateUser({ plan: 'free' }); toast('You are on the Free plan'); render(); } });
      $('#resetDemo', page).onclick = async () => { if (await confirmBox({ title: 'Reset demo data?', body: 'Sessions, squads, presets and notifications are replaced with fresh samples.', ok: 'Reset' })) { S.resetDemo(); toast('Demo data reset'); go('#/dashboard'); } };
      $('#deleteAcc', page).onclick = async () => { if (await confirmBox({ title: 'Delete account?', body: 'Everything stored in this browser is erased. This cannot be undone.', ok: 'Delete account', danger: true })) { resetSession(); Audio.stopAll(); S.wipe(); toast('Account deleted'); location.hash = '/signup'; } };
      $('#logout2', page).onclick = () => $('#logout').click();
    },
  };
}


/* ---------------- pools ---------------- */
let countdownTimer = 0;
function startCountdowns(scope) {
  clearInterval(countdownTimer);
  const run = () => {
    $$('[data-countdown]', scope).forEach((el) => {
      const end = +el.dataset.countdown, left = end - Date.now();
      el.textContent = el.dataset.prefix ? `${el.dataset.prefix} ${P.countdown(left)}` : P.countdown(left);
    });
    const pv = $('#pointsVal'); if (pv) pv.textContent = S.get().points.toLocaleString();
  };
  run();
  countdownTimer = setInterval(run, 1000);
}
const coinImg = (c, size = 40) => c?.image
  ? `<img class="coin-img" src="${esc(c.image)}" alt="" width="${size}" height="${size}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'coin-img coin-img--txt',textContent:'${esc((c.symbol || '?')[0].toUpperCase())}'}))" />`
  : `<span class="coin-img coin-img--txt" style="width:${size}px;height:${size}px">${esc((c?.symbol || '?')[0].toUpperCase())}</span>`;
const statusPill = (st) => ({ live: '<span class="pill pill--live">● Live</span>', locked: '<span class="pill pill--lock">Locked</span>', upcoming: '<span class="pill pill--blue">Upcoming</span>', resolved: '<span class="pill">Resolved</span>' }[st]);
const changeTag = (ch) => `<span class="chg ${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(2)}%</span>`;

function poolCard(id, end, c, compact = false) {
  const coin = P.coinFor(id), st = P.statusOf(end);
  if (!coin) return '';
  const mine = c.mine.length;
  return `<a class="card pool ${st === 'live' ? 'pool--live' : ''}" href="#/pools/${id}?end=${end}">
    <div class="pool__top">${coinImg(coin)}${mine ? '<span class="pill pill--lime">Your call</span>' : ''}${statusPill(st)}</div>
    <h3 class="pool__title">${esc(coin.symbol.toUpperCase())} price at ${P.fmtTime(end)}</h3>
    <div class="pool__name">${esc(coin.name)}</div>
    <div class="pool__now">now <b>${P.fmtPrice(coin.price)}</b> ${changeTag(coin.change)}</div>
    ${compact ? '' : '<hr />'}
    <div class="pool__stats">
      <div><span class="eyebrow">Participants</span><b>${c.participants}</b></div>
      <div><span class="eyebrow">Total staked</span><b>${c.staked.toLocaleString()} LP</b></div>
      <div><span class="eyebrow">${st === 'resolved' ? 'Closed' : st === 'upcoming' ? 'Opens in' : 'Time left'}</span><b data-countdown="${st === 'upcoming' ? end - P.HOUR : end}">${P.countdown((st === 'upcoming' ? end - P.HOUR : end) - Date.now())}</b></div>
    </div>
  </a>`;
}

function Pools({ query }) {
  const status = ['live', 'upcoming', 'resolved', 'mine', 'all'].includes(query.status) ? query.status : 'live';
  const cat = CATS.includes(query.cat) ? query.cat : 'all';
  const q = (query.q || '').toLowerCase();
  const link = (patch) => `#/pools?${new URLSearchParams({ status, cat, ...(q ? { q } : {}), ...patch })}`;
  return {
    title: 'Pools',
    html: `
    <section class="pools-head">
      <div><h2 class="pools-h">Pools</h2><p>Call where a coin closes each hour. The nearer you land, the more Lift points you earn.</p></div>
      <nav class="seg" aria-label="Status">${[['live', 'Live'], ['upcoming', 'Upcoming'], ['resolved', 'Resolved'], ['mine', 'My forecasts'], ['all', 'All']].map(([k, l]) => `<a href="${link({ status: k })}" class="${k === status ? 'on' : ''}">${l}</a>`).join('')}</nav>
    </section>
    <div class="pools-bar">
      <nav class="cats" aria-label="Category" id="cats"><a href="${link({ cat: 'all' })}" class="${cat === 'all' ? 'on' : ''}">All pools <i data-count="all">…</i></a>${Object.entries(P.CATEGORIES).map(([k, v]) => `<a href="${link({ cat: k })}" class="${cat === k ? 'on' : ''}">${v.label} <i data-count="${k}">…</i></a>`).join('')}</nav>
      <div class="pools-tools">
        <input class="input input--sm" id="poolSearch" type="search" placeholder="Search coins" value="${esc(q)}" aria-label="Search coins" />
        <a class="btn btn--ghost btn--sm" href="#/pools?status=${status}&cat=${cat}" id="refreshPools">Refresh prices</a>
        <a class="btn btn--primary btn--sm" href="#/timer?autostart=1" title="Earn 1 LP per focused minute">Earn LP</a>
      </div>
    </div>
    <p class="api-note" id="apiNote">Live prices from Binance &amp; CoinGecko, refreshed every minute · Lift points are play points with no cash value.</p>
    <div id="poolsBody"><div class="pool-grid">${Array.from({ length: 8 }, () => '<div class="card pool pool--skeleton"></div>').join('')}</div></div>`,
    bind(page) {
      let alive = true;
      const draw = async (force) => {
        await P.loadMarkets(force);
        if (!alive) return;
        await P.settleDue(toast);
        $('#apiNote', page).textContent = P.isSimulated() ? 'Price APIs unreachable right now — showing reference prices. Lift points are play points with no cash value.' : 'Live prices from Binance & CoinGecko, refreshed every minute · Lift points are play points with no cash value.';
        const inCat = (id) => (cat === 'all' || P.CATEGORIES[cat].ids.includes(id));
        const matches = (id) => !q || `${id} ${P.coinFor(id)?.symbol} ${P.coinFor(id)?.name}`.toLowerCase().includes(q);
        const body = $('#poolsBody', page);
        if (status === 'mine') {
          const list = S.get().forecasts.filter((f) => inCat(f.coinId) && matches(f.coinId));
          Object.keys(P.CATEGORIES).concat('all').forEach((k) => { const el = $(`[data-count="${k}"]`, page); if (el) el.textContent = S.get().forecasts.filter((f) => k === 'all' || P.CATEGORIES[k].ids.includes(f.coinId)).length; });
          const won = S.get().forecasts.filter((f) => f.status !== 'open').reduce((a, f) => a + (f.payout - f.stake), 0);
          body.innerHTML = `<div class="grid-4" style="margin-bottom:16px">
            <div class="card stat"><span class="eyebrow">Balance</span><span class="stat__val">${S.get().points.toLocaleString()}<small>LP</small></span><a class="stat__foot" href="#/timer?autostart=1">Earn more by focusing →</a></div>
            <div class="card stat"><span class="eyebrow">Open calls</span><span class="stat__val">${S.get().forecasts.filter((f) => f.status === 'open').length}</span></div>
            <div class="card stat"><span class="eyebrow">Resolved</span><span class="stat__val">${S.get().forecasts.filter((f) => f.status !== 'open').length}</span></div>
            <div class="card stat"><span class="eyebrow">Net result</span><span class="stat__val ${won >= 0 ? 'txt-up' : 'txt-down'}">${won >= 0 ? '+' : ''}${won}<small>LP</small></span></div></div>
          ${list.length ? `<section class="card"><div class="table-wrap"><table><thead><tr><th>Pool</th><th>Close</th><th>Your call</th><th>Stake</th><th>Status</th><th>Actual</th><th>Payout</th><th><span class="sr-only">Open</span></th></tr></thead><tbody>
            ${list.map((f) => { const c = P.coinFor(f.coinId); return `<tr><td><span class="cell-coin">${coinImg(c, 22)} ${esc(f.symbol.toUpperCase())}</span></td><td>${P.fmtTime(f.end)}</td><td>${P.fmtPrice(f.price)}</td><td>${f.stake} LP</td><td>${f.status === 'open' ? `<span class="pill pill--live" data-countdown="${f.end}">${P.countdown(f.end - Date.now())}</span>` : `<span class="pill ${f.status === 'won' ? 'pill--green' : f.status === 'partial' ? 'pill--lime' : ''}">${f.status}</span>`}</td><td>${f.actual ?? '—'}</td><td>${f.payout != null ? `${f.payout} LP` : '—'}</td><td><a class="btn btn--ghost btn--sm" href="#/pools/${f.coinId}?end=${f.end}">Open</a></td></tr>`; }).join('')}
          </tbody></table></div></section>` : `<section class="card empty"><h2 style="font:800 28px/1 var(--display)">NO FORECASTS YET</h2><p>Pick a live pool and make your first call.</p><a class="btn btn--primary" href="#/pools?status=live">Browse live pools</a></section>`}`;
        } else {
          const pools = P.poolsFor(status).filter((x) => P.coinFor(x.id));
          Object.keys(P.CATEGORIES).concat('all').forEach((k) => { const el = $(`[data-count="${k}"]`, page); if (el) el.textContent = pools.filter((x) => k === 'all' || P.CATEGORIES[k].ids.includes(x.id)).length; });
          const shown = pools.filter((x) => inCat(x.id) && matches(x.id)).map((x) => ({ ...x, c: P.crowd(x.id, x.end) }));
          body.innerHTML = shown.length ? `<div class="pool-grid">${shown.map((x) => poolCard(x.id, x.end, x.c)).join('')}</div>`
            : `<section class="card empty">No pools match${q ? ` “${esc(q)}”` : ''}.<br /><a class="btn btn--ghost btn--sm" href="#/pools">Clear filters</a></section>`;
        }
        startCountdowns(page);
      };
      draw(false);
      const refresh = setInterval(() => draw(false), 60000);
      // re-render the list when the hour rolls over
      const rollover = setTimeout(() => render(), P.liveEnd() - Date.now() + 1500);
      $('#refreshPools', page).onclick = (e) => { e.preventDefault(); toast('Refreshing prices…'); draw(true); };
      let t;
      if (q) { const si = $('#poolSearch', page); si.focus(); si.setSelectionRange(si.value.length, si.value.length); }
      $('#poolSearch', page).oninput = (e) => { clearTimeout(t); t = setTimeout(() => history.replaceState(null, '', link({ q: e.target.value })) || render(), 350); };
      return () => { alive = false; clearInterval(refresh); clearTimeout(rollover); clearInterval(countdownTimer); };
    },
  };
}
const CATS = Object.keys(P.CATEGORIES);

function PoolDetail({ parts, query }) {
  const id = parts[1];
  if (!CATS.some((k) => P.CATEGORIES[k].ids.includes(id))) return Lost();
  const end = +query.end || P.liveEnd();
  const range = ['1h', '24h', '7d', '30d'].includes(query.range) ? query.range : '24h';
  const st = P.statusOf(end);
  return {
    title: 'Pool',
    html: `
    <a class="auth__back" href="#/pools?status=${st === 'locked' ? 'live' : st}" style="margin:0">${ico('back', 'mark')} All pools</a>
    <section class="pool-hero" id="poolHero"><div class="empty">Loading pool…</div></section>
    <div class="pool-layout">
      <div style="display:grid;gap:16px;align-content:start;min-width:0">
        <section class="card">
          <div class="card__head"><h2>Price chart</h2>
            <nav class="seg" aria-label="Chart range">${['1h', '24h', '7d', '30d'].map((r) => `<a href="#/pools/${id}?end=${end}&range=${r}" class="${r === range ? 'on' : ''}">${r.toUpperCase()}</a>`).join('')}</nav></div>
          <div class="chart-box"><canvas id="priceChart" aria-label="Price chart" role="img"></canvas><div class="chart-tip" id="chartTip" hidden></div></div>
          <div class="chart-legend"><span><i style="background:#39ff7a"></i>Price</span><span><i class="dash" style="border-color:#b8ff3c"></i>Your call</span><span><i class="dash" style="border-color:#4d8dff"></i>Round close</span><span class="eyebrow" id="chartSrc"></span></div>
        </section>
        <section class="card"><div class="card__head"><h2>Crowd forecasts</h2><span class="eyebrow">where other pilots called it</span></div><div id="crowdChart" class="crowd"></div></section>
        <section class="card"><div class="card__head"><h2>How scoring works</h2><a class="btn btn--ghost btn--sm" href="#/pools?status=mine">My forecasts</a></div>
          <div class="rules">
            <div><b>1 · Call the close</b><p>Enter the price you think this coin will show at ${P.fmtTime(end)}. Calls lock 5 minutes before close.</p></div>
            <div><b>2 · Accuracy</b><p>Exact = full score. Every 1% away halves it; 2% away scores zero.</p></div>
            <div><b>3 · Timing</b><p>Calls made early in the hour earn up to a 1.5× timing bonus.</p></div>
            <div><b>4 · Payout</b><p>Stake × accuracy × timing × 2. Lift points only — earn more by <a class="link" href="#/timer">focusing</a>.</p></div>
          </div>
        </section>
      </div>
      <aside style="display:grid;gap:16px;align-content:start">
        <section class="card" id="forecastCard"><div class="empty">Loading…</div></section>
        <section class="card"><div class="card__head"><h2>Your calls here</h2></div><div id="myCalls" class="list"></div></section>
        <section class="card"><div class="card__head"><h2>More pools</h2><a class="btn btn--ghost btn--sm" href="#/pools?cat=${P.categoryOf(id)}">${P.CATEGORIES[P.categoryOf(id)].label}</a></div><div id="related" class="list"></div></section>
      </aside>
    </div>`,
    bind(page) {
      let alive = true, chart = null, hoverX = null, previewPrice = null;
      const canvas = $('#priceChart', page), tip = $('#chartTip', page);
      const redraw = () => {
        if (!chart) return;
        const mine = S.get().forecasts.filter((f) => f.coinId === id && f.end === end);
        const lines = [...mine.map((f) => ({ value: f.price, color: '#b8ff3c', label: `YOU ${P.fmtPrice(f.price)}` })), ...(previewPrice ? [{ value: previewPrice, color: '#39ff7a', label: `CALL ${P.fmtPrice(previewPrice)}` }] : [])];
        const h = P.drawChart(canvas, chart.view, { lines, markerTs: end, hover: hoverX });
        if (h && hoverX != null) {
          tip.hidden = false;
          tip.innerHTML = `<b>${P.fmtPrice(h.p)}</b><span>${new Date(h.t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>`;
          tip.style.left = `${Math.min(canvas.clientWidth - 150, Math.max(0, hoverX - 70))}px`;
        } else tip.hidden = true;
      };
      canvas.addEventListener('pointermove', (e) => { hoverX = e.offsetX; redraw(); });
      canvas.addEventListener('pointerleave', () => { hoverX = null; redraw(); });
      const onResize = () => redraw();
      addEventListener('resize', onResize);

      const loadChartData = async () => {
        const days = range === '1h' || range === '24h' ? 1 : range === '7d' ? 7 : 30;
        const data = await P.loadChart(id, days);
        if (!alive) return;
        const pts = range === '1h' ? data.points.filter((pt) => pt.t >= Date.now() - P.HOUR - 10 * 60000) : data.points;
        const coin = P.coinFor(id);
        // append the freshest spot price so the line ends "now"
        const view = coin && P.statusOf(end) !== 'resolved' ? [...pts, { t: Date.now(), p: coin.price }] : pts;
        chart = { data, view };
        $('#chartSrc', page).textContent = data.simulated ? 'Simulated — price APIs unavailable' : `Source: ${data.source}`;
        redraw();
        return data;
      };

      const renderAll = async () => {
        await P.loadMarkets();
        if (!alive) return;
        await P.settleDue(toast);
        const coin = P.coinFor(id), status = P.statusOf(end), c = P.crowd(id, end);
        if (!coin) { $('#poolHero', page).innerHTML = '<div class="empty">This coin is unavailable right now. <a class="link" href="#/pools">Back to pools</a></div>'; return; }
        document.title = `${coin.symbol.toUpperCase()} pool · Leap Gate`;
        $('.topbar h1').textContent = `${coin.symbol.toUpperCase()} pool`;
        const data = await loadChartData();
        const closePrice = status === 'resolved' && data ? P.priceAt(data.points, end) : null;
        $('#poolHero', page).innerHTML = `
          <div class="pool-hero__id">${coinImg(coin, 56)}<div><div class="quick" style="gap:8px;margin-bottom:6px">${statusPill(status)}<span class="pill">${P.CATEGORIES[P.categoryOf(id)].label}</span></div><h2>${esc(coin.symbol.toUpperCase())} price at ${P.fmtTime(end)}</h2><p>${esc(coin.name)}</p></div></div>
          <div class="pool-hero__stats">
            <div><span class="eyebrow">Now</span><b>${P.fmtPrice(coin.price)}</b>${changeTag(coin.change)}</div>
            ${closePrice ? `<div><span class="eyebrow">Closed at</span><b>${P.fmtPrice(closePrice)}</b></div>` : ''}
            <div><span class="eyebrow">Participants</span><b>${c.participants}</b></div>
            <div><span class="eyebrow">Total staked</span><b>${c.staked.toLocaleString()} LP</b></div>
            <div><span class="eyebrow">${status === 'resolved' ? 'Status' : status === 'upcoming' ? 'Opens in' : 'Time left'}</span><b ${status === 'resolved' ? '' : `data-countdown="${status === 'upcoming' ? end - P.HOUR : end}"`}>${status === 'resolved' ? 'Closed' : P.countdown((status === 'upcoming' ? end - P.HOUR : end) - Date.now())}</b></div>
          </div>`;

        // crowd distribution (simulated around the price at the time)
        const center = closePrice || coin.price, rnd = c.rnd, bins = new Array(21).fill(0);
        for (let i = 0; i < Math.max(c.participants, 1) * 3; i++) {
          const g = (rnd() + rnd() + rnd() - 1.5) / 1.5; // ~normal in [-1,1]
          bins[Math.max(0, Math.min(20, Math.round(10 + g * 10)))]++;
        }
        const peak = Math.max(...bins, 1), lo = center * 0.99, hi = center * 1.01;
        const mine = c.mine;
        $('#crowdChart', page).innerHTML = `<div class="crowd__bars">${bins.map((b, i) => `<i style="height:${(b / peak) * 100}%" title="${P.fmtPrice(lo + ((hi - lo) * i) / 20)}"></i>`).join('')}
          ${mine.map((f) => { const x = Math.max(0, Math.min(100, ((f.price - lo) / (hi - lo)) * 100)); return `<span class="crowd__me" style="left:${x}%">YOU</span>`; }).join('')}</div>
          <div class="crowd__axis"><span>${P.fmtPrice(lo)}</span><span>${P.fmtPrice(center)}</span><span>${P.fmtPrice(hi)}</span></div>`;

        // my calls
        $('#myCalls', page).innerHTML = mine.length ? mine.map((f) => `<div class="list__row"><span class="mode-ico">${ico('pools')}</span><div class="list__main"><b>${P.fmtPrice(f.price)}</b><small>${f.stake} LP · ${S.ago(f.placedAt)}</small></div>${f.status === 'open' ? '<span class="pill pill--live">Open</span>' : `<span class="pill ${f.status === 'won' ? 'pill--green' : f.status === 'partial' ? 'pill--lime' : ''}">${f.payout} LP</span>`}</div>`).join('')
          : `<div class="empty" style="padding:14px">No calls in this pool yet.</div>`;

        // related pools
        const rel = P.CATEGORIES[P.categoryOf(id)].ids.filter((x) => x !== id && P.coinFor(x)).slice(0, 5);
        $('#related', page).innerHTML = rel.map((x) => { const rc = P.coinFor(x); return `<a class="list__row" href="#/pools/${x}?end=${P.liveEnd()}">${coinImg(rc, 30)}<div class="list__main"><b>${esc(rc.symbol.toUpperCase())}</b><small>${esc(rc.name)}</small></div><b>${P.fmtPrice(rc.price)}</b></a>`; }).join('');

        // forecast form
        const fc = $('#forecastCard', page);
        const bal = S.get().points;
        if (status === 'resolved') {
          fc.innerHTML = `<div class="card__head"><h2>Pool closed</h2></div><p style="color:var(--muted);margin:0 0 14px">This round closed at <b style="color:var(--ink)">${P.fmtPrice(closePrice)}</b>.${mine.length ? ` You earned <b style="color:var(--accent)">${mine.reduce((a, f) => a + (f.payout || 0), 0)} LP</b>.` : ''}</p>
            <a class="btn btn--primary btn--block" href="#/pools/${id}?end=${P.liveEnd()}">Go to the live ${esc(coin.symbol.toUpperCase())} pool</a>`;
        } else if (status === 'upcoming') {
          fc.innerHTML = `<div class="card__head"><h2>Opens soon</h2></div><p style="color:var(--muted);margin:0 0 14px">Forecasts open when the current round closes, in <b data-countdown="${end - P.HOUR}">${P.countdown(end - P.HOUR - Date.now())}</b>.</p>
            <button class="btn btn--primary btn--block" id="remind">Remind me</button><a class="btn btn--ghost btn--block" style="margin-top:8px" href="#/pools/${id}?end=${P.liveEnd()}">Forecast the live round instead</a>`;
          $('#remind', fc).onclick = () => { S.addReminder(`${coin.symbol.toUpperCase()} pool for ${P.fmtTime(end)} opens soon`, `#/pools/${id}?end=${end}`); toast('Reminder added to notifications'); render(); };
        } else if (status === 'locked') {
          fc.innerHTML = `<div class="card__head"><h2>Calls locked</h2></div><p style="color:var(--muted);margin:0 0 14px">The last 5 minutes are locked so nobody can call the close from the live price. Resolves in <b data-countdown="${end}"></b>.</p>
            <a class="btn btn--primary btn--block" href="#/pools/${id}?end=${end + P.HOUR}">See next round</a>`;
        } else {
          const step = coin.price * 0.001;
          fc.innerHTML = `<div class="card__head"><h2>Make your call</h2><a class="pill pill--lime" href="#/pools?status=mine">${bal.toLocaleString()} LP</a></div>
            <form id="fcForm" novalidate>
              <div class="field"><label for="fcPrice">Price at ${P.fmtTime(end)} (USD)</label>
                <div class="nudge"><button type="button" class="btn btn--ghost" data-nudge="-1" aria-label="Lower by 0.1%">−</button><input class="input" id="fcPrice" inputmode="decimal" value="${coin.price}" /><button type="button" class="btn btn--ghost" data-nudge="1" aria-label="Raise by 0.1%">+</button></div>
                <div class="field__err"></div>
                <button type="button" class="link" id="useNow" style="justify-self:start;font-size:12px">Use current price (${P.fmtPrice(coin.price)})</button></div>
              <div class="field"><label for="fcStake">Stake · <span id="stakeVal">50</span> LP</label><input type="range" id="fcStake" min="10" max="${Math.max(10, bal)}" step="5" value="${Math.min(50, Math.max(10, bal))}" ${bal < 10 ? 'disabled' : ''} />
                <div class="quick" style="gap:6px">${[25, 50, 100].map((v) => `<button type="button" class="btn btn--ghost btn--sm" data-stake="${v}">${v}</button>`).join('')}<button type="button" class="btn btn--ghost btn--sm" data-stake="max">Max</button></div></div>
              <div class="payout" id="payoutBox"></div>
              ${bal < 10 ? `<p class="fine" style="text-align:left">You need at least 10 LP. <a class="link" href="#/timer?autostart=1">Focus to earn more</a>.</p>` : ''}
              <button class="btn btn--primary btn--block btn--lg" ${bal < 10 ? 'disabled' : ''}>Place forecast</button>
            </form>`;
          const priceIn = $('#fcPrice', fc), stakeIn = $('#fcStake', fc);
          const updatePayout = () => {
            const stake = +stakeIn.value; $('#stakeVal', fc).textContent = stake;
            const timing = P.score(1, 1, Date.now(), end).timing;
            previewPrice = parseFloat(priceIn.value) || null; redraw();
            $('#payoutBox', fc).innerHTML = `<div class="kv"><span>Timing bonus now</span><b>${timing.toFixed(2)}×</b></div>
              ${[['Exact', 0], ['0.5% off', 0.005], ['1% off', 0.01], ['2%+ off', 0.02]].map(([l, e]) => `<div class="kv"><span>If ${l}</span><b class="${e < 0.02 ? 'txt-up' : ''}">${Math.round(stake * Math.max(0, 1 - e / 0.02) * timing * 2)} LP</b></div>`).join('')}`;
          };
          $$('[data-nudge]', fc).forEach((b) => (b.onclick = () => { const v = parseFloat(priceIn.value) || coin.price; priceIn.value = +(v + step * +b.dataset.nudge).toPrecision(8); updatePayout(); }));
          $('#useNow', fc).onclick = () => { priceIn.value = coin.price; updatePayout(); };
          $$('[data-stake]', fc).forEach((b) => (b.onclick = () => { stakeIn.value = b.dataset.stake === 'max' ? stakeIn.max : Math.min(+stakeIn.max, +b.dataset.stake); updatePayout(); }));
          priceIn.oninput = updatePayout; stakeIn.oninput = updatePayout;
          updatePayout();
          $('#fcForm', fc).onsubmit = async (e) => {
            e.preventDefault();
            const price = parseFloat(priceIn.value), stake = +stakeIn.value, err = priceIn.closest('.field').querySelector('.field__err');
            if (!(price > 0)) { priceIn.classList.add('invalid'); err.textContent = 'Enter a price above 0'; return; }
            if (Math.abs(price - coin.price) / coin.price > 0.25) { priceIn.classList.add('invalid'); err.textContent = 'Calls must be within 25% of the current price'; return; }
            if (P.statusOf(end) !== 'live') { toast('This round just locked — try the next one', true); render(); return; }
            if (!(await confirmBox({ title: 'Place forecast?', body: `${coin.symbol.toUpperCase()} at ${P.fmtPrice(price)} for ${P.fmtTime(end)}, staking ${stake} LP. Calls can't be edited once placed.`, ok: 'Place forecast' }))) return;
            try {
              S.addForecast({ coinId: id, symbol: coin.symbol, end, price, stake });
              toast(`Forecast placed — ${stake} LP on ${P.fmtPrice(price)}`); confetti(); render();
            } catch (x) { toast(x.message, true); }
          };
        }
        startCountdowns(page);
      };
      renderAll();
      const refresh = setInterval(() => P.loadMarkets(true).then(() => alive && loadChartData()), 60000);
      const until = end - Date.now();
      const flip = until > 0 ? setTimeout(() => render(), Math.min(until - (P.statusOf(end) === 'live' ? P.LOCK : 0), 2 ** 31 - 1) + 1000) : 0;
      return () => { alive = false; clearInterval(refresh); clearTimeout(flip); clearInterval(countdownTimer); removeEventListener('resize', onResize); };
    },
  };
}

function Lost() {
  return { title: 'Lost altitude', html: `<div class="lost">${mark('mark device__ico')}<h2>404</h2><p style="color:var(--muted)">This page drifted off course.</p><div class="quick" style="justify-content:center"><a class="btn btn--primary" href="#/dashboard">Back to dashboard</a><a class="btn btn--ghost" href="/">Website</a></div></div>` };
}

/* ---------------- boot ---------------- */
setMode(S.get().settings.defaultMode);
render();
