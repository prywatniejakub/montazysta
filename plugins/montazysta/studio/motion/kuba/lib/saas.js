"use strict";
// saas.js — the approved SaaS product-film engine (see wiedza/feedback-saas-film-style.md), on top of motion/lib/engine.js.
// Page: timing.js + engine.js + saas.js + the film's scenes, then saasBoot("x.m4a").  Everything is a pure function of t.
//   S(a, z, build, o)        scene with a 3D camera (cam) and soft blur/scale cross-dissolves; build(cam, sceneEl, s) -> up(lt, t)
//   camSet(cam, [x, y, s, rx, ry, rz])   keysAt(keys, t)   words(parent, text, y, size, times, o)   appear / vanish / popIn
//   aurora(moodKeys)  clouds(parent, o)  ripple(parent)  morph(el, keys)  win(parent, ...)  monitor(parent, ...)  hud(...)
if (window.FADE_IN === undefined) window.FADE_IN = false;  // frame 0 = a full picture, never black (wiedza/feedback-reel-retention.md)
const ROOT = document.getElementById("scenes"), BG = document.getElementById("bg");
const FW = (window.FRAME || {}).w || 1920, FH = (window.FRAME || {}).h || 1080;  // reels: window.FRAME = {w: 1080, h: 1920} + lib/saas-reel.css
const oc = u => 1 - Math.pow(1 - u, 3), ioc = E.inOutCubic, ios = E.inOutSine;
const ioe = u => u <= 0 ? 0 : u >= 1 ? 1 : u < .5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2;
const oback = (u, s = 1.5) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
function keysAt(keys, t, ease = ioc) {
  let c = keys[0].slice(2);
  for (let i = 1; i < keys.length; i++) { const [a, d, ...v] = keys[i]; if (t < a) break; const u = ease(clamp((t - a) / Math.max(d, 1e-3))); c = c.map((x, j) => mix(x, v[j], u)); if (u < 1) break; }
  return c;
}
const wt = k => T.lines[LI(k)].words.filter(w => norm(w.w)).map(w => w.t);
const px = v => v + "px";
const place = (e, x, y, w, h) => { Object.assign(e.style, { left: px(x), top: px(y) }); if (w != null) e.style.width = px(w); if (h != null) e.style.height = px(h); return e; };
const at = (parent, cls, html, x, y, w, h) => place(el(parent, "div", cls, html), x, y, w, h);  // element at (x, y) = its top-left
// centred box; text chips (pill / ok / chipk / stamp4 / fit) never get a fixed width (text outside its box = 3 bugs so far): an invisible box of w x h centres a chip sized to its text
const ctr = (parent, cls, html, cx, cy, w, h) => /(^| )(pill|ok|chipk|stamp4|fit)( |$)/.test(cls)
  ? el(place(el(parent, "div", "fitbox"), cx - w / 2, cy - h / 2, w, h), "div", cls, html)
  : place(el(parent, "div", cls, html), cx - w / 2, cy - h / 2, w, h);
function appear(e, t, a, d = .55, dy = 26, extra = "") {
  const u = P(t, a, a + d, oc); e.style.opacity = clamp((t - a) / (d * .5));
  e.style.transform = `translateY(${(1 - u) * dy}px) ${extra}`; e.style.filter = u < .99 ? `blur(${(1 - u) * 12}px)` : ""; return u;
}
function vanish(e, t, a, d = .4) { const u = P(t, a, a + d, E.inCubic); if (u > 0) { e.style.opacity = Math.min(+e.style.opacity || 1, 1 - u); e.style.filter = `blur(${u * 12}px)`; } return u; }
function popIn(e, t, a, base = "", f = 1.7, z = .6) { const s = spring(t - a, f, z); e.style.opacity = clamp((t - a) / .12); e.style.transform = `${base} scale(${t < a ? 0 : Math.max(0, s)})`; return s; }
function typeInto(e, text, t, t0, cps = 24, caret = true) {
  const n = Math.floor(clamp((t - t0) * cps, 0, text.length)); const s = text.slice(0, n) + (caret && t >= t0 - .3 && (n < text.length || Math.floor(t * 2.5) % 2) ? "|" : "");
  if (e.textContent !== s) e.textContent = s;
}
const money = v => "$" + Math.round(v).toLocaleString("en-US");
const moneyK = v => v >= 1e6 ? "$" + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M" : "$" + Math.round(v / 1e3) + "k";

// ---------------------------------------------------------------- icons (stroke = currentColor)
const SV = (d, fill) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
const IC = {
  rec: SV('<circle cx="12" cy="12" r="7"/>', 1), cut: SV('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>'),
  spark: SV('<path d="M12 2c.6 4.8 2.7 7.4 8 8-5.3.6-7.4 3.2-8 8-.6-4.8-2.7-7.4-8-8 5.3-.6 7.4-3.2 8-8z"/>', 1),
  cal: SV('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'), short: SV('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>'),
  globe: SV('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'), mic: SV('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  lock: SV('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  moon: SV('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', 1), bulb: SV('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  mega: SV('<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/>'), play: SV('<path d="M8 5.5v13l11-6.5z"/>', 1),
  app: SV('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>'), users: SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>'),
  upload: SV('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'), download: SV('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'), zoom: SV('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>'),
  folder: SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'), laptop: SV('<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 19h20"/>'),
  factory: SV('<path d="M3 20V10l5 3V10l5 3V6h3l1 7h3v7z"/><path d="M7 17h2M12 17h2"/>'), office: SV('<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M11 21v-3h2v3"/>'),
  store: SV('<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M10 20v-5h4v5"/>'),
  course: SV('<path d="M3 8l9-4 9 4-9 4zM7 10v5c0 1.5 2.2 3 5 3s5-1.5 5-3v-5M21 8v6"/>'), tool: SV('<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17v3h3l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.5-.5-2.6z"/>'),
  book: SV('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"/>'), box: SV('<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5zM3 7.5L12 12l9-4.5M12 12v9"/>'),
  brief: SV('<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'), hand: SV('<path d="M7 11l3-3 3 2 3-3 5 5-6 6-5-1-4-4zM3 10l4 1M17 7l1-1"/>'),
  server: SV('<rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6.5h.01M8 17.5h.01M12 6.5h4M12 17.5h4"/>'),
  bolt: SV('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', 1), target: SV('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'),
  film: SV('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>'), eye: SV('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
  card: SV('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/>'), chat: SV('<path d="M4 5h16v11H9l-5 4z"/>'), send: SV('<path d="M4 12l16-8-6 16-3-7z"/>', 1),
  claude: '<svg viewBox="0 0 24 24" fill="none" stroke="#e8845c" stroke-width="2.6" stroke-linecap="round"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg>',
};
const KBA = '<svg viewBox="0 0 100 100"><path d="M30 24v52M30 52l26-28M40 44l22 32" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><circle cx="74" cy="30" r="8" fill="#9ff5cf"/></svg>';
// a glossy app-icon tile with a glyph (svg) and a sheen that can sweep (e.sh)
function appIcon(parent, size, cx, cy, glyph = KBA, bg = "linear-gradient(145deg, #5a86ff 0%, #7b5cff 55%, #c56bff 100%)") {
  const e = ctr(parent, "", glyph, cx, cy, size, size);
  Object.assign(e.style, { position: "absolute", borderRadius: "26%", background: bg, overflow: "hidden", boxShadow: "0 30px 90px rgba(100,110,255,.5), inset 0 2px 0 rgba(255,255,255,.4), inset 0 -8px 20px rgba(40,0,120,.35)" });
  e.firstChild.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%"; e.sh = el(e, "div", "sheen"); return e;
}

// ---------------------------------------------------------------- footage (clips/<name>/001.jpg.., 30 fps)
const CLIPIMG = {};
function clipImgs(n, base = window.CLIPBASE || "clips", len = 150) { const k = base + "/" + n; return CLIPIMG[k] || (CLIPIMG[k] = Array.from({ length: len }, (_, i) => { const im = new Image(); im.src = `${base}/${n}/${String(i + 1).padStart(3, "0")}.jpg`; return im; })); }
function canvas(parent, w, h, cls = "") { const cv = el(parent, "canvas", cls); cv.width = w; cv.height = h; cv.last = ""; return cv; }
function drawClip(cv, name, lt, o = {}) {
  const ims = clipImgs(name), f = clamp(Math.floor(lt * 30), 0, ims.length - 1), z = o.zoom || 1, key = `${name}${f}|${z.toFixed(3)}|${o.cx}|${o.cy}|${(o.dim || 0).toFixed(2)}`;
  if (cv.last === key) return; const im = ims[f]; if (!im.complete || !im.naturalWidth) return; cv.last = key;
  const c = cv.getContext("2d"), W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight; let sw = iw, sh = ih;
  if (sw / sh > W / H) sw = sh * W / H; else sh = sw * H / W; sw /= z; sh /= z;
  const sx = clamp((o.cx ?? .5) * iw - sw / 2, 0, iw - sw), sy = clamp((o.cy ?? .5) * ih - sh / 2, 0, ih - sh);
  c.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
  if (o.dim) { c.fillStyle = `rgba(0,0,0,${o.dim})`; c.fillRect(0, 0, W, H); }
}
function seqAt(seq, t) { let s = seq[0]; for (const q of seq) if (t >= q[0]) s = q; return { name: s[1], lt: Math.min(Math.max(0, t - s[0]), 4.96) }; }
const frameUrl = (n, f, base = window.CLIPBASE || "clips") => `${base}/${n}/${String(f).padStart(3, "0")}.jpg`;

// ---------------------------------------------------------------- aurora background: mood keys [t, blue, violet, cyan, pink, navy]
const AUC = ["79,124,255", "139,108,255", "94,231,255", "255,122,217", "38,58,170"];
const AUP = [[-520, -260, 1500], [560, 160, 1500], [-300, 420, 1100], [700, -380, 1100], [0, 0, 2300]];
let MOODK = [[0, .5, .5, .1, .1, .5], [1e4, .5, .5, .1, .1, .5]];
const AUE = AUC.map((c, k) => { const e = el(BG, "div", "au"); const s = AUP[k][2]; place(e, -s / 2, -s / 2, s, s); e.style.background = `radial-gradient(closest-side, rgba(${c},.75), rgba(${c},.28) 45%, rgba(${c},.06) 75%, transparent)`; return e; });
function aurora(keys) { MOODK = keys.concat([[1e4, ...keys[keys.length - 1].slice(1)]]); }
function bgUp(t) {
  let i = 0; while (i < MOODK.length - 2 && MOODK[i + 1][0] <= t) i++;
  const a = MOODK[i], b = MOODK[i + 1], u = ios(clamp((t - a[0]) / Math.max(.4, Math.min(1.2, b[0] - a[0]))));
  AUE.forEach((e, k) => { e.style.opacity = mix(a[k + 1], b[k + 1], u).toFixed(3);
    e.style.transform = `translate(${FW / 2 + AUP[k][0] * FW / 1920 + Math.sin(t * .23 + k * 1.9) * 140}px,${FH / 2 + AUP[k][1] * FH / 1080 + Math.cos(t * .19 + k * 2.4) * 110}px)`; });
}

// ---------------------------------------------------------------- scenes
const SCN = [];
function S(a, z, build, o = {}) {
  const e = el(ROOT, "div", "sc" + (o.light ? " light" : "")), cam = el(e, "div", "cam");
  const s = { a, z, e, cam, light: !!o.light, inD: o.inD ?? .7, outD: o.outD ?? .6, on: false, pushOut: o.pushOut ?? 1, inBlur: o.inBlur ?? 22, cut: o.cut };
  s.up = build(cam, e, s) || (() => {});
  if (o.whoosh !== false && a > .5) sfx(o.whoosh || "WH_SOFT", a + .1, o.gain ?? -24);
  SCN.push(s); return s;
}
const VIG = document.getElementById("vig");
function scUp(t) {
  let lit = 0;
  for (const s of SCN) {
    const on = t >= s.a && t < s.z + s.outD;
    if (on !== s.on) { s.e.style.display = on ? "block" : "none"; s.on = on; }
    if (!on) continue;
    const i = s.inD ? P(t, s.a, s.a + s.inD, oc) : 1, w = s.outD ? P(t, s.z, s.z + s.outD, E.inCubic) : 0;
    s.e.style.opacity = (i * (1 - w)).toFixed(3); if (s.light) lit = Math.max(lit, i * (1 - w));
    const bl = (1 - i) * s.inBlur + w * 22; s.e.style.filter = bl > .3 ? `blur(${bl.toFixed(1)}px)` : "";
    s.e.style.transform = `scale(${(1 + (1 - i) * .05 * (s.inBlur ? 1 : 0) + w * .06 * s.pushOut).toFixed(4)})`;
    s.up(t - s.a, t);
  }
  VIG.style.opacity = (1 - .85 * lit).toFixed(3);
}
const camSet = (cam, [x, y, s, rx = 0, ry = 0, rz = 0]) => { cam.style.transform = `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate(${-x}px,${-y}px)`; };
// centred line of words (scene coords unless o.inCam), each word revealed at its time; o.grad = indexes, o.cls, o.x
function words(parent, text, y, size, times, o = {}) {
  const e = el(parent, "div", "hl" + (o.cls ? " " + o.cls : "")); e.style.top = px(y - size * .6); e.style.fontSize = px(size);
  if (o.inCam) e.style.left = px(-FW / 2); if (o.x != null) e.style.left = px(o.x); if (o.w) e.style.width = px(o.w); if (o.align) e.style.textAlign = o.align;
  e.ws = text.split(" ").map((w, i) => { const s = el(e, "span", "wd" + (o.grad && o.grad.includes(i) ? " " + (o.gcls || "grad") : ""), w); s.at = times[Math.min(i, times.length - 1)]; return s; });
  e.up = t => e.ws.forEach(s => { const a = s.at - .08, u = P(t, a, a + .6, oc); s.style.opacity = clamp((t - a) / .28); s.style.transform = `translateY(${(1 - u) * 30}px)`; s.style.filter = u < .99 ? `blur(${(1 - u) * 14}px)` : ""; });
  return e;
}
const pill = (parent, html, x, y, cls = "pill") => { const e = el(parent, "div", cls, html); place(e, x, y); e.style.transform = "translateX(-50%)"; return e; };
const icoPill = (parent, icon, col, text, x, y) => pill(parent, `<span style="color:${col};display:flex">${icon}</span>${text}`, x, y);
// a word that rolls into another word (text change with a vertical blur roll): items [[t, "word", cls]]
function swapWord(parent, items, x, y, size, o = {}) {
  const e = at(parent, "ab", "", x, y); Object.assign(e.style, { font: `600 ${size}px/1.15 var(--font)`, letterSpacing: "-.045em", whiteSpace: "nowrap", color: o.color || "var(--txt)" });
  if (o.center) e.style.transform = "translateX(-50%)";
  const sp = items.map(([a, w, c]) => { const s = el(e, "span", c || "", w); Object.assign(s.style, { position: "absolute", left: o.center ? "50%" : "0", top: "0", whiteSpace: "nowrap" }); if (o.center) s.style.marginLeft = "0"; s.a = a; return s; });
  e.up = t => sp.forEach((s, i) => { const nx = sp[i + 1], u = P(t, s.a - .05, s.a + .45, oc), v = nx ? P(t, nx.a - .05, nx.a + .35, E.inCubic) : 0;
    s.style.opacity = t < s.a - .05 ? 0 : (u * (1 - v)).toFixed(3); s.style.transform = `${o.center ? "translateX(-50%) " : ""}translateY(${(1 - u) * size * .6 - v * size * .6}px)`; s.style.filter = (1 - u) + v > .02 ? `blur(${((1 - u) + v) * 16}px)` : ""; });
  return e;
}

// ---------------------------------------------------------------- continuity: a shell whose box morphs (keys [t, d, cx, cy, w, h, radius])
function morph(e, keys, t, ease = ioe) { const [cx, cy, w, h, r] = keysAt(keys, t, ease); Object.assign(e.style, { left: px(cx - w / 2), top: px(cy - h / 2), width: px(w), height: px(h), borderRadius: px(r) }); return [cx, cy, w, h, r]; }
// browser / app window (centred at cx, cy); o.light, o.url, o.title
function win(parent, cx, cy, w, h, o = {}) {
  const e = ctr(parent, "win" + (o.light ? " wl" : ""), `<div class="tb"><i></i><i></i><i></i>${o.url != null ? `<div class="url">${o.url}</div>` : ""}</div><div class="bd"></div>`, cx, cy, w, h);
  e.bd = e.querySelector(".bd"); e.tb = e.querySelector(".tb"); return e;
}
// monitor on a stand; screen w x h centred at (cx, cy); returns {e, scr}; o.rock = sits on a rock
function monitor(parent, cx, cy, w, h, o = {}) {
  const e = at(parent, "mon", "", 0, 0); const scr = ctr(e, "scr", "", cx, cy, w, h);
  const neck = ctr(e, "neck", "", cx, cy + h / 2 + 75, 110, 150); neck.style.zIndex = -1;
  const foot = ctr(e, "foot", "", cx, cy + h / 2 + 160, 360, 26);
  if (o.rock) { const r = ctr(e, "", "", cx, cy + h / 2 + 230, 900, 180); Object.assign(r.style, { position: "absolute", borderRadius: "48% 52% 40% 44% / 60% 60% 40% 40%", background: "radial-gradient(ellipse at 40% 30%, #4a4f63, #1d2030 55%, #0b0c14)", boxShadow: "inset 0 10px 30px rgba(255,255,255,.12), 0 40px 80px rgba(0,0,0,.6)" }); r.style.zIndex = -2; e.rock = r; }
  return { e, scr };
}
// progress HUD (n of total) in a scene; returns up(t, n)
function hud(parent, label, total) {
  const e = el(parent, "div", "hud", `<span>${label}</span><b class="num"></b>`), b = e.querySelector("b"), dots = Array.from({ length: total }, () => el(e, "i", ""));
  return (t, n, show = 1) => { e.style.opacity = show; b.textContent = `${n}/${total}`; dots.forEach((d, i) => d.classList.toggle("on", i < n)); };
}
// water ripple at (x, y) in parent: rings + soft glow; up(t, t0)
function ripple(parent, x, y, col = "255,255,255") {
  const g = ctr(parent, "", "", x, y, 600, 600); Object.assign(g.style, { position: "absolute", pointerEvents: "none", borderRadius: "50%", background: `radial-gradient(closest-side, rgba(${col},.35), transparent)` });
  const R = [0, 1, 2].map(() => { const r = ctr(parent, "ring", "", x, y, 600, 600); r.style.borderColor = `rgba(${col},.9)`; return r; });
  return (t, t0) => { const d = t - t0; g.style.opacity = d > 0 && d < 1 ? (1 - d) * .8 : 0; g.style.transform = `scale(${.2 + d * .8})`;
    R.forEach((r, i) => { const u = (d - i * .12) / 1.1; r.style.opacity = u > 0 && u < 1 ? (1 - u) * .9 : 0; r.style.transform = `scale(${.05 + u * .95})`; r.style.borderWidth = px(Math.max(1, 6 * (1 - u))); }); };
}
// soft procedural clouds (value-noise fbm), drawn once into a canvas; o.seed, o.tint [r,g,b], o.cover 0..1
function clouds(parent, o = {}) {
  const W = 480, H = 270, cv = canvas(el(parent, "div", "clouds"), W, H), c = cv.getContext("2d"), img = c.createImageData(W, H), seed = o.seed || 1;
  const rnd = (x, y) => hash(x * 7 + seed * 131, y * 13 + seed * 71);
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, s = u => u * u * (3 - 2 * u);
    return mix(mix(rnd(xi, yi), rnd(xi + 1, yi), s(xf)), mix(rnd(xi, yi + 1), rnd(xi + 1, yi + 1), s(xf)), s(yf)); };
  const [tr, tg, tb] = o.tint || [236, 238, 255], cover = o.cover ?? .5;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 0, a = .5, f = 1 / 60; for (let k = 0; k < 5; k++) { v += a * vn(x * f, y * f * 1.6); a *= .5; f *= 2; }
    const d = clamp((v - (1 - cover) * .75) * 2.4), sh = .78 + .22 * clamp(v * 1.3), i = (y * W + x) * 4;
    img.data[i] = tr * sh; img.data[i + 1] = tg * sh; img.data[i + 2] = tb * sh; img.data[i + 3] = d * 255;
  }
  c.putImageData(img, 0, 0); return cv.parentNode;
}

// ---------------------------------------------------------------- boot + preview player
function saasBoot(audio) {
  const base = window.render;
  window.render = t => { base(t); bgUp(t); scUp(t); if (window.AFTER) window.AFTER(t); return true; };
  const rend = new URLSearchParams(location.search).has("render");
  (async () => {
    await document.fonts.ready;
    const imgs = [...document.images].concat(rend ? Object.values(CLIPIMG).flat() : []);
    await Promise.all(imgs.map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    window.render(0); window.READY = true;
  })();
  if (rend) return;
  previewPlayer(audio, { w: FW, h: FH, chapters: FW < FH ? [] : T.chapters });
}
