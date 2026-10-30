"use strict";
// Rdzeń rolki 1080x1920: deterministyczne window.render(t), sceny, klipy z klatek JPG (klatki/<nazwa>/NNN.jpg), oś słów z timing.js.
const T = window.TIMING;
window.DUR = T.DUR;
window.SFX = [];
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const mix = (a, b, u) => a + (b - a) * u;
const E = { lin: u => u, out: u => 1 - Math.pow(1 - u, 3), out4: u => 1 - Math.pow(1 - u, 4), io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, in: u => u * u * u };
const P = (t, a, b, e = E.out) => e(clamp((t - a) / (b - a)));
function spring(dt, f = 2, z = .5) { if (dt <= 0) return 0; const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt)); }
const sfx = (name, t, gain = -6, maxlen = null) => window.SFX.push([name, +t.toFixed(3), gain, maxlen]);

// ---- słowa lektora
const LN = k => T.lines.find(l => l.key === k);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]/g, "");
function W(needle, nth = 0) { const n = norm(needle), hits = T.lines.flatMap(l => l.words).filter(w => norm(w.w).startsWith(n)); if (!hits.length) throw new Error(`nie ma słowa "${needle}"`); return hits[Math.min(nth, hits.length - 1)].t; }

// ---- DOM
const stage = document.createElement("div"); stage.id = "stage"; document.body.appendChild(stage);
function el(parent, cls, html, css) { const e = document.createElement("div"); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (css) Object.assign(e.style, css); parent.appendChild(e); return e; }
function pop(e, t, t0, from = .6, f = 2.2, z = .55, base = "") { const s = t < t0 ? 0 : spring(t - t0, f, z); e.style.opacity = t < t0 ? 0 : clamp((t - t0) / .08); e.style.transform = `${base} scale(${mix(from, 1, s)})`; return s; }
function rise(e, t, t0, dy = 60, d = .45, base = "") { const u = P(t, t0, t0 + d); e.style.opacity = t < t0 ? 0 : clamp((t - t0) / .12); e.style.transform = `${base} translateY(${(1 - u) * dy}px)`; return u; }

// ---- klipy z klatek
const CLIPS = {}, LOADS = [];
function useClip(name) {
  if (CLIPS[name]) return CLIPS[name];
  const n = (window.CLIPN || {})[name] || 0, arr = [];
  for (let i = 1; i <= n; i++) { const im = new Image(); LOADS.push(new Promise(r => { im.onload = im.onerror = r; })); im.src = `klatki/${name}/${String(i).padStart(3, "0")}.jpg`; arr.push(im); }
  return (CLIPS[name] = arr);
}

// ---- sceny
const SC = [];
function scene(a, z, build, o = {}) { const root = el(stage, "scene"), cam = el(root, "cam"); const s = { a, z, root, cam, o }; s.upd = build(cam, s) || (() => {}); root.style.opacity = 0; SC.push(s); return s; }
function render(t) {
  SC.forEach(s => {
    const vis = t >= s.a && t < s.z;
    s.root.style.opacity = vis ? 1 : 0; s.root.style.visibility = vis ? "visible" : "hidden";
    if (vis) s.upd(t - s.a, t);
  });
}
window.render = render;

// ---- start: podgląd w przeglądarce (klik = dźwięk) albo tryb renderu
const PO_FONTACH = [];
function boot(audio) {
  const q = new URLSearchParams(location.search);
  const czcionki = ["900 88px Montserrat", "700 58px Montserrat"].map(f => document.fonts.load(f, "AąćęłńóśźżĄĆĘŁŃÓŚŹŻ"));  // polskie znaki są w osobnym pliku czcionki
  Promise.all([...LOADS, ...czcionki]).then(() => document.fonts.ready).then(() => {
    PO_FONTACH.forEach(f => f());
    render(0); window.READY = true;
    if (q.has("render")) return;
    const st = q.get("t"); if (st != null) { render(+st); return; }
    const a = new Audio(audio); let t0 = performance.now(), on = false;
    document.addEventListener("click", () => { a.currentTime = 0; a.play(); on = true; });
    const loop = () => { const t = on ? a.currentTime : ((performance.now() - t0) / 1000) % T.DUR; render(t); requestAnimationFrame(loop); }; loop();
  });
}
