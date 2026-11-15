// prem.js: próbki Clips4you w zatwierdzonym stylu (od 2026-10-05, po odrzuceniu sch1/shf1/dk1/aq1).
// Zasady: napisy max 3 słowa (wyskok, obrys), pełny kadr 9:16 bez ramek, mało tekstu, najazdy przy cięciach, licznik kasynowy.
// Wymaga c4y.js (T, el, clamp, mix, E, P, spring, sfx, useClip, scene, boot) i prem.css.
const outBack = (u, s = 1.9) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const cleanW = w => w.replace(/[„”"«»]/g, "");
const PR = { caps: [], off: [] };

// ---- napisy: słowa [{w,t,e}] -> grupy max 3 słowa / 16 znaków, łamane na interpunkcji
function premCaps(parent, words, o = {}) {
  const box = el(parent, "p-cap"); if (o.top) box.style.top = o.top + "px";
  let cur = null;
  words.forEach(w => {
    const c = cleanW(w.w).trim(); if (!c) return;
    const prev = cur && cur.words[cur.words.length - 1];
    if (!cur || cur.words.length >= (o.max || 3) || cur.len + c.length > (o.chars || 16) || /[.,:;!?…]$/.test(prev.w)) { cur = { words: [], len: 0 }; PR.caps.push(cur); }
    cur.words.push({ ...w, c }); cur.len += c.length + 1;
  });
  PR.caps.forEach((c, k) => {
    const nx = PR.caps[k + 1], end = c.words[c.words.length - 1].e;
    c.a = c.words[0].t - .04; c.z = nx ? Math.min(nx.words[0].t - .04, end + .5) : end + .9;
    c.el = el(box, "w"); c.rot = (hash(k, 9) - .5) * 3.2;
    c.el.innerHTML = c.words.map(w => { const col = o.hi && o.hi(w.c); const txt = w.c.replace(/[.,:;!…]+$/, "");
      return `<span${col ? ` style="color:${col}"` : ""}>${txt}</span>`; }).join("");
  });
  return box;
}
function premCapsUpdate(t) {
  const off = PR.off.some(([a, z]) => t >= a && t < z);
  PR.caps.forEach(c => {
    const on = !off && t >= c.a && t < c.z;
    c.el.style.opacity = on ? 1 : 0;
    if (on) { const u = clamp((t - c.a) / .13); c.el.style.transform = `scale(${(1.25 - .25 * outBack(u, 2.2)).toFixed(3)}) rotate(${c.rot.toFixed(2)}deg)`; }
  });
}
// słowa z timing.js (lektor)
const voiceWords = () => { const o = []; T.lines.forEach(L => L.words.forEach(w => o.push(w))); return o; };

// ---- hak u góry (widoczny od t=0)
function premHook(parent, html, a, z) {
  const e = el(parent, "p-hook", html);
  return t => { const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (on) e.style.transform = `scale(${(1 + .015 * Math.sin(t * 4)).toFixed(4)})`; };
}

// ---- licznik kasynowy (z long.js)
function premOdo(parent, digits, o = {}) {
  const wrap = el(parent, "p-big"); wrap.style.top = (o.top || 560) + "px";
  const e = el(wrap, "d-odo"); e.style.color = o.color || "#fff"; if (o.size) e.style.fontSize = o.size + "px";
  if (o.prefix) el(e, "d-fx", o.prefix);
  const cols = [];
  for (let p = digits - 1; p >= 0; p--) {
    const w = el(e, "d-dg"), s = el(w, "d-st", "0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0");
    const c = { w, s, p, cm: null }; cols.push(c);
    if (o.space && p % 3 === 0 && p) c.cm = el(e, "d-cm", "&nbsp;");
  }
  if (o.suffix) { const sx = el(e, "d-fx d-sfx", o.suffix); }
  if (o.label) el(wrap, "lab", o.label);
  return { wrap, set(v, vel = 0) {
    v = Math.max(0, v); const lead = Math.max(o.minDigits || 1, String(Math.floor(v)).length);
    cols.forEach(c => {
      const base = Math.floor(v / 10 ** c.p) % 10, below = (v % 10 ** c.p) / 10 ** c.p;
      const pos = c.p === 0 ? base + (v % 1) : base + clamp((below - .9) * 10);
      c.s.style.transform = `translateY(${-pos}em)`;
      const spin = Math.abs(vel) / 10 ** c.p; c.s.style.filter = spin > 6 ? `blur(${Math.min(6, spin / 8)}px)` : "";
      c.w.style.display = c.p < lead ? "" : "none"; if (c.cm) c.cm.style.display = c.p < lead ? "" : "none";
    });
  } };
}
// licznik od v0 do v1 w czasie [a, b], widoczny [a, z]
function premOdoRun(od, t, a, b, z, v0, v1) {
  const on = t >= a && t < z; od.wrap.style.opacity = on ? 1 : 0; if (!on) return;
  const u = E.out(clamp((t - a) / Math.max(.05, b - a))), v = mix(v0, v1, u), dv = (v1 - v0) * 3 * Math.pow(1 - clamp((t - a) / (b - a)), 2) / Math.max(.05, b - a);
  od.set(v, dv / 30); const s = t < a + .25 ? outBack(clamp((t - a) / .25), 2) : 1; od.wrap.style.transform = `scale(${(.7 + .3 * s).toFixed(3)})`;
}

// ---- obraz na pełny kadr (cover), z kotwicą i zoomem
function premDraw(ctx, im, o = {}) {
  if (!im || !im.complete || !im.naturalWidth) return;
  const iw = im.naturalWidth, ih = im.naturalHeight, base = Math.max(1080 / iw, 1920 / ih) * (o.z || 1);
  const w = iw * base, h = ih * base, ax = o.ax ?? .5, ay = o.ay ?? .5;
  const x = (1080 - w) * ax + (o.dx || 0), y = (1920 - h) * ay + (o.dy || 0);
  if (o.blur) { ctx.save(); ctx.filter = `blur(${o.blur}px)`; ctx.drawImage(im, x, y, w, h); ctx.restore(); } else ctx.drawImage(im, x, y, w, h);
}
// klatka klipu w chwili dt od startu cięcia (30 kl./s)
const frameAt = (fr, dt, off = 0) => fr && fr.length ? fr[Math.min(fr.length - 1, Math.max(0, Math.floor((dt + off) * 30)))] : null;
// klatka dopasowana do długości cięcia: krótki klip zwalnia (zamiast stać na ostatniej klatce), dłuższy gra normalnie
const frameFit = (fr, dt, len) => { if (!fr || !fr.length) return null; const sp = Math.min(1, fr.length / 30 / Math.max(.1, len)); return fr[Math.min(fr.length - 1, Math.floor(dt * 30 * sp))]; };
// najazd przy cięciu + powolny dojazd + rozmycie wejścia (przejście „zoom”)
function cutLook(dt, len, o = {}) {
  const z = (o.z0 || 1) + (o.push ?? .06) * E.io(clamp(dt / Math.max(.4, len))) + (o.punch ?? .07) * Math.max(0, 1 - dt / .16);
  const blur = o.zoomIn ? 14 * Math.max(0, 1 - dt / .12) : 0;
  return { z, blur };
}
// trzy pasy POV jeden nad drugim (pełny kadr, cienkie czarne przerwy)
function premTri(ctx, ims, shown, t) {
  const H = (1920 - 2 * 14) / 3;
  ims.forEach((im, i) => {
    if (shown[i] == null || t < shown[i] || !im || !im.complete || !im.naturalWidth) return;
    const y0 = i * (H + 14), u = clamp((t - shown[i]) / .22), slide = (1 - E.out4(u)) * (i % 2 ? -1080 : 1080);
    const s = Math.max(1080 / im.naturalWidth, H / im.naturalHeight) * 1.04, w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, 1080, H); ctx.clip(); ctx.drawImage(im, (1080 - w) / 2 + slide, y0 + (H - h) / 2, w, h); ctx.restore();
  });
}
// wstrząs przy uderzeniu
const shake = (t, t0, amp = 18) => t >= t0 && t < t0 + .25 ? (1 - (t - t0) / .25) * amp * Math.sin((t - t0) * 90) : 0;
