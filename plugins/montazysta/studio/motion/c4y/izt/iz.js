// iz.js: silnik rolek Izzi Therm (2026-10-27), kopia zs.js. Wymaga c4y.js + prem.js + iz.css.
// Obraz = jedna kanwa i lista ujęć: klipy Pexels (clips/<nazwa>) albo zdjęcia kliniki (../zoltyszalik/img).
// Ujęcie: { k: "clip"|"img", s: nazwa, a, b, z0, ax, ay, push, f: filtr canvas, whip: 1|-1 (przejście z przesunięciem), shake: [t0, amp] }
const Y = "#9be15d";
const TT = !!window.TT;  // wersja TikTok: bez numeru telefonu w kadrze (numer w opisie profilu)
function Wf(k, needle, fb) { try { return W(k, needle); } catch (e) { return fb; } }
const ZIM = {};
function izImgs(names) {
  names.forEach(n => { if (ZIM[n]) return; const i = new Image(); LOADS.push(new Promise(r => { i.onload = i.onerror = r; })); i.src = `../izt/img/${n}`; ZIM[n] = i; });
}
function izSrc(sh, dt, len) {
  if (sh.k === "img") return ZIM[sh.s];
  const fr = useClip(sh.s); return frameFit(fr, dt + (sh.off || 0), len + (sh.off || 0));
}
function izDrawShot(ctx, sh, t, dx = 0, blur = 0) {
  const dt = Math.max(0, t - sh.a), len = sh.b - sh.a;
  const L = cutLook(dt, len, { z0: sh.z0 || 1.04, push: sh.push ?? .06, punch: sh.a > 0 && !sh.whip && !sh.fade ? .035 : 0, zoomIn: dt < .12 && sh.a > 0 && !sh.whip && !sh.fade });
  const im = izSrc(sh, dt, len); if (!im) return;
  let sx = 0, sy = 0;
  if (sh.shake) { sx = shake(t, sh.shake[0], sh.shake[1]); sy = shake(t + .07, sh.shake[0], sh.shake[1] * .7); }
  if (sh.jitter) { sx += Math.sin(t * 61) * sh.jitter; sy += Math.cos(t * 53) * sh.jitter * .6; }
  ctx.save();
  const f = [sh.f || "", (L.blur + blur) > .3 ? `blur(${(L.blur + blur).toFixed(1)}px)` : ""].join(" ").trim();
  if (f) ctx.filter = f;
  premDraw(ctx, im, { z: L.z, ax: sh.ax ?? .5, ay: sh.ay ?? .5, dx: dx + sx, dy: sy });
  ctx.restore();
}
// rysuje ujęcia na kanwie; przejście whip = stare wyjeżdża, nowe wjeżdża z rozmyciem (0,2 s)
function izShots(parent, shots) {
  const cv = el(parent, "iz-cv", `<canvas width="1080" height="1920"></canvas>`).firstChild, ctx = cv.getContext("2d");
  shots.forEach(s => { if (s.k === "clip") useClip(s.s); });  // wczytaj klatki przed startem (inaczej czarny początek ujęcia)
  shots.forEach((s, i) => { if (i > 0) sfx(s.whip ? "WH_SWING" : "WH_SOFT", s.a - .06, s.whip ? -20 : s.fade ? -28 : -24); });
  return t => {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
    const i = shots.findIndex(s => t >= s.a && t < s.b), k = i < 0 ? shots.length - 1 : i, sh = shots[k];
    const u = clamp((t - sh.a) / .2);
    if (sh.whip && k > 0 && u < 1) {
      const e = E.out4(u), d = sh.whip;
      izDrawShot(ctx, shots[k - 1], t, -d * 1080 * e, 16 * (1 - u));
      izDrawShot(ctx, sh, t, d * 1080 * (1 - e), 16 * (1 - u));
    } else if (sh.fade && k > 0 && t - sh.a < sh.fade) {  // spokojne przenikanie
      izDrawShot(ctx, shots[k - 1], t);
      ctx.save(); ctx.globalAlpha = E.io(clamp((t - sh.a) / sh.fade)); izDrawShot(ctx, sh, t); ctx.restore();
    } else izDrawShot(ctx, sh, t);
  };
}
// słowa lektora do napisów: zamiana słów liczbami ({"trzech": "3"}) i łączenie par ("dwadzieścia osiem" -> "28")
function izWords(map = {}, pairs = []) {
  const ws = voiceWords().map(w => ({ ...w }));
  for (let i = 0; i < ws.length; i++) {
    for (const [a, b, rep] of pairs) {
      if (i + 1 < ws.length && norm(ws[i].w) === norm(a) && norm(ws[i + 1].w) === norm(b)) {
        const punct = (ws[i + 1].w.match(/[.,:;!?]+$/) || [""])[0];
        ws[i] = { ...ws[i], w: rep + punct, e: ws[i + 1].e }; ws.splice(i + 1, 1);
      }
    }
    const key = Object.keys(map).find(m => norm(ws[i].w) === norm(m));
    if (key) { const punct = (ws[i].w.match(/[.,:;!?]+$/) || [""])[0]; ws[i] = { ...ws[i], w: map[key] + punct }; }
  }
  return ws;
}
// pojawienie się elementu (sprężyna) w [a, z)
function izPop(e, t, a, z, base = "", from = .6) {
  const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return false;
  const s = spring(t - a, 2.4, .55); e.style.transform = `${base} scale(${mix(from, 1, s).toFixed(4)})`; return true;
}
// karta końcowa: wjeżdża od dołu w chwili a; infolinia 24 h w h24, numer w tel, przycisk w btn
// karta końcowa Izzi Therm: logo, (Piotr), „Darmowa konsultacja”, podpis, przycisk; wjeżdża od dołu w chwili a, nagłówek w h, podpis w tl, przycisk w b
function izEnd(parent, o = {}) {
  const wp = o.piotr !== false;
  const e = el(parent, "iz-end" + (wp ? " wp" : ""), `<div class="in"><img class="lg" src="../izt/img/logo.png">` +
    (wp ? `<div class="pio"><img src="../izt/img/piotr.png"></div><div class="who">${o.who || "Porozmawiasz z Piotrem z Izzi Therm"}</div>` : "") +
    `<div class="h24">${o.tag || "BEZPŁATNIE"}</div><div class="tel">${o.h || "Darmowa konsultacja"}</div><div class="k">${o.k || "Sprawdzimy, czy to pasuje do Twojej budowy"}</div>` +
    `<div class="b">${o.b || "Umów konsultację"}</div><div class="u">izzitherm.pl</div>${o.note ? `<div class="nt">${o.note}</div>` : ""}</div>`);
  const inn = e.querySelector(".in");
  const img = e.querySelector("img.lg"), pio = e.querySelector(".pio"), who = e.querySelector(".who"), h24 = e.querySelector(".h24"), tel = e.querySelector(".tel"), k = e.querySelector(".k"), btn = e.querySelector(".b");
  return (t, a, h, tl, b) => {
    if (t < a) { e.style.opacity = 0; return; }
    const dt = t - a; e.style.opacity = 1; inn.style.transform = `scale(${(1 + .035 * E.io(clamp(dt / 6))).toFixed(4)})`; e.style.transform = `translateY(${((1 - E.out4(clamp(dt / .3))) * 1920).toFixed(1)}px)`;
    img.style.transform = `translateX(-50%) scale(${mix(.6, 1, outBack(clamp((dt - .12) / .35), 2)).toFixed(3)})`;
    if (pio) { const u = clamp((dt - .2) / .35); pio.style.opacity = u > 0 ? 1 : 0; pio.style.transform = `scale(${mix(.5, 1, outBack(u, 2)).toFixed(3)})`; who.style.opacity = clamp((dt - .4) / .25); }
    zsPopX(h24, t, h, "translateX(-50%)", .5);
    tel.style.opacity = t >= h ? 1 : 0; if (t >= h) tel.style.transform = `scale(${mix(.7, 1, outBack(clamp((t - h) / .3), 2.2)).toFixed(3)})`;
    k.style.opacity = t >= tl ? clamp((t - tl) / .25) : 0;
    const ab = t - b; btn.style.opacity = ab > 0 ? 1 : 0;
    btn.style.transform = `translateX(-50%) scale(${ab > 0 ? (mix(.5, 1, outBack(clamp(ab / .3), 2.4)) * (1 + .03 * Math.sin(ab * 6))).toFixed(4) : .5})`;
  };
}
function zsPopX(e, t, a, base, from) { return izPop(e, t, a, 1e9, base, from); }
