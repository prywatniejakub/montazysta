"use strict";
// Clips4you reel engine (1080x1920, light style). Deterministic window.render(t) for motion/render.py,
// scenes with a quick slide transition and a slow camera push, headlines with an animated highlighter,
// phones playing real reels from JPG frames (../clips/<name>/NNN.jpg), voice timing from timing.js (window.TIMING).
const T = window.TIMING;
window.DUR = T.DUR;
window.SFX = [];
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const mix = (a, b, u) => a + (b - a) * u;
const E = { lin: u => u, out: u => 1 - Math.pow(1 - u, 3), out4: u => 1 - Math.pow(1 - u, 4), io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, in: u => u * u * u };
const P = (t, a, b, e = E.out) => e(clamp((t - a) / (b - a)));
function spring(dt, f = 2, z = .5) { if (dt <= 0) return 0; const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt)); }
const sfx = (name, t, gain = -6, maxlen = null) => window.SFX.push([name, +t.toFixed(3), gain, maxlen]);

// ---- voice timing
const LN = k => T.lines.find(l => l.key === k);
const LS = k => LN(k).slot;
const LE = k => { const w = LN(k).words; return w[w.length - 1].e; };
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]/g, "");
function W(k, needle, nth = 0) { const n = norm(needle), hits = LN(k).words.filter(w => norm(w.w).startsWith(n)); if (!hits.length) throw new Error(`no "${needle}" in ${k}`); return hits[Math.min(nth, hits.length - 1)].t; }

// ---- dom
const stage = document.createElement("div"); stage.id = "stage"; document.body.appendChild(stage);
function el(parent, cls, html, css) { const e = document.createElement("div"); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (css) Object.assign(e.style, css); parent.appendChild(e); return e; }
const px = v => typeof v === "number" ? v + "px" : v;
function at(e, x, y, w, h) { if (x != null) e.style.left = px(x); if (y != null) e.style.top = px(y); if (w != null) e.style.width = px(w); if (h != null) e.style.height = px(h); return e; }
const ICO = {
  spark: '<svg viewBox="0 0 100 100"><path fill="#ffd60a" d="M50 4C51.8 34 66 48.2 96 50C66 51.8 51.8 66 50 96C48.2 66 34 51.8 4 50C34 48.2 48.2 34 50 4Z"/></svg>',
  chk: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#111113" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="#e5383b" stroke-width="3.8" stroke-linecap="round"/></svg>',
  cursor: '<svg viewBox="0 0 32 32"><path d="M6 3l19 12.5-8.6 1.6 5 9.4-3.8 2-5-9.5L6 25z" fill="#111113" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="#111113" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 22s7-7.2 7-12.2A7 7 0 0 0 5 9.8C5 14.8 12 22 12 22z" fill="#111113"/><circle cx="12" cy="9.8" r="2.8" fill="#ffd60a"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="#111113" stroke-width="2.2"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>',
};
el(stage, "", `<i>${ICO.spark}</i>Clips4you`).id = "bug";

// headline: "Zwykłe słowa [marker] |czerwone|"  ->  words; [..] = highlighter span, |..| = red
function H(parent, src, y, size = 88, cls = "") {
  const e = el(parent, "h " + cls); e.style.top = px(y); e.style.fontSize = px(size);
  const html = src.replace(/\[([^\]]+)\]/g, '<span class="m">$1</span>').replace(/\|([^|]+)\|/g, '<span class="r">$1</span>');
  e.innerHTML = html; e.marks = [...e.querySelectorAll(".m")]; e.marks.forEach(m => m.style.setProperty("--p", 0)); return e;
}
function markIn(h, t, t0, i = 0, d = .35) { const m = h.marks[i]; if (m) m.style.setProperty("--p", P(t, t0, t0 + d, E.io).toFixed(3)); }
// pop in: scale spring + fade
function pop(e, t, t0, from = .6, f = 2.2, z = .55, base = "") { const s = t < t0 ? 0 : spring(t - t0, f, z); e.style.opacity = t < t0 ? 0 : clamp((t - t0) / .08); e.style.transform = `${base} scale(${mix(from, 1, s)})`; return s; }
function rise(e, t, t0, dy = 60, d = .45, base = "") { const u = P(t, t0, t0 + d); e.style.opacity = t < t0 ? 0 : clamp((t - t0) / .12); e.style.transform = `${base} translateY(${(1 - u) * dy}px)`; return u; }
const hide = e => { e.style.opacity = 0; };

// ---- phones with real reels (frames)
const CLIPS = {}, LOADS = [];
function useClip(name) {
  if (CLIPS[name]) return CLIPS[name];
  const n = (window.CLIPN || {})[name] || 0, arr = [];
  for (let i = 1; i <= n; i++) { const im = new Image(); LOADS.push(new Promise(r => { im.onload = im.onerror = r; })); im.src = `../clips/${name}/${String(i).padStart(3, "0")}.jpg`; arr.push(im); }
  return (CLIPS[name] = arr);
}
function Phone(parent, name, x, y, w, extra = "") {
  const h = Math.round(w * 16 / 9), e = at(el(parent, "phone", `<canvas width="540" height="960"></canvas>${extra}`), x, y, w, h);
  e.cv = e.querySelector("canvas"); e.ctx = e.cv.getContext("2d"); e.frames = useClip(name); e.clip = name; return e;
}
function play(ph, t, t0 = 0, speed = 1) { const fr = ph.frames; if (!fr.length) return; const i = Math.max(0, Math.floor((t - t0) * 30 * speed)) % fr.length; const im = fr[i]; if (im.complete && im.naturalWidth) ph.ctx.drawImage(im, 0, 0, 540, 960); }

// ---- timeline card (site "machine")
function Timeline(parent, x, y, w, file = "nagranie_z_klientem.mp4", len = "60:00") {
  const c = at(el(parent, "card tlw"), x, y, w, null);
  c.innerHTML = `<div class="fn"><span><i class="dot"></i>${file}</span><em>${len}</em></div><div class="bars"></div>`;
  const bars = c.querySelector(".bars"); let s = 11;
  for (let i = 0; i < 46; i++) { s = (s * 9301 + 49297) % 233280; const hh = 34 + Math.abs(Math.sin(i * .41) * 60 + (s / 233280) * 40 - 12); bars.insertAdjacentHTML("beforeend", `<i style="height:${Math.min(126, hh).toFixed(0)}px"></i>`); }
  c.hls = [["HOOK", 8, 13], ["PUENTA", 36, 15], ["EMOCJE", 66, 12]].map(([lb, l, ww]) => { const hl = el(bars, "hl", `<b>${lb}</b>`); hl.style.left = l + "%"; hl.style.width = ww + "%"; hl.style.opacity = 0; return hl; });
  c.ph = el(bars, "ph"); c.bars = bars; return c;
}
function tlUpdate(c, t, t0, hlTimes = []) { c.ph.style.left = mix(1, 97, ((t - t0) / 6) % 1) + "%"; c.hls.forEach((h, i) => { const ti = hlTimes[i]; if (ti == null) { h.style.opacity = 0; return; } pop(h, t, ti, .5, 3, .6); }); }

// ---- scenes: slide in from the right (.24 s), slow camera push inside
const SC = [];
function scene(a, z, build, o = {}) { const root = el(stage, "scene"), cam = el(root, "cam"); const s = { a, z, root, cam, o }; s.upd = build(cam, s) || (() => {}); root.style.opacity = 0; SC.push(s); return s; }
const TR = .24;
function render(t) {
  SC.forEach((s, i) => {
    const next = SC[i + 1], vis = t >= s.a - (s.o.pre || 0) && t < s.z + (next && !s.o.cut ? TR : 0);
    s.root.style.opacity = vis ? 1 : 0; s.root.style.visibility = vis ? "visible" : "hidden";
    if (!vis) return;
    const lt = t - s.a;
    let x = 0; if (i > 0 && !s.o.cut && !s.o.cin) x = (1 - P(t, s.a, s.a + TR, E.out4)) * 1080;  // incoming (cin = twarde cięcie na wejściu)
    if (next && !next.o.cut && !next.o.cin && t >= s.z) x = -P(t, s.z, s.z + TR, E.out4) * 1080;       // outgoing
    s.root.style.transform = `translateX(${x.toFixed(1)}px)`;
    const u = clamp(lt / Math.max(.5, s.z - s.a)), sc = 1 + (s.o.push ?? .045) * E.io(u);
    s.cam.style.transform = `scale(${sc.toFixed(4)})`;
    s.upd(lt, t);
  });
}
window.render = render;

// ---- boot: preview (loop with sound on click) or render mode
function boot(audio) {
  const q = new URLSearchParams(location.search);
  SC.forEach((s, i) => { if (i > 0 && !s.o.cut && !s.o.cin) sfx("WH_SOFT", s.a - .08, -14); });
  Promise.all(LOADS).then(() => document.fonts.ready).then(() => {
    render(0); window.READY = true;
    if (q.has("render")) return;
    const st = q.get("t"); if (st != null) { render(+st); return; }
    const a = new Audio(audio); let t0 = performance.now(), on = false;
    document.addEventListener("click", () => { a.currentTime = 0; a.play(); on = true; });
    const loop = () => { const t = on ? a.currentTime : ((performance.now() - t0) / 1000) % T.DUR; render(t); requestAnimationFrame(loop); }; loop();
  });
}
