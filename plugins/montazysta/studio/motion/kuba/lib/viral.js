"use strict";
window.FADE_IN = false;  // 2026-09-26: no fade from black - the first frame decides the swipe, it must be a full picture
// Fast split-screen reel: a big board under a moving camera (top half), gameplay frames (bottom half) and
// word-by-word captions on the seam.  Camera moves / shakes / flashes come from window.CFG (script.py).
const V2 = {};
const inOutExpo = u => u <= 0 ? 0 : u >= 1 ? 1 : u < .5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2;
const outBack = (u, s = 1.6) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);

function viralSetup(C) {
  // C.full = one board over the whole screen (no gameplay); otherwise board on top, gameplay at the bottom
  const root = el(document.getElementById("scenes"), "div", "layer");
  const top = el(root, "div", "v-top" + (C.full ? " v-full" : "")), board = el(top, "div", "v-board");
  if (C.board) { board.style.width = C.board[0] + "px"; board.style.height = C.board[1] + "px"; }
  const tflash = el(top, "div", "v-flash");
  let bot = null, cv = null, bflash = null;
  if (!C.full) {
    bot = el(root, "div", "v-bot"); cv = el(bot, "canvas", ""); cv.width = 1080; cv.height = 960;
    bflash = el(bot, "div", "v-flash"); el(root, "div", "v-seam");
  }
  const cap = el(root, "div", "v-cap"); cap.style.top = (C.capY || 960) + "px";
  Object.assign(V2, { C, root, top, board, tflash, bot, cv, ctx: cv && cv.getContext("2d"), bflash, cap, cy: C.full ? (C.camY || 860) : 480 });
  // soft light: radial gradients (no hard edge at any zoom), 1.7x the nominal radius
  (C.zones || []).forEach(([x, y, r0, c]) => {
    const r = r0 * 1.7, z = el(board, "div", "v-zone");
    Object.assign(z.style, { left: x - r + "px", top: y - r + "px", width: 2 * r + "px", height: 2 * r + "px",
      background: `radial-gradient(closest-side, ${c}bb 0%, ${c}66 35%, ${c}22 65%, ${c}00 100%)` });
  });
  buildCaptions(C.hi || {});
  return V2;
}

// ---------------------------------------------------------------- board pieces (board coordinates = centre of the piece)
function B(cls, x, y, w, h, html) { const e = el(V2.board, "div", cls, html); e.style.left = (x - w / 2) + "px"; e.style.top = (y - h / 2) + "px"; e.style.width = w + "px"; e.style.height = h + "px"; e.bx = x; e.by = y; return e; }
function Bt(text, x, y, size, color = "#fff", w = 1600) { const e = B("bt", x, y, w, size * 1.1, text); e.style.fontSize = size + "px"; e.style.lineHeight = size * 1.1 + "px"; e.style.color = color; return e; }
function Bpx(text, x, y, s, color) { const h = el(V2.board, "div", "bx"); const c = pxText(h, text, s, color); h.style.left = (x - c.width / 2) + "px"; h.style.top = (y - c.height / 2) + "px"; return h; }
function Bicon(name, x, y, s) { const h = el(V2.board, "div", "bx"); pxIcon(h, name, s); h.style.left = (x - 6 * s) + "px"; h.style.top = (y - 6 * s) + "px"; return h; }
// entrance from a direction: L R T B (slide), S (scale pop), Z (spin + scale); returns progress 0..1
function enter(e, t, a, dir = "S", dist = 700, extra = "") {
  if (t < a) { e.style.opacity = 0; return 0; }
  const u = clamp((t - a) / .42), k = outBack(u, 1.5), o = 1 - k;
  const m = { L: `translate(${-dist * o}px,0)`, R: `translate(${dist * o}px,0)`, T: `translate(0,${-dist * o}px)`, B: `translate(0,${dist * o}px)`,
    S: `scale(${Math.max(0, k)})`, Z: `scale(${Math.max(0, k)}) rotate(${o * -140}deg)` }[dir];
  e.style.opacity = clamp(u / .15); e.style.transform = m + " " + extra; return u;
}

// ---------------------------------------------------------------- camera
function camAt(t) {
  const M = V2.C.cam; let s = M[0].slice(2);
  for (let i = 1; i < M.length; i++) {
    const [a, d, ...to] = M[i]; if (t < a) break;
    const u = inOutExpo(clamp((t - a) / Math.max(.01, d))); s = s.map((v, k) => mix(v, to[k], u));
  }
  return s;  // [x, y, z, r]
}
function shakeAt(t) { let x = 0, y = 0, r = 0; for (const [a, amp] of V2.C.shake || []) { const p = amp * pulse(t, a, .28) * clamp((t - a + .01) / .01); x += p * (hash(Math.floor(t * 60), 1) - .5) * 2; y += p * (hash(Math.floor(t * 60), 2) - .5) * 2; r += p * .08 * (hash(Math.floor(t * 60), 3) - .5); } return [x, y, r]; }
function cameraUpdate(t) {
  const [x, y, z, r] = camAt(t), [sx, sy, sr] = shakeAt(t);
  const drift = 1 + .012 * Math.sin(t * 1.3);
  V2.board.style.transform = `translate(${540 + sx}px,${V2.cy + sy}px) rotate(${r + sr}deg) scale(${z * drift}) translate(${-x}px,${-y}px)`;
  let f = 0; for (const a of V2.C.flash || []) f += .35 * pulse(t, a, .12) * clamp((t - a + .01) / .01);
  V2.tflash.style.opacity = Math.min(.7, f);
  let g = 0; for (const [a, b] of V2.C.gray || []) g = Math.max(g, P(t, a, a + .3, E.lin) * (1 - P(t, b - .25, b, E.lin)));
  V2.board.style.filter = g > .01 ? `grayscale(${g}) brightness(${1 - .2 * g})` : "";
}

// ---------------------------------------------------------------- gameplay (bottom half)
const V2CACHE = new Map(); let V2last = -1;
function v2frame(t) {
  const CU = window.CUTS;
  for (const [a, b, base] of CU) if (t >= a && t < b) return [base + Math.floor((t - a) * GFPS), a];
  const L = t < CU[0][0] ? CU[0] : CU[CU.length - 1];
  return [t < CU[0][0] ? L[2] : L[2] + Math.floor((L[1] - L[0]) * GFPS) - 1, L[0]];
}
function v2load(i) {
  i = Math.max(0, Math.min(NFRAMES - 1, i)); let p = V2CACHE.get(i);
  if (!p) { const im = new Image(); im.src = `frames/${String(i + 1).padStart(5, "0")}.jpg`; p = im.decode().then(() => im, () => im); V2CACHE.set(i, p); if (V2CACHE.size > 150) V2CACHE.delete(V2CACHE.keys().next().value); }
  return p;
}
async function v2game(t) {
  const [i] = v2frame(t); for (let k = 1; k <= 8; k++) v2load(i + k);
  if (i !== V2last) { const im = await v2load(i); if (im.naturalWidth) V2.ctx.drawImage(im, 0, 0, 1080, 960); V2last = i; }
}
function gameUpdate(t) {
  const [, a] = v2frame(t); let z = 1.04 + .03 * Math.sin(t * .7);
  for (const p of V2.C.punchGame || []) z += .1 * pulse(t, p, .22) * clamp((t - p + .01) / .01);
  let f = 0; for (const [a0] of window.CUTS) if (a0 > .2) f += .28 * pulse(t, a0, .1) * clamp((t - a0 + .01) / .01);
  V2.cv.style.transform = `scale(${z.toFixed(4)})`; V2.bflash.style.opacity = Math.min(.5, f);
  let g = 0; for (const [ga, gb] of V2.C.gray || []) g = Math.max(g, P(t, ga, ga + .3, E.lin) * (1 - P(t, gb - .25, gb, E.lin)));
  V2.cv.style.filter = g > .01 ? `grayscale(${g})` : "";
}

// ---------------------------------------------------------------- captions: 1-2 words, pop, keywords coloured
const V2CAP = [];
function buildCaptions(HI) {
  T.lines.forEach(L => {
    let cur = null;
    L.words.forEach(w => {
      const clean = w.w.replace(/[.,:;!?"“”…]+/g, ""); if (!norm(clean)) return;
      const prev = cur && cur.words[cur.words.length - 1];
      if (!cur || cur.words.length >= 2 || cur.len + clean.length > 11 || /[.,:;!?…]$/.test(prev.w) || clean.length > 8) { cur = { words: [], len: 0 }; V2CAP.push(cur); }
      cur.words.push({ ...w, clean }); cur.len += clean.length + 1;
    });
  });
  V2CAP.forEach((c, k) => {
    const nx = V2CAP[k + 1], end = c.words[c.words.length - 1].e;
    c.a = c.words[0].t - .03; c.z = nx ? Math.min(nx.words[0].t - .03, end + .5) : end + .9;
    c.el = el(V2.cap, "div", "w"); c.el.style.opacity = 0;
    c.sp = c.words.map((w, i) => { const s = el(c.el, "span", "", w.clean); if (i < c.words.length - 1) s.style.marginRight = ".28em"; const key = Object.keys(HI).find(h => norm(w.clean).startsWith(norm(h))); s.style.color = key ? HI[key] : "#fff"; return s; });
    c.rot = (hash(k, 9) - .5) * 5; c.len2 = c.words.map(w => w.clean).join(" ").length;
    if (c.len2 > 9) c.el.style.fontSize = Math.max(80, 118 * 9 / c.len2) + "px";
  });
}
function captionsUpdate(t) {
  const off = (V2.C.capOff || []).some(([a, b]) => t >= a && t < b);  // a hook / burst draws its own text (dopa.js)
  V2CAP.forEach(c => {
    if (off || t < c.a || t >= c.z) { c.el.style.opacity = 0; return; }
    const u = clamp((t - c.a) / .12), s = 1.28 - .28 * outBack(u, 2.2);
    c.el.style.opacity = 1; c.el.style.transform = `scale(${s.toFixed(3)}) rotate(${c.rot.toFixed(2)}deg)`;
  });
}

function viralStart(update, audio) {
  const base = window.render;
  const game = !V2.C.full && window.CUTS;
  window.render = t => (game ? v2game(t) : Promise.resolve()).then(() => { cameraUpdate(t); if (game) gameUpdate(t); captionsUpdate(t); update(t); return base(t); });
  start(audio);
  // live preview: a play overlay (browsers only allow sound after a click); every click restarts from 0 with sound
  const q = new URLSearchParams(location.search);
  if (!q.has("render") && !q.has("t")) {
    const o = document.createElement("div");
    o.innerHTML = '<div style="padding:26px 44px;border-radius:60px;background:#2fd07a;color:#03140a;font:900 40px \'Segoe UI Black\',sans-serif">▶ KLIKNIJ — ODTWÓRZ Z DŹWIĘKIEM</div><div style="margin-top:18px;color:#cfd6e6;font:600 22px \'Segoe UI\',sans-serif">klik / spacja = pauza i wznowienie · pasek na dole = przewijanie</div>';
    Object.assign(o.style, { position: "fixed", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.6)", zIndex: 99, cursor: "pointer" });
    document.body.appendChild(o);
    addEventListener("click", () => { o.style.display = "none"; });
  }
}
