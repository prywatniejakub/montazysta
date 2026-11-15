"use strict";
// vkit2.js — klocki Clips4you VSL v2 (styl Gaming Studio na białym): sceny z płaską kamerą, tło, telefony z prawdziwymi rolkami,
// karty, pigułki z ikoną w kółku, profil, okno, „skorupa”, która zmienia kształt (ciągłość), pomocnicze czasy słów.
// Wymaga engine.js + saas.js + c4yfilm.js (HX, IK, STAR, cursor4, curAt, rip4, xmark, stampIn, logo4, thumbUrl, CN).
const VS = (a, z, build, o = {}) => { const s = S(a, z, build, o); s.e.classList.add("vs"); return s; };
function ws(key, from, n, nth = 0) {
  const L = T.lines[LI(key)].words.filter(w => norm(w.w)), f = norm(from);
  const idx = L.map((w, i) => norm(w.w).startsWith(f) ? i : -1).filter(i => i >= 0);
  const i0 = idx[Math.min(nth, idx.length - 1)] ?? 0;
  return Array.from({ length: n }, (_, k) => L[Math.min(L.length - 1, i0 + k)].t);
}
// preload thumbnails used as CSS backgrounds (renderer waits for document.images) + every font face once
const PRE = el(document.body, "div", ""); PRE.style.display = "none";
const TH_SEEN = new Set();
function TH(clip, f = 30) { const u = thumbUrl(clip, f); if (!TH_SEEN.has(u)) { TH_SEEN.add(u); el(PRE, "img").src = u; } return u; }
el(document.body, "div", "", ["900 Montserrat", "800 Montserrat", "400 Inter", "500 Inter", "600 Inter", "700 Inter", "800 Inter"].map(f => { const [w, n] = f.split(" "); return `<span style="font-family:${n};font-weight:${w}">Clips4you ąęłńóśźż 0123</span>`; }).join("")).style.cssText = "position:absolute;left:0;top:0;opacity:0;pointer-events:none";

// flat background behind all scenes: dots + two pale warm glows drifting
const BGD = el(BG, "div", "bgd"), BGG = [[-560, -300, 1300], [620, 360, 1200]].map(([x, y, s]) => { const g = el(BG, "div", "bgg"); place(g, 960 + x - s / 2, 540 + y - s / 2, s, s); return g; });
const bgDrift = t => BGG.forEach((g, i) => { g.style.transform = `translate(${Math.sin(t * .17 + i * 2) * 90}px, ${Math.cos(t * .13 + i) * 70}px)`; });

// phones
function phoneX(parent, cx, cy, w, clip, o = {}) {
  const b = Math.round(w * .045), sw = w - 2 * b, sh = Math.round(sw * 16 / 9), h = sh + 2 * b;
  const e = ctr(parent, "phx", "", cx, cy, w, h); e.style.borderRadius = px(w * .16); e.style.padding = px(b);
  const sc = el(e, "div", "scr"); sc.style.borderRadius = px(w * .16 - b * .8);
  const cv = canvas(sc, 540, 960); el(sc, "div", "isl");
  if (o.ai) el(sc, "div", "aib", "Treść AI");
  if (o.tag != null) { e.tag = el(sc, "div", "tag", o.tag); }
  e.cv = cv; e.scr = sc; e.w = w; e.h = h; e.clip = o.still ? null : clip;
  if (o.still) sc.style.background = `url(${TH(clip, o.still)}) center/cover`; else if (clip) clipImgs(clip, window.CLIPBASE, CN(clip));
  e.draw = (lt, o2 = {}) => { if (!e.clip) return; const L = CN(e.clip) / 30 - .05; drawClip(cv, e.clip, ((lt % L) + L) % L, o2); };
  e.set = n => { if (n !== e.clip) { e.clip = n; cv.last = ""; clipImgs(n, window.CLIPBASE, CN(n)); } };
  return e;
}
function phoneUI(parent, cx, cy, w, html = "") {
  const b = Math.round(w * .045), sw = w - 2 * b, sh = Math.round(sw * 16 / 9), h = sh + 2 * b;
  const e = ctr(parent, "phx", "", cx, cy, w, h); e.style.borderRadius = px(w * .16); e.style.padding = px(b);
  const sc = el(e, "div", "scr"); sc.style.borderRadius = px(w * .16 - b * .8);
  e.ui = el(sc, "div", "ui", html); el(sc, "div", "isl"); e.sw = sw; e.sh = sh; e.w = w; e.h = h; return e;
}
const vcard = (parent, cx, cy, w, h, html = "", cls = "") => ctr(parent, "vc " + cls, html, cx, cy, w, h);
const icn = (svg, col) => `<span class="ic2"${col ? ` style="color:${col}"` : ""}>${svg}</span>`;
// pill with the icon in a round badge (ctr sizes it to its text: no fixed width = text never leaves it)
const vp = (parent, icon, text, cx, cy, cls = "") => ctr(parent, "pill vp " + cls + (icon ? "" : " np"), (icon ? `<span class="bd2">${icon}</span>` : "") + text, cx, cy, 20, 20);
const chip = (icon, text, cls = "") => `<span class="chip ${cls}">${icon ? icn(icon) : ""}${text}</span>`;
const ttl = (parent, icon, text, x, y) => at(parent, "ttl", `<span class="tic">${icon}</span>${text}`, x, y);

const LI_IN = '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#0a66c2"/><path d="M26 40h11v34H26zM31.5 22.5a6.4 6.4 0 1 1 0 12.8 6.4 6.4 0 0 1 0-12.8zM44 40h10.6v4.7h.2c1.5-2.8 5-5.7 10.4-5.7 11.1 0 13.2 7.3 13.2 16.8V74H67.4V57.6c0-3.9-.1-8.9-5.4-8.9-5.4 0-6.3 4.2-6.3 8.6V74H44z" fill="#fff"/></svg>';
const PLAT = ["instagram", "facebook", "tiktok", "youtube", "linkedin"];
const PNAME = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn" };
const plogo = k => k === "linkedin" ? LI_IN : LOGOS[k];
function picon(parent, k, cx, cy, s) { const e = ctr(parent, "plg", plogo(k), cx, cy, s, s); e.style.borderRadius = px(s * .26); return e; }
const TGI = '<svg viewBox="0 0 24 24"><path d="M3.5 11.3l15.4-6c.7-.3 1.4.2 1.2 1.2l-2.6 12.3c-.2.9-.8 1.1-1.5.7l-4-3-2 1.9c-.2.2-.4.4-.8.4l.3-4.1 7.4-6.7c.3-.3-.1-.4-.5-.2l-9.2 5.8-4-1.2c-.9-.3-.9-.9.3-1.1z" fill="#fff"/></svg>';

function prof(parent, cx, cy, w, o = {}) {
  const cols = o.cols || 3, rows = o.rows || 2, cw = (w - 36 - 6 * (cols - 1)) / cols, ch = cw * 1.3;
  const e = vcard(parent, cx, cy, w, 0, `<div class="hd"><div class="av${o.comp ? " c" : ""}">${o.comp ? IK.building : STAR()}</div><div><div class="nm">${o.name}</div><div class="st"><span><b class="np num">${o.posts}</b> postów</span><span class="ls">${o.last || ""}</span></div></div></div><div class="gr"></div>`, "prf");
  const gr = e.querySelector(".gr"); gr.style.gridTemplateColumns = `repeat(${cols}, ${cw}px)`;
  e.cells = []; for (let i = 0; i < cols * rows; i++) { const c = el(gr, "div", "cl e"); c.style.height = px(ch); e.cells.push(c); }
  const H = 26 + 72 + 16 + rows * ch + (rows - 1) * 6 + 18; e.style.height = px(H); e.style.top = px(cy - H / 2); e.H = H;
  e.np = e.querySelector(".np"); e.ls = e.querySelector(".ls");
  e.put = (i, clip, f = 30) => { const c = e.cells[i]; c.classList.remove("e"); c.style.backgroundImage = `url(${TH(clip, f)})`; return c; };
  return e;
}
function wnd(parent, cx, cy, w, h, url) {
  const e = ctr(parent, "wnd", `<div class="tb"><i></i><i></i><i></i>${url ? `<div class="u">${url}</div>` : ""}</div><div class="bd"></div>`, cx, cy, w, h);
  e.bd = e.querySelector(".bd"); return e;
}
// shell = one card that morphs between boxes: keys [t, d, cx, cy, w, h, r]; layers inside cross-fade
function shell(parent) { const e = el(parent, "div", "shell"); return e; }
const layer = (sh, html = "") => el(sh, "div", "lay", html);
function spr(e, t, a, base = "", f = 1.9, z = .62) { const s = spring(t - a, f, z); e.style.opacity = clamp((t - a) / .14); e.style.transform = `${base} scale(${t < a ? 0 : Math.max(0, s)})`; return s; }
function io(e, t, a, z = 1e9, base = "", dy = 30) {
  const u = P(t, a, a + .6, oc), v = P(t, z, z + .4, E.inCubic);
  e.style.opacity = (clamp((t - a) / .3) * (1 - v)).toFixed(3); e.style.transform = `${base} translateY(${((1 - u) * dy - v * 16).toFixed(1)}px)`;
  const bl = (1 - u) * 10 + v * 12; e.style.filter = bl > .3 ? `blur(${bl.toFixed(1)}px)` : ""; return u;
}
const fadeIO = (e, t, a, z = 1e9, d = .5) => { const v = P(t, a, a + d, oc) * (1 - P(t, z, z + d * .8, E.inCubic)); e.style.opacity = v.toFixed(3); e.style.display = v > 0 ? "" : "none"; return v; };
const VIEWS = ["1,2 mln", "846 tys.", "612 tys.", "433 tys.", "389 tys.", "251 tys.", "198 tys.", "164 tys."];
const REELS = ["c01", "c03", "c05", "c07", "c09", "c11", "c13", "c15", "c02", "c04", "c06", "c08", "c10", "c12", "c14", "c16", "c17"];
const FACES = ["ad3_hook", "ad12_hook", "ad1_hook", "ad4_hook", "ad11_hook", "ad2_hook", "ad7_hook", "ad9_hook", "ad13_hook", "ad5_hook", "ad8_hook", "ad6_hook", "ad10_hook"];
const rolek = n => n === 1 ? "rolka" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? "rolki" : "rolek";
