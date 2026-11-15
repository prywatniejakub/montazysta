"use strict";
// c4yfilm.js — Clips4you YouTube films (1920x1080): the look of clips4you.pl (paper, ink, yellow highlighter, brutal cards,
// phones with real reels) animated with the SaaS engine (motion/kuba/lib/saas.js: S(), camSet, keysAt, morph, appear...).
// Page: timing.js + manifest.js + engine.js + saas.js + c4yfilm.js + the film's scenes, then saasBoot("fN.m4a").
window.CLIPBASE = window.CLIPBASE || "../../clips";
const CN = n => (window.CLIPN || {})[n] || 150;
const STAR = (c = "#ffd60a") => `<svg viewBox="0 0 100 100"><path fill="${c}" d="M50 4C51.8 34 66 48.2 96 50C66 51.8 51.8 66 50 96C48.2 66 34 51.8 4 50C34 48.2 48.2 34 50 4Z"/></svg>`;
const SK = (d, w = 2.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IK = {
  clock: SK('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'), bulb: SK('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  cut: SK('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>'), up: SK('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
  phone: SK('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>'), cal: SK('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  chat: SK('<path d="M4 5h16v11H9l-5 4z"/>'), doc: SK('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'), music: SK('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  text: SK('<path d="M4 6V4h16v2M12 4v16M9 20h6"/>'), zoom: SK('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>'), img: SK('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  eye: SK('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'), heart: SK('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  lock: SK('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'), unlock: SK('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.5-1.9"/>'),
  pin: '<svg viewBox="0 0 24 24"><path d="M15 3l6 6-3 1-4 4 .5 4.5L13 20l-4-4-5 5-1-1 5-5-4-4 1.5-1.5L10 10l4-4z" fill="#111113"/></svg>',
  check: SK('<path d="M5 12.5l4.2 4.2L19 7"/>', 3), x: SK('<path d="M6 6l12 12M18 6L6 18"/>', 3), play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  coffee: SK('<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3v3M12 3v3"/>'), bell: SK('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>'),
  user: SK('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>'), users: SK('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>'),
  call: SK('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'), video: SK('<rect x="2.5" y="6.5" width="13" height="11" rx="2"/><path d="M15.5 10.5l6-3.2v9.4l-6-3.2"/>'),
  folder: SK('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'), money: SK('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'),
  star: STAR("#111113"), mute: SK('<path d="M4 9h4l5-4v14l-5-4H4zM17 9l4 6M21 9l-4 6"/>'), send: SK('<path d="M4 12l16-8-6 16-3-7z"/>'), shop: SK('<path d="M4 9l1.5-5h13L20 9M4 9h16v11H4z"/>'),
  building: SK('<path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/>'),
};
const CUR4 = '<svg viewBox="0 0 32 32"><path d="M6 3l19 12.5-8.6 1.6 5 9.4-3.8 2-5-9.5L6 25z" fill="#111113" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const thumbUrl = (n, f = 30) => frameUrl(n, Math.min(f, CN(n)));
const plural = n => n === 1 ? "post" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? "posty" : "postów";

// ---------------------------------------------------------------- headline: "Zwykłe [zakreślone] |czerwone|" + voice times
function HX(parent, src, y, size, times, o = {}) {
  const e = el(parent, "div", "hx" + (o.cls ? " " + o.cls : "")); e.style.top = px(y - size * .56); e.style.fontSize = px(size);
  if (o.inCam) e.style.left = px(-FW / 2 + (o.x || 0)); else if (o.x != null) e.style.left = px(o.x);
  if (o.w) e.style.width = px(o.w); if (o.align) e.style.textAlign = o.align; if (o.color) e.style.color = o.color;
  const s2 = src.replace(/\[([^\]]+)\]/g, (_, g) => g.split(" ").map(w => "[" + w + "]").join(" ")).replace(/\|([^|]+)\|/g, (_, g) => g.split(" ").map(w => "|" + w + "|").join(" "));
  const tt = typeof times === "number" ? [times] : times || [0];
  e.ws = s2.split(" ").filter(Boolean).map((tok, i) => {
    let m = tok.match(/^\[(.*)\](.*)$/), cls = "wd", txt = tok;
    if (m) { cls += " mk"; txt = m[1] + m[2]; } else if ((m = tok.match(/^\|(.*)\|(.*)$/))) { cls += " rd"; txt = m[1] + m[2]; }
    const s = el(e, "span", cls, txt); s.at = tt[Math.min(i, tt.length - 1)] + (o.dt || 0); s.mk = cls.includes("mk"); return s;
  });
  e.up = (t, z = 1e9) => e.ws.forEach(s => {
    const a = o.stat ? -1 : s.at - .08, u = P(t, a, a + .55, oc), v = P(t, z, z + .35, E.inCubic);
    s.style.opacity = (clamp((t - a) / .26) * (1 - v)).toFixed(3); s.style.transform = `translateY(${((1 - u) * 28 - v * 24).toFixed(1)}px)`;
    const bl = (1 - u) * 12 + v * 12; s.style.filter = bl > .2 ? `blur(${bl.toFixed(1)}px)` : "";
    if (s.mk) s.style.setProperty("--p", o.stat ? 1 : P(t, s.at + .1, s.at + .5, ioc).toFixed(3));
  });
  return e;
}
const kx = (parent, text, cx, y) => { const e = el(parent, "div", "kx", text); e.style.top = px(y); e.style.left = px(cx); e.style.transform = "translateX(-50%)"; return e; };
const bcard = (parent, cx, cy, w, h, html = "", cls = "") => ctr(parent, "bc " + cls, html, cx, cy, w, h);
const yp = (parent, html, cx, cy, cls = "") => ctr(parent, "pill yp " + cls, html, cx, cy, 20, 20);
const ico = (svg, col) => `<span class="ic2"${col ? ` style="color:${col}"` : ""}>${svg}</span>`;
function logo4(parent, cx, cy, size = 64) { const b = el(place(el(parent, "div", "fitbox"), cx - 10, cy - 10, 20, 20), "div", "logo4", `<i>${STAR()}</i>Clips4you`); b.style.fontSize = px(size); b.style.position = "relative"; return b.parentNode; }
// generic in/out for any element: pops on a spring at a, fades out at z
function inout(e, t, a, z = 1e9, o = {}) {
  const s = o.pop ? spring(t - a, o.f || 1.8, o.zz || .62) : P(t, a, a + (o.d || .5), oc), v = P(t, z, z + (o.dz || .35), E.inCubic);
  e.style.opacity = (clamp((t - a) / .18) * (1 - v)).toFixed(3);
  const sc = o.pop ? (t < a ? 0 : Math.max(0, s)) : 1, dy = o.pop ? 0 : (1 - s) * (o.dy ?? 30);
  e.style.transform = `${o.base || ""} translateY(${(dy - v * (o.dy2 ?? 0)).toFixed(1)}px) scale(${(sc * (1 - v * .08)).toFixed(4)})`;
  const bl = (o.pop ? 0 : (1 - s) * 10) + v * 10; e.style.filter = bl > .2 ? `blur(${bl.toFixed(1)}px)` : ""; return s;
}

// ---------------------------------------------------------------- phone with a real reel (clips/<name>/NNN.jpg, 30 fps)
function phone4(parent, cx, cy, w, clip, o = {}) {
  const h = Math.round(w * 16 / 9), e = ctr(parent, "ph4", "", cx, cy, w, h), cv = canvas(e, 540, 960);
  e.clip = clip; e.cv = cv; e.w = w; e.h = h; clipImgs(clip, window.CLIPBASE, CN(clip));
  if (o.tag) el(e, "div", "tg", o.tag); if (o.ok) el(e, "div", "okb", IK.check);
  e.draw = (lt, o2 = {}) => { const L = CN(e.clip) / 30 - .05; drawClip(cv, e.clip, ((lt % L) + L) % L, o2); };
  e.set = n => { if (n !== e.clip) { e.clip = n; cv.last = ""; clipImgs(n, window.CLIPBASE, CN(n)); } };
  return e;
}
// caption on a phone (big white words with ink stroke), words appear at times
function cap4(ph, html, y, size = 30) { const c = el(ph, "div", "capx", html); c.style.top = px(y); c.style.fontSize = px(size); return c; }

// ---------------------------------------------------------------- calendar (30 days)
function cal4(parent, cx, cy, w, o = {}) {
  const cols = 7, gap = 10, cw = (w - 52 - gap * (cols - 1)) / cols, ch = o.ch || cw * (o.ratio || .78);
  const e = bcard(parent, cx, cy, w, 0, `<div class="hd"><span>${o.title || "Twój miesiąc"}</span><em>${o.sub || "30 dni"}</em></div><div class="gd"></div>`, "cal4 " + (o.cls || ""));
  e.style.height = "auto"; const gd = e.querySelector(".gd"); gd.style.gridTemplateColumns = `repeat(${cols}, ${cw}px)`;
  const off = o.off ?? 2; e.days = [];
  for (let i = 0; i < off; i++) { const b = el(gd, "div", "dy"); b.style.height = px(ch); b.style.opacity = .35; }
  for (let d = 1; d <= 30; d++) { const b = el(gd, "div", "dy", `<s>${d}</s><div class="fl"></div>`); b.style.height = px(ch); b.fl = b.querySelector(".fl"); e.days.push(b); }
  const H = 26 * 2 + 52 + 5 * ch + 4 * gap; e.style.top = px(cy - H / 2);
  e.fill = (i, clip, f = 20) => { const b = e.days[i]; b.fl.style.backgroundImage = `url(${thumbUrl(clip, f)})`; return b; };
  e.pop = (i, t, a) => { const b = e.days[i], s = spring(t - a, 2, .6); b.fl.style.opacity = t < a ? 0 : 1; b.fl.style.transform = `scale(${t < a ? .3 : .3 + .7 * Math.min(1.1, s)})`; };
  return e;
}

// ---------------------------------------------------------------- video call window (Ty + Clips4you)
function callWin(parent, cx, cy, w, h) {
  const e = ctr(parent, "wn", `<div class="tb4"><i></i><i></i><i></i><div class="u">rozmowa online · Clips4you</div></div><div class="bd4"></div>`, cx, cy, w, h), bd = e.querySelector(".bd4");
  bd.style.background = "#fbfaf6"; const tw = (w - 72) / 2, th = h - 52 - 150;
  const L = at(bd, "tile4", `<div class="av4">${ico(IK.user)}</div><div class="bars4"></div><div class="nm">Ty</div>`, 24, 24, tw, th);
  const R = at(bd, "tile4", `<div class="av4" style="background:#111113">${ico(STAR())}</div><div class="bars4"></div><div class="nm">Clips4you</div>`, 48 + tw, 24, tw, th);
  [L, R].forEach(x => { x.querySelector(".av4 .ic2").style.cssText = "width:78px;height:78px"; x.bars = [...Array(9)].map(() => el(x.querySelector(".bars4"), "i", "")); });
  const tm = at(bd, "ab", "", 0, h - 52 - 108, w, 70); Object.assign(tm.style, { display: "flex", justifyContent: "center", alignItems: "center", gap: "22px" });
  tm.innerHTML = `<div class="pill yp w sm num" style="position:relative">${ico(IK.video)}<span class="tmr">00:00</span> / 60:00</div><div class="pill yp sm" style="position:relative;background:#e5383b;color:#fff">${ico(IK.call)}Zakończ</div>`;
  e.tmr = tm.querySelector(".tmr"); e.L = L; e.R = R; e.bd = bd;
  e.talk = (t, who, amp = 1) => [L, R].forEach((x, k) => x.bars.forEach((b, i) => { const on = who === k ? amp : 0, hh = 10 + on * 44 * Math.abs(Math.sin(t * (7 + i * 1.3) + i * 2.1) * Math.sin(t * 3.1 + i)); b.style.height = px(hh); x.style.borderColor = on > .3 ? "#ffd60a" : "#111113"; x.style.boxShadow = on > .3 ? "0 0 0 4px #111113" : ""; }));
  e.clock = sec => { const m = Math.floor(sec / 60), s = Math.floor(sec % 60); e.tmr.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; };
  return e;
}
const bub = (parent, html, x, y, me) => place(el(parent, "div", "bb" + (me ? " me" : ""), html), x, y);
function note4(parent, icon, title, sub, x, y, time = "teraz") { return place(el(parent, "div", "nt", `<i>${icon}</i><div><b>${title}</b><span>${sub}</span></div><small>${time}</small>`), x, y); }

// ---------------------------------------------------------------- timeline of the 60-min recording (site "machine")
function tline(parent, cx, cy, w, o = {}) {
  const e = bcard(parent, cx, cy, w, 0, `<div class="fn"><span><i class="dt"></i>${o.file || "nagranie_z_klientem.mp4"}</span><em>${o.len || "60:00"}</em></div><div class="bars5"></div>`, "tl4 soft");
  e.style.height = "auto"; e.style.top = px(cy - 130); const bars = e.querySelector(".bars5"); let s = 11;
  for (let i = 0; i < (o.n || 64); i++) { s = (s * 9301 + 49297) % 233280; const hh = 30 + Math.abs(Math.sin(i * .41) * 60 + (s / 233280) * 44 - 12); el(bars, "i", "").style.height = px(Math.min(124, hh)); }
  e.segs = (o.segs || [["HOOK", 6, 9], ["0:24", 30, 8], ["0:38", 58, 11], ["0:31", 80, 9]]).map(([lb, l, ww]) => { const g = el(bars, "div", "seg4", `<b>${lb}</b>`); g.style.left = l + "%"; g.style.width = ww + "%"; g.style.opacity = 0; return g; });
  e.ph = el(bars, "div", "phd"); e.bars = bars; return e;
}

// ---------------------------------------------------------------- step cards (the map) + HUD
function step4(parent, cx, cy, w, h, n, title, o = {}) {
  const e = ctr(parent, "st4" + (o.gold ? " gold" : ""), `<div class="fr">${o.gold ? `<span class="lk">${IK.lock}</span>` : `<div class="n">${n}</div>`}<div class="t">${title}</div></div><div class="bk">${o.back || ""}</div>`, cx, cy, w, h);
  e.fr = e.firstChild; e.bk = e.lastChild; return e;
}
function hud4(parent) {
  const e = el(parent, "div", "hud4", `<span>KROK</span><b class="num">0/4</b>`), b = e.querySelector("b"), bars = [0, 1, 2, 3].map(() => el(e, "i", "")), lk = el(e, "u", "", IK.lock);
  return (n, gold, show) => { e.style.opacity = show; e.style.transform = `translateY(${(1 - show) * -20}px)`; b.textContent = `${n}/4`; bars.forEach((x, i) => x.classList.toggle("on", i < n)); lk.classList.toggle("on", !!gold); lk.innerHTML = gold ? IK.unlock : IK.lock; };
}

// ---------------------------------------------------------------- cursor, ripple, cross, stamp, counter
function cursor4(parent) { const c = el(parent, "div", "cur4", CUR4); c.style.opacity = 0; return c; }
function curAt(c, t, keys) { const [x, y, o] = keysAt(keys, t, ioe); c.style.opacity = o; c.style.transform = `translate(${x}px,${y}px)`; }
function rip4(parent, x, y) { const R = [0, 1].map(() => ctr(parent, "rip4", "", x, y, 200, 200)); return (t, t0) => R.forEach((r, i) => { const u = (t - t0 - i * .1) / .7; r.style.opacity = u > 0 && u < 1 ? (1 - u) : 0; r.style.transform = `scale(${.1 + u * .9})`; }); }
function xmark(parent, cx, cy, w, h) {
  const e = ctr(parent, "xx", "", cx, cy, w, h), L = Math.hypot(w, h) * .5, a = Math.atan2(h, w) * 180 / Math.PI;
  const A = el(e, "i", ""), B = el(e, "i", ""); [A, B].forEach(x => { x.style.width = px(0); });
  e.up = (t, t0) => { const u1 = P(t, t0, t0 + .22, oc), u2 = P(t, t0 + .18, t0 + .4, oc);
    A.style.width = px(L * 2 * u1); A.style.transform = `rotate(${a}deg) translateX(${-L}px)`; A.style.opacity = u1 > 0 ? 1 : 0;
    B.style.width = px(L * 2 * u2); B.style.transform = `rotate(${-a}deg) translateX(${-L}px)`; B.style.opacity = u2 > 0 ? 1 : 0; };
  return e;
}
function stampIn(e, t, a, rot = -8) { const s = spring(t - a, 2.4, .5); e.style.opacity = clamp((t - a) / .08); e.style.transform = `rotate(${rot}deg) scale(${t < a ? 2.2 : mix(2.2, 1, Math.min(1.05, s))})`; return s; }
const cnt = (e, v, t, a, b, fmt = x => Math.round(x)) => { e.textContent = fmt(v * P(t, a, b, ioc)); };
// soft floating idle (for cards that sit still): tiny drift so nothing is ever frozen
const drift = (t, k = 0, a = 6) => `translate(${(Math.sin(t * .7 + k) * a).toFixed(1)}px, ${(Math.cos(t * .55 + k * 1.7) * a).toFixed(1)}px)`;

// ---------------------------------------------------------------- Instagram-like profile (grid of reels)
function prof4(parent, cx, cy, w, o = {}) {
  const cols = o.cols || 3, rows = o.rows || 3, cellW = (w - 12 - 6 * (cols - 1)) / cols, cellH = cellW * (o.ar || 1.35);
  const e = bcard(parent, cx, cy, w, 0, `<div class="top"><div class="pic">${o.pic || STAR("#111113")}</div><div><div class="nmx">${o.name || "Twoja Firma"}</div><div class="st"><span><b class="np">${o.posts ?? 1}</b> <i class="npl" style="font-style:normal">${plural(o.posts ?? 1)}</i></span><span><b>${o.fol || "1 240"}</b> obserwujących</span></div></div></div><div class="gr4"></div>`, "prof4");
  e.style.height = "auto"; const gr = e.querySelector(".gr4"); gr.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
  e.cells = []; for (let i = 0; i < cols * rows; i++) { const c = el(gr, "div", "cl"); c.style.height = px(cellH); e.cells.push(c); }
  const H = 26 + 110 + 18 + rows * cellH + (rows - 1) * 6 + 6; e.style.top = px(cy - H / 2); e.H = H; e.np = e.querySelector(".np"); e.npl = e.querySelector(".npl"); e.posts = n => { e.np.textContent = n; e.npl.textContent = plural(n); };
  e.put = (i, clip, f = 25, extra = "") => { e.cells[i].innerHTML = `<img src="${thumbUrl(clip, f)}">${extra}`; return e.cells[i]; };
  return e;
}

// ---------------------------------------------------------------- generic (films 2+): big number on ink, HUD with n/total + lock, receipt
function punch(a, z, n, title, key, word = "krok", total = 4) {
  S(a, z, (cam, e) => {
    const big = el(cam, "div", "bign num", "0" + n); big.style.left = px(-FW / 2 - 330); big.style.top = px(-200);
    const tt = HX(cam, title, 20, title.length > 9 ? 120 : 150, [W(key, title.slice(0, 3), 0, .6)], { inCam: true, x: 330, color: "#fff" });
    const k = kx(cam, `${word} ${n} z ${total}`, 330, 130); k.style.color = "rgba(255,255,255,.55)";
    const bars = [...Array(total)].map((_, i) => { const b = ctr(cam, "", "", 330 - (total - 1) * 45 + i * 90, 210, 74, 12); Object.assign(b.style, { position: "absolute", borderRadius: "6px", background: i < n ? "#ffd60a" : "rgba(255,255,255,.18)" }); b.k = i; return b; });
    sfx("IMP_SOFT", a + .12, -21);
    return (lt, t) => {
      const u = P(t, a, a + .6, ioe); big.style.transform = `translateY(${(1 - u) * 120}px)`; big.style.opacity = u; big.style.filter = u < .99 ? `blur(${(1 - u) * 16}px)` : "";
      tt.up(t); appear(k, t, a + .25, .5, 20, "translateX(-50%)");
      bars.forEach(b => { const v = P(t, a + .3 + b.k * .06, a + .7 + b.k * .06, oc); b.style.transform = `scaleX(${v})`; b.style.opacity = v; });
      camSet(cam, [mix(-40, 20, P(t, a, z, ios)), 0, mix(1.08, 1, P(t, a, z, ioc)), 0, mix(-6, 4, P(t, a, z, ios))]);
    };
  }, { inD: .25, outD: .35 });
  SCN[SCN.length - 1].e.classList.add("ink");
}
function hudN(parent, label, total) {
  const e = el(parent, "div", "hud4", `<span>${label}</span><b class="num">0/${total}</b>`), b = e.querySelector("b"), bars = [...Array(total)].map(() => el(e, "i", "")), lk = el(e, "u", "", IK.lock);
  if (total > 4) bars.forEach(x => { x.style.width = "22px"; });
  return (n, gold, show) => { e.style.opacity = show; e.style.transform = `translateY(${(1 - show) * -20}px)`; b.textContent = `${n}/${total}`; bars.forEach((x, i) => x.classList.toggle("on", i < n)); lk.classList.toggle("on", !!gold); lk.innerHTML = gold ? IK.unlock : IK.lock; };
}
// film HUD overlay: steps start at line keys; gold = the payoff line
function filmHud(label, keys, from, goldKey) {
  const L = el(ROOT, "div", "ab"); Object.assign(L.style, { inset: 0, pointerEvents: "none" });
  const up = hudN(L, label, keys.length), ST = keys.map(k => LS(k)), G = LS(goldKey) + .6, z = LS("e1") - .3, FD = document.getElementById("fade");
  window.AFTER = t => { FD.style.opacity = P(t, DUR - .3, DUR, E.lin); const s = P(t, from, from + .4) * (1 - P(t, z, z + .4)); L.style.display = s > 0 ? "" : "none"; if (s > 0) up(ST.filter(x => t >= x).length, t >= G, s); };
}
// receipt (paragon): lines print one by one; rows [[label, value, t, cls]]; total optional
function receipt(parent, cx, cy, w, title, rows) {
  const e = bcard(parent, cx, cy, w, 0, `<div style="font:900 30px var(--d);text-align:center;padding:26px 0 10px">${title}</div><div style="border-top:3px dashed #111113;margin:0 26px"></div>`, "rcpt");
  e.style.height = "auto"; e.style.paddingBottom = "22px"; e.rows = rows.map(([l, v, t, cls]) => { const r = el(e, "div", "", `<span>${l}</span><b class="num">${v}</b>`); Object.assign(r.style, { display: "flex", justifyContent: "space-between", gap: "20px", margin: "14px 26px 0", font: "700 30px/1.3 var(--b)", whiteSpace: "nowrap" }); if (cls) r.querySelector("b").style.color = cls; r.t = t; return r; });
  e.style.top = px(cy - 60); e.style.transformOrigin = "50% 0";
  e.up = t => e.rows.forEach(r => { const u = P(t, r.t, r.t + .3, oc); r.style.opacity = u; r.style.transform = `translateY(${(1 - u) * -12}px)`; });
  return e;
}
