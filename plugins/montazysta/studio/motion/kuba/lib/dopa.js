"use strict";
// Retention tricks the user picked (2026-09-23) on top of viral.js — mix them inside one viral-board reel:
//   dopaHook   glitch / typed words on black for the hook, then a whip into the board
//   odo        casino odometer for EVERY number (digits roll, blur when fast)
//   postHTML / ringSVG + ringDraw   screenshot-like posts and dashboards with a hand-drawn marker ring
//   dopaBurst  one hard-cut burst: new background per beat, zoom punch, emoji, boxed 3-word captions
//   dopaGlitch pattern interrupts (RGB split + slices + jitter), 2-3 per reel
// Everything is a pure function of t (render.py draws frames in parallel, out of order).  Call dopaUpdate(t) in update().
const DOPA = [];
function dopaUpdate(t) { DOPA.forEach(f => f(t)); }
function capOff(a, b) { (V2.C.capOff = V2.C.capOff || []).push([a, b]); }
const cleanW = w => w.replace(/[.,:;!?"“”…]+/g, "");
const rate = (f, t) => (f(t + .02) - f(t - .02)) / .04;
function spokenWords(a, z) { const o = []; T.lines.forEach(L => L.words.forEach(w => { if (w.t >= a - .01 && w.t < z && norm(cleanW(w.w))) o.push(w); })); return o; }
function sentences(ws) { const o = []; let g = []; ws.forEach(w => { g.push(w); if (/[.?!:]$/.test(w.w)) { o.push(g); g = []; } }); if (g.length) o.push(g); return o; }
const hiOf = (c, hi) => { const k = Object.keys(hi).find(h => norm(c).startsWith(norm(h))); return k ? hi[k] : null; };

// ---------------------------------------------------------------- hook: words slam / type in on black, RGB split, whip out at z
function dopaHook(a, z, opt = {}) {
  const hi = opt.hi || V2.C.hi || {}, L = el(V2.root, "div", "d-hook"), box = el(L, "div", "d-hk"), bands = el(L, "div", "d-bands");
  const BN = Array.from({ length: 6 }, () => el(bands, "i", ""));
  capOff(a - .05, z + .05);
  const groups = sentences(spokenWords(a, z)), all = [];
  groups.forEach((g, gi) => g.forEach((w, k) => {
    const c = cleanW(w.w), col = hiOf(c, hi), mp = opt.map && opt.map[norm(c)], txt = mp != null ? mp : c.toUpperCase();
    if (!txt) return;  // map to "" = the word is only heard (e.g. "$30" already says "bucks")
    const e = el(box, "div", "d-hw"); e.w = w; e.g = gi; e.txt = txt; e.col = col || "#fff";
    e.style.fontSize = Math.min(col ? 250 : 165, 960 / (txt.length * .66)) + "px"; e.style.color = e.col;
    e.dx = (hash(k + gi * 7, 3) - .5) * 36; e.rot = (hash(k + gi * 7, 4) - .5) * 10; e.typed = !!col && txt.length > 3 && hash(k + gi, 5) > .35;
    all.push(e);
  }));
  const gStart = groups.map(g => g[0].t);
  DOPA.push(t => {
    const on = t >= a - .05 && t < z + .4; L.style.display = on ? "block" : "none"; if (!on) return;
    let cur = 0; gStart.forEach((s, i) => { if (t >= s - .05) cur = i; });
    all.forEach(e => {
      if (e.g !== cur) { e.style.display = "none"; return; }
      e.style.display = "inline-block"; const d = t - e.w.t + .03;
      if (d < 0) { e.style.opacity = 0; e.textContent = e.txt; return; }
      e.style.opacity = 1;
      if (e.typed) { const n = Math.min(e.txt.length, Math.floor(d * 28) + 1); e.textContent = e.txt.slice(0, n) + (n < e.txt.length || Math.floor(t * 4) % 2 ? "▌" : ""); }
      else e.textContent = e.txt;
      const u = clamp(d / .14), s = e.typed ? 1 : 1.9 - .9 * outBack(u, 1.8), sx = 5 + 22 * (1 - u);
      const j = d < .12 ? (hash(Math.floor(t * 60), 7) - .5) * 40 : 0;
      e.style.transform = `translateX(${e.dx + j}px) rotate(${e.rot}deg) scale(${s})`;
      e.style.textShadow = `${sx}px 0 rgba(255,45,85,.9), ${-sx}px 0 rgba(0,229,255,.9), 0 12px 0 rgba(0,0,0,.6)`;
    });
    // slices on every new sentence + light flicker
    const gl = Math.max(0, ...gStart.map((s, i) => i && t >= s - .05 && t < s + .12 ? 1 - (t - s + .05) / .17 : 0));
    BN.forEach((b, k) => { const f = Math.floor(t * 30); b.style.display = gl > 0 ? "block" : "none"; b.style.top = hash(f, k) * 1800 + "px"; b.style.height = 30 + hash(f, k + 9) * 140 + "px"; b.style.transform = `translateX(${(hash(f, k + 3) - .5) * 160}px)`; });
    box.style.transform = gl ? `translateX(${(hash(Math.floor(t * 60), 2) - .5) * 60 * gl}px)` : "";
    // whip out into the board
    const w = clamp((t - z) / .32); L.style.transform = `translateX(${-w * w * 1300}px)`; L.style.filter = w > 0 ? `blur(${w * 26}px)` : ""; L.style.opacity = 1 - w * .6;
  });
}

// ---------------------------------------------------------------- clean hook (Apple-like): off-white stage, black minimal type, hard cuts on the words
// beats = [[t, html], ...]; inside a beat, .d-pop[data-t] pops in at its own time; o.up(t, beat, k) for extra motion;
// leaves at z like a dismissed app card (shrinks, rounds its corners, swipes up) over the board
function dopaClean(a, z, beats, o = {}) {
  const L = el(V2.root, "div", "d-clean"), vig = document.getElementById("vig"); capOff(a - .05, z + .3);
  const bs = beats.map(([bt, html]) => { const e = el(L, "div", "d-cb", html); e.bt = bt; e.pops = [...e.querySelectorAll(".d-pop")].map(p => (p.at = +p.dataset.t, p)); return e; });
  DOPA.push(t => {
    const on = t >= a - .05 && t < z + .5; L.style.display = on ? "block" : "none";
    if (vig) vig.style.opacity = on ? clamp((t - z) / .45) : 1;  // the dark vignette only comes back with the board
    if (!on) return;
    let k = 0; bs.forEach((e, i) => { if (t >= e.bt) k = i; });
    bs.forEach((e, i) => { e.style.display = i === k ? "flex" : "none"; });
    const c = bs[k]; c.style.transform = `scale(${1.05 - .05 * E.outCubic(clamp((t - c.bt) / .3))})`;
    c.pops.forEach(p => { const u = clamp((t - p.at) / .3); p.style.opacity = clamp(u / .2); p.style.transform = `translateY(${(1 - E.outCubic(u)) * 40}px) scale(${.8 + .2 * outBack(u, 1.4)})`; });
    if (o.up) o.up(t, c, k);
    const s = E.inOutCubic(clamp((t - z) / .18)), w = clamp((t - z - .12) / .34);
    L.style.transform = `translateY(${-w * w * 2100}px) scale(${1 - .12 * s})`; L.style.borderRadius = 90 * s + "px";
    L.style.boxShadow = s ? `0 40px 120px rgba(0,0,0,${.55 * s})` : "";
  });
  return L;
}

// clean WHITE BOARD hook: same Apple look, but the pieces sit on a big dotted white board and the camera glides between them
// items = [[x, y, html], ...] (board coords = centre); .d-pop[data-t] pop in; cam = [[t, dur, x, y, zoom, rot], ...] (inOutExpo)
function dopaWhiteboard(a, z, items, cam) {
  const L = el(V2.root, "div", "d-clean d-wbL"), vig = document.getElementById("vig"), W2 = el(L, "div", "d-wb"); capOff(a - .05, z + .3);
  items.forEach(([x, y, html]) => { const e = el(W2, "div", "d-wbi", html); e.style.left = x + "px"; e.style.top = y + "px"; });
  const pops = [...W2.querySelectorAll(".d-pop")].map(p => (p.at = +p.dataset.t, p));
  DOPA.push(t => {
    const on = t >= a - .05 && t < z + .5; L.style.display = on ? "block" : "none";
    if (vig) vig.style.opacity = on ? clamp((t - z) / .45) : 1;
    if (!on) return;
    pops.forEach(p => { const u = clamp((t - p.at) / .3); p.style.opacity = clamp(u / .2); p.style.transform = `translateY(${(1 - E.outCubic(u)) * 40}px) scale(${.8 + .2 * outBack(u, 1.4)})`; });
    const [x, y, zz, r] = keysAt(cam, t), dr = 1 + .012 * Math.sin(t * 1.3);
    W2.style.transform = `translate(540px,860px) rotate(${r}deg) scale(${zz * dr}) translate(${-x}px,${-y}px)`;
    const s = E.inOutCubic(clamp((t - z) / .18)), w = clamp((t - z - .12) / .34);
    L.style.transform = `translateY(${-w * w * 2100}px) scale(${1 - .12 * s})`; L.style.borderRadius = 90 * s + "px";
    L.style.boxShadow = s ? `0 40px 120px rgba(0,0,0,${.55 * s})` : "";
  });
  return L;
}

// ---------------------------------------------------------------- casino odometer: digits roll with carry, blur when fast
function odo(parent, digits, o = {}) {
  const e = el(parent, "div", "d-odo"); e.style.fontSize = (o.size || 200) + "px"; e.style.color = o.color || "#fff";
  if (o.prefix !== "") el(e, "span", "d-fx", o.prefix == null ? "$" : o.prefix);
  const cols = [];
  for (let p = digits - 1; p >= 0; p--) {
    const w = el(e, "span", "d-dg"), s = el(w, "span", "d-st", "0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0");
    const c = { w, s, p, cm: null }; cols.push(c);
    if (o.comma !== false && p % 3 === 0 && p) c.cm = el(e, "span", "d-cm", ",");
  }
  if (o.suffix) el(e, "span", "d-fx d-sfx", o.suffix);
  return { e, set(v, vel = 0) {
    v = Math.max(0, v); const lead = Math.max(o.minDigits || 1, String(Math.floor(v)).length);
    cols.forEach(c => {
      const base = Math.floor(v / 10 ** c.p) % 10, below = (v % 10 ** c.p) / 10 ** c.p;
      const pos = c.p === 0 ? base + (v % 1) : base + clamp((below - .9) * 10);
      c.s.style.transform = `translateY(${-pos}em)`;
      const spin = Math.abs(vel) / 10 ** c.p;  // digit changes per second
      c.s.style.filter = spin > 6 ? `blur(${Math.min(6, spin / 8)}px)` : "";
      c.w.style.display = c.p < lead ? "" : "none"; if (c.cm) c.cm.style.display = c.p < lead ? "" : "none";
    });
  } };
}
// board-placed odometer driven by a value function f(t)
function Bodo(x, y, digits, f, o = {}) {
  const h = B("d-odoB", x, y, o.w || 1400, (o.size || 200) * 1.1, ""); const d = odo(h, digits, o);
  DOPA.push(t => d.set(f(t), rate(f, t))); h.odo = d; return h;
}

// ---------------------------------------------------------------- screenshots
function postHTML(p) {
  return `<div class="d-post${p.dark ? " dark" : ""}"><div class="hd"><i style="background:${p.av || "linear-gradient(135deg,#ff9a5c,#ff4d8a)"}"></i><div><b>${p.name}</b><span>${p.handle} · ${p.time || "2h"}</span></div></div>`
    + `<div class="tx">${p.text}</div>${p.media || ""}<div class="st">${(p.stats || [["Replies", "0"], ["Reposts", "0"], ["Likes", "0"]]).map(([k, v], i) => `<span>${k} <b class="s${i}">${v}</b></span>`).join("")}</div></div>`;
}
const ringSVG = (w, h, c = "#ff3b4f", sw = 8) => `<svg class="d-ring" viewBox="0 0 ${w} ${h}" style="position:absolute;left:-${w * .09}px;top:-${h * .22}px;width:${w}px;height:${h}px;overflow:visible"><path d="M${w * .1},${h * .55} C${w * .05},${h * .1} ${w * .92},${h * .02} ${w * .96},${h * .45} C${w},${h * .92} ${w * .18},${h * .98} ${w * .08},${h * .6}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" pathLength="1" stroke-dasharray="1.05" stroke-dashoffset="1.05"/></svg>`;
function ringDraw(root, k, t, a, d = .4) { const p = root.querySelectorAll(".d-ring path")[k]; if (p) p.setAttribute("stroke-dashoffset", 1.05 * (1 - P(t, a, a + d, E.inOutSine))); }
// write-on for handwritten notes (Segoe Print)
function writeOn(e, t, a, d = .7) { e.style.opacity = t > a ? 1 : 0; e.style.clipPath = `inset(-30px ${100 - clamp((t - a) / d) * 100}% -30px -30px)`; }

// ---------------------------------------------------------------- hard-cut burst: scenes [[t, html], ...], boxed captions, emoji
function dopaBurst(a, z, cuts, opt = {}) {
  const L = el(V2.root, "div", "d-burst"), fl = el(L, "div", "d-bfl"), cap = el(L, "div", "d-bcap"), emo = el(L, "div", "d-emo");
  capOff(a, z);
  const sc = cuts.map(([ct, html, bg]) => { const e = el(L, "div", "d-sc", html); e.style.background = bg || "#05060a"; e.ct = ct; return e; });
  L.insertBefore(fl, null); L.appendChild(cap); L.appendChild(emo);
  const GR = sentences(spokenWords(a, z)).flatMap(g => { const o = []; for (let i = 0; i < g.length; i += 3) o.push(g.slice(i, i + 3)); return o; });
  const E2 = opt.emoji || {}; let lg = -1, sp = [];
  DOPA.push(t => {
    const on = t >= a && t < z + .3; L.style.display = on ? "block" : "none"; if (!on) return;
    let k = 0; sc.forEach((e, i) => { if (t >= e.ct) k = i; });
    sc.forEach((e, i) => { e.style.display = i === k ? "block" : "none"; });
    const c = sc[k], d = t - c.ct; c.style.transform = `scale(${(1.24 - .24 * E.outCubic(clamp(d / .2))) * (1 + d * .03)}) rotate(${(hash(k, 4) - .5) * 5}deg)`;
    fl.style.opacity = k && d < .05 ? .85 : 0;
    const g = GR.findIndex(q => q.some(w => w.t <= t + .02) && (GR[GR.indexOf(q) + 1] ? GR[GR.indexOf(q) + 1][0].t > t + .02 : true));
    if (g !== lg) { lg = g; cap.innerHTML = ""; sp = g < 0 ? [] : GR[g].map(w => { const s = el(cap, "span", "", cleanW(w.w)); s.w = w; return s; }); }
    let cw = null; sp.forEach(s => { const cur = s.w.t <= t + .02 && (sp[sp.indexOf(s) + 1] ? sp[sp.indexOf(s) + 1].w.t > t + .02 : true); if (cur) cw = s.w;
      s.style.opacity = t >= s.w.t - .03 ? 1 : 0; s.style.background = cur ? (opt.box || "#ffd84a") : "transparent"; s.style.color = cur ? "#141000" : "#fff";
      s.style.webkitTextStroke = cur ? "0" : "14px #000"; s.style.transform = cur ? `scale(${1.2 - .12 * clamp((t - s.w.t) / .12)}) rotate(-3deg)` : ""; });
    const ek = cw && Object.keys(E2).find(h => norm(cleanW(cw.w)).startsWith(norm(h)));
    if (ek) { const u = clamp((t - cw.t) / .25); emo.textContent = E2[ek]; emo.style.opacity = 1; emo.style.transform = `scale(${outBack(u, 2)}) rotate(${(1 - u) * -30}deg)`; } else emo.style.opacity = 0;
    const w = clamp((t - z) / .3); L.style.transform = `translateX(${w * w * 1300}px)`; L.style.filter = w > 0 ? `blur(${w * 24}px)` : "";
  });
  return sc;
}

// ---------------------------------------------------------------- full-screen scenes between board stations
// build(L) -> up(local_t, t); enters with a whip from o.in (R/L/B/Z), leaves with a whip to the left at z
function dopaScene(a, z, build, o = {}) {
  const L = el(V2.root, "div", "d-scene"); if (o.bg) L.style.background = o.bg;
  const up = build(L), inD = o.inD == null ? .3 : o.inD, outD = o.outD == null ? .3 : o.outD;
  DOPA.push(t => {
    const on = t >= a && t < z + outD; L.style.display = on ? "block" : "none"; if (!on) return;
    const i = clamp((t - a) / inD), w = clamp((t - z) / outD), k = 1 - E.outCubic(i);
    let tr = { R: `translateX(${k * 1150}px)`, L: `translateX(${-k * 1150}px)`, B: `translateY(${k * 1950}px)`, Z: `scale(${1 + k * .6})` }[o.in || "R"];
    let f = k > .01 ? `blur(${k * 22}px)` : "";
    if (w > 0) { tr += ` translateX(${-w * w * 1300}px)`; f = `blur(${w * 24}px)`; }
    L.style.transform = tr; L.style.filter = f; L.style.opacity = o.in === "Z" ? clamp(i * 3) : 1;
    up(t - a, t);
  });
  return L;
}
// camera / cursor keys [t0, dur, ...values] glide with inOutExpo (same feel as the board camera)
function keysAt(keys, t, ease = inOutExpo) {
  let c = keys[0].slice(2);
  for (let i = 1; i < keys.length; i++) { const [a, d, ...v] = keys[i]; if (t < a) break; const u = ease(clamp((t - a) / Math.max(d, 1e-3))); c = c.map((x, j) => mix(x, v[j], u)); if (u < 1) break; }
  return c;
}
const offs = (e, top) => { let x = 0, y = 0; while (e && e !== top) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x, y]; };
const ctr = (e, top) => { const [x, y] = offs(e, top); return [x + e.offsetWidth / 2, y + e.offsetHeight / 2]; };

// screen recording (Screen Studio look): wallpaper, an app window, cursor, click ripples, auto-zoom camera.
// o = {title, top, h, winW, winH, url, dark, wall}; returns S with S.body (fill it), S.up(t, cam, cur, clicks)
function screenRec(L, o = {}) {
  L.style.background = o.wall || "linear-gradient(160deg,#3b1f8f 0%,#1b4e9b 55%,#0b2a4a 100%)";
  if (o.title) el(L, "div", "d-srt", o.title);
  const vh = o.h || 1120, vp = el(L, "div", "d-vp"); vp.style.top = (o.top || 330) + "px"; vp.style.height = vh + "px";
  const world = el(vp, "div", "d-world"); world.style.height = vh + "px";
  const ww = o.winW || 980, wh = o.winH || 900;
  const win = el(world, "div", "d-win" + (o.dark ? " dark" : "")); Object.assign(win.style, { left: (1080 - ww) / 2 + "px", top: (vh - wh) / 2 + "px", width: ww + "px", height: wh + "px" });
  win.innerHTML = `<div class="bar"><i></i><i></i><i></i><div class="url">${o.url || ""}</div></div><div class="body"></div>`;
  const cur = el(world, "div", "d-cur", `<svg viewBox="0 0 22 30" width="46" height="62"><path d="M2 2 L2 24 L8 18.5 L12 28 L16 26.3 L12.2 17 L20 17 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>`);
  const rip = el(world, "div", "d-rip");
  const S = { L, vp, world, win, body: win.querySelector(".body"), vh, cur, rip, P: e => ctr(e, world) };
  S.up = (t, cam, curK, clicks = []) => {
    const [x, y, z, r = 0] = keysAt(cam, t); world.style.transform = `translate(540px,${vh / 2}px) rotate(${r}deg) scale(${z}) translate(${-x}px,${-y}px)`;
    if (curK) { const [cx, cy] = keysAt(curK, t, E.inOutSine); cur.style.transform = `translate(${cx}px,${cy}px)`; }
    let ro = 0; clicks.forEach(([ct, cx, cy]) => { const u = (t - ct) / .45; if (u > 0 && u < 1) { ro = 1 - u; rip.style.left = cx + "px"; rip.style.top = cy + "px"; rip.style.transform = `scale(${.3 + u})`; } });
    rip.style.opacity = ro;
  };
  return S;
}
// light AI chat inside a screenRec body: user prompt typed into the box, sent, answer streams (code lines)
function chatUI(body, prompt, answer, code) {
  body.classList.add("d-chat");
  body.innerHTML = `<div class="msgs"><div class="me"></div><div class="ai"><i></i><div><p></p><pre></pre></div></div></div><div class="inp"><span class="tx"></span><b>↑</b></div>`;
  const q = s => body.querySelector(s), me = q(".me"), ai = q(".ai"), p = q(".ai p"), pre = q("pre"), tx = q(".inp .tx");
  return { send: q(".inp b"), inp: q(".inp"), pre, up(t, tType, tSend, cps = 38) {
    const n = Math.floor(clamp((t - tType) * cps, 0, prompt.length));
    const sent = t >= tSend; tx.textContent = sent ? "" : prompt.slice(0, n) + (Math.floor(t * 3) % 2 ? "|" : "");
    me.textContent = prompt; me.style.display = sent ? "block" : "none"; me.style.transform = `translateY(${(1 - E.outCubic(clamp((t - tSend) / .25))) * 60}px)`;
    const a0 = tSend + .35; ai.style.display = t > a0 ? "flex" : "none";
    p.textContent = answer.slice(0, Math.floor(clamp((t - a0) * 60, 0, answer.length)));
    const c0 = a0 + answer.length / 60 + .1, lines = code.split("\n"), shown = Math.floor(clamp((t - c0) * 7, 0, lines.length));
    pre.innerHTML = lines.slice(0, shown).map(l => l.replace(/(const|function|return|let|await|new)/g, "<em>$1</em>").replace(/(".*?")/g, "<u>$1</u>")).join("\n") + (t > c0 && shown < lines.length ? "▌" : "");
  } };
}

// red (before) vs green (after) split: two halves, labels, odometers; returns {top, bot}
function splitScene(L, a, b) {
  const half = (y, cls, d) => { const h = el(L, "div", "d-half " + cls); h.style.top = y + "px";
    el(h, "div", "chip", d.chip); el(h, "div", "lab", d.label || ""); h.num = el(h, "div", "num"); h.feed = el(h, "div", "feed"); return h; };
  const top = half(0, "red", a), bot = half(980, "green", b);
  el(L, "div", "d-seam"); const vs = el(L, "div", "d-vs", "VS");
  top.odo = odo(top.num, a.digits || 5, { size: 170, color: "#fff", prefix: a.prefix, suffix: a.suffix });
  bot.odo = odo(bot.num, b.digits || 5, { size: 170, color: "#fff", prefix: b.prefix, suffix: b.suffix });
  return { top, bot, vs };
}

// documentary look over a scene: grain, vignette, letterbox, warm grade; returns up(t)
function docLook(L) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"), im = g.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = hash(i, 11) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 36; } g.putImageData(im, 0, 0);
  const gr = el(L, "div", "d-grain"); gr.style.backgroundImage = `url(${cv.toDataURL()})`;
  el(L, "div", "d-vig"); el(L, "div", "d-lb top"); el(L, "div", "d-lb bot");
  return t => { const f = Math.floor(t * 24); gr.style.transform = `translate(${hash(f, 1) * 40 - 20}px,${hash(f, 2) * 40 - 20}px)`; L.style.filter = (L.style.filter || "").replace(/ ?brightness\([^)]*\)/, "") + ` brightness(${1 + (hash(Math.floor(t * 12), 3) - .5) * .06})`; };
}

// CTA over the zoomed-out board: COMMENT "SAAS", the word typed into a comment box, DM card "FREE LESSON #1".
// w.dm (the CTA from 2026-09-25): DM ME "SAAS" - the word is typed into an Instagram message to Kuba Builds AI, the lesson comes back
function dopaCTA(a, w) {
  const dm = !!w.dm, C = el(V2.top, "div", "layer d-cta"); C.style.opacity = 0;
  const c1 = el(C, "div", "cta", `<div class="c1">${dm ? "DM ME" : "COMMENT"}</div>`); c1.style.top = dm ? "170px" : "200px";
  const c2 = el(C, "div", "cta", '<div class="c2">“SAAS”</div>'); c2.style.top = dm ? "290px" : "320px";
  const SEND = `<div class="snd">${ICON('<path d="M4 12l16-8-6 16-3-6z"/>', "#03140a")}</div>`;
  const c3 = el(C, "div", "cta", dm ? `<div class="dmbx"><div class="dmh"><div class="av3"></div><div><b>Kuba Builds AI</b><span>Instagram · Message</span></div></div><div class="cbox2"><div class="fld"></div>${SEND}</div></div>`
    : `<div class="cbox2"><div class="av3"></div><div class="fld"></div>${SEND}</div>`); c3.style.top = dm ? "600px" : "640px";
  const c5 = el(C, "div", "cta", `<div class="dm"><div class="dmi">${ICON('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>', "#fff")}</div><div class="dmt"><b>FREE LESSON #1</b><span>Build your own app with AI</span><u>kubabuilds.com</u></div><span class="free">FREE</span></div>`); c5.style.top = dm ? "925px" : "860px";
  const c4 = el(C, "div", "cta"); c4.style.top = dm ? "1225px" : "1170px"; c4.style.gap = "18px"; c4.style.alignItems = "center"; pxBlock(c4, 64); pxText(c4, "KUBA BUILDS AI", 6, "#fff");
  const fld = c3.querySelector(".fld"), fr = c5.querySelector(".free");
  DOPA.push(t => {
    C.style.opacity = P(t, a, a + .25, E.lin);
    c1.style.transform = `translateY(${(1 - clamp(spring(t - a, 1.8, .6))) * -80}px)`;
    c2.style.transform = `scale(${t > a ? Math.max(0, spring(t - a - .08, 1.8, .5)) : 0})`;
    c3.style.transform = `translateY(${(1 - clamp(spring(t - a - .2, 1.6, .6))) * 200}px)`; c3.style.opacity = P(t, a + .2, a + .35, E.lin);
    typeInto(fld, "SAAS", t, w.saas + .05, 10);
    if (dm && !fld.textContent) fld.innerHTML = '<i class="ph">Message…</i>';
    c5.style.transform = `translateX(${(1 - clamp(spring(t - w.send + .1, 1.6, .6))) * 1100}px) rotate(-2deg)`;
    fr.style.transform = `rotate(12deg) scale(${Math.max(0, spring(t - w.free + .06, 1.8, .5)) * (1 + .05 * Math.sin(t * 7))})`;
    c5.firstChild.style.boxShadow = t > w.lesson ? `0 20px 0 rgba(0,0,0,.35), 0 0 0 ${4 + 3 * Math.sin(t * 8)}px rgba(126,240,168,.8), 0 0 70px rgba(47,208,122,.45)` : "";
    c4.style.opacity = P(t, a + .5, a + .8, E.lin);
  });
}
// call after everything is built: captions and glitch slices on top of the scenes
function dopaDone() { V2.root.appendChild(V2.cap); V2.root.querySelectorAll(".d-gl, .d-conf").forEach(e => V2.root.appendChild(e)); }

// ---------------------------------------------------------------- positive energy (coach reels): confetti bursts + a rotating sunburst
function dopaConfetti(times, o = {}) {
  const L = el(V2.root, "div", "d-conf"), N = o.n || 70, COL = o.colors || ["#ffd84a", "#7ef0a8", "#5ee7ff", "#ff6b8b", "#b69cff", "#ffa23a"];
  const P2 = times.flatMap((a, b) => Array.from({ length: N }, (_, k) => { const e = el(L, "i", ""); const s = k + b * 997;
    e.style.background = COL[k % COL.length]; e.style.width = 14 + hash(s, 1) * 16 + "px"; e.style.height = 8 + hash(s, 2) * 10 + "px";
    return { e, a, x0: o.x || 540, y0: o.y || 1100, vx: (hash(s, 3) - .5) * 1900, vy: -900 - hash(s, 4) * 1400, sp: (hash(s, 5) - .5) * 1400 }; }));
  DOPA.push(t => P2.forEach(p => { const d = t - p.a; if (d < 0 || d > 2.4) { p.e.style.opacity = 0; return; }
    p.e.style.opacity = 1 - clamp((d - 1.6) / .8); p.e.style.transform = `translate(${p.x0 + p.vx * d * .8}px,${p.y0 + p.vy * d + 1500 * d * d}px) rotate(${p.sp * d}deg)`; }));
}
function Bsun(x, y, r = 900, col = "rgba(255,216,74,.13)") {
  const e = B("d-sun", x, y, r * 2, r * 2, ""); e.style.background = `repeating-conic-gradient(${col} 0 9deg, transparent 9deg 18deg)`;
  e.style.webkitMaskImage = e.style.maskImage = "radial-gradient(closest-side, #000 20%, transparent 100%)";
  DOPA.push(t => { e.style.transform = `rotate(${t * 12}deg)`; }); return e;
}

// ---------------------------------------------------------------- glitch interrupts on the whole frame
function dopaGlitch(times, d = .24) {
  const bands = el(V2.root, "div", "d-bands d-gl"), BN = Array.from({ length: 7 }, () => el(bands, "i", ""));
  DOPA.push(t => {
    let g = 0; times.forEach(a => { if (t >= a && t < a + d) g = Math.max(g, 1 - (t - a) / d); });
    const f = Math.floor(t * 30);
    // the whole frame: board or whatever scene is showing
    V2.root.style.filter = g ? `drop-shadow(${10 * g}px 0 rgba(255,45,85,.95)) drop-shadow(${-10 * g}px 0 rgba(0,229,255,.95))` : "";
    V2.root.style.transform = g ? `translate(${(hash(f, 1) - .5) * 70 * g}px,${(hash(f, 2) - .5) * 30 * g}px)` : "";
    BN.forEach((b, k) => { b.style.display = g ? "block" : "none"; b.style.top = hash(f, k) * 1850 + "px"; b.style.height = 20 + hash(f, k + 9) * 160 + "px"; b.style.transform = `translateX(${(hash(f, k + 3) - .5) * 240}px)`; });
  });
}
