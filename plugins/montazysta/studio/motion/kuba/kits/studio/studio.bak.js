"use strict";
// YouTube Gaming Studio — kit film for the Kuba Builds AI Marketplace (1920x1080, ~1:49).
// SaaS product-film look: navy + violet aurora, glass panels, the app mock-up with real Minecraft footage (clips/),
// smooth camera, words revealed with the narrator.  Everything is a pure function of t (render.py draws out of order).
const ST = document.getElementById("stage"), ROOT = document.getElementById("scenes"), BG = document.getElementById("bg");
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
// appear: fade + rise + un-blur from a (0..1 returned)
function appear(e, t, a, d = .55, dy = 26, extra = "") {
  const u = P(t, a, a + d, oc); e.style.opacity = clamp((t - a) / (d * .5));
  e.style.transform = `translateY(${(1 - u) * dy}px) ${extra}`; e.style.filter = u < .99 ? `blur(${(1 - u) * 12}px)` : ""; return u;
}
function vanish(e, t, a, d = .4) { const u = P(t, a, a + d, E.inCubic); if (u > 0) { e.style.opacity = Math.min(+e.style.opacity || 1, 1 - u); e.style.filter = `blur(${u * 12}px)`; } return u; }
function popIn(e, t, a, base = "") { const s = spring(t - a, 1.7, .6); e.style.opacity = clamp((t - a) / .12); e.style.transform = `${base} scale(${t < a ? 0 : Math.max(0, s)})`; return s; }

// ---------------------------------------------------------------- icons
const SV = (d, fill) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'}>${d}</svg>`;
const IC = {
  rec: SV('<circle cx="12" cy="12" r="7"/>', 1), cut: SV('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>'),
  spark: SV('<path d="M12 2c.6 4.8 2.7 7.4 8 8-5.3.6-7.4 3.2-8 8-.6-4.8-2.7-7.4-8-8 5.3-.6 7.4-3.2 8-8z"/>', 1),
  cal: SV('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'), short: SV('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>'),
  globe: SV('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'), mic: SV('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  pad: SV('<path d="M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6L14 15h-4l-1 .6A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4z"/><path d="M7 11v3M5.5 12.5h3M16 12h.01M18 13.5h.01"/>'),
  lock: SV('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
  moon: SV('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', 1), bulb: SV('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  mega: SV('<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8"/>'), play: SV('<path d="M8 5.5v13l11-6.5z"/>', 1),
  app: SV('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>'), users: SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>'),
  upload: SV('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'), sound: SV('<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/>'), zoom: SV('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>'),
  cc: SV('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 10.3a2.2 2.2 0 1 0 0 3.4M16.5 10.3a2.2 2.2 0 1 0 0 3.4"/>'), fast: SV('<path d="M4 6l7 6-7 6zM13 6l7 6-7 6z"/>', 1),
  folder: SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'), laptop: SV('<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 19h20"/>'),
  claude: '<svg viewBox="0 0 24 24" fill="none" stroke="#e8845c" stroke-width="2.6" stroke-linecap="round"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg>',
};
const APPGLYPH = '<svg viewBox="0 0 100 100"><rect x="21" y="30" width="58" height="42" rx="11" fill="none" stroke="#fff" stroke-width="6.5"/><path d="M44 41v20l17-10z" fill="#fff"/><circle cx="77" cy="28" r="9" fill="#ff4d5e" stroke="#fff" stroke-width="3.5"/></svg>';
function appIcon(parent, size, x, y) { const e = el(parent, "div", "appic", APPGLYPH); place(e, x - size / 2, y - size / 2, size, size); e.sh = el(e, "div", "sheen"); return e; }

// ---------------------------------------------------------------- gameplay clips (clips/<name>/001.jpg.., 30 fps, 150 frames)
const CLIPIMG = {}, CLIPN = ["green", "farm", "zomb", "obsi", "tunnel"];
const clipImgs = n => CLIPIMG[n] || (CLIPIMG[n] = Array.from({ length: 150 }, (_, i) => { const im = new Image(); im.src = `clips/${n}/${String(i + 1).padStart(3, "0")}.jpg`; return im; }));
CLIPN.forEach(clipImgs);
function canvas(parent, w, h, cls = "") { const cv = el(parent, "canvas", cls); cv.width = w; cv.height = h; cv.last = ""; return cv; }
function drawClip(cv, name, lt, o = {}) {
  const f = clamp(Math.floor(lt * 30), 0, 149), z = o.zoom || 1, key = `${name}${f}|${z.toFixed(3)}|${o.cx}|${(o.dim || 0).toFixed(2)}`;
  if (cv.last === key) return; const im = clipImgs(name)[f]; if (!im.complete || !im.naturalWidth) return; cv.last = key;
  const c = cv.getContext("2d"), W = cv.width, H = cv.height; let sw = 1280, sh = 720;
  if (sw / sh > W / H) sw = sh * W / H; else sh = sw * H / W; sw /= z; sh /= z;
  const sx = clamp((o.cx ?? .5) * 1280 - sw / 2, 0, 1280 - sw), sy = clamp((o.cy ?? .5) * 720 - sh / 2, 0, 720 - sh);
  c.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
  if (o.dim) { c.fillStyle = `rgba(0,0,0,${o.dim})`; c.fillRect(0, 0, W, H); }
}
// which clip plays at t: seq = [[t0, name], ...]
function seqAt(seq, t) { let s = seq[0]; for (const q of seq) if (t >= q[0]) s = q; return { name: s[1], lt: Math.min(Math.max(0, t - s[0]), 4.96) }; }
const frameUrl = (n, f) => `clips/${n}/${String(f).padStart(3, "0")}.jpg`;

// ---------------------------------------------------------------- aurora background (mood keys: blue, violet, cyan, pink, navy)
const AUC = ["79,124,255", "139,108,255", "94,231,255", "255,122,217", "38,58,170"];
const AUP = [[-520, -260, 1500], [560, 160, 1500], [-300, 420, 1100], [700, -380, 1100], [0, 0, 2300]];
const AUE = AUC.map((c, k) => { const e = el(BG, "div", "au"); const s = AUP[k][2]; place(e, -s / 2, -s / 2, s, s); e.style.background = `radial-gradient(closest-side, rgba(${c},.75), rgba(${c},.28) 45%, rgba(${c},.06) 75%, transparent)`; return e; });
const MOODK = [[0, .3, .12, 0, 0, .45], [11.5, .22, .08, 0, 0, .4], [16.6, .22, .08, 0, 0, .4], [17.7, .04, .02, 0, 0, .12], [18.05, .85, .75, .25, .18, .55], [26, .55, .45, .12, .06, .5],
  [45.5, .5, .55, .1, .1, .5], [59.5, .45, .65, .1, .3, .45], [66, .6, .45, .3, .08, .5], [80.5, .45, .5, .1, .15, .45], [83.6, .55, .9, .1, .5, .45], [90, .6, .6, .2, .28, .5],
  [101, .85, .75, .3, .3, .55], [DUR, .85, .75, .3, .3, .55]];
function bgUp(t) {
  let i = 0; while (i < MOODK.length - 2 && MOODK[i + 1][0] <= t) i++;
  const a = MOODK[i], b = MOODK[i + 1], u = ios(clamp((t - a[0]) / Math.max(.4, Math.min(1.2, b[0] - a[0])))) ;
  AUE.forEach((e, k) => { e.style.opacity = mix(a[k + 1], b[k + 1], u).toFixed(3);
    e.style.transform = `translate(${960 + AUP[k][0] + Math.sin(t * .23 + k * 1.9) * 140}px,${540 + AUP[k][1] + Math.cos(t * .19 + k * 2.4) * 110}px)`; });
}

// ---------------------------------------------------------------- scenes: soft blur + scale cross-dissolves, a 3D camera each
const SCN = [];
function S(a, z, build, o = {}) {
  const e = el(ROOT, "div", "sc"), cam = el(e, "div", "cam");
  const s = { a, z, e, cam, inD: o.inD ?? .7, outD: o.outD ?? .6, on: false, pushOut: o.pushOut ?? 1 };
  s.up = build(cam, e, s) || (() => {});
  if (o.whoosh !== false && a > .5) sfx("WH_SOFT", a + .1, o.gain ?? -24);
  SCN.push(s); return s;
}
function scUp(t) {
  for (const s of SCN) {
    const on = t >= s.a && t < s.z + s.outD;
    if (on !== s.on) { s.e.style.display = on ? "block" : "none"; s.on = on; }
    if (!on) continue;
    const i = P(t, s.a, s.a + s.inD, oc), w = P(t, s.z, s.z + s.outD, E.inCubic);
    s.e.style.opacity = (i * (1 - w)).toFixed(3);
    const bl = (1 - i) * 22 + w * 22; s.e.style.filter = bl > .3 ? `blur(${bl.toFixed(1)}px)` : "";
    s.e.style.transform = `scale(${(1 + (1 - i) * .05 + w * .06 * s.pushOut).toFixed(4)})`;
    s.up(t - s.a, t);
  }
}
const camSet = (cam, [x, y, s, rx = 0, ry = 0, rz = 0]) => { cam.style.transform = `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate(${-x}px,${-y}px)`; };
// a centred line of words (in scene coordinates), each word revealed at its time
function words(parent, text, y, size, times, o = {}) {
  const e = el(parent, "div", "hl" + (o.cls ? " " + o.cls : "")); e.style.top = px(y - size * .6); e.style.fontSize = px(size); if (o.x) e.style.left = px(o.x);
  e.ws = text.split(" ").map((w, i) => { const s = el(e, "span", "wd" + (o.grad && o.grad.includes(i) ? " grad" : ""), w); s.at = times[Math.min(i, times.length - 1)]; return s; });
  e.up = t => e.ws.forEach(s => { const a = s.at - .08, u = P(t, a, a + .6, oc); s.style.opacity = clamp((t - a) / .28); s.style.transform = `translateY(${(1 - u) * 30}px)`; s.style.filter = u < .99 ? `blur(${(1 - u) * 14}px)` : ""; });
  return e;
}
const pill = (parent, html, x, y, cls = "pill") => { const e = el(parent, "div", cls, html); place(e, x, y); e.style.transform = "translateX(-50%)"; return e; };

// ---------------------------------------------------------------- 1. HOOK a: "You love making [clip] gaming videos."
S(0, 2.55, (cam, e) => {
  const row = el(e, "div", "hl"); Object.assign(row.style, { top: "450px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "100px", height: "180px" });
  const tw = wt("h1"), txt = ["You", "love", "making", null, "gaming", "videos."], parts = [];
  txt.forEach((w, i) => {
    if (w) { const s = el(row, "span", "wd" + (i >= 4 ? " grad" : ""), w); s.at = tw[i > 3 ? i - 1 : i]; parts.push(s); return; }
    const card = el(row, "div", ""); Object.assign(card.style, { height: "170px", width: "0", borderRadius: "26px", overflow: "hidden", margin: "0 .12em", boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.2)", flex: "none" });
    card.cv = canvas(card, 600, 340); card.cv.style.cssText = "width:300px;height:170px;display:block"; parts.push(card); row.card = card;
  });
  return (lt, t) => {
    parts.forEach(s => { if (s === row.card) return; const a = s.at - .08, u = P(t, a, a + .6, oc); s.style.opacity = clamp((t - a) / .28); s.style.transform = `translateY(${(1 - u) * 30}px)`; s.style.filter = u < .99 ? `blur(${(1 - u) * 14}px)` : ""; });
    const a = W("h1", "making") + .2, u = spring(t - a, 1.4, .75); row.card.style.width = px(Math.max(0, u * 300)); row.card.style.marginLeft = row.card.style.marginRight = px(Math.min(1, u) * 14);
    drawClip(row.card.cv, "green", Math.max(0, t - a), { zoom: 1.15 });
    row.style.transform = `scale(${1 + lt * .012})`;
  };
}, { inD: .5 });

// ---------------------------------------------------------------- 2. HOOK b: the weekend calendar filling up
S(2.55, 11.35, (cam, e) => {
  const h = words(e, "But one video eats your whole weekend.", 170, 78, wt("h2"), { grad: [5, 6] });
  const cal = el(cam, "div", "gl"); place(cal, -640, -250, 1280, 600);
  const H0 = 9, HN = 12, top = 92, rowH = 40, colX = [150, 700], colW = 520;
  ["Saturday", "Sunday"].forEach((d, i) => { const l = el(cal, "div", "lbl", d); place(l, colX[i] + 6, 36); l.style.fontSize = "18px"; l.style.color = "rgba(220,228,255,.75)"; });
  for (let k = 0; k <= HN; k += 2) { const l = el(cal, "div", "lbl", `${H0 + k}:00`); place(l, 40, top + k * rowH - 9); l.style.letterSpacing = ".04em";
    const ln = el(cal, "div", "ab"); place(ln, 130, top + k * rowH, 1110, 1); ln.style.background = "rgba(255,255,255,.07)"; }
  const hw = wt("h2");  // Recording 7, Cutting 8, Captions 9, Shorts 10, Uploading 11
  const B = [[0, 10, 13, "Recording", "3 h", "#ff5a6a", "#b8303f", hw[7]], [0, 14, 20, "Cutting", "6 h", "#4f7cff", "#2b47b8", hw[8]], [1, 10, 12, "Captions", "2 h", "#8b6cff", "#5a3fc4", hw[9]],
    [1, 12.5, 15, "Shorts", "2.5 h", "#e86bd0", "#9c3a8c", hw[10]], [1, 15.5, 17, "Uploading", "1.5 h", "#2fb8d6", "#1b7690", hw[11]]];
  const blocks = B.map(([c, a, z, n, d, c1, c2, at]) => { const b = el(cal, "div", "blk", `${n}<small>${d}</small>`); place(b, colX[c], top + (a - H0) * rowH + 3, colW, (z - a) * rowH - 6);
    b.style.background = `linear-gradient(135deg, ${c1}, ${c2})`; b.style.boxShadow = `0 18px 40px ${c1}55, inset 0 1px 0 rgba(255,255,255,.3)`; b.style.transformOrigin = "50% 0"; b.at = at; b.hh = (z - a) * rowH - 6; sfx("CLICK", at, -22); return b; });
  const tot = el(e, "div", "ab"); place(tot, 1480, 880); tot.innerHTML = `<div class="lbl" style="position:static;margin-bottom:6px">This weekend</div><div class="n" style="font:700 84px var(--font);letter-spacing:-.04em;color:#fff"></div>`;
  const n = tot.querySelector(".n"), hours = [0, 3, 9, 11, 13.5, 15];
  return (lt, t) => {
    h.up(t);
    const u = P(t, 2.7, 3.6, oc); camSet(cam, [0, mix(80, 40, ios(clamp(lt / 9))), mix(.86, .92, lt / 9), mix(28, 16, u), mix(-14, -8, lt / 9)]); cal.style.opacity = u;
    blocks.forEach(b => { const s = spring(t - b.at + .05, 1.6, .62); b.style.opacity = clamp((t - b.at + .05) / .12); b.style.transform = `scaleY(${t < b.at - .05 ? 0 : Math.max(0, s)})`; });
    let v = 0; blocks.forEach((b, i) => { v += (hours[i + 1] - hours[i]) * P(t, b.at, b.at + .6, ioc); });
    n.textContent = (Math.round(v * 2) / 2) + " h"; appear(tot, t, hw[7] - .2);
  };
});

// ---------------------------------------------------------------- 3. HOOK c: the channel that stopped
S(11.35, 17.2, (cam, e) => {
  const tw = wt("h3"), l1 = words(e, "Most channels don't die because they're bad.", 170, 70, tw.slice(0, 7)), l2 = words(e, "They die because the creator burns out.", 170, 70, tw.slice(7), { grad: [5, 6] });
  const card = el(cam, "div", "gl"); place(card, -600, -210, 1200, 560);
  card.innerHTML = `<div class="ab" style="left:40px;top:36px;width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#ffb35c,#ff5a6a)"></div>
    <div class="ab" style="left:132px;top:40px;font:700 34px var(--font);color:#fff;letter-spacing:-.02em">Your Gaming Channel</div>
    <div class="ab st" style="left:132px;top:84px;font:500 22px var(--font);color:var(--dim)">Uploads per week</div>
    <div class="ab bad" style="right:40px;top:48px;height:46px;padding:0 20px;border-radius:24px;background:rgba(255,77,94,.16);border:1px solid rgba(255,77,94,.5);font:700 20px/44px var(--font);color:#ff9aa5">Last upload · 4 months ago</div>`;
  const ch = el(card, "div", "ab chart"); place(ch, 60, 160, 1080, 330);
  const data = [8, 9, 7, 9, 8, 7, 6, 6, 4, 5, 3, 2, 2, 1, 0, 0, 0, 0];
  const bars = data.map((d, i) => { const b = el(ch, "i", ""); b.style.left = px(i * 60); b.hh = 30 + d * 32; b.at = 11.6 + i * .12; return b; });
  const base = el(ch, "div", "ab"); place(base, 0, 330, 1080, 2); base.style.background = "rgba(255,255,255,.15)";
  const bad = card.querySelector(".bad"), burn = W("h3", "burns");
  return (lt, t) => {
    l1.up(t); vanish(l1, t, tw[7] - .35, .35); if (t >= tw[7] - .05) l2.up(t); else l2.ws.forEach(s => { s.style.opacity = 0; });
    camSet(cam, [0, 20 - lt * 4, .9 + lt * .012, 12 - lt * 1.2, 8 - lt * 2.2]);
    bars.forEach(b => { const u = P(t, b.at, b.at + .5, oc); b.style.height = px(Math.max(6, b.hh * u)); b.style.opacity = clamp((t - b.at) / .15); });
    appear(bad, t, burn - .1, .5, 14);
    const g = P(t, burn, burn + 1, ioc); card.style.filter = g > 0 ? `grayscale(${g * .9}) brightness(${1 - g * .35})` : "";
  };
}, { outD: .8 });
sfx("RISER", 18.02, -17);

// ---------------------------------------------------------------- 4. MEET: icon + name, then the app flies in
const APPOSE = [0, -100, .76, 12, 0];  // hand-off pose to the app scene
function buildApp(cam) {
  const win = el(cam, "div", "win");
  win.innerHTML = `<div class="tb"><i></i><i></i><i></i><b>YouTube Gaming Studio</b></div>`;
  const side = el(win, "div", "side"), lg = el(side, "div", "lg"); appIcon(lg, 38, 19, 19).style.position = "relative"; lg.lastChild.style.left = lg.lastChild.style.top = "0"; el(lg, "span", "", "Gaming Studio");
  const NAV = [["Record", IC.rec], ["Editor", IC.cut], ["Shorts", IC.short], ["Dubbing", IC.globe], ["Publish", IC.cal], ["Library", IC.folder]];
  const nav = NAV.map(([n, i]) => el(side, "div", "nav", i + n));
  nav[0].querySelector("svg").style.color = "#ff4d5e";
  // record pane
  const rp = el(win, "div", "pane");
  const prev = el(rp, "div", "prev"); place(prev, 28, 26, 1000, 562); const pcv = canvas(prev, 1280, 720);
  const recb = el(prev, "div", "recb", "<i></i><span>REC</span>"), tmr = el(prev, "div", "tmr", "00:00:00");
  const pausO = el(prev, "div", "ab"); Object.assign(pausO.style, { inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,20,.45)", font: "800 64px var(--font)", color: "#ffd84a", letterSpacing: ".06em", opacity: 0 }); pausO.textContent = "❚❚ PAUSED";
  const onlyG = el(prev, "div", "pill", IC.lock + "Game window only"); Object.assign(onlyG.style, { left: "18px", bottom: "18px", top: "auto", height: "50px", fontSize: "20px", opacity: 0 });
  const rc = el(rp, "div", "ab"); place(rc, 1056, 26, 246, 562);
  const lab = el(rc, "div", "lbl", "Recording"); place(lab, 4, 4);
  const bRec = el(rc, "div", "btn rec", `<span class="t">● Start</span><kbd>F10</kbd>`); place(bRec, 0, 40, 246, 76);
  const bPau = el(rc, "div", "btn gho", `❚❚ Pause<kbd>F9</kbd>`); place(bPau, 0, 130, 246, 62);
  const lab2 = el(rc, "div", "lbl", "Mark a moment"); place(lab2, 4, 222);
  const MK = [["✦", "Good moment", "#7ee0ff"], ["☺", "Funny", "#ffd84a"], ["!", "Scary", "#ff6b7a"], ["↗", "Short", "#b69cff"]];
  const mks = MK.map(([g, n, c], i) => { const m = el(rc, "div", "mk", `<b style="background:${c}">${g}</b>${n}`); place(m, 0, 258 + i * 66, 246); m.c = c; return m; });
  const tl = el(rp, "div", "card"); place(tl, 28, 606, 1274, 206);
  const tll = el(tl, "div", "lbl", "Last 30 seconds"); place(tll, 20, 14);
  const wv = [0, 1].map(r => { const w = el(tl, "div", "ab wave"); place(w, 20, 50 + r * 76, 1234, 66); const c = r ? "#ff9a4a" : "#5b8cff"; w.bars = Array.from({ length: 154 }, (_, i) => { const b = el(w, "i", ""); b.style.left = px(i * 8); b.style.background = c; return b; }); return w; });
  const wl = ["Mic", "Game"].map((n, r) => { const l = el(tl, "div", "ab", `${r ? IC.pad : IC.mic}`); place(l, 1210, 60 + r * 76, 30, 30); l.style.color = r ? "#ff9a4a" : "#5b8cff"; return l; });
  const flags = el(tl, "div", "ab"); place(flags, 20, 44, 1234, 150);
  // editor pane
  const ep = el(win, "div", "pane"); ep.style.opacity = 0;
  const eprev = el(ep, "div", "prev"); place(eprev, 28, 24, 720, 405); const ecv = canvas(eprev, 1280, 720);
  const ecap = el(eprev, "div", "cap", ""); ecap.style.bottom = "34px";
  const ai = el(ep, "div", "card"); place(ai, 776, 24, 526, 405);
  const ail = el(ai, "div", "lbl", "AI assist"); place(ail, 22, 18);
  const TG = [["Speed up silence", IC.fast, "#5b8cff"], ["Captions from speech", IC.cc, "#8b6cff"], ["Sound effects", IC.sound, "#ff9a4a"], ["Auto zoom", IC.zoom, "#e86bd0"], ["Dub to English", IC.globe, "#3ddc97"]];
  const togs = TG.map(([n, i, c], k) => { const g = el(ai, "div", "tog", `<div class="ic" style="background:${c}26;color:${c}">${i}</div>${n}<div class="sw"><i></i></div>`); g.style.left = "18px"; g.style.right = "18px"; g.style.top = px(52 + k * 69); g.style.height = "60px"; g.c = c; g.sw = g.querySelector(".sw"); g.kn = g.querySelector(".sw i"); return g; });
  const et = el(ep, "div", "card"); place(et, 28, 450, 1274, 362);
  const TR = ["Effects", "Video", "Mic", "Game", "Captions", "Sounds"];
  const trk = TR.map((n, i) => { const r = el(et, "div", "trk"); place(r, 0, 30 + i * 54, 1274, 46); el(r, "div", "nm", n); const c = el(r, "div", "ab"); place(c, 130, 0, 1124, 46); c.style.overflow = "hidden"; r.c = c; return r; });
  const ph = el(et, "div", "ph"); place(ph, 130, 22, 2, 336);
  return { win, nav, rp, ep, prev, pcv, recb, tmr, pausO, onlyG, bRec, bPau, mks, wv, flags, eprev, ecv, ecap, togs, trk, ph, et };
}
S(17.95, 25.3, (cam, e, s) => {
  const ic = appIcon(cam, 210, 0, -120);
  const nm = words(e, "YouTube Gaming Studio", 640, 104, wt("m1").slice(1), { cls: "gradw" });
  const A = buildApp(cam); A.win.style.transformOrigin = "50% 50%";
  drawClip(A.pcv, "green", 0); A.recb.style.opacity = 0; A.bPau.style.opacity = .5;
  const m2 = wt("m2"), P3 = [[IC.rec, "Records your game", "#ff4d5e", m2[3]], [IC.spark, "Edits with AI", "#a98bff", m2[6]], [IC.cal, "Runs your channel", "#3ddc97", m2[11]]];
  const pills = P3.map(([i, n, c, at], k) => { const p = pill(e, `<span style="color:${c};display:flex">${i}</span>${n}`, 560 + k * 400, 930); p.at = at; sfx("CLICK", at, -24); return p; });
  sfx("IMP_BASS", 18.05, -13);
  const fly = m2[0] - .1;
  return (lt, t) => {
    const k = spring(t - 18.02, 1.1, .62), mv = P(t, fly, fly + 1.1, ioe);
    ic.style.opacity = clamp((t - 18.02) / .25) * (1 - mv); ic.style.transform = `translateY(${-mv * 260}px) scale(${Math.max(0, k) * (1 - mv * .6)})`;
    ic.style.filter = t - 18.02 < .35 ? `blur(${(1 - clamp((t - 18.02) / .35)) * 18}px)` : "";
    ic.sh.style.backgroundPosition = `${mix(130, -30, P(t, 18.5, 19.4, ios))}% 0`;
    nm.up(t); nm.style.opacity = 1 - mv; nm.style.transform = `translateY(${-mv * 120}px)`;
    const f = P(t, fly, fly + 1.4, ioe);
    A.win.style.opacity = clamp((t - fly) / .3);
    A.win.style.transform = `translateY(${mix(900, 0, f)}px) rotateX(${mix(38, 0, f)}deg)`;
    camSet(cam, [0, mix(0, APPOSE[1], f), mix(1, APPOSE[2], f), mix(0, APPOSE[3], f), Math.sin(lt * .5) * 2 * f]);
    drawClip(A.pcv, "green", Math.max(0, t - fly));
    pills.forEach(p => { const u = appear(p, t, p.at - .1, .5, 30, "translateX(-50%)"); });
  };
}, { inD: .15, outD: .45, pushOut: 0 });

// ---------------------------------------------------------------- 5. THE APP: record, pause, markers, then the editor
S(25.25, 59.3, (cam, e, s) => {
  const A = buildApp(cam);
  const c1 = wt("c1"), c2 = wt("c2"), c3 = wt("c3"), e1 = wt("e1"), e2 = wt("e2"), e3 = wt("e3");
  const tF10 = W("c1", "F10"), tRec = tF10 + .12, tP = W("c2", "F9"), tRes = c2[5] + .05, tMk = W("c3", "marks");
  const tStop = e1[2] - .25, tEd = e1[5];  // "stop," / "opens"
  const MF = [[W("c3", "Funny"), 1], [W("c3", "Scary"), 2], [W("c3", "Short"), 3]];
  const pausedFor = t => t < tP ? 0 : Math.min(t, tRes) - tP;
  const recT = t => t < tRec ? 0 : Math.min(t, tStop) - tRec - pausedFor(t);
  // keycaps (scene space, in front of everything)
  const key = (label, x, y) => { const k = el(e, "div", "ab"); place(k, x, y); const kk = el(k, "div", "key", `<div class="glow"></div><div class="base"></div><div class="top">${label}</div>`); k.top = kk.querySelector(".top"); k.glow = kk.querySelector(".glow"); return k; };
  const kF10 = key("F10", 1640, 800), kF9 = key("F9", 1640, 800), kMk = key("✦", 1640, 800);
  const keyUp = (k, t, a, press) => { const u = P(t, a, a + .45, oc), w = P(t, press + .7, press + 1.1, E.inCubic); k.style.opacity = clamp((t - a) / .2) * (1 - w);
    const pr = Math.exp(-Math.max(0, t - press) / .12) * (t >= press ? 1 : 0); k.style.transform = `translateY(${(1 - u) * 60}px) scale(${.9 + .1 * u}) rotateX(18deg)`;
    k.top.style.transform = `translateY(${pr * 9}px)`; k.top.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,.25), 0 ${10 - pr * 9}px 0 #0a0d18`; k.glow.style.opacity = pr; };
  [[tF10, -12], [tP, -12], [tMk, -12]].forEach(([a, g]) => sfx("CLICK", a, g));
  sfx("CLICK", tRes, -20);
  MF.forEach(([a]) => sfx("CLICK", a, -18));
  // chips over the preview
  const chG = pill(A.prev, `<span style="color:#ff9a4a;display:flex">${IC.pad}</span>Game audio`, 0, 0), chM = pill(A.prev, `<span style="color:#5b8cff;display:flex">${IC.mic}</span>Your voice`, 0, 0);
  Object.assign(chG.style, { left: "auto", top: "auto", right: "228px", bottom: "18px", height: "50px", fontSize: "20px" }); Object.assign(chM.style, { left: "auto", top: "auto", right: "18px", bottom: "18px", height: "50px", fontSize: "20px" });
  const file = pill(A.prev, `<span style="color:#3ddc97;display:flex">${IC.check}</span>episode-12.mp4 · one file`, 500, 470);
  // flags on the "last 30 s" timeline
  const FL = MF.map(([a, k], i) => { const f = el(A.flags, "div", "flag"); const c = A.mks[k].c; f.innerHTML = `<div class="ln" style="background:${c};box-shadow:0 0 10px ${c}"></div><div class="tg" style="background:${c}">${["", "☺ Funny", "! Scary", "↗ Short"][k]}</div>`; f.tg = f.lastChild; f.at = a; f.k = k; return f; });
  const cur = el(A.win, "div", "cur", CURSOR), rip = el(A.win, "div", "rip");
  const navY = i => 46 + 22 + 38 + 28 + i * 52 + 26;  // centre of nav item i in window coords
  const CUR = [[0, 0, 1700, 1000], [tStop - 1.1, .8, 1395, 138], [tEd - .9, .7, 110, navY(1)], [tEd + .8, .8, 1700, 1000]];
  const clicks = [tStop, tEd];
  clicks.forEach(a => sfx("CLICK", a, -16));
  // editor timeline segments: speech / silence (silence shrinks when "speed up the silence")
  const SEG = [[150, 0], [90, 1], [210, 0], [120, 1], [170, 0], [80, 1], [230, 0], [110, 1], [200, 0]];
  const vids = SEG.map(([w, q], i) => { const c = el(A.trk[1].c, "div", "clp"); c.style.background = `url(${frameUrl(["zomb", "obsi", "green", "farm", "tunnel"][i % 5], 60)}) center/auto 100% repeat-x`; c.style.boxShadow = "inset 0 0 0 2px rgba(255,255,255,.25)"; return c; });
  const mics = SEG.map(([w, q]) => { const c = el(A.trk[2].c, "div", "clp"); if (q) { c.style.background = "repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 6px, transparent 6px 12px)"; c.style.border = "1px dashed rgba(255,255,255,.25)"; c.innerHTML = `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 15px var(--font);color:#9fb8ff">2×</span>`; }
    else { c.style.background = "rgba(91,140,255,.22)"; c.innerHTML = Array.from({ length: Math.floor(w / 7) }, (_, k) => `<i style="position:absolute;left:${k * 7 + 3}px;top:${17 - (4 + hash(k, w) * 13)}px;width:3px;height:${2 * (4 + hash(k, w) * 13)}px;border-radius:2px;background:#6f9bff"></i>`).join(""); } c.q = q; return c; });
  const games = SEG.map(() => { const c = el(A.trk[3].c, "div", "clp"); c.style.background = "linear-gradient(90deg, rgba(255,154,74,.35), rgba(255,154,74,.22))"; return c; });
  const CW = ["WAIT", "WHAT", "ZOMBIES?!", "RUN", "NO WAY", "OBSIDIAN", "LET'S GO", "FINALLY", "EPIC"];
  const capc = CW.map(w => { const c = el(A.trk[4].c, "div", "cw", w); return c; });
  const sfxc = [0, 2, 4, 6, 8].map(() => { const c = el(A.trk[5].c, "div", "cw", "♪"); c.style.background = "rgba(255,154,74,.3)"; c.style.borderColor = "rgba(255,170,100,.6)"; return c; });
  const zc = [2, 6].map(() => { const c = el(A.trk[0].c, "div", "cw", "Zoom"); c.style.background = "rgba(232,107,208,.3)"; c.style.borderColor = "rgba(240,140,220,.6)"; return c; });
  const tSil = W("e2", "speeds"), tCap = W("e2", "writes"), tSfx = W("e2", "adds"), tZm = W("e2", "zooms"), tDub = W("e3", "dubs");
  [tSil, tCap, tSfx, tZm, tDub].forEach(a => sfx("CLICK", a, -20));
  sfx("WH_DATA", tSil + .1, -26);
  // dubbing panel (scene space)
  const dub = el(cam, "div", "gl"); place(dub, -500, -230, 1000, 470); dub.style.transform = "translateZ(160px)";
  dub.innerHTML = `<div class="lbl" style="left:40px;top:34px">Dubbing</div><div class="ab" style="right:40px;top:26px;display:flex;gap:10px;align-items:center;font:600 22px var(--font);color:#fff">Polish <span style="color:var(--dim)">→</span> <span class="grad" style="font-weight:700">English</span></div>`;
  const DL = [["O nie, tam są zombie!", "Oh no, there are zombies!"], ["Uciekamy do tunelu!", "Run to the tunnel!"], ["Mam go, obsydian!", "Got it, obsidian!"]];
  const dls = DL.map(([pl, en], i) => { const r = el(dub, "div", "ab"); place(r, 40, 96 + i * 118, 920, 100); r.innerHTML = `<div class="dl" style="height:100px"><div class="lang" style="background:rgba(255,255,255,.1);color:#fff">PL</div><span class="tx"></span></div>`;
    r.lg = r.querySelector(".lang"); r.tx = r.querySelector(".tx"); r.pl = pl; r.en = en; return r; });
  return (lt, t) => {
    // ---- camera
    const kc = [[0, 0, ...APPOSE], [26.0, 1.4, 0, -10, .97, 0, 0], [W("c1", "just") - .1, 1.1, -22, -120, 1.5, 0, -4], [c1[5] - .2, 1.2, -22, -60, 1.3, 6, 0],
      [c2[0] - .2, 1.2, 190, -40, 1.1, 0, -9], [c3[0] - .1, 1.2, -60, -100, 1.28, 0, 4], [tMk - .5, 1.1, 300, 300, 1.45, 8, -4],
      [tStop - 1.2, 1.1, 0, 0, .98, 0, 0], [tEd + .4, 1.0, 0, 0, 1.02, 0, 0], [tSil - .3, 1.1, 0, 230, 1.32, 10, 0], [tCap - .1, 2.5, 60, 250, 1.36, 8, -3],
      [tZm - .5, 1.0, -170, -170, 1.62, 0, 4], [e3[0] - .3, 1.2, 0, 10, .95, 6, 0], [58.6, 1.2, 0, 10, .9, 6, 0]];
    camSet(cam, keysAt(kc, t));
    // ---- record pane
    const onEd = P(t, tEd, tEd + .35, ioc);
    A.rp.style.opacity = 1 - onEd; A.ep.style.opacity = onEd; A.rp.style.display = onEd >= 1 ? "none" : ""; A.ep.style.display = onEd <= 0 ? "none" : "";
    A.nav[0].classList.toggle("on", t < tEd); A.nav[1].classList.toggle("on", t >= tEd);
    if (onEd < 1) {
      const rec = t >= tRec && t < tStop, paused = t >= tP && t < tRes;
      A.bRec.querySelector(".t").textContent = rec ? "■ Stop" : "● Start"; A.bRec.style.filter = rec ? "saturate(.9) brightness(.9)" : "";
      A.recb.style.opacity = rec ? (paused ? 1 : .55 + .45 * (Math.floor(t * 2) % 2)) : 0; A.recb.lastChild.textContent = paused ? "PAUSED" : "REC";
      A.recb.firstChild.style.background = paused ? "#ffd84a" : "#ff4d5e";
      const r = recT(t) + 734; A.tmr.textContent = `00:${String(Math.floor(r / 60)).padStart(2, "0")}:${String(Math.floor(r % 60)).padStart(2, "0")}`; A.tmr.style.color = paused ? "#ffd84a" : "#fff";
      A.prev.style.boxShadow = rec ? `0 0 0 3px ${paused ? "#ffd84a" : "#ff4d5e"}, 0 0 50px ${paused ? "rgba(255,216,74,.3)" : "rgba(255,77,94,.3)"}` : "0 0 0 1px rgba(255,255,255,.1)";
      A.pausO.style.opacity = P(t, tP, tP + .2, oc) * (1 - P(t, tRes, tRes + .25, oc));
      A.bPau.style.background = paused ? "rgba(255,216,74,.2)" : ""; A.bPau.style.borderColor = paused ? "rgba(255,216,74,.7)" : "";
      const et = t - pausedFor(t);  // gameplay does not move while paused
      const q = seqAt([[0, "green"], [30.6, "farm"], [35.4, "tunnel"], [37.4, "zomb"], [42.3, "obsi"]], et);
      drawClip(A.pcv, q.name, q.lt, { dim: paused ? .15 : 0 });
      appear(A.onlyG, t, W("c1", "Nothing") - .1, .5, 16); vanish(A.onlyG, t, c2[0] - .3);
      // level waves scroll while recording
      const sc = Math.floor(recT(t) * 10), live = t >= tRec && t < tStop && !paused;
      A.wv.forEach((w, r) => w.bars.forEach((b, i) => { const k = i + sc, amp = r ? .35 + .4 * hash(k >> 3, 7) : (hash(k >> 4, 3) > .35 ? .25 + .75 * hash(k, 5) : .06);
        const hh = t < tRec ? 4 : 6 + 56 * amp * (r ? .5 + .5 * hash(k, 11) : 1); b.style.height = px(hh); b.style.top = px(33 - hh / 2); b.style.opacity = live || t >= tRec ? 1 : .35; }));
      A.mks.forEach((m, k) => { const f = MF.find(x => x[1] === k); const on = f ? pulse(t, f[0], .5) * (t >= f[0] ? 1 : 0) : 0; m.style.background = on > .02 ? `${m.c}${Math.round(on * 80 + 20).toString(16).padStart(2, "0")}` : ""; m.style.transform = `scale(${1 + on * .06})`; });
      FL.forEach((f, i) => { const x = [760, 950, 1140][i] - Math.max(0, recT(t) - recT(MF[2][0])) * 40; f.style.left = px(x); f.style.display = t >= f.at ? "" : "none"; const s = spring(t - f.at, 2, .55); f.tg.style.transform = `scale(${Math.max(0, s)})`; f.tg.style.top = "-44px"; f.tg.style.transformOrigin = "0 100%"; });
    }
    keyUp(kF10, t, tF10 - .6, tF10); kF10.style.display = t < tF10 + 1.2 ? "" : "none";
    keyUp(kF9, t, tP - .6, tP); kF9.style.display = t > tP - .7 && t < tP + 1.2 ? "" : "none";
    keyUp(kMk, t, tMk - .6, tMk); kMk.style.display = t > tMk - .7 && t < tMk + 1.2 ? "" : "none";
    [chG, chM].forEach((c, i) => { appear(c, t, [W("c1", "game"), W("c1", "voice")][i] - .1, .5, 24); vanish(c, t, c2[0] - .4); });
    appear(file, t, W("c2", "one") - .1, .5, 24, "translateX(-50%)"); vanish(file, t, c3[0] - .3);
    // cursor
    const [cx, cy] = keysAt(CUR, t, ios); cur.style.transform = `translate(${cx}px,${cy}px)`; cur.style.display = t > tStop - 1.2 && t < tEd + 1.5 ? "" : "none";
    let ro = 0; clicks.forEach(a => { const u = (t - a) / .45; if (u > 0 && u < 1) { ro = 1 - u; const [x, y] = keysAt(CUR, a, ios); rip.style.left = px(x + 4); rip.style.top = px(y + 4); rip.style.transform = `scale(${.3 + u})`; } }); rip.style.opacity = ro;
    // ---- editor pane
    if (onEd > 0) {
      const sil = P(t, tSil, tSil + .9, ioe); let x = 0; const xs = SEG.map(([w, q]) => { const ww = q ? w * (1 - .6 * sil) : w; const o = [x, ww]; x += ww + 4; return o; });
      [vids, mics, games].forEach(arr => arr.forEach((c, i) => { c.style.left = px(xs[i][0]); c.style.width = px(xs[i][1]); }));
      mics.forEach(c => { if (c.q) c.style.borderColor = sil > 0 ? "rgba(140,170,255,.8)" : ""; });
      const speech = xs.filter((_, i) => !SEG[i][1]);
      capc.forEach((c, i) => { const sp = speech[Math.floor(i / 2) % speech.length]; c.style.left = px(sp[0] + (i % 2) * sp[1] * .5 + 4); const a = tCap + .15 + i * .09; c.style.opacity = clamp((t - a) / .1); c.style.transform = `scale(${t < a ? .6 : Math.min(1, .6 + (t - a) * 4)})`; });
      sfxc.forEach((c, i) => { const sp = xs[[0, 2, 4, 6, 8][i]]; c.style.left = px(sp[0] + 20); popIn(c, t, tSfx + i * .1); });
      zc.forEach((c, i) => { const sp = xs[[2, 6][i]]; c.style.left = px(sp[0] + 50); popIn(c, t, tZm - .1 + i * .15); });
      A.ph.style.left = px(130 + ((t - tEd) * 38) % 1100);
      A.togs.forEach((g, i) => { const a = [tSil, tCap, tSfx, tZm, tDub][i], u = P(t, a, a + .3, oc); g.sw.style.background = u > .5 ? g.c : ""; g.kn.style.transform = `translateX(${u * 24}px)`; g.style.borderColor = u > .5 ? `${g.c}88` : ""; g.style.background = u > .5 ? `${g.c}14` : ""; });
      const q = seqAt([[0, "zomb"], [51.2, "obsi"], [56.2, "green"]], t), zm = 1 + .22 * (pulse(t, tZm + .05, .6) * (t > tZm ? 1 : 0)) + .18 * (pulse(t, tZm + .8, .6) * (t > tZm + .8 ? 1 : 0));
      drawClip(A.ecv, q.name, q.lt, { zoom: zm });
      const capT = [["WAIT…", tCap + .2], ["ZOMBIES?!", tCap + .7], ["NO WAY", tSfx], ["OBSIDIAN!", tZm - .1], ["LET'S GO", tZm + .7]];
      let ct = ""; capT.forEach(([w, a]) => { if (t >= a) ct = w; }); if (A.ecap.textContent !== ct) A.ecap.textContent = ct;
      A.ecap.style.transform = `scale(${1.15 - .15 * clamp((t - (capT.filter(c => t >= c[1]).pop() || [0, 0])[1]) / .12)})`;
      const dm = P(t, e3[0] - .1, e3[0] + .6, oc) * (1 - P(t, 59.0, 59.4, oc)); A.win.style.filter = dm > .01 ? `blur(${dm * 8}px) brightness(${1 - dm * .45})` : "";
    }
    // ---- dub panel
    const du = appear(dub, t, W("e3", "watch") - .5, .6, 40, "translateZ(160px)");
    dls.forEach((r, i) => { const a = tDub + i * .45, sw = t >= a + .35; r.lg.textContent = sw ? "EN" : "PL"; r.lg.style.background = sw ? "linear-gradient(135deg,#3ddc97,#2fb8d6)" : "rgba(255,255,255,.1)"; r.lg.style.color = sw ? "#04150b" : "#fff";
      const txt = sw ? r.en.slice(0, Math.floor(clamp((t - a - .35) * 40, 0, r.en.length))) : r.pl; if (r.tx.textContent !== txt) r.tx.textContent = txt; appear(r, t, W("e3", "watch") - .2 + i * .12, .5, 18); });
  };
}, { inD: .1, outD: .7 });

// ---------------------------------------------------------------- 6. SHORTS: every marked moment becomes a vertical short
S(59.3, 65.9, (cam, e) => {
  const s1 = wt("s1"), hl = words(e, "Every marked moment becomes a short.", 150, 64, [s1[1], s1[1], s1[2], s1[2], s1[5], s1[7], s1[8]], { grad: [5, 6] });
  const card = el(cam, "div", "prev"); place(card, -480, -270, 960, 540); const ccv = canvas(card, 1280, 720);
  const PH = [["farm", "☺ Funny", "#ffd84a", "HE DID NOT SEE THAT", -430, 16], ["zomb", "! Scary", "#ff6b7a", "ZOMBIES?!", 0, 0], ["obsi", "↗ Short", "#b69cff", "FINALLY OBSIDIAN", 430, -16]];
  const phones = PH.map(([c, tag, col, cap, x, ry], i) => { const g = el(cam, "div", "ab"); const p = el(g, "div", "phone"); const scr = el(p, "div", "scr"); p.cv = canvas(scr, 405, 880); el(p, "div", "isl");
    const tg = el(scr, "div", "tag", tag); tg.style.background = col; const cp = el(scr, "div", "cap", cap); cp.style.bottom = "150px"; cp.style.padding = "0 18px"; cp.style.whiteSpace = "normal";
    const ok = el(g, "div", "ok", `${IC.check}Ready`); place(ok, -70, 370); g.p = p; g.cp = cp; g.ok = ok; g.c = c; g.x = x; g.ry = ry; g.i = i; return g; });
  const tV = W("s1", "vertical"), tC = W("s1", "Captioned"), tR = W("s1", "Ready");
  sfx("WH_SWING", tV - .1, -22); sfx("IMP_SOFT", tR, -22); sfx("CLICK", tC, -20);
  return (lt, t) => {
    hl.up(t);
    camSet(cam, [0, 40, .92 + lt * .01, 6, Math.sin(lt * .6) * 3]);
    const out = P(t, tV - .3, tV + .4, oc); card.style.opacity = 1 - out; card.style.transform = `scale(${1 - out * .3})`;
    drawClip(ccv, "zomb", Math.max(0, t - 59.3));
    phones.forEach(g => { const a = tV - .15 + g.i * .12, u = P(t, a, a + .9, ioe); g.style.opacity = clamp((t - a) / .2);
      g.style.transform = `translate(${g.x * u}px, ${(1 - u) * 60 + 30}px) rotateY(${g.ry * u}deg) scale(${.55 + .45 * u})`;
      drawClip(g.p.cv, g.c, Math.max(0, t - a), { cx: .5 });
      g.cp.style.opacity = t >= tC + g.i * .12 ? 1 : 0; g.cp.style.transform = `scale(${1.2 - .2 * clamp((t - tC - g.i * .12) / .12)})`;
      appear(g.ok, t, tR - .05 + g.i * .1, .45, 16); });
  };
});

// ---------------------------------------------------------------- 7. PUBLISH: the queue fills, weeks ahead
S(65.9, 72.1, (cam, e) => {
  const p1 = wt("p1"), hl = words(e, "Your YouTube queue, on autopilot.", 130, 62, [p1[3], p1[4], p1[5], p1[5], p1[5]], { grad: [3, 4] });
  const board = el(cam, "div", "gl"); place(board, -760, -330, 1520, 700); board.style.overflow = "hidden";
  const inner = el(board, "div", "ab"); place(inner, 72, 0, 1376, 2400);
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], CL = ["green", "farm", "zomb", "obsi", "tunnel"];
  const thumbs = [];
  for (let w = 0; w < 3; w++) {
    const wk = el(inner, "div", "lbl", `Week ${w + 1}`); place(wk, 0, 34 + w * 470);
    DAYS.forEach((d, i) => { const col = el(inner, "div", "day"); place(col, i * 200, 74 + w * 470); el(col, "h6", "", d);
      const L = el(col, "div", "th"); place(L, 0, 34, 176, 99); L.innerHTML = `<img src="${frameUrl(CL[(i + w) % 5], 20 + i * 15)}"><div class="tt">EP ${12 + i + w * 7}</div>`; L.at = 66.55 + (i + w * 7) * .12; L.v = 0; thumbs.push(L);
      for (let k = 0; k < 5; k++) { const V = el(col, "div", "th v"); place(V, (k % 3) * 60, 144 + Math.floor(k / 3) * 112, 56, 100); V.innerHTML = `<img src="${frameUrl(CL[(i + k + w) % 5], 30 + k * 20)}">`; V.at = L.at + .1 + k * .05; V.v = 1; thumbs.push(V); } });
  }
  const cnt = pill(e, `<span style="color:#3ddc97;display:flex">${IC.cal}</span><span class="n">0</span> uploads scheduled`, 960, 960);
  const n = cnt.querySelector(".n"), tWk = W("p1", "weeks"), tV = W("p1", "video"), tS = W("p1", "shorts");
  sfx("WH_DATA", 66.6, -26); sfx("WH_SOFT", tWk - .1, -24);
  return (lt, t) => {
    hl.up(t);
    camSet(cam, [0, 30, .92, 14 - lt * 1.2, -6 + lt * 1.4]);
    const scroll = P(t, tWk - .1, tWk + 1.3, ioe); inner.style.transform = `translateY(${-scroll * 940}px)`;
    thumbs.forEach(th => { const a = th.at > 69 ? tWk - .1 + (th.at - 69) * .08 : th.at; th.style.opacity = clamp((t - a) / .15); th.style.transform = `scale(${t < a ? .7 : .7 + .3 * oback(clamp((t - a) / .3))})`;
      const hl2 = th.v ? pulse(t, tS, .8) * (t > tS ? 1 : 0) : pulse(t, tV, .8) * (t > tV ? 1 : 0); th.style.boxShadow = hl2 > .02 ? `0 0 0 ${2 + hl2 * 2}px ${th.v ? "#b69cff" : "#5b8cff"}, 0 0 30px ${th.v ? "#b69cff" : "#5b8cff"}` : ""; });
    appear(cnt, t, tV, .5, 20, "translateX(-50%)");
    n.textContent = Math.round(126 * P(t, tV, tWk + 1.4, ioc) * .33 + 126 * .67 * P(t, tWk - .1, tWk + 1.4, ioc));
  };
});

// ---------------------------------------------------------------- 8. your computer can be off
S(72.0, 76.6, (cam, e) => {
  const p2 = wt("p2"), hl = words(e, "Your computer can be off.", 150, 70, p2.slice(0, 5), { grad: [4] });
  const lap = el(cam, "div", "ab"); place(lap, -760, -170);
  lap.innerHTML = `<div class="ab scr" style="left:0;top:0;width:640px;height:400px;border-radius:22px 22px 6px 6px;background:#0c0f1c;border:10px solid #1a1f30;overflow:hidden"></div><div class="ab" style="left:-50px;top:400px;width:740px;height:26px;border-radius:0 0 22px 22px;background:linear-gradient(180deg,#2a3048,#151a2a)"></div>`;
  const scr = lap.querySelector(".scr"); scr.innerHTML = `<img src="${frameUrl("green", 40)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85"><div class="off" style="position:absolute;inset:0;background:#030409;display:flex;align-items:center;justify-content:center;gap:14px;color:#8fa0d0;font:600 30px var(--font)"><span style="width:40px;height:40px;display:flex">${IC.moon}</span>Off</div>`;
  const off = scr.querySelector(".off");
  const N = [["Published", "EP 13 · Cave escape", "6:00 PM"], ["Published", "Short · Zombies?!", "1:00 PM"], ["Published", "Short · Finally obsidian", "3:00 PM"], ["Published", "Short · He did not see that", "5:00 PM"]];
  const notes = N.map(([a, b, c], i) => { const x = el(cam, "div", "note", `<div class="ic" style="background:linear-gradient(135deg,#ff4d5e,#c4202f);color:#fff">${IC.play}</div><div><b>${a} · ${c}</b><span>${b}</span></div>`); place(x, 160, -250 + i * 112); x.at = W("p2", "posts") - .9 + i * .35; return x; });
  const tOff = W("p2", "off");
  sfx("IMP_SOFT", tOff, -24); notes.forEach(x => sfx("CLICK", x.at, -24));
  return (lt, t) => {
    hl.up(t); camSet(cam, [0, 20, .95 + lt * .012, 6, 8 - lt * 2]);
    off.style.opacity = P(t, tOff - .05, tOff + .35, oc);
    notes.forEach(x => appear(x, t, x.at, .55, 50));
  };
});

// ---------------------------------------------------------------- 9. a weekend of work -> one evening
S(76.5, 80.5, (cam, e) => {
  const p3 = wt("p3"), hl = words(e, "A weekend of work now fits into one evening.", 150, 66, p3, { grad: [7, 8] });
  const L = el(cam, "div", "gl"), R = el(cam, "div", "gl"); place(L, -700, -190, 620, 440); place(R, 120, -190, 580, 440);
  L.innerHTML = `<div class="lbl" style="left:34px;top:30px">Before</div><div class="ab" style="left:34px;top:62px;font:700 44px var(--font);color:#fff;letter-spacing:-.03em">Weekend · 15 h</div>`;
  R.innerHTML = `<div class="lbl" style="left:34px;top:30px">Now</div><div class="ab" style="left:34px;top:62px;font:700 44px var(--font);letter-spacing:-.03em"><span class="grad">One evening</span></div>`;
  const BC = [["#ff5a6a", 3], ["#4f7cff", 6], ["#8b6cff", 2], ["#e86bd0", 2.5], ["#2fb8d6", 1.5]];
  let y = 0; const bl = BC.map(([c, h]) => { const b = el(L, "div", "blk"); place(b, 34, 140 + y * 17, 552, h * 17 - 4); b.style.background = c; b.style.padding = "0"; b.y0 = 140 + y * 17; b.h0 = h * 17 - 4; y += h; return b; });
  const ev = el(R, "div", "blk", `<span style="display:inline-flex;width:28px;height:28px;vertical-align:-6px;margin-right:10px">${IC.moon}</span>Record · AI edit · Queue`); place(ev, 34, 190, 512, 90);
  ev.style.background = "linear-gradient(135deg,#4f7cff,#8b6cff)"; ev.style.boxShadow = "0 20px 50px rgba(100,110,255,.45)";
  const tFit = W("p3", "fits"), tEv = W("p3", "evening");
  sfx("WH_SWING", tFit, -22); sfx("IMP_SOFT", tEv + .1, -22);
  return (lt, t) => {
    hl.up(t); camSet(cam, [0, 30, .95, 8, 0]);
    appear(L, t, 76.6, .5, 30); appear(R, t, W("p3", "now") - .2, .5, 30);
    bl.forEach((b, i) => { const u = P(t, tFit + i * .06, tFit + .7 + i * .06, ioe); b.style.transform = `translate(${u * 820}px, ${u * (60 - (b.y0 - 140))}px) scale(${1 - u * .5}, ${1 - u * .8})`; b.style.opacity = 1 - P(t, tFit + .5 + i * .06, tFit + .8 + i * .06); });
    const s = spring(t - tEv + .15, 1.6, .6); ev.style.opacity = clamp((t - tEv + .15) / .15); ev.style.transform = `scale(${t < tEv - .15 ? 0 : Math.max(0, s)})`;
  };
}, { outD: .7 });

// ---------------------------------------------------------------- 10. not just a tool: a business
S(80.5, 90.1, (cam, e) => {
  const b1 = wt("b1"), l1 = words(e, "This isn't just a tool.", 470, 96, b1.slice(4, 9)), l2 = words(e, "It's a business.", 620, 150, b1.slice(9), { grad: [2] });
  const tBiz = W("b1", "business"), b2 = wt("b2");
  sfx("IMP_BASS", tBiz, -16);
  const C1 = el(cam, "div", "gl"), C2 = el(cam, "div", "gl"); place(C1, -780, -250, 700, 520); place(C2, 80, -250, 700, 520);
  C1.innerHTML = `<div class="lbl" style="left:40px;top:36px">Option 1</div><div class="ab" style="left:40px;top:70px;font:700 46px var(--font);color:#fff;letter-spacing:-.03em">Run your own channels</div>`;
  C2.innerHTML = `<div class="lbl" style="left:40px;top:36px">Option 2</div><div class="ab" style="left:40px;top:70px;font:700 46px var(--font);color:#fff;letter-spacing:-.03em">Sell it to creators</div>`;
  const CH = [["Cave Diaries", "#ffb35c,#ff5a6a"], ["Farm Life", "#7ef0a8,#2fb8d6"], ["Speedrun Lab", "#9fb8ff,#8b6cff"]];
  const rows = CH.map(([n, g], i) => { const r = el(C1, "div", "tog", `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,${g})"></div>${n}<div class="ab" style="right:20px;font:600 17px var(--font);color:#9ff5cf">● daily</div>`); place(r, 40, 170 + i * 94); r.style.width = "620px"; r.style.height = "78px"; r.style.right = "auto"; r.at = b2[3] - .2 + i * .15; return r; });
  const plan = el(C2, "div", "card"); place(plan, 40, 160, 620, 320);
  plan.innerHTML = `<div class="ab" style="left:30px;top:26px;display:flex;align-items:center;gap:14px"><div class="appic" style="position:relative;width:54px;height:54px">${APPGLYPH}</div><div style="font:700 28px var(--font);color:#fff">Creator plan</div></div>
    <div class="ab" style="left:30px;top:100px;font:500 22px var(--font);color:var(--dim)">Monthly subscription</div>
    <div class="ab sub" style="left:30px;top:150px;width:560px;height:66px;border-radius:18px;display:flex;align-items:center;justify-content:center;font:700 24px var(--font);color:#fff;background:linear-gradient(95deg,#4f7cff,#8b6cff)">Subscribe</div>
    <div class="ab av" style="left:30px;top:240px;height:52px;width:560px"></div>`;
  const av = plan.querySelector(".av"), AVC = ["#ffb35c", "#7ef0a8", "#9fb8ff", "#ff7ad9", "#5ee7ff", "#ffd84a", "#b69cff", "#ff6b7a"];
  const avs = AVC.map((c, i) => { const a = el(av, "div", "ab"); place(a, i * 38, 0, 52, 52); a.style.borderRadius = "50%"; a.style.background = `linear-gradient(135deg,${c},#1a1f30)`; a.style.border = "3px solid #151a2b"; a.at = W("b2", "monthly") - .3 + i * .1; return a; });
  const or = pill(e, "or", 960, 520); or.style.width = "84px"; or.style.justifyContent = "center";
  avs.forEach(a => sfx("CLICK", a.at, -28));
  return (lt, t) => {
    l1.up(t); l2.up(t);
    const mv = P(t, b2[0] - .5, b2[0] + .3, E.inCubic);
    l1.style.opacity = (1 - P(t, tBiz - .2, tBiz + .3) * .55) * (1 - mv); l1.style.transform = `translateY(${-P(t, b1[9] - .2, b1[9] + .5, ioc) * 60}px)`;
    l2.style.opacity = 1 - mv; l2.style.filter = mv > 0 ? `blur(${mv * 14}px)` : ""; l1.style.filter = l2.style.filter;
    camSet(cam, [0, 40, .92 + lt * .006, 8, 0]);
    appear(C1, t, b2[0] - .1, .6, 60); appear(C2, t, W("b2", "sell") - .15, .6, 60); popIn(or, t, W("b2", "or") - .1, "translateX(-50%)");
    rows.forEach(r => appear(r, t, r.at, .45, 20));
    avs.forEach(a => { const s = spring(t - a.at, 2, .55); a.style.opacity = clamp((t - a.at) / .1); a.style.transform = `scale(${t < a.at ? 0 : Math.max(0, s)})`; });
  };
});

// ---------------------------------------------------------------- 11. the kit
S(90.0, 100.9, (cam, e) => {
  const k1 = wt("k1"), kick = el(e, "div", "hl kick", "Inside the kit"); kick.style.top = "150px"; kick.style.fontSize = "24px";
  const hl = words(e, "Everything you need.", 240, 84, [k1[4], k1[4], k1[4]], { grad: [0] });
  const K = [["App", IC.app, "#4f7cff", "The full studio, ready to launch.", W("k1", "app")], ["Know-how", IC.bulb, "#ffb35c", "Who to sell to, pricing, first clients.", W("k1", "know")],
    ["Marketing", IC.mega, "#e86bd0", "Ads, sales scripts, content ideas.", W("k1", "marketing")], ["Videos", IC.play, "#3ddc97", "Setup and sales demo, step by step.", W("k1", "videos") - .5]];
  const cards = K.map(([n, i, c, d, at], k) => { const g = el(cam, "div", "ab"); const x = el(g, "div", "kc gl", `<div class="ic" style="background:${c}26;color:${c}">${i}</div><h4>${n}</h4><p>${d}</p>`); g.x = -600 + k * 400; g.at = at; sfx("CLICK", at, -20); return g; });
  const k2 = wt("k2"), claude = pill(e, `<span style="display:flex;width:34px;height:34px">${IC.claude}</span>Built with Claude`, 960, 760, "chipk");
  const cta = el(e, "div", "cta", `Ready to launch`); place(cta, 960 - 260, 870, 520);
  const ring = el(e, "div", "ab"); place(ring, 960 - 270, 860, 540, 116); ring.style.borderRadius = "60px"; ring.style.border = "3px solid rgba(160,150,255,.9)";
  const tL = W("k2", "launch"), tRd = W("k2", "Ready");
  sfx("IMP_SOFT", k2[0], -22); sfx("CLICK", tL, -14); sfx("IMP_SOFT", tL + .05, -18);
  return (lt, t) => {
    appear(kick, t, k1[1] - .2, .5, 16); hl.up(t);
    const up = P(t, k2[0] - .4, k2[0] + .5, ioe);
    camSet(cam, [0, mix(-60, 60, up), mix(.95, .8, up), 10, Math.sin(lt * .5) * 3]);
    cards.forEach(g => { const u = P(t, g.at - .1, g.at + .7, ioe); g.style.opacity = clamp((t - g.at + .1) / .25); g.style.transform = `translate(${g.x}px, ${(1 - u) * 120 + 60}px) rotateX(${(1 - u) * 30}deg)`; });
    hl.style.opacity = 1 - up; kick.style.opacity = Math.min(+kick.style.opacity, 1 - up);
    appear(claude, t, k2[0] - .05, .5, 24, "translateX(-50%)");
    const c = appear(cta, t, tRd - .1, .5, 24); const pr = pulse(t, tL, .25) * (t >= tL ? 1 : 0); cta.style.transform += ` scale(${1 - pr * .05})`;
    const ru = clamp((t - tL) / .7); ring.style.opacity = t >= tL && ru < 1 ? 1 - ru : 0; ring.style.transform = `scale(${1 + ru * .25}, ${1 + ru * .6})`;
  };
});

// ---------------------------------------------------------------- 12. END: logo lockup + where to get it
S(100.8, DUR, (cam, e) => {
  const x1 = wt("x1"), ic = appIcon(cam, 170, 0, -210);
  const nm = words(e, "YouTube Gaming Studio", 560, 100, x1.slice(0, 3), { cls: "gradw" });
  const tag = el(e, "div", "sub", "Record. Edit. Publish. On autopilot."); tag.style.top = "640px";
  const cta = el(e, "div", "cta", `Unlock it on Kuba Builds AI`); place(cta, 960 - 360, 770, 720);
  const url = el(e, "div", "sub", "kubabuildsai.com"); url.style.top = "900px"; url.style.fontWeight = 600; url.style.color = "rgba(220,228,255,.8)";
  sfx("IMP_SOFT", x1[0], -18);
  return (lt, t) => {
    const k = spring(t - x1[0] + .2, 1.2, .6); ic.style.opacity = clamp((t - x1[0] + .2) / .25); ic.style.transform = `scale(${Math.max(0, k)})`;
    ic.sh.style.backgroundPosition = `${mix(130, -30, P(t, x1[0] + .3, x1[0] + 1.3, ios))}% 0`;
    nm.up(t); appear(tag, t, x1[2] + .2, .6, 16);
    appear(cta, t, W("x1", "Unlock") - .1, .6, 30); cta.style.backgroundPosition = "";
    appear(url, t, W("x1", "Kuba") - .1, .6, 16);
    camSet(cam, [0, 0, 1 + lt * .008, 0, 0]);
  };
}, { outD: .01 });

// ---------------------------------------------------------------- boot + preview player
(function boot() {
  const base = window.render;
  window.render = t => { base(t); bgUp(t); scUp(t); return true; };
  // the renderer waits for every frame; the live preview starts at once (frames still loading are drawn when they arrive)
  const all = new URLSearchParams(location.search).has("render") ? Object.values(CLIPIMG).flat() : [];
  (async () => {
    await document.fonts.ready;
    await Promise.all(all.concat([...document.images]).map(i => i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    window.render(0); window.READY = true;
  })();
  if (new URLSearchParams(location.search).has("render")) return;
  previewPlayer("studio.m4a", { w: 1920, h: 1080, chapters: T.chapters });
})();
