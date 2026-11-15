"use strict";
// Long-form 16:9 (1920x1080) on top of motion/lib/engine.js — the channel style (glitch / kinetic hook, viral boards,
// screen recordings with auto-zoom, light chat, red vs green split, casino odometers) stretched over a ~8 min lesson.
//   scn(a, z, build, o)  full-screen scene, whips in / out; build(S) -> up(local_t, t)
//   board(S, w, h, o)    a big board under a camera (keys like dopa: [t, dur, x, y, zoom, rot])
//   kine(a, z, o)        kinetic type on black: the words spoken in [a, z) slam / type in
//   rec(S, o)            screen-recording look: wallpaper, windows, cursor, clicks, auto-zoom camera
//   term / vscode        terminal (PowerShell, Claude Code) and VS Code mock-ups
//   captions             bottom, max 3 words, keywords coloured; capOff(a, z) hides them
// Everything is a pure function of t (render.py draws frames out of order).  Preview player: longStart().
const LG = { root: null, cap: null, scenes: [], upd: [], capOff: [], HI: {}, caps: [] };
const inOutExpo = u => u <= 0 ? 0 : u >= 1 ? 1 : u < .5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2;
const outBack = (u, s = 1.6) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
const rate = (f, t) => (f(t + .02) - f(t - .02)) / .04;
const cleanW = w => w.replace(/[.,:;!?"“”…]+/g, "");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const K = LS, KE = LE;  // line start / end by key
const hiOf = (c, hi) => { const k = Object.keys(hi).find(h => norm(c).startsWith(norm(h))); return k ? hi[k] : null; };
function spokenWords(a, z) { const o = []; T.lines.forEach(L => L.words.forEach(w => { if (w.t >= a - .01 && w.t < z && norm(cleanW(w.w))) o.push(w); })); return o; }
function sentences(ws) { const o = []; let g = []; ws.forEach(w => { g.push(w); if (/[.?!:]$/.test(w.w)) { o.push(g); g = []; } }); if (g.length) o.push(g); return o; }
function capOff(a, z) { LG.capOff.push([a, z]); }
function keysAt(keys, t, ease = inOutExpo) {
  let c = keys[0].slice(2);
  for (let i = 1; i < keys.length; i++) { const [a, d, ...v] = keys[i]; if (t < a) break; const u = ease(clamp((t - a) / Math.max(d, 1e-3))); c = c.map((x, j) => mix(x, v[j], u)); if (u < 1) break; }
  return c;
}
// entrance from a direction: L R T B (slide), S (pop), Z (spin + pop), F (fade); returns progress 0..1
function enter(e, t, a, dir = "S", dist = 700, extra = "") {
  if (t < a) { e.style.opacity = 0; return 0; }
  const u = clamp((t - a) / .42), k = outBack(u, 1.5), o = 1 - k;
  const m = { L: `translate(${-dist * o}px,0)`, R: `translate(${dist * o}px,0)`, T: `translate(0,${-dist * o}px)`, B: `translate(0,${dist * o}px)`,
    S: `scale(${Math.max(0, k)})`, Z: `scale(${Math.max(0, k)}) rotate(${o * -140}deg)`, F: "" }[dir];
  e.style.opacity = dir === "F" ? clamp(u / .6) : clamp(u / .15); e.style.transform = m + " " + extra; return u;
}
const vis = (e, on) => { e.style.display = on ? "" : "none"; };

function longSetup(o = {}) {
  LG.root = el(document.getElementById("scenes"), "div", "layer");
  LG.HI = o.hi || {};
  LG.cap = el(LG.root, "div", "l-cap");
  buildCaptions();
}

// ---------------------------------------------------------------- scenes
function scn(a, z, build, o = {}) {
  const S = el(LG.root, "div", "l-scene" + (o.cls ? " " + o.cls : ""));
  if (o.bg) S.style.background = o.bg;
  const inD = o.in === "cut" ? 0 : (o.inD == null ? .32 : o.inD), outD = o.out === "cut" ? 0 : (o.outD == null ? .3 : o.outD);
  const up = build(S) || (() => {});
  if (inD && o.sfx !== false) sfx(o.whoosh || "WH_SOFT", a + .08, o.sfxGain == null ? -20 : o.sfxGain);
  LG.scenes.push({ a, z, S, up, o, inD, outD, on: false });
  return S;
}
function scenesUpdate(t) {
  for (const s of LG.scenes) {
    const on = t >= s.a && t < s.z + s.outD;
    if (on !== s.on) { s.S.style.display = on ? "block" : "none"; s.on = on; }
    if (!on) continue;
    const i = s.inD ? clamp((t - s.a) / s.inD) : 1, w = s.outD ? clamp((t - s.z) / s.outD) : 0, k = 1 - E.outCubic(i);
    let tr = "", f = "";
    if (k > .001) { tr = { R: `translateX(${k * 1500}px)`, L: `translateX(${-k * 1500}px)`, B: `translateY(${k * 1100}px)`, T: `translateY(${-k * 1100}px)`, Z: `scale(${1 + k * .5})`, F: "" }[s.o.in || "R"] || ""; f = s.o.in === "F" ? "" : `blur(${k * 22}px)`; }
    if (w > 0) { tr += ` translateX(${-w * w * 1600}px)`; f = `blur(${w * 24}px)`; }
    s.S.style.transform = tr; s.S.style.filter = f; s.S.style.opacity = s.o.in === "Z" ? clamp(i * 3) : s.o.in === "F" ? i : 1;
    s.up(t - s.a, t);
  }
}

// ---------------------------------------------------------------- board + camera
function board(S, w, h, o = {}) {
  const b = el(S, "div", "l-board" + (o.light ? " light" : "")); b.style.width = w + "px"; b.style.height = h + "px";
  const fl = el(S, "div", "l-flash");
  (o.zones || []).forEach(([x, y, r0, c]) => {
    const r = r0 * 1.7, zz = el(b, "div", "l-zone");
    Object.assign(zz.style, { left: x - r + "px", top: y - r + "px", width: 2 * r + "px", height: 2 * r + "px",
      background: `radial-gradient(closest-side, ${c}bb 0%, ${c}66 35%, ${c}22 65%, ${c}00 100%)` });
  });
  return { el: b, fl,
    B(cls, x, y, w, h, html) { const e = el(b, "div", "bp " + cls, html); Object.assign(e.style, { left: x - w / 2 + "px", top: y - h / 2 + "px", width: w + "px", height: h + "px" }); return e; },
    T(text, x, y, size, color = "#fff", w = 2600) { const e = el(b, "div", "bt", text); Object.assign(e.style, { left: x - w / 2 + "px", top: y - size * .55 + "px", width: w + "px", height: size * 1.1 + "px", fontSize: size + "px", lineHeight: size * 1.1 + "px", color }); return e; },
    cam(t, keys, shake = [], flashes = []) {
      const [x, y, z, r] = keysAt(keys, t); let sx = 0, sy = 0;
      for (const [a, amp] of shake) { const p = amp * pulse(t, a, .28) * clamp((t - a + .01) / .01); sx += p * (hash(Math.floor(t * 60), 1) - .5) * 2; sy += p * (hash(Math.floor(t * 60), 2) - .5) * 2; }
      const drift = 1 + (o.drift == null ? .01 : o.drift) * Math.sin(t * 1.3);  // drift 0 for screenshots: a constant micro-zoom shimmers small text
      b.style.transform = `translate(${960 + sx}px,${540 + sy}px) rotate(${r || 0}deg) scale(${z * drift}) translate(${-x}px,${-y}px)`;
      let f = 0; for (const a of flashes) f += .4 * pulse(t, a, .12) * clamp((t - a + .01) / .01); fl.style.opacity = Math.min(.7, f);
    } };
}

// ---------------------------------------------------------------- kinetic type: the words spoken in [a, z), in chunks of <= 4
function kine(a, z, o = {}) {
  capOff(a - .05, z + .05);
  const hi = o.hi || LG.HI;
  return scn(a, z, S => {
    S.classList.add("l-kine", "scan"); if (o.bg) S.style.background = o.bg;
    if (o.kick) el(S, "div", "l-kick", o.kick);
    const bx = el(S, "div", "l-kbox"), bands = el(S, "div", "l-bands"), BN = Array.from({ length: 6 }, () => el(bands, "i", ""));
    const groups = []; sentences(spokenWords(a, z)).forEach(s => { let g = []; s.forEach(w => { g.push(w); if (g.length >= (o.chunk || 4) || /,$/.test(w.w)) { groups.push(g); g = []; } }); if (g.length) groups.push(g); });
    const all = [];
    groups.forEach((g, gi) => g.forEach((w, k) => {
      const c = cleanW(w.w), col = hiOf(c, o.hi || hi), mp = o.map && o.map[norm(c)], txt = mp != null ? mp : c.toUpperCase();
      if (!txt) return;
      const e = el(bx, "div", "l-kw"); e.w = w; e.g = gi; e.txt = txt; e.col = col || "#fff";
      e.style.fontSize = Math.min(col ? 220 : 150, 1650 / (txt.length * .64)) + "px"; e.style.color = e.col;
      e.dx = (hash(k + gi * 7, 3) - .5) * 40; e.rot = (hash(k + gi * 7, 4) - .5) * 8; e.typed = !!col && txt.length > 3 && hash(k + gi, 5) > .35;
      all.push(e);
    }));
    const gStart = groups.map(g => g[0].t);
    gStart.forEach((s, i) => { if (i) sfx("IMP_SOFT", s, -24); });
    return (lt, t) => {
      let cur = 0; gStart.forEach((s, i) => { if (t >= s - .05) cur = i; });
      all.forEach(e => {
        if (e.g !== cur) { e.style.display = "none"; return; }
        e.style.display = "inline-block"; const d = t - e.w.t + .03;
        if (d < 0) { e.style.opacity = 0; e.textContent = e.txt; return; }
        e.style.opacity = 1;
        if (e.typed) { const n = Math.min(e.txt.length, Math.floor(d * 28) + 1); e.textContent = e.txt.slice(0, n) + (n < e.txt.length || Math.floor(t * 4) % 2 ? "▌" : ""); } else e.textContent = e.txt;
        const u = clamp(d / .14), s = e.typed ? 1 : 1.9 - .9 * outBack(u, 1.8), sx = 5 + 22 * (1 - u);
        const j = d < .12 ? (hash(Math.floor(t * 60), 7) - .5) * 40 : 0;
        e.style.transform = `translateX(${e.dx + j}px) rotate(${e.rot}deg) scale(${s})`;
        e.style.textShadow = `${sx}px 0 rgba(255,45,85,.9), ${-sx}px 0 rgba(0,229,255,.9), 0 12px 0 rgba(0,0,0,.6)`;
      });
      const gl = Math.max(0, ...gStart.map((s, i) => i && t >= s - .05 && t < s + .12 ? 1 - (t - s + .05) / .17 : 0));
      BN.forEach((b, k) => { const f = Math.floor(t * 30); b.style.display = gl > 0 ? "block" : "none"; b.style.top = hash(f, k) * 1000 + "px"; b.style.height = 20 + hash(f, k + 9) * 90 + "px"; b.style.transform = `translateX(${(hash(f, k + 3) - .5) * 200}px)`; });
      bx.style.transform = gl ? `translateX(${(hash(Math.floor(t * 60), 2) - .5) * 60 * gl}px)` : "";
    };
  }, { in: o.in || "cut", out: o.out, sfx: o.in && o.in !== "cut", cls: o.cls });
}

// ---------------------------------------------------------------- captions (bottom, <= 3 words)
function buildCaptions() {
  T.lines.forEach(L => {
    let cur = null;
    L.words.forEach(w => {
      const c = cleanW(w.w); if (!norm(c)) return;
      const prev = cur && cur.words[cur.words.length - 1];
      if (!cur || cur.words.length >= 3 || cur.len + c.length > 18 || /[.,:;!?…]$/.test(prev.w)) { cur = { words: [], len: 0 }; LG.caps.push(cur); }
      cur.words.push({ ...w, c }); cur.len += c.length + 1;
    });
  });
  LG.caps.forEach((c, k) => {
    const nx = LG.caps[k + 1], end = c.words[c.words.length - 1].e;
    c.a = c.words[0].t - .03; c.z = nx ? Math.min(nx.words[0].t - .03, end + .45) : end + .8;
    c.el = el(LG.cap, "div", "w"); c.rot = (hash(k, 9) - .5) * 3;
    c.words.forEach(w => { const s = el(c.el, "span", "", esc(w.c)); const col = hiOf(w.c, LG.HI); if (col) s.style.color = col; });
    c.on = false;
  });
}
function captionsUpdate(t) {
  const off = LG.capOff.some(([a, z]) => t >= a && t < z);
  LG.caps.forEach(c => {
    const on = !off && t >= c.a && t < c.z;
    if (on !== c.on) { c.el.style.opacity = on ? 1 : 0; c.on = on; }
    if (on) { const u = clamp((t - c.a) / .12); c.el.style.transform = `scale(${(1.22 - .22 * outBack(u, 2.2)).toFixed(3)}) rotate(${c.rot.toFixed(2)}deg)`; }
  });
}

// ---------------------------------------------------------------- casino odometer
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
      const spin = Math.abs(vel) / 10 ** c.p;
      c.s.style.filter = spin > 6 ? `blur(${Math.min(6, spin / 8)}px)` : "";
      c.w.style.display = c.p < lead ? "" : "none"; if (c.cm) c.cm.style.display = c.p < lead ? "" : "none";
    });
  } };
}
// odometer driven by f(t) (set every frame while its scene is on)
function odoF(parent, digits, f, o = {}) { const d = odo(parent, digits, o); d.up = t => d.set(f(t), rate(f, t)); return d; }

// ---------------------------------------------------------------- screen recording
const CURSOR_SVG = `<svg viewBox="0 0 22 30" width="40" height="54"><path d="M2 2 L2 24 L8 18.5 L12 28 L16 26.3 L12.2 17 L20 17 Z" fill="#fff" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
function rec(S, o = {}) {
  S.style.background = o.wall || "linear-gradient(135deg,#3b1f8f 0%,#1b4e9b 55%,#0b2a4a 100%)";
  const world = el(S, "div", "l-world");
  const R = { S, world };
  R.win = (x, y, w, h, wo = {}) => {
    const e = el(world, "div", "l-win" + (wo.dark ? " dark" : ""));
    Object.assign(e.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
    e.innerHTML = `<div class="bar"><i></i><i></i><i></i>${wo.url != null ? `<div class="url">${wo.url}</div>` : `<div class="ttl">${wo.title || ""}</div>`}</div><div class="body"></div>`;
    e.body = e.querySelector(".body"); e.url = e.querySelector(".url");
    return e;
  };
  if (o.title) R.title = el(S, "div", "l-rtitle", o.title);
  R.cur = el(world, "div", "l-cur", CURSOR_SVG); R.rip = el(world, "div", "l-rip");
  // cam keys [t, dur, x, y, zoom, rot] (world point to the centre), cursor keys [t, dur, x, y], clicks [t, x, y]
  R.up = (t, cam, curK, clicks = []) => {
    const [x, y, z, r = 0] = keysAt(cam, t);
    world.style.transform = `translate(960px,540px) rotate(${r}deg) scale(${z}) translate(${-x}px,${-y}px)`;
    if (curK) { const [cx, cy] = keysAt(curK, t, E.inOutSine); R.cur.style.display = ""; R.cur.style.transform = `translate(${cx}px,${cy}px)`; } else R.cur.style.display = "none";
    let ro = 0; clicks.forEach(([ct, cx, cy]) => { const u = (t - ct) / .45; if (u > 0 && u < 1) { ro = 1 - u; R.rip.style.left = cx + "px"; R.rip.style.top = cy + "px"; R.rip.style.transform = `scale(${.3 + u})`; } });
    R.rip.style.opacity = ro;
  };
  return R;
}
const clickSfx = clicks => clicks.forEach(([ct]) => sfx("CLICK", ct, -16));

// terminal: items [t0, text/html, kind, cps, t1]; kinds: cmd (prompt + typed), type (typed, no prompt), out (html line),
// ask (Claude Code input box, typed), paste (input box, all at once).  An item disappears after t1 if given.
function term(parent, o = {}) {
  const e = el(parent, "div", "l-term"); if (o.font) e.style.fontSize = o.font + "px"; if (o.bg) e.style.background = o.bg;
  const ps = o.ps == null ? '<span class="ps">PS C:\\Users\\you&gt;</span> ' : o.ps;
  let last = "";
  return { e, up(t, items) {
    let h = "";
    items.forEach((it, i) => {
      const [t0, txt, kind = "out", cps = 20, t1] = it;
      if (t < t0 || (t1 != null && t >= t1)) return;
      const nxt = items.slice(i + 1).find(x => x[0] <= t);
      const blink = Math.floor(t * 2.5) % 2 ? "▌" : " ";
      if (kind === "cmd" || kind === "type") {
        const n = Math.floor(clamp((t - t0 - .25) * cps, 0, txt.length));
        h += (kind === "cmd" ? ps : "") + esc(txt.slice(0, n)) + (!nxt ? (n < txt.length ? "▌" : blink) : "") + "\n";
      } else if (kind === "ask" || kind === "paste") {
        const n = kind === "paste" ? (t >= t0 + .15 ? txt.length : 0) : Math.floor(clamp((t - t0 - .2) * cps, 0, txt.length));
        h += `<span class="inp"><span class="dim">&gt;</span> ${esc(txt.slice(0, n))}${n < txt.length || !nxt ? "▌" : ""}</span>`;
      } else h += txt + "\n";
    });
    if (h !== last) { e.innerHTML = h; last = h; }
    e.scrollTop = e.scrollHeight;  // also after the scene was hidden (scrollHeight was 0 then)
  } };
}
const CC_WELCOME = cwd => `<span class="box"><span class="or">✻</span> Welcome to <b>Claude Code</b>!\n\n  <span class="dim">/help for help, /status for your current setup</span>\n\n  <span class="dim">cwd: ${cwd}</span></span>`;
const CC_TOOL = (name, arg) => `<i class="dot gn"></i><b>${name}</b>(<span class="dim">${esc(arg)}</span>)`;
const CC_SAY = s => `<i class="dot or"></i>${s}`;
const CC_ASK = (q, opts, sel = 0) => `<span class="box gray">${q}\n\n${opts.map((x, i) => i === sel ? `<span class="sel">❯ ${i + 1}. ${x}</span>` : `  ${i + 1}. ${x}`).join("\n")}</span>`;

// VS Code window content
function vscode(parent, o = {}) {
  const e = el(parent, "div", "l-vsc");
  e.innerHTML = `<div class="menu">${["File", "Edit", "Selection", "View", "Go", "Run", "Terminal", "Help"].map(m => `<b data-m="${m}">${m}</b>`).join("")}</div>
    <div class="side"><h5>EXPLORER</h5><div class="files"></div></div>
    <div class="main"><div class="ed"></div><div class="panel"><div class="tabs"><span>PROBLEMS</span><span>OUTPUT</span><b>TERMINAL</b></div></div></div>`;
  const q = s => e.querySelector(s);
  const V = { e, menu: m => q(`[data-m="${m}"]`), files: q(".files"), ed: q(".ed"), panel: q(".panel"), main: q(".main") };
  V.term = term(V.panel, o);
  V.dd = (menuName, x, items) => { const d = el(e, "div", "dd", items.map(s => `<div>${s}</div>`).join("")); d.style.left = x + "px"; d.style.display = "none"; d.items = [...d.children]; return d; };
  return V;
}

// ---------------------------------------------------------------- red vs green split (left / right)
function splitLR(S, a, b) {
  const half = (cls, d) => { const h = el(S, "div", "l-half " + cls); el(h, "div", "chip", d.chip); h.body = el(h, "div", ""); Object.assign(h.body.style, { position: "absolute", left: "50px", right: "50px", top: "140px", bottom: "150px" }); return h; };
  const L = half("red", a), R = half("green", b); el(S, "div", "l-seam"); const vs = el(S, "div", "l-vs", "VS");
  return { L, R, vs };
}

// ---------------------------------------------------------------- positive energy: confetti, sunburst; glitch on the whole frame
function confetti(times, o = {}) {
  const L = el(LG.root, "div", "l-conf"), N = o.n || 90, COL = o.colors || ["#ffd84a", "#7ef0a8", "#5ee7ff", "#ff6b8b", "#b69cff", "#ffa23a"];
  const P2 = times.flatMap((a, b) => Array.from({ length: N }, (_, k) => { const e = el(L, "i", ""); const s = k + b * 997;
    e.style.background = COL[k % COL.length]; e.style.width = 14 + hash(s, 1) * 16 + "px"; e.style.height = 8 + hash(s, 2) * 10 + "px";
    return { e, a, x0: (o.x || 960) + (hash(s, 6) - .5) * 300, y0: o.y || 700, vx: (hash(s, 3) - .5) * 2600, vy: -700 - hash(s, 4) * 1100, sp: (hash(s, 5) - .5) * 1400 }; }));
  times.forEach(a => sfx("POP", a, -14));
  LG.upd.push(t => P2.forEach(p => { const d = t - p.a; if (d < 0 || d > 2.4) { if (p.e.style.opacity !== "0") p.e.style.opacity = 0; return; }
    p.e.style.opacity = 1 - clamp((d - 1.6) / .8); p.e.style.transform = `translate(${p.x0 + p.vx * d * .7}px,${p.y0 + p.vy * d + 1300 * d * d}px) rotate(${p.sp * d}deg)`; }));
}
function sun(parent, x, y, r = 900, col = "rgba(255,216,74,.13)") {
  const e = el(parent, "div", "l-sun"); Object.assign(e.style, { left: x - r + "px", top: y - r + "px", width: 2 * r + "px", height: 2 * r + "px",
    background: `repeating-conic-gradient(${col} 0 9deg, transparent 9deg 18deg)` });
  e.style.webkitMaskImage = e.style.maskImage = "radial-gradient(closest-side, #000 20%, transparent 100%)";
  e.spin = t => { e.style.transform = `rotate(${t * 12}deg)`; }; return e;
}
function glitch(times, d = .24) {
  const bands = el(LG.root, "div", "l-bands l-gl"), BN = Array.from({ length: 7 }, () => el(bands, "i", ""));
  times.forEach(a => sfx("WH_DATA", a, -18));
  LG.upd.push(t => {
    let g = 0; times.forEach(a => { if (t >= a && t < a + d) g = Math.max(g, 1 - (t - a) / d); });
    const f = Math.floor(t * 30);
    LG.root.style.filter = g ? `drop-shadow(${10 * g}px 0 rgba(255,45,85,.95)) drop-shadow(${-10 * g}px 0 rgba(0,229,255,.95))` : "";
    LG.root.style.transform = g ? `translate(${(hash(f, 1) - .5) * 80 * g}px,${(hash(f, 2) - .5) * 30 * g}px)` : "";
    BN.forEach((b, k) => { b.style.display = g ? "block" : "none"; b.style.top = hash(f, k) * 1040 + "px"; b.style.height = 16 + hash(f, k + 9) * 100 + "px"; b.style.transform = `translateX(${(hash(f, k + 3) - .5) * 300}px)`; });
  });
}
// hand-drawn marker ring around (x, y, w, h) inside parent (board or scene); returns up(t, a) that draws it from a
function ring(parent, x, y, w, h, col = "#ff3b4f", sw = 9) {
  const W2 = w * 1.18, H2 = h * 1.5, e = el(parent, "div", "");
  Object.assign(e.style, { position: "absolute", left: x - W2 / 2 + "px", top: y - H2 / 2 + "px", width: W2 + "px", height: H2 + "px", pointerEvents: "none", zIndex: 6 });
  e.innerHTML = `<svg viewBox="0 0 ${W2} ${H2}" width="${W2}" height="${H2}" style="overflow:visible"><path d="M${W2 * .12},${H2 * .58} C${W2 * .04},${H2 * .08} ${W2 * .93},${H2 * .01} ${W2 * .97},${H2 * .46} C${W2 * 1.01},${H2 * .93} ${W2 * .17},${H2 * .99} ${W2 * .07},${H2 * .62}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" pathLength="1" stroke-dasharray="1.05" stroke-dashoffset="1.05" style="filter:drop-shadow(0 3px 0 rgba(0,0,0,.35))"/></svg>`;
  const p = e.querySelector("path");
  return (t, a, d = .45) => p.setAttribute("stroke-dashoffset", 1.05 * (1 - P(t, a, a + d, E.inOutSine)));
}
// an image placed at its native size (or scale s) with its centre at (x, y); img coords -> parent coords with .at(ix, iy)
function pic(parent, src, x, y, iw, ih, s = 1, cls = "l-pic") {
  const e = el(parent, "div", cls, `<img src="${src}" style="display:block;width:100%;height:100%">`);
  const w = iw * s, h = ih * s; Object.assign(e.style, { position: "absolute", left: x - w / 2 + "px", top: y - h / 2 + "px", width: w + "px", height: h + "px" });
  e.at = (ix, iy) => [x - w / 2 + ix * s, y - h / 2 + iy * s]; e.s = s; return e;
}
// type into an element: text appears at cps from t0 (cursor while typing)
function typeInto(e, text, t, t0, cps = 24, caret = true) {
  const n = Math.floor(clamp((t - t0) * cps, 0, text.length)); const s = text.slice(0, n) + (caret && t >= t0 && n < text.length ? "|" : "");
  if (e.textContent !== s) e.textContent = s;
}

// ---------------------------------------------------------------- boot + preview player
function longDone() { LG.root.appendChild(LG.cap); LG.root.querySelectorAll(".l-conf, .l-gl").forEach(e => LG.root.appendChild(e)); }
function longStart(update, audio) {
  longDone();
  const base = window.render;
  window.render = t => { base(t); scenesUpdate(t); captionsUpdate(t); LG.upd.forEach(f => f(t)); if (update) update(t); return true; };
  (async () => {
    await document.fonts.ready;
    window.render(0); window.READY = true;
  })();
  if (new URLSearchParams(location.search).has("render")) return;
  previewPlayer(audio, { w: 1920, h: 1080, chapters: T.chapters });
}
