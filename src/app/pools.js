// Forecast pools: call where a coin's price closes each hour and stake Lift points (play points, no cash value).
// Live prices + charts from Binance's public market-data API and CoinGecko, with cached/simulated fallback.
import * as S from './store.js';
import { COINS } from './coins.js';

const API = 'https://api.coingecko.com/api/v3';
const HOUR = 3600000, LOCK = 5 * 60000;

export const CATEGORIES = {
  crypto: { label: 'Crypto', ids: ['bitcoin', 'ethereum', 'solana', 'ripple', 'binancecoin', 'cardano', 'avalanche-2', 'sui', 'chainlink'] },
  memes: { label: 'Memes', ids: ['dogecoin', 'shiba-inu', 'pepe', 'bonk', 'dogwifcoin', 'floki', 'popcat', 'brett', 'mog-coin'] },
  commodities: { label: 'Commodities', ids: ['pax-gold', 'tether-gold', 'kinesis-gold', 'kinesis-silver'] },
  rwa: { label: 'RWA', ids: ['ondo-finance', 'centrifuge', 'polymesh', 'realio-network', 'maker'] },
};
const ALL_IDS = Object.values(CATEGORIES).flatMap((c) => c.ids).filter((id) => COINS[id]);
const categoryOf = (id) => Object.keys(CATEGORIES).find((k) => CATEGORIES[k].ids.includes(id));

/* ---------------- data layer ---------------- */
// Prices: Binance public market-data API first (generous limits, CORS-enabled, no geo block),
// CoinGecko for coins Binance doesn't list, then cached / reference prices if both are unavailable.
const BINANCE = 'https://data-api.binance.vision/api/v3';
let markets = null, marketsAt = 0, marketsSimulated = false, inflight = null;
const chartCache = new Map();

function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}
async function getJSON(url, ms = 8000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(t); }
}

export async function loadMarkets(force = false) {
  if (!force && markets && Date.now() - marketsAt < 45000) return markets;
  if (!markets) {
    try {
      const cached = JSON.parse(localStorage.getItem('lg:markets') || 'null');
      if (cached && Date.now() - cached.at < 10 * 60000) { markets = cached.data; marketsAt = cached.at; marketsSimulated = !!cached.simulated; if (!force && Date.now() - cached.at < 45000) return markets; }
    } catch { /* ignore */ }
  }
  if (inflight) return inflight;
  inflight = (async () => {
    const next = Object.fromEntries(ALL_IDS.map((id) => {
      const m = COINS[id], prev = markets?.[id];
      return [id, { id, symbol: m.symbol, name: m.name, image: m.image, price: prev?.price ?? m.ref, change: prev?.change ?? 0, live: false }];
    }));
    const binIds = ALL_IDS.filter((id) => COINS[id].binance), cgIds = ALL_IDS.filter((id) => !COINS[id].binance);
    const [bin, cg] = await Promise.allSettled([
      getJSON(`${BINANCE}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(binIds.map((id) => COINS[id].binance)))}`),
      getJSON(`${API}/simple/price?ids=${cgIds.join(',')}&vs_currencies=usd&include_24hr_change=true`),
    ]);
    if (bin.status === 'fulfilled') {
      const bySym = Object.fromEntries(bin.value.map((x) => [x.symbol, x]));
      binIds.forEach((id) => { const x = bySym[COINS[id].binance]; if (x) Object.assign(next[id], { price: +x.lastPrice, change: +x.priceChangePercent, live: true }); });
    }
    if (cg.status === 'fulfilled') {
      cgIds.forEach((id) => { const x = cg.value[id]; if (x?.usd) Object.assign(next[id], { price: x.usd, change: x.usd_24h_change ?? 0, live: true }); });
    }
    const liveCount = Object.values(next).filter((c) => c.live).length;
    if (liveCount === 0 && markets) { inflight = null; marketsAt = Date.now() - 30000; return markets; } // keep last good data, retry soon
    markets = next;
    marketsSimulated = liveCount === 0;
    marketsAt = liveCount === 0 ? Date.now() - 30000 : Date.now();
    try { localStorage.setItem('lg:markets', JSON.stringify({ at: marketsAt, data: markets, simulated: marketsSimulated })); } catch { /* ignore */ }
    inflight = null;
    return markets;
  })();
  return inflight;
}
export const isSimulated = () => marketsSimulated;

const KLINES = { 1: ['5m', 288], 7: ['1h', 168], 30: ['4h', 180] };
export async function loadChart(id, days) {
  const key = `${id}:${days}`, hit = chartCache.get(key);
  if (hit && Date.now() - hit.at < (hit.simulated ? 60000 : 3 * 60000)) return hit;
  const save = (out) => (chartCache.set(key, out), out);
  const coin = COINS[id];
  if (coin.binance) {
    try {
      const [interval, limit] = KLINES[days];
      const rows = await getJSON(`${BINANCE}/klines?symbol=${coin.binance}&interval=${interval}&limit=${limit}`);
      return save({ points: rows.map((k) => ({ t: k[6], p: +k[4] })), source: 'Binance', simulated: false, at: Date.now() });
    } catch { /* fall through to CoinGecko */ }
  }
  try {
    const { prices } = await getJSON(`${API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
    return save({ points: prices.map(([t, p]) => ({ t, p })), source: 'CoinGecko', simulated: false, at: Date.now() });
  } catch {
    // seeded random walk ending at the current price, so the page stays usable when every source is unavailable
    const now = markets?.[id]?.price ?? coin.ref, n = days <= 1 ? 288 : days <= 7 ? 168 : 180;
    const rnd = seeded(key), step = (days * 86400000) / n, pts = [];
    let p = now;
    for (let i = n; i >= 0; i--) { pts.push({ t: Date.now() - i * step, p }); p *= 1 + (rnd() - 0.5) * 0.006 * Math.sqrt(days); }
    const scale = now / pts[pts.length - 1].p;
    return save({ points: pts.map((x) => ({ t: x.t, p: x.p * scale })), source: 'Simulated', simulated: true, at: Date.now() });
  }
}
export function priceAt(points, ts) {
  let best = points[points.length - 1];
  for (const pt of points) if (Math.abs(pt.t - ts) < Math.abs(best.t - ts)) best = pt;
  return best.p;
}

/* ---------------- rounds ---------------- */
export const liveEnd = () => Math.ceil((Date.now() + 1) / HOUR) * HOUR;
export function statusOf(end) {
  const now = Date.now();
  if (end <= now) return 'resolved';
  if (end - now > HOUR) return 'upcoming';
  return end - now <= LOCK ? 'locked' : 'live';
}
export function poolsFor(status) {
  const live = liveEnd();
  const ends = status === 'live' ? [live] : status === 'upcoming' ? [live + HOUR] : status === 'resolved' ? [live - HOUR, live - 2 * HOUR] : [live, live + HOUR, live - HOUR];
  return ends.flatMap((end) => ALL_IDS.map((id) => ({ id, end, key: `${id}-${end}` })));
}
export function crowd(id, end) {
  const st = statusOf(end), rnd = seeded(`${id}-${end}`);
  const full = 6 + Math.floor(rnd() * 140), avg = 20 + Math.floor(rnd() * 160);
  const frac = st === 'upcoming' ? 0 : st === 'resolved' ? 1 : Math.min(1, Math.max(0.05, 1 - (end - Date.now()) / HOUR) ** 0.7);
  const mine = S.get().forecasts.filter((f) => f.coinId === id && f.end === end);
  const participants = Math.round(full * frac) + (mine.length ? 1 : 0);
  return { participants, staked: Math.round(full * frac * avg) + mine.reduce((a, f) => a + f.stake, 0), mine, rnd };
}

/* ---------------- scoring ---------------- */
// accuracy falls linearly to 0 at 2% away; calls placed earlier in the hour get up to 1.5x
export function score(forecast, actual, placedAt, end) {
  const err = Math.abs(forecast - actual) / actual;
  const accuracy = Math.max(0, 1 - err / 0.02);
  const timing = 1 + 0.5 * Math.min(1, Math.max(0, (end - placedAt - LOCK) / (HOUR - LOCK)));
  return { accuracy, timing, multiplier: accuracy * timing * 2, err };
}

export async function settleDue(toast) {
  const due = S.get().forecasts.filter((f) => f.status === 'open' && f.end <= Date.now());
  for (const f of due) {
    const chart = await loadChart(f.coinId, 1);
    const actual = Date.now() - f.end < 23 * HOUR ? priceAt(chart.points, f.end) : (markets?.[f.coinId]?.price ?? f.price);
    const { multiplier, accuracy } = score(f.price, actual, f.placedAt, f.end);
    const payout = Math.round(f.stake * multiplier);
    S.settleForecast(f.id, { actual: fmtPrice(actual), payout, accuracy });
    toast?.(`${f.symbol.toUpperCase()} pool resolved — ${payout > 0 ? `+${payout} LP` : 'no payout this time'}`, payout === 0);
  }
  return due.length;
}

/* ---------------- formatting ---------------- */
export function fmtPrice(p) {
  if (p == null || Number.isNaN(p)) return '—';
  if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 2 })}`;
  return `$${Number(p.toPrecision(4)).toFixed(Math.min(12, Math.max(4, 3 - Math.floor(Math.log10(p)))))}`;
}
export const fmtTime = (ts) => new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
export function countdown(ms) {
  if (ms <= 0) return 'Closed';
  const h = Math.floor(ms / HOUR), m = Math.floor((ms % HOUR) / 60000), s = Math.floor((ms % 60000) / 1000);
  return h ? `${h}h ${m}m` : `${m}m ${String(s).padStart(2, '0')}s`;
}
export const coinFor = (id) => markets?.[id];
export { categoryOf, HOUR, LOCK };

/* ---------------- chart (canvas) ---------------- */
export function drawChart(canvas, points, { lines = [], markerTs = null, hover = null } = {}) {
  const dpr = Math.min(devicePixelRatio || 1, 2), W = canvas.clientWidth, H = canvas.clientHeight;
  if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!points?.length) return null;
  const pad = { l: 8, r: 92, t: 16, b: 26 };
  const vals = points.map((p) => p.p).concat(lines.map((l) => l.value).filter(Boolean));
  let min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || max * 0.01; min -= span * 0.08; max += span * 0.08;
  const t0 = points[0].t, t1 = points[points.length - 1].t;
  const X = (t) => pad.l + ((t - t0) / (t1 - t0 || 1)) * (W - pad.l - pad.r);
  const Y = (p) => pad.t + (1 - (p - min) / (max - min)) * (H - pad.t - pad.b);
  const up = points[points.length - 1].p >= points[0].p, col = up ? '#39ff7a' : '#ff5d6c';

  // grid + price labels
  ctx.font = '600 10px "Martian Mono", monospace'; ctx.textBaseline = 'middle';
  // axis labels need enough significant digits to tell adjacent ticks apart (matters for sub-cent coins)
  const tickStep = (max - min) / 4, sig = Math.max(3, Math.ceil(Math.log10(max / tickStep)) + 1);
  const axisLabel = (p) => (p >= 1 ? fmtPrice(p) : `$${Number(p.toPrecision(sig)).toFixed(Math.min(12, Math.max(2, sig - 1 - Math.floor(Math.log10(p)))))}`);
  for (let i = 0; i <= 4; i++) {
    const p = min + tickStep * i, y = Y(p);
    ctx.strokeStyle = '#ffffff10'; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#8fa3c7'; ctx.fillText(axisLabel(p), W - pad.r + 8, y);
  }
  // time labels
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  const days = (t1 - t0) / 86400000;
  const timeTicks = W < 520 ? 2 : 4;
  for (let i = 0; i <= timeTicks; i++) {
    const t = t0 + ((t1 - t0) * i) / timeTicks, d = new Date(t);
    const label = days <= 1.1 ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    ctx.fillStyle = '#5f739b'; ctx.fillText(label, Math.min(W - pad.r - 24, Math.max(pad.l + 24, X(t))), H - 6);
  }
  ctx.textAlign = 'left';
  // area + line
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, up ? '#39ff7a40' : '#ff5d6c40'); grad.addColorStop(1, '#39ff7a00');
  ctx.beginPath();
  points.forEach((pt, i) => (i ? ctx.lineTo(X(pt.t), Y(pt.p)) : ctx.moveTo(X(pt.t), Y(pt.p))));
  ctx.lineTo(X(t1), H - pad.b); ctx.lineTo(X(t0), H - pad.b); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath();
  points.forEach((pt, i) => (i ? ctx.lineTo(X(pt.t), Y(pt.p)) : ctx.moveTo(X(pt.t), Y(pt.p))));
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
  // last price dot
  const last = points[points.length - 1];
  ctx.beginPath(); ctx.arc(X(last.t), Y(last.p), 4, 0, 7); ctx.fillStyle = col; ctx.fill();
  // round close marker
  if (markerTs && markerTs >= t0 && markerTs <= t1) {
    ctx.setLineDash([3, 4]); ctx.strokeStyle = '#4d8dffaa'; ctx.beginPath(); ctx.moveTo(X(markerTs), pad.t); ctx.lineTo(X(markerTs), H - pad.b); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#9fc0ff'; ctx.fillText('CLOSE', X(markerTs) + 5, pad.t + 10);
  }
  // forecast lines
  lines.forEach((l) => {
    if (!l.value) return;
    const y = Y(l.value);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = l.color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke(); ctx.setLineDash([]);
    const tw = ctx.measureText(l.label).width + 12;
    ctx.fillStyle = l.color; ctx.fillRect(pad.l, y - 18, tw, 16);
    ctx.fillStyle = '#03140a'; ctx.fillText(l.label, pad.l + 6, y - 7);
  });
  // hover crosshair
  let hovered = null;
  if (hover != null) {
    const tHover = t0 + ((hover - pad.l) / (W - pad.l - pad.r)) * (t1 - t0);
    hovered = points.reduce((a, b) => (Math.abs(b.t - tHover) < Math.abs(a.t - tHover) ? b : a));
    const hx = X(hovered.t), hy = Y(hovered.p);
    ctx.strokeStyle = '#ffffff44'; ctx.beginPath(); ctx.moveTo(hx, pad.t); ctx.lineTo(hx, H - pad.b); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
  }
  return hovered;
}
