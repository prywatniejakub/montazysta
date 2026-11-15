// zs.js: wspólny silnik rolek Żółtego Szalika (pakiet start8, 2026-10-19). Wymaga c4y.js + prem.js + zs.css.
// Obraz = jedna kanwa i lista ujęć: klipy Pexels (clips/<nazwa>) albo zdjęcia kliniki (../zoltyszalik/img).
// Ujęcie: { k: "clip"|"img", s: nazwa, a, b, z0, ax, ay, push, f: filtr canvas, whip: 1|-1 (przejście z przesunięciem), shake: [t0, amp] }
const Y = "#ffd23f";
const TT = !!window.TT;  // wersja TikTok: bez numeru telefonu w kadrze (numer w opisie profilu)
function Wf(k, needle, fb) { try { return W(k, needle); } catch (e) { return fb; } }
const ZIM = {};
function zsImgs(names) {
  names.forEach(n => { if (ZIM[n]) return; const i = new Image(); LOADS.push(new Promise(r => { i.onload = i.onerror = r; })); i.src = `../zoltyszalik/img/${n}`; ZIM[n] = i; });
}
function zsSrc(sh, dt, len) {
  if (sh.k === "img") return ZIM[sh.s];
  const fr = useClip(sh.s); return frameFit(fr, dt + (sh.off || 0), len + (sh.off || 0));
}
function zsDrawShot(ctx, sh, t, dx = 0, blur = 0) {
  const dt = Math.max(0, t - sh.a), len = sh.b - sh.a;
  const L = cutLook(dt, len, { z0: sh.z0 || 1.04, push: sh.push ?? .06, punch: sh.a > 0 && !sh.whip && !sh.fade ? .035 : 0, zoomIn: dt < .12 && sh.a > 0 && !sh.whip && !sh.fade });
  const im = zsSrc(sh, dt, len); if (!im) return;
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
function zsShots(parent, shots) {
  const cv = el(parent, "zs-cv", `<canvas width="1080" height="1920"></canvas>`).firstChild, ctx = cv.getContext("2d");
  shots.forEach(s => { if (s.k === "clip") useClip(s.s); });  // wczytaj klatki przed startem (inaczej czarny początek ujęcia)
  shots.forEach((s, i) => { if (i > 0) sfx(s.whip ? "WH_SWING" : "WH_SOFT", s.a - .06, s.whip ? -20 : s.fade ? -28 : -24); });
  return t => {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
    const i = shots.findIndex(s => t >= s.a && t < s.b), k = i < 0 ? shots.length - 1 : i, sh = shots[k];
    const u = clamp((t - sh.a) / .2);
    if (sh.whip && k > 0 && u < 1) {
      const e = E.out4(u), d = sh.whip;
      zsDrawShot(ctx, shots[k - 1], t, -d * 1080 * e, 16 * (1 - u));
      zsDrawShot(ctx, sh, t, d * 1080 * (1 - e), 16 * (1 - u));
    } else if (sh.fade && k > 0 && t - sh.a < sh.fade) {  // spokojne przenikanie
      zsDrawShot(ctx, shots[k - 1], t);
      ctx.save(); ctx.globalAlpha = E.io(clamp((t - sh.a) / sh.fade)); zsDrawShot(ctx, sh, t); ctx.restore();
    } else zsDrawShot(ctx, sh, t);
  };
}
// słowa lektora do napisów: zamiana słów liczbami ({"trzech": "3"}) i łączenie par ("dwadzieścia osiem" -> "28")
function zsWords(map = {}, pairs = []) {
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
function zsPop(e, t, a, z, base = "", from = .6) {
  const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return false;
  const s = spring(t - a, 2.4, .55); e.style.transform = `${base} scale(${mix(from, 1, s).toFixed(4)})`; return true;
}
// karta końcowa: wjeżdża od dołu w chwili a; infolinia 24 h w h24, numer w tel, przycisk w btn
function zsEnd(parent, o = {}) {
  const e = el(parent, "zs-end", `<div class="in"><img src="../zoltyszalik/img/logo.png"><div class="k">${o.k || "Porozmawiaj anonimowo"}</div><div class="h24">INFOLINIA 24 H</div>` +
    `<div class="tel${TT ? " tt" : ""}">${TT ? "Numer w opisie profilu" : "501 011 101"}</div><div class="b">Zadzwoń</div><div class="u">zoltyszalik.com.pl · Kraków</div>${o.note ? `<div class="nt">${o.note}</div>` : ""}</div>`);
  const inn = e.querySelector(".in");
  const img = e.querySelector("img"), h24 = e.querySelector(".h24"), tel = e.querySelector(".tel"), btn = e.querySelector(".b");
  return (t, a, h, tl, b) => {
    if (t < a) { e.style.opacity = 0; return; }
    const dt = t - a; e.style.opacity = 1; inn.style.transform = `scale(${(1 + .035 * E.io(clamp(dt / 6))).toFixed(4)})`; e.style.transform = `translateY(${((1 - E.out4(clamp(dt / .3))) * 1920).toFixed(1)}px)`;
    img.style.transform = `translateX(-50%) scale(${mix(.6, 1, outBack(clamp((dt - .12) / .35), 2)).toFixed(3)})`;
    zsPop(h24, t, h, 1e9, "translateX(-50%)", .5);
    tel.style.opacity = t >= tl ? 1 : 0; if (t >= tl) tel.style.transform = `scale(${mix(.7, 1, outBack(clamp((t - tl) / .3), 2.2)).toFixed(3)})`;
    const ab = t - b; btn.style.opacity = ab > 0 ? 1 : 0;
    btn.style.transform = `translateX(-50%) scale(${ab > 0 ? (mix(.5, 1, outBack(clamp(ab / .3), 2.4)) * (1 + .03 * Math.sin(ab * 6))).toFixed(4) : .5})`;
  };
}
