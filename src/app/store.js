// Local-only demo store. Nothing leaves the browser; passwords are never stored.
const KEY = 'leapgate:v1';
const DAY = 86400000;

export const MODES = {
  sprint: { label: 'Sprint', minutes: 25, pill: 'green' },
  deep: { label: 'Deep', minutes: 90, pill: 'blue' },
  custom: { label: 'Custom', minutes: 45, pill: 'lime' },
};

const COLORS = ['#39ff7a', '#4d8dff', '#b8ff3c', '#8fd3ff', '#ffd34d'];
const uid = () => Math.random().toString(36).slice(2, 9);
export const code = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

function fresh() {
  return { user: null, sessions: [], squads: [], notifications: [], presets: [], forecasts: [], points: 500, settings: defaultSettings() };
}
function defaultSettings() {
  return { goal: 120, defaultMode: 'sprint', customMinutes: 45, shield: true, notifications: true, sounds: true, reducedMotion: false, calendar: false, weeklyEmail: true };
}

let state;
try { state = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { state = fresh(); }
state.settings = { ...defaultSettings(), ...state.settings };
if (typeof state.points !== 'number') state.points = 500;
if (!Array.isArray(state.forecasts)) state.forecasts = [];

const listeners = new Set();
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked: keep in memory */ }
  listeners.forEach((fn) => fn(state));
}
export const get = () => state;

/* ---------- auth ---------- */
export function signIn({ name, email, provider = 'email' }) {
  const first = !state.user && !state.sessions.length;
  state.user = { name: name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), email, provider, since: Date.now() };
  if (first) seed();
  save();
}
export function signOut() { state.user = null; save(); }
export function wipe() { state = fresh(); save(); }
export function resetDemo() { const u = state.user; state = fresh(); state.user = u; seed(); save(); }
export const initials = (n = '') => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'LG';

function seed() {
  const now = Date.now();
  const tasks = ['Essay draft', 'Refactor auth', 'Sketch ideas', 'Reading: ch. 4', 'Inbox zero', 'Portfolio page', 'Study flashcards'];
  const s = [];
  for (let d = 13; d >= 0; d--) {
    const count = d === 0 ? 1 : Math.floor(Math.random() * 3) + (d % 6 === 0 ? 0 : 1);
    for (let i = 0; i < count; i++) {
      const mode = Math.random() > 0.7 ? 'deep' : 'sprint';
      const minutes = mode === 'deep' ? 60 + Math.floor(Math.random() * 30) : 20 + Math.floor(Math.random() * 6);
      s.push({ id: uid(), ts: now - d * DAY - (i + 1) * 3.2 * 3600000, mode, minutes, task: tasks[(d + i) % tasks.length], completed: Math.random() > 0.12, distractions: Math.floor(Math.random() * 2) });
    }
  }
  state.sessions = s.sort((a, b) => b.ts - a.ts);
  state.squads = [
    { id: uid(), name: 'Night Owls', color: COLORS[1], code: code(), owner: false, members: [
      { name: 'Amara Okafor', status: 'focus', minutes: 340 }, { name: 'Jonah Reyes', status: 'break', minutes: 295 }, { name: 'Riko Tanaka', status: 'idle', minutes: 410 }] },
    { id: uid(), name: 'Thesis Crew', color: COLORS[0], code: code(), owner: true, members: [
      { name: 'Sam Patel', status: 'focus', minutes: 520 }, { name: 'Lea Novak', status: 'idle', minutes: 180 }] },
  ];
  state.notifications = [
    { id: uid(), text: 'Amara started a Deep session in Night Owls', ts: now - 12 * 60000, href: `#/squads/${state.squads[0].id}`, read: false },
    { id: uid(), text: 'Your weekly flight log is ready', ts: now - 5 * 3600000, href: '#/log', read: false },
    { id: uid(), text: 'Tip: mix Rain + Brown noise for deep work', ts: now - DAY, href: '#/sounds', read: true },
  ];
  state.presets = [{ id: uid(), name: 'Rainy library', mix: { rain: 0.6, cafe: 0.2, brown: 0, train: 0 } }];
}

/* ---------- sessions ---------- */
export const distanceOf = (minutes, streak = 0) => Math.round(minutes * 0.42 * (1 + Math.min(streak, 10) * 0.03) * 10) / 10; // km Pip flies

export function addSession({ mode, minutes, task, completed, distractions }) {
  const sess = { id: uid(), ts: Date.now(), mode, minutes, task: task || 'Untitled focus', completed, distractions };
  state.sessions.unshift(sess);
  state.points += minutes; // 1 Lift point per focused minute
  if (completed) notify(`Nice landing — ${minutes} min of ${MODES[mode].label.toLowerCase()} focus logged`, '#/log');
  save();
  return sess;
}
export function deleteSession(id) { state.sessions = state.sessions.filter((s) => s.id !== id); save(); }

const dayKey = (ts) => new Date(ts).toDateString();
export function minutesOn(date) { return state.sessions.filter((s) => dayKey(s.ts) === dayKey(date)).reduce((a, s) => a + s.minutes, 0); }
export function streak() {
  let n = 0;
  for (let d = 0; d < 365; d++) {
    const m = minutesOn(Date.now() - d * DAY);
    if (m > 0) n++; else if (d > 0) break; // today can still be empty
  }
  return n;
}
export function range(days) {
  const out = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(Date.now() - d * DAY);
    out.push({ date, minutes: minutesOn(date) });
  }
  return out;
}
export function sessionsSince(days) { const from = Date.now() - days * DAY; return state.sessions.filter((s) => s.ts >= from); }

/* ---------- squads ---------- */
export function createSquad(name, color) {
  const sq = { id: uid(), name, color, code: code(), owner: true, members: [] };
  state.squads.push(sq);
  notify(`Squad "${name}" created — share code ${sq.code}`, `#/squads/${sq.id}`);
  save();
  return sq;
}
export function joinSquad(joinCode) {
  const found = state.squads.find((s) => s.code === joinCode);
  if (found) return found;
  const names = ['Morning Larks', 'Code & Coffee', 'Studio Hours', 'Deadline Divers'];
  const sq = { id: uid(), name: names[Math.floor(Math.random() * names.length)], color: COLORS[Math.floor(Math.random() * COLORS.length)], code: joinCode, owner: false,
    members: [{ name: 'Dev Mehta', status: 'focus', minutes: 260 }, { name: 'Iris Chen', status: 'idle', minutes: 150 }] };
  state.squads.push(sq);
  notify(`You joined ${sq.name}`, `#/squads/${sq.id}`);
  save();
  return sq;
}
export function leaveSquad(id) { state.squads = state.squads.filter((s) => s.id !== id); save(); }
export const squadColors = COLORS;

/* ---------- notifications / settings / presets ---------- */
export function notify(text, href = '#/dashboard') { state.notifications.unshift({ id: uid(), text, ts: Date.now(), href, read: false }); state.notifications = state.notifications.slice(0, 20); }
export function markAllRead() { state.notifications.forEach((n) => (n.read = true)); save(); }
export function markRead(id) { const n = state.notifications.find((x) => x.id === id); if (n) n.read = true; save(); }
export function updateSettings(patch) { state.settings = { ...state.settings, ...patch }; save(); }
export function updateUser(patch) { state.user = { ...state.user, ...patch }; save(); }
export function savePreset(name, mix) { state.presets.push({ id: uid(), name, mix: { ...mix } }); save(); }
export function deletePreset(id) { state.presets = state.presets.filter((p) => p.id !== id); save(); }

export function ago(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

/* ---------- Lift points & forecast pools (play points only, no cash value) ---------- */
export function addForecast(f) {
  if (f.stake > state.points) throw new Error('Not enough Lift points');
  state.points -= f.stake;
  const fc = { id: uid(), placedAt: Date.now(), status: 'open', ...f };
  state.forecasts.unshift(fc);
  save();
  return fc;
}
export function settleForecast(id, { actual, payout, accuracy }) {
  const f = state.forecasts.find((x) => x.id === id);
  if (!f || f.status !== 'open') return null;
  Object.assign(f, { status: payout > f.stake ? 'won' : payout > 0 ? 'partial' : 'lost', actual, payout, accuracy, settledAt: Date.now() });
  state.points += payout;
  notify(`${f.symbol.toUpperCase()} pool resolved at ${actual} — you ${payout > 0 ? `earned ${payout} LP` : 'missed this one'}`, `#/pools/${f.coinId}?end=${f.end}`);
  save();
  return f;
}
export function addReminder(text, href) { notify(text, href); save(); }
