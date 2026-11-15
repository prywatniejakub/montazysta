"use strict";
// Shared engine of the vertical motion ads (1080x1920): deterministic window.render(t) for motion/render.py,
// scene windows, text / 3D helpers, real footage on canvases, background blobs + flashes, voice-word timing from
// timing.js (motion/lib/plan.py) and a live preview (plain open = loop, click = restart with sound, ?t=5 = still).
const ASSETS = window.ASSETS || "../assets/";  // variant pages (motion/odbicia/<id>) sit one folder deeper

// ---------------------------------------------------------------- math
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const mix = (a, b, u) => a + (b - a) * u;
const E = {
  lin: u => u, inCubic: u => u * u * u, outCubic: u => 1 - Math.pow(1 - u, 3),
  inOutCubic: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  outQuart: u => 1 - Math.pow(1 - u, 4), outExpo: u => u >= 1 ? 1 : 1 - Math.pow(2, -10 * u),
  inExpo: u => u <= 0 ? 0 : Math.pow(2, 10 * u - 10), inOutSine: u => -(Math.cos(Math.PI * u) - 1) / 2,
};
const P = (t, a, b, e = E.outExpo) => e(clamp((t - a) / (b - a)));
function spring(dt, f = 1.6, z = .55) { if (dt <= 0) return 0; const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt)); }
const pulse = (t, t0, d = .3) => t < t0 ? 0 : Math.exp(-(t - t0) / d);
function hash(a, b) { let x = (a * 374761393 + b * 668265263) | 0; x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; }
function curve(t, pts) { if (t <= pts[0][0]) return [pts[0][1], pts[0][2]]; for (let i = 0; i < pts.length - 1; i++) { const [a, x0, y0] = pts[i], [z, x1, y1] = pts[i + 1]; if (t <= z) { const u = E.inOutCubic((t - a) / (z - a)); return [mix(x0, x1, u), mix(y0, y1, u)]; } } const l = pts[pts.length - 1]; return [l[1], l[2]]; }

// ---------------------------------------------------------------- stage skeleton
document.body.insertAdjacentHTML("afterbegin", `<div id="stage"><div class="layer" id="bg"></div><div class="layer" id="scenes"></div>
  <div class="layer" id="fx"><div class="layer" id="flash"></div><div class="layer" id="vig"></div><div class="layer" id="fade"></div></div></div>
  <svg width="0" height="0" style="position:absolute"><defs id="defs">
    <linearGradient id="sparkG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5aa0ff"/><stop offset=".55" stop-color="#8f7bff"/><stop offset="1" stop-color="#e38bff"/></linearGradient>
    <linearGradient id="warmG" x1="0" x2="1"><stop offset="0" stop-color="#ffe8a3"/><stop offset=".5" stop-color="#ffb65c"/><stop offset="1" stop-color="#ff6b8b"/></linearGradient>
    <linearGradient id="coolG" x1="0" x2="1"><stop offset="0" stop-color="#5ee7ff"/><stop offset="1" stop-color="#8b6cff"/></linearGradient>
    <linearGradient id="iconG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fb4ff"/><stop offset="1" stop-color="#c56bff"/></linearGradient>
    <radialGradient id="igG" cx=".3" cy="1.07" r="1.3"><stop offset="0" stop-color="#fdf497"/><stop offset=".08" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient>
    <filter id="glowF" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs></svg>`);
const NS = "http://www.w3.org/2000/svg";

// ---------------------------------------------------------------- icons
const SPARK = '<svg viewBox="0 0 100 100"><path fill="url(#sparkG)" d="M50 0C52 30 70 48 100 50C70 52 52 70 50 100C48 70 30 52 0 50C30 48 48 30 50 0Z"/></svg>';
const sparkIn = c => SPARK.replace("url(#sparkG)", c);
const CHECK = (c = "#04150b") => `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CROSS = (c = "#fff") => `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></svg>`;
const CURSOR = '<svg viewBox="0 0 32 32"><path d="M6 3l19 12.5-8.6 1.6 5 9.4-3.8 2-5-9.5L6 25z" fill="#fff" stroke="#0b0d12" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const UPLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="#8fb4ff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5"/><path d="M12 12v8M8.8 15l3.2-3.2 3.2 3.2"/></svg>';
const ICON = (d, stroke = "url(#iconG)") => `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.4 10.9c.6.5.9 1.1.9 1.8V16h5v-.3c0-.7.3-1.3.9-1.8A6 6 0 0 0 12 3z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>',
  cam: '<rect x="2.5" y="6.5" width="13" height="11" rx="2"/><path d="M15.5 10.5l6-3.2v9.4l-6-3.2"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 7.8L20 18M8.2 16.2L20 6"/>',
  text: '<path d="M4 6V4h16v2M12 4v16M9 20h6"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.3-.3-.3-.5-.7-.5-1.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15.5" cy="7.5" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9.5v5M18 9.5v5"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  bolt: '<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  scissor2: '<path d="M4 4l16 16M20 4L4 20"/>',
  building: '<path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/>',
  spark: '<path d="M12 2c.3 5 2.5 7.7 8 8-5.5.3-7.7 3-8 8-.3-5-2.5-7.7-8-8 5.5-.3 7.7-3 8-8z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 2.5-3 6s1 4 3 4v8"/>',
  home: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
  car: '<path d="M4 16v-3l2-5h12l2 5v3M4 16h16M4 16v2M20 16v2"/><circle cx="7.5" cy="16" r="1.5"/><circle cx="16.5" cy="16" r="1.5"/>',
  bag: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
};
const NOTE = "M55 20h12c1 8 7 14 15 15v12c-6 0-11-2-15-5v23a18 18 0 1 1-18-18c1 0 2 0 3 .2v12.5a6 6 0 1 0 3 5.3z";
const LOGOS = {
  tiktok: `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#000"/><g transform="translate(-4 2)"><path d="${NOTE}" fill="#25f4ee" transform="translate(-2.5 -2.5)"/><path d="${NOTE}" fill="#fe2c55" transform="translate(2.5 2.5)"/><path d="${NOTE}" fill="#fff"/></g></svg>`,
  instagram: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="url(#igG)"/><rect x="22" y="22" width="56" height="56" rx="17" fill="none" stroke="#fff" stroke-width="7"/><circle cx="50" cy="50" r="13.5" fill="none" stroke="#fff" stroke-width="7"/><circle cx="66.5" cy="33.5" r="4.2" fill="#fff"/></svg>',
  youtube: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#fff"/><rect x="12" y="26" width="76" height="48" rx="14" fill="#ff0000"/><path d="M43 38v24l21-12z" fill="#fff"/></svg>',
  facebook: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#1877f2"/><path d="M56 88V56h11l2-13H56v-8c0-3.6 1.2-6.2 6.4-6.2H70V17.3c-1.3-.2-5.4-.6-10.1-.6-10 0-16.7 6-16.7 17.2V43H32v13h11.2v32z" fill="#fff"/></svg>',
  x: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#000"/><path d="M24 22h15l37 56H61z" fill="#fff"/><path d="M73 22L29 78" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>',
};

// ---------------------------------------------------------------- dom + text
function el(parent, tag, cls, html) { const e = document.createElement(tag || "div"); if (cls) e.className = cls; if (html != null) e.innerHTML = html; parent.appendChild(e); return e; }
function box(parent, cls, w, h, html) { const e = el(parent, "div", "abs " + (cls || ""), html); e.style.width = w + "px"; e.style.height = h + "px"; e.style.left = (-w / 2) + "px"; e.style.top = (-h / 2) + "px"; return e; }
const grp = (parent, cls) => el(parent, "div", "g " + (cls || ""));
const tf = (e, s) => { e.style.transform = s; };
const show = (e, o) => { e.style.opacity = o; };
function splitChars(e, text) { e.innerHTML = ""; const chars = [], words = text.split(" "); words.forEach((word, wi) => { const w = el(e, "span", "w"); for (const ch of word) chars.push(el(w, "span", "c", ch)); if (wi < words.length - 1) e.appendChild(document.createTextNode(" ")); }); return chars; }
function textBox(parent, text, size, weight = 700, w = 1040, align = "center") { const h = Math.round(size * 1.3), e = box(parent, "t", w, h); e.style.fontSize = size + "px"; e.style.fontWeight = weight; e.style.lineHeight = h + "px"; e.style.textAlign = align; e.chars = splitChars(e, text); return e; }
function gradBox(parent, text, size, cls, weight = 700, w = 1040) { const h = Math.round(size * 1.3), e = box(parent, "t", w, h); e.style.fontSize = size + "px"; e.style.fontWeight = weight; e.style.lineHeight = h + "px"; e.style.textAlign = "center"; e.span = el(e, "span", "gtext " + cls, text); return e; }
function reveal(chars, t, t0, o = {}) { const st = o.stagger ?? .03, dur = o.dur ?? .9, y = o.y ?? 40, bl = o.blur ?? 16; chars.forEach((c, i) => { const a = t0 + i * st, u = P(t, a, a + dur), op = clamp((t - a) / (dur * .45)); c.style.opacity = op; c.style.transform = u >= 1 ? "" : `translate3d(0,${(1 - u) * y}px,0)`; c.style.filter = u > .995 ? "" : `blur(${(1 - u) * bl}px)`; }); }
function conceal(chars, t, t0, o = {}) { const st = o.stagger ?? .015, dur = o.dur ?? .3, y = o.y ?? -40, bl = o.blur ?? 14; chars.forEach((c, i) => { const a = t0 + i * st, u = P(t, a, a + dur, E.inCubic); if (u <= 0) return; c.style.opacity = 1 - u; c.style.transform = `translate3d(0,${u * y}px,0)`; c.style.filter = `blur(${u * bl}px)`; }); }
function wipe(e, u, soft = .3) { if (u >= 1) { e.style.webkitMaskImage = ""; return; } const p = mix(-soft, 1, u) * 100; e.style.webkitMaskImage = `linear-gradient(90deg, #000 ${p}%, transparent ${p + soft * 100}%)`; }
function gradIn(e, t, t0, dur = .8) { wipe(e.span, P(t, t0, t0 + dur, E.outCubic), .35); const u = P(t, t0, t0 + dur * .8); e.span.style.filter = u > .99 ? "" : `blur(${(1 - u) * 14}px)`; e.style.opacity = t < t0 ? 0 : 1; }
const sheen = (e, u) => { e.style.backgroundPosition = `${mix(125, -25, u)}% 0, 0 0`; };
function title(e, t, t0, sheenAt) { if (e.span) { gradIn(e, t, t0); sheen(e.span, P(t, sheenAt ?? t0 + .45, (sheenAt ?? t0 + .45) + .8, E.inOutSine)); } else reveal(e.chars, t, t0, { stagger: .03, dur: .9, y: 40, blur: 18 }); }
function pop(e, t, t0, f = 2, z = .55) { const s = spring(t - t0, f, z); e.style.opacity = clamp((t - t0) / .1); return s; }
function dirBlur(id) {
  const f = document.createElementNS(NS, "filter"); f.id = id;
  for (const [k, v] of [["x", "-40%"], ["y", "-40%"], ["width", "180%"], ["height", "180%"], ["color-interpolation-filters", "sRGB"]]) f.setAttribute(k, v);
  const g = document.createElementNS(NS, "feGaussianBlur"); g.setAttribute("stdDeviation", "0 0"); f.appendChild(g); document.getElementById("defs").appendChild(f);
  return (e, bx, by) => { if (bx < .4 && by < .4) { e.style.filter = ""; return; } g.setAttribute("stdDeviation", `${bx.toFixed(2)} ${by.toFixed(2)}`); e.style.filter = `url(#${id})`; };
}
function extrude(parent, text, size, tint = [130, 140, 200], n = 20, step = 2.5, w = 1100) {
  const g = grp(parent), lh = Math.round(size * 1.2);
  g.layers = []; g.size = size;
  for (let k = n - 1; k >= 0; k--) {
    const L = box(g, "ext", w, lh); L.style.font = `700 ${size}px/${lh}px var(--font)`; g.layers.push(L);
    if (k === 0) { L.innerHTML = `<span class="gtext silver">${text}</span>`; g.front = L.firstChild; }
    else { L.textContent = text; const u = k / (n - 1); L.style.color = `rgb(${mix(tint[0], 12, u) | 0},${mix(tint[1], 12, u) | 0},${mix(tint[2], 28, u) | 0})`; }
    tf(L, `translateZ(${-k * step}px)`);
  }
  return g;
}
const fitExtrude = (g, maxW) => fit(g, maxW, () => g.front.offsetWidth, k => g.layers.forEach(L => { L.style.fontSize = (g.size * k).toFixed(2) + "px"; }));
function odometer(parent, ndig, size, w = 1040, sep = []) {
  const holder = box(parent, "ctr", w, size), o = el(holder, "div", "odo"); o.style.font = `700 ${size}px/${size}px var(--font)`;
  const cols = [];
  for (let p = ndig - 1; p >= 0; p--) { const col = el(o, "div", "col"); col.style.height = size + "px"; cols.push({ p, strip: el(col, "div", "strip2", "0123456789".split("").concat(["0"]).map(d => `<span>${d}</span>`).join("")) }); if (sep.includes(p)) el(o, "div", "").style.width = ".2em"; }
  holder.set = (V, dv = 0) => cols.forEach(({ p, strip }) => {
    const q = Math.pow(10, p), pos = Math.floor(V / q) % 10 + (p === 0 ? V % 1 : clamp(V % q - (q - 1))), sig = clamp((V - q * .9) / (q * .1)), v = Math.abs(dv) / q;
    strip.style.transform = `translateY(${-pos * size}px)`; strip.style.color = `rgb(${mix(52, 246, sig) | 0},${mix(58, 248, sig) | 0},${mix(74, 252, sig) | 0})`; strip.style.filter = v > 1.5 ? `blur(${Math.min(10, v * .5)}px)` : "";
  });
  return holder;
}
const reel = (parent, w, h, img) => box(parent, "reel", w, h, `<div class="im" style="background-image:url(${ASSETS}img/${img}.jpg)"></div>`);
const logo = (parent, key, size) => { const e = box(parent, "logo", size, size, LOGOS[key]); e.style.borderRadius = size * .22 + "px"; return e; };

// ---------------------------------------------------------------- real footage: jpg frame sequences drawn on canvases
const CLIPS = {}, CLIP_LEN = { rawjet: 90, editjet: 90, rawmonia: 90, editmonia: 90 };
function loadClip(name) { if (!CLIPS[name]) CLIPS[name] = Array.from({ length: CLIP_LEN[name] || 60 }, (_, i) => { const im = new Image(); im.src = `${ASSETS}clips/${name}/${String(i + 1).padStart(2, "0")}.jpg`; return im; }); return CLIPS[name]; }
function screen(parent, w, h, clip, cls = "scrn") { const e = box(parent, cls, w, h), cv = el(e, "canvas", ""); cv.width = w; cv.height = h; e.cv = cv; e.ctx = cv.getContext("2d"); e.clip = clip; e.last = -1; loadClip(clip); return e; }
function playClip(e, t, t0 = 0, clip) {
  if (clip && clip !== e.clip) { e.clip = clip; e.last = -1; loadClip(clip); }
  const fr = CLIPS[e.clip], k = ((Math.floor((t - t0) * 30) % fr.length) + fr.length) % fr.length;
  if (k === e.last) return; e.last = k;
  const im = fr[k], cw = e.cv.width, ch = e.cv.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), sw = cw / s, sh = ch / s;
  e.ctx.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, 0, 0, cw, ch);
}

// ---------------------------------------------------------------- timing from the voice-over (plan.py)
const T = window.TIMING, DUR = T.DUR, DROP = T.DROP, BRK = T.BRK, REDROP = T.REDROP, END = T.END, BAR = T.BAR, BEAT = T.BEAT;
const bt = n => (T.GRID0 ?? T.H0) + n * BEAT;
const BEATS = T.beats || [], ACC = T.ACC || [];
const beatsIn = (a, z) => BEATS.filter(x => x >= a - 1e-3 && x <= z + 1e-3);
const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
// lines are addressed by index or, in the variant templates, by key (lines.json "key")
const LI = k => { if (typeof k === "number") return k; const i = T.lines.findIndex(l => l.key === k); if (i < 0) throw new Error(`no line "${k}"`); return i; };
const HAS = k => typeof k === "number" ? k < T.lines.length : T.lines.some(l => l.key === k);
const LS = k => T.lines[LI(k)].slot, LE = k => { const w = T.lines[LI(k)].words; return w[w.length - 1].e; };
const LF = (k, u) => mix(LS(k), LE(k), u);  // a point inside a line: 0 = its first word, 1 = end of its last word
// frac: where to fall back to when a variant rewrote the line and the word is gone
function W(k, needle, nth = 0, frac) { const i = LI(k), n = norm(needle); const hits = T.lines[i].words.filter(w => norm(w.w).startsWith(n)); if (!hits.length) { if (frac != null) return LF(i, frac); throw new Error(`no word "${needle}" in line ${i}`); } return hits[Math.min(nth, hits.length - 1)].t; }
// when an on-screen phrase should appear: the first spoken word matching one of its words (stem match, so
// "nagrania" finds "nagrań"), else the point frac of the line
const fold = s => norm(s).normalize("NFD").replace(/\p{M}/gu, "").replace(/ł/g, "l");  // "nagrań" ~ "nagrania"
function sync(k, text, frac = 0) {
  const i = LI(k), ws = T.lines[i].words.filter(w => norm(w.w));
  for (const c of String(text).replace(/<[^>]*>/g, " ").split(/\s+/).map(fold).filter(c => c.length >= 3)) {
    const stem = c.slice(0, Math.max(3, c.length - 2)), hit = ws.find(w => fold(w.w).startsWith(stem));
    if (hit) return hit.t;
  }
  return LF(i, frac);
}

// ---------------------------------------------------------------- variant (motion/odbicia.py writes window.VARIANT) + palette
const V = window.VARIANT || {};
const TX = (key, def) => V.ekran && V.ekran[key] != null ? V.ekran[key] : def;
let PAL = null;
function usePalette(def) {
  const name = V.paleta || def;
  PAL = (window.PALETTES || {})[name];
  if (!PAL) throw new Error(`no palette "${name}" (lib/palety.js)`);
  const r = document.documentElement.style;
  PAL.A.forEach((c, k) => r.setProperty(`--a${k + 1}`, c)); PAL.B.forEach((c, k) => r.setProperty(`--b${k + 1}`, c));
  for (const k of ["btn", "btnglow", "ray", "glow1", "glow2", "flash"]) r.setProperty(`--${k}`, PAL[k]);
  const stops = (id, cs) => [...document.getElementById(id).children].forEach((s, k, all) => s.setAttribute("stop-color", cs[Math.round(k * (cs.length - 1) / Math.max(1, all.length - 1))]));
  stops("warmG", PAL.A); stops("coolG", PAL.B);
  return PAL;
}
const blobsOf = pos => pos.map((p, k) => ({ ...p, c: PAL.blobs[k % PAL.blobs.length] }));

// explicit timing of an on-screen phrase from the variant (V.sync[key]: a spoken word or a 0..1 point of the line), else sync()
function cue(k, key, text, frac = 0) { const s = V.sync && V.sync[key]; if (typeof s === "number") return LF(k, s); if (typeof s === "string") return W(k, s, 0, frac); return sync(k, text, frac); }
const lastW = k => { const ws = T.lines[LI(k)].words.filter(w => norm(w.w)); return ws[ws.length - 1].t; };

// ---------------------------------------------------------------- sound effects + check frames declared by the template
// (motion/odbicia.py reads window.SFX from the page and mixes them with audiokit; names = audiokit constants)
const SFXL = [], STILLS = [];
function sfx(name, t, gain, maxlen = null) { SFXL.push([name, +t.toFixed(3), gain, maxlen]); }
window.SFX = SFXL; window.STILLS = STILLS;
window.ERRORS = window.ERRORS || [];
addEventListener("error", e => window.ERRORS.push(String(e.message)));

// ---------------------------------------------------------------- variable texts shrink to fit (measured once the font is in)
const FITS = [];
const maxContent = e => { const w0 = e.style.width; e.style.width = "max-content"; const m = e.offsetWidth; e.style.width = w0; return m; };
function fit(e, maxW, measure = maxContent, apply) { FITS.push({ e, maxW, measure, apply }); return e; }
function applyFits() {
  if (!FITS.length) return;
  for (const s of scenes) s.el.style.display = "block";
  for (const f of FITS) {
    if (f.base == null) f.base = parseFloat(getComputedStyle(f.e).fontSize);
    const set = k => f.apply ? f.apply(k) : (f.e.style.fontSize = (f.base * k).toFixed(2) + "px");
    set(1);
    const w = f.measure(f.e);
    if (w > f.maxW) set(f.maxW / w * .98);
  }
  for (const s of scenes) { s.el.style.display = "none"; s.on = false; }
}

// ---------------------------------------------------------------- scenes, background, flashes
const scenes = [];
function scene(id, a, z) { const e = el(document.getElementById("scenes"), "div", "scene"); e.id = id; const s = { id, a, b: z, el: e, world: el(e, "div", "world"), on: false, update: () => {} }; scenes.push(s); return s; }
function exitZ(s, t, a, z, dz = -900, blur = 14) { const o = P(t, a, z, E.inExpo); s.world.style.transform = (s.world.style.transform || "").replace(/ ?translateZ\([^)]*\)/, "") + ` translateZ(${o * dz}px)`; s.el.style.filter = o > .02 ? `blur(${o * blur}px)` : ""; s.el.style.opacity = 1 - P(t, z - .06, z, E.lin); return o; }
let BLOBS = [], MOOD = [[0, 0, 0, 0, 0], [DUR, 0, 0, 0, 0]], blobEls = [];
function background(blobs, mood) {
  BLOBS = blobs; MOOD = mood;
  blobEls = blobs.map(q => { const e = el(document.getElementById("bg"), "div", "blob"); e.style.background = `radial-gradient(closest-side, rgba(${q.c},.8) 0%, rgba(${q.c},.3) 42%, rgba(${q.c},.08) 70%, transparent 100%)`; return e; });
}
function bgUpdate(t) { let i = 0; while (i < MOOD.length - 2 && MOOD[i + 1][0] <= t) i++; const a = MOOD[i], c = MOOD[i + 1], u = E.inOutSine(clamp((t - a[0]) / Math.max(1e-6, c[0] - a[0]))); BLOBS.forEach((q, k) => { blobEls[k].style.opacity = mix(a[k + 1] ?? 0, c[k + 1] ?? 0, u); blobEls[k].style.transform = `translate(${q.x + Math.sin(t * .31 + k * 1.7) * 80}px,${q.y + Math.cos(t * .27 + k * 2.3) * 90}px) scale(${q.s || 1})`; }); }
const FLASH = [[DROP, .85, .38], [END, .5, .45]];
if (REDROP && Math.abs(REDROP - END) > .1) FLASH.push([REDROP, .45, .3]);
for (const a of ACC) if (Math.abs(a - END) > .1) FLASH.push([a, .4, .3]);
const fxFlash = document.getElementById("flash"), fxFade = document.getElementById("fade");
function fxUpdate(t) { let f = 0; for (const [t0, a, d] of FLASH) f += a * pulse(t, t0 - .01, d) * clamp((t - t0 + .03) / .03); fxFlash.style.opacity = Math.min(1, f); fxFade.style.opacity = P(t, DUR - .8, DUR, E.inOutSine) + (window.FADE_IN === false ? 0 : 1 - P(t, 0, .06, E.lin)); }  // reels: frame 0 must be a full picture (FADE_IN = false in viral.js)
window.DURATION = DUR;
window.render = t => { bgUpdate(t); fxUpdate(t); for (const s of scenes) { const on = t >= s.a && t < s.b; if (on !== s.on) { s.el.style.display = on ? "block" : "none"; s.on = on; } if (on) s.update(t); } return true; };

// ---------------------------------------------------------------- boot + preview
function start(audio) {
  audio = window.AUDIO || audio;
  (async () => {
    try { await document.fonts.load('600 40px "SUV"'); } catch (e) {}
    await document.fonts.ready;
    applyFits();
    const imgs = [...document.images, ...Object.values(CLIPS).flat()];
    await Promise.all(imgs.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    await Promise.all(Object.values(CLIPS).flat().map(i => i.decode ? i.decode().catch(() => {}) : 0));
    // background-image urls are not in document.images: preload them too
    const urls = new Set(); document.querySelectorAll("[style*='url(']").forEach(e => { const m = e.getAttribute("style").match(/url\(([^)]+)\)/); if (m) urls.add(m[1].replace(/["']/g, "")); });
    await Promise.all([...urls].map(u => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = u; })));
    window.render(0); window.READY = true;
  })();
  if (new URLSearchParams(location.search).has("render")) return;
  previewPlayer(audio, { w: 1080, h: 1920 });
}

// ---------------------------------------------------------------- preview player (browser only, never in ?render)
// Pause / resume where you stopped, seek bar, time with tenths (for corrections), chapters (o.chapters), the last
// position is remembered per page (Ctrl+F5 after a fix comes back to the same moment).  The audio is loaded as a blob:
// python's http.server has no Range requests, so a plain <audio src> could not seek and always restarted from 0.
// Keys: space = play / pause, arrows = 1 s (shift = 5 s), , . = one frame back / forward, Home = start.
function previewPlayer(audio, o = {}) {
  const SW = o.w || 1080, SH = o.h || 1920, q = new URLSearchParams(location.search), still = q.has("t"), BAR = still ? 0 : 58;
  const fitStage = () => { const s = Math.min(innerWidth / SW, (innerHeight - BAR) / SH), st = document.getElementById("stage"); st.style.transformOrigin = "0 0"; st.style.transform = `translate(${(innerWidth - SW * s) / 2}px,${(innerHeight - BAR - SH * s) / 2}px) scale(${s})`; for (const e of [document.documentElement, document.body]) { e.style.background = "#000"; e.style.width = "100vw"; e.style.height = "100vh"; } };
  fitStage(); addEventListener("resize", fitStage);
  if (still) { const go = () => window.READY ? window.render(+q.get("t")) : setTimeout(go, 50); go(); return; }
  document.head.insertAdjacentHTML("beforeend", `<style>
    #pp { position: fixed; left: 0; right: 0; bottom: 0; height: 58px; display: flex; align-items: center; gap: 12px; padding: 0 14px; background: #0b0d13; border-top: 1px solid #262b38; z-index: 100; font: 600 14px "Segoe UI", sans-serif; color: #cfd6e6; }
    #pp button { background: #1d2230; color: #e8ecf5; border: 1px solid #2e3446; border-radius: 8px; padding: 6px 10px; font: 600 13px "Segoe UI"; cursor: pointer; white-space: nowrap; }
    #pp button:hover { border-color: #5b6480; } #pp button.on { background: #2fd07a; color: #03140a; border-color: #2fd07a; }
    #pp .pl { width: 46px; font-size: 16px; } #pp input { flex: 1; min-width: 160px; accent-color: #2fd07a; cursor: pointer; }
    #pp .tm { font: 700 15px Consolas, monospace; min-width: 150px; text-align: center; color: #fff; }
    #pp .chs { display: flex; gap: 6px; overflow-x: auto; max-width: 55vw; } #pp .hl { color: #6b7488; font-size: 12px; white-space: nowrap; }</style>`);
  const au = new Audio(), KEY = "pp:" + location.pathname;
  let ready = false, playing = false, clock = 0, t0 = performance.now();
  try { const s = q.has("from") ? +q.get("from") : +localStorage.getItem(KEY); if (s > 0 && s < DUR) clock = s; } catch (e) {}
  const now = () => !playing ? clock : ready && !au.paused && !au.seeking ? au.currentTime : clock + (performance.now() - t0) / 1000;
  fetch(audio).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(b => {
    au.src = URL.createObjectURL(b);
    au.addEventListener("loadedmetadata", () => { ready = true; if (playing) { au.currentTime = now(); au.play().catch(() => {}); } }, { once: true });
  }).catch(() => {});
  const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
  const bar = document.createElement("div"); bar.id = "pp";
  const chs = o.chapters || [];
  bar.innerHTML = `<button class="pl">▶</button><span class="tm"></span><input type="range" min="0" max="${DUR}" step="0.01" value="0">`
    + (chs.length ? `<div class="chs">${chs.map((c, i) => `<button data-a="${c.a}">${i + 1}. ${c.title}</button>`).join("")}</div>` : "")
    + `<span class="hl">spacja ▶❚❚ · ←/→ 1 s · shift 5 s · , . klatka</span>`;
  document.body.appendChild(bar);
  const btn = bar.querySelector(".pl"), seek = bar.querySelector("input"), tm = bar.querySelector(".tm"), chb = [...bar.querySelectorAll(".chs button")];
  const setT = s => { clock = clamp(s, 0, DUR - .01); t0 = performance.now(); if (ready) au.currentTime = clock; };
  const play = () => { if (playing) return; if (clock >= DUR - .05) clock = 0; playing = true; t0 = performance.now(); if (ready) { au.currentTime = clock; au.play().catch(() => {}); } btn.textContent = "❚❚"; };
  const pause = () => { if (!playing) return; clock = now(); playing = false; au.pause(); btn.textContent = "▶"; save(); };
  const toggle = () => playing ? pause() : play();
  const save = () => { try { localStorage.setItem(KEY, String(now())); } catch (e) {} };
  window.PLAYER = { play, pause, toggle, seek: setT, now, audio: au, ready: () => ready };
  btn.onclick = toggle;
  let drag = false;
  seek.oninput = () => setT(+seek.value);
  seek.onpointerdown = () => { drag = true; }; seek.onpointerup = () => { drag = false; };
  // keys belong to the player, not to a focused button / slider (space would click the button a second time)
  bar.addEventListener("click", () => setTimeout(() => document.activeElement && document.activeElement.blur && document.activeElement.blur(), 0));
  seek.onchange = () => seek.blur();
  chb.forEach(b => { b.onclick = () => { setT(+b.dataset.a - .3); play(); }; });
  // a click anywhere outside the bar = play / pause (also the "click to play" overlay of the reels)
  addEventListener("click", e => { if (!e.target.closest("#pp")) toggle(); });
  addEventListener("keydown", e => {
    const k = e.code, step = e.shiftKey ? 5 : 1;
    if (k === "Space") { e.preventDefault(); toggle(); }
    else if (k === "ArrowRight") { e.preventDefault(); setT(now() + step); } else if (k === "ArrowLeft") { e.preventDefault(); setT(now() - step); }
    else if (k === "Comma" || k === "Period") { pause(); setT(now() + (k === "Period" ? 1 : -1) / 30); } else if (k === "Home") setT(0);
  });
  addEventListener("beforeunload", save);
  let lastUi = -1, lastSave = 0;
  const loop = () => {
    if (window.READY) {
      let t = now();
      if (t >= DUR - .01) { t = DUR - .01; if (playing) { playing = false; clock = t; au.pause(); btn.textContent = "▶"; } }
      if (ready && playing && !au.paused && Math.abs(au.currentTime - t) > .25) au.currentTime = t;
      window.render(t);
      if (Math.abs(t - lastUi) > .04) {
        lastUi = t; if (!drag) seek.value = t; tm.textContent = `${fmt(t)} / ${fmt(DUR)}`;
        chb.forEach((b, i) => b.classList.toggle("on", t >= chs[i].a - .5 && (i === chb.length - 1 || t < chs[i + 1].a - .5)));
      }
      if (performance.now() - lastSave > 1000) { lastSave = performance.now(); save(); }
    }
    requestAnimationFrame(loop);
  };
  loop();
}
