"use strict";
// NOWY STYL rolek klientów Clips4you (wzór go4d8, zaakceptowany 2026-10-05): ujęcia co 1-2 s jako warstwy na cały ekran,
// twarz z ustami TYLKO gdy ma ruch (nigdy zamrożona), prawdziwa strona klienta przewijana z palcem, napisy po 1-3 słowa.
// Potrzebuje c4y.js (el, at, pop, rise, W, LE, sfx, useClip, E, P, clamp, mix) i timing.js.
const G4 = { S: 2.88, FX: "C:/Users/komputer/Desktop/Youtube/motion/kuba/assets/sfx/" };

// klatki kluczowe [t, ...wartości] z płynnym przejściem (max .55 s)
G4.keyAt = (K, t, d = .55) => {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 1; i < K.length; i++) if (t < K[i][0]) {
    const [a, ...va] = K[i - 1], [b, ...vb] = K[i], u = E.io(clamp((t - a) / Math.min(d, b - a)));
    return va.map((v, j) => mix(v, vb[j], u));
  }
  return K[K.length - 1].slice(1);
};

// twarz: o = { clip, fx, fy (środek twarzy w 1080x1920), patch?: {src, x, y, w, h, f} }
G4.face = (c, o) => {
  const L = el(c, "layer face", `<canvas width="1080" height="1920"></canvas>`); el(L, "shade");
  // znaczek AI (OBOWIĄZKOWY, wiedza/feedback-znaczek-ai.md): w warstwie twarzy, więc jest TYLKO w ujęciach z postacią AI
  el(L, "aitag", "AI");
  const ctx = L.querySelector("canvas").getContext("2d"), fr = useClip(o.clip), VEND = T.VEND, PT = o.patch;
  let off, pc, mk;
  if (PT) {  // łatka na wypalone przez model „napisy”: czysty kawałek z innej klatki, miękkie brzegi
    off = document.createElement("canvas"); pc = document.createElement("canvas"); mk = document.createElement("canvas");
    off.width = 1080; off.height = 1920; pc.width = mk.width = PT.w; pc.height = mk.height = PT.h;
    const m = mk.getContext("2d"), f = PT.f / PT.w, g = PT.f / PT.h;
    let gr = m.createLinearGradient(0, 0, PT.w, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(f, "#000"); gr.addColorStop(1 - f, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
    m.fillStyle = gr; m.fillRect(0, 0, PT.w, PT.h); m.globalCompositeOperation = "destination-in";
    gr = m.createLinearGradient(0, 0, 0, PT.h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(g, "#000"); gr.addColorStop(1 - g, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
    m.fillStyle = gr; m.fillRect(0, 0, PT.w, PT.h);
  }
  const patched = im => {
    if (!PT) return im;
    const clean = fr[PT.src], x = off.getContext("2d"), p = pc.getContext("2d");
    x.drawImage(im, 0, 0, 1080, 1920);
    if (clean && clean.complete && clean.naturalWidth) {
      const sx = clean.naturalWidth / 1080;
      p.globalCompositeOperation = "source-over"; p.clearRect(0, 0, PT.w, PT.h);
      p.drawImage(clean, PT.x * sx, PT.y * sx, PT.w * sx, PT.h * sx, 0, 0, PT.w, PT.h);
      p.globalCompositeOperation = "destination-in"; p.drawImage(mk, 0, 0);
      x.drawImage(pc, PT.x, PT.y);
    }
    return off;
  };
  // mode: "close" (zbliżenie twarzy) | "wide"; punches: [[t, siła]] uderzenia zoomem
  L.draw = (t, mode, t0, punches = []) => {
    const vt = Math.min(t, VEND - .04), im = fr[Math.min(fr.length - 1, Math.max(0, Math.round(vt * 30)))];
    if (!im || !im.complete || !im.naturalWidth) return;
    const calm = typeof mode === "number", u = clamp((t - t0) / (calm ? 4 : 2)), close = mode === "close";
    let z = calm ? mode + .04 * u : close ? 1.55 + .05 * u : 1.03 + .03 * u;
    punches.forEach(([p, a]) => { if (t >= p - .03 && t < p + .9) z += a * clamp((t - p + .03) / .08) * (1 - P(t, p + .6, p + .9)); });
    const ty = close ? 700 : calm ? o.fy - 40 * (mode - 1) : o.fy;
    ctx.drawImage(patched(im), 540 - o.fx * z, ty - o.fy * z, 1080 * z, 1920 * z);
  };
  return L;
};

// ujęcia: SHOTS = [[start, warstwa, {from: 1|-1, ...}]]; zwraca funkcję (t, extra) -> {i, cur, prev, o, t0}
G4.shots = (L, SHOTS) => (t, shakeX = 0) => {
  let i = 0; SHOTS.forEach((s, j) => { if (t >= s[0]) i = j; });
  const [t0, cur, o] = SHOTS[i], prev = i > 0 ? SHOTS[i - 1][1] : null;
  if (o.fade) {
    const tf = clamp((t - t0) / .5);
    Object.entries(L).forEach(([k, e]) => { e.style.visibility = (k === cur || (k === prev && tf < 1 && prev !== cur)) ? "visible" : "hidden"; });
    L[cur].style.zIndex = 2; L[cur].style.opacity = E.io(tf).toFixed(3); L[cur].style.filter = "none";
    L[cur].style.transform = `translateX(${shakeX.toFixed(1)}px) scale(${(1.025 - .025 * E.out(tf)).toFixed(4)})`;
    if (prev && prev !== cur) { L[prev].style.zIndex = 1; L[prev].style.opacity = 1; L[prev].style.transform = "none"; L[prev].style.filter = "none"; }
    return { i, cur, prev, o, t0, tr: tf, prevShot: i > 0 ? SHOTS[i - 1] : null, shot: SHOTS[i] };
  }
  L[cur].style.opacity = 1;
  const tr = o.from ? clamp((t - t0) / .22) : 1, slide = (1 - E.out4(tr)) * 1080 * (o.from || 0);
  Object.entries(L).forEach(([k, e]) => { e.style.visibility = (k === cur || (k === prev && tr < 1 && prev !== cur)) ? "visible" : "hidden"; });
  L[cur].style.transform = `translateX(${(slide + shakeX).toFixed(1)}px)`;
  L[cur].style.filter = tr < 1 ? `blur(${((1 - tr) * 16).toFixed(1)}px)` : "none";
  L[cur].style.zIndex = 2;
  if (prev && prev !== cur) { L[prev].style.zIndex = 1; L[prev].style.transform = tr < 1 ? `translateX(${(-(o.from || 0) * E.out4(tr) * 420).toFixed(0)}px)` : "none"; L[prev].style.filter = "none"; }
  return { i, cur, prev, o, t0, tr, prevShot: i > 0 ? SHOTS[i - 1] : null, shot: SHOTS[i] };
};
G4.whooshes = SHOTS => SHOTS.forEach(([t0, , o], i) => { if (o.from) sfx(i % 2 ? "WH_SWING" : "WH_SOFT", t0 - .06, -12); else if (o.fade && i) sfx("WH_SOFT", t0 - .12, -20); });

// napisy: [linia, od słowa, do słowa (wyłącznie) | null = koniec linii, html, czerwone?]; nigdy dwa naraz
G4.caps = (c, list, calm = false) => {
  const CAPS = list.map(([k, a, z, html, red]) => ({ a: W(k, a), z: z ? W(k, z) : LE(k) + .25, html, red }));
  CAPS.forEach((g, i) => { if (CAPS[i + 1]) g.z = Math.min(g.z, CAPS[i + 1].a); });
  const els = CAPS.map(g => { const e = el(c, calm ? "ccap" : "cap" + (g.red ? " r" : ""), calm ? `<span>${g.html}</span>` : g.html); e.g = g; return e; });
  if (calm) return (t, stop = 1e9) => els.forEach(e => { if (t >= e.g.a - .05 && t < e.g.z && t < stop) { const u = E.out(clamp((t - e.g.a + .05) / .25)), v = clamp((e.g.z - t) / .15);
    e.style.opacity = Math.min(u, v); e.style.transform = `translateY(${((1 - u) * 14).toFixed(1)}px)`; } else e.style.opacity = 0; });
  return (t, stop = 1e9) => els.forEach(e => { if (t >= e.g.a && t < e.g.z && t < stop) pop(e, t, e.g.a, .78, 3.2, .6); else e.style.opacity = 0; });
};

// prawdziwa strona: img = plik zrzutu (1080 szer.); cam(sy, ss, focus) w px strony telefonu (375 szer.)
G4.site = (c, img) => {
  const L = el(c, "layer site"), pg = el(L, "pg", `<img src="${img}">`), S = G4.S;
  L.pg = pg;
  L.cam = (sy, ss = 1, focus = null) => {
    const F = ((focus == null ? sy + 333 : focus) - sy) * S;
    pg.style.transform = `translate(540px, ${F.toFixed(1)}px) scale(${ss.toFixed(4)}) translate(-540px, ${(-F).toFixed(1)}px) translateY(${(-sy * S).toFixed(1)}px)`;
  };
  L.glow = (r, pad = 8) => { const g = el(pg, "glow"); Object.assign(g.style, { left: r[0] * S - pad + "px", top: r[1] * S - pad + "px", width: r[2] * S + 2 * pad + "px", height: r[3] * S + 2 * pad + "px" }); return g; };
  // palec: kółko + fala w punkcie (x, y) strony; upd(t, tKlik)
  L.finger = (x, y) => {
    const tap = el(pg, "tap"), rip = el(pg, "rip");
    [tap, rip].forEach(e => { e.style.left = x * S + "px"; e.style.top = y * S + "px"; });
    return tt => t => {
      if (t >= tt - .35 && t < tt + .5) { tap.style.opacity = clamp((t - tt + .35) / .1) * (1 - P(t, tt + .25, tt + .5)); tap.style.transform = `scale(${t < tt ? 1 : .8})`; } else tap.style.opacity = 0;
      if (t >= tt && t < tt + .6) { const u = (t - tt) / .6; rip.style.opacity = 1 - u; rip.style.transform = `scale(${1 + u * 2.4})`; } else rip.style.opacity = 0;
    };
  };
  return L;
};

// telefon: kind "in" (dzwoni) | "out" (rozmowa z licznikiem)
G4.call = (c, kind = "in") => {
  const L = el(c, "layer call", `<div class="ring"></div><div class="who"><div class="av">?</div><div class="nm">Nieznany numer</div><div class="nr">dzwoni…</div></div>` +
    (kind === "in" ? `<div class="bt no">${G4.ICO.hang}</div><div class="bt yes">${G4.ICO.pick}</div>` : `<div class="bt end1">${G4.ICO.hang}</div>`));
  L.ring = L.querySelector(".ring"); L.who = L.querySelector(".who"); L.av = L.querySelector(".av"); L.nm = L.querySelector(".nm"); L.nr = L.querySelector(".nr");
  L.pulse = (t, t0) => { const ph = Math.max(0, t - t0); L.ring.style.transform = `scale(${1 + (ph * 1.4) % 1 * .6})`; L.ring.style.opacity = 1 - (ph * 1.4) % 1; };
  return L;
};
G4.ICO = {
  hang: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 9c-1.6 0-3.1.3-4.6.8v3.1c0 .4-.2.7-.6.9-.9.4-1.8 1-2.5 1.7-.2.2-.4.3-.7.3s-.5-.1-.7-.3L.3 13.1c-.2-.2-.3-.4-.3-.7s.1-.5.3-.7C3.3 8.9 7.4 7 12 7s8.7 1.9 11.7 4.7c.2.2.3.4.3.7s-.1.5-.3.7l-2.5 2.5c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.8-.7-1.6-1.3-2.5-1.7-.3-.2-.6-.5-.6-.9V9.8C15.1 9.3 13.6 9 12 9z"/></svg>',
  pick: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z"/></svg>',
};

// plansza końcowa Go4Driver
G4.end = (c, sub, cta) => {
  const L = el(c, "layer dark");
  const lg = at(el(L, "logo", "Go<b>4</b>Driver"), null, 640), sb = at(el(L, "sub", sub), null, 860);
  const bt = at(el(L, "btnl", cta), null, 1150), url = at(el(L, "url", "go4driver.com"), null, 1360);
  L.upd = (t, t0) => { if (t >= t0) { pop(lg, t, t0, .7, 2.4, .55); rise(sb, t, t0 + .15, 40, .35); pop(bt, t, t0 + .3, .7, 2.6, .5); rise(url, t, t0 + .45, 30, .35); } else [lg, sb, bt, url].forEach(hide); };
  return L;
};

// pieczątka na środku (np. „0 zł”)
G4.stamp = (parent, html, top = 1080) => { const s = el(parent, "stamp", `<b>${html}</b>`); s.style.top = top + "px"; return s; };
