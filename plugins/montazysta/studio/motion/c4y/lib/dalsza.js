"use strict";
// Dalsza część reklamy po hooku AI (wzór: sek2 = AI1 „Sekunda” v2, zaakceptowany 2026-10-25), po c4y.js i c4yad.js + dalsza.css.
// Sceny w stylu naszych rolek: nagłówek z żółtym podkreśleniem, B-role w ramce, telefony z przykładowymi rolkami, branże,
// trzy kroki, licznik 30 spotkań, pieczęć gwarancji, formularz z kursorem. Słowa = [linia, początek słowa] (W z c4y.js).
const WW = ([k, w]) => W(k, w);

// B-rol w ramce: klatki clips/<name> (1280x720, 30 kl./s, w pętli od t0), przycięte do proporcji ramki
function Frame(parent, name, y, h = 600) {
  const e = at(el(parent, "frm", `<canvas width="928" height="${h - 12}"></canvas>`), null, y, null, h);
  e.ctx = e.querySelector("canvas").getContext("2d"); e.frames = useClip(name);
  e.sw = Math.min(1280, 720 * 928 / (h - 12)); e.sx = (1280 - e.sw) / 2; e.ch = h - 12; return e;
}
function show(f, t, t0) { const fr = f.frames; if (!fr.length) return; const im = fr[Math.max(0, Math.floor((t - t0) * 30)) % fr.length]; if (im.complete && im.naturalWidth) f.ctx.drawImage(im, f.sx, 0, f.sw, 720, 0, 0, 928, f.ch); }

// S0: ostatnia klatka hooka (tail.png), papier wjeżdża z prawej
function TailScene(t1 = .1) {
  const tail = new Image(); LOADS.push(new Promise(r => { tail.onload = tail.onerror = r; })); tail.src = "tail.png";
  scene(0, t1, (c) => { tail.className = "full"; c.appendChild(tail); }, { push: 0 });
  sfx("IMP_BASS", t1, -10);
}

// trzy telefony z przykładowymi rolkami ze strony (postacie AI: znaczek)
function PhonesScene(a, z, head, mark, names) {
  return scene(a, z, (c) => {
    const h = H(c, head, 290, 96);
    el(c, "aitag dk", "AI");
    const ph = [[85, 660, -6], [400, 620, 0], [715, 660, 6]].map(([x, y, r], i) => {
      const p = Phone(c, names[i], x, y, 280); p.r = r; p.t0 = a + .12 + i * .1; sfx("POP", p.t0, -14); return p; });
    return (lt, t) => { markIn(h, t, WW(mark) - .05); ph.forEach(p => { pop(p, t, p.t0, .6, 2.2, .55, `rotate(${p.r}deg)`); play(p, t, p.t0); }); };
  });
}

// klient wart kilka tysięcy zł: różne branże (bez budowlanki, wiedza/feedback-scenariusze-wynik-nie-narzedzia.md pkt 6)
const CHIPS = [["🦷 Stomatologia", "⚖️ Kancelaria"], ["🏠 Nieruchomości", "🎓 Szkolenia"], ["💼 Doradztwo", "🚗 Auto"], ["📊 Księgowość", "💆 Gabinet"], ["+ inne branże"]];
function ChipsScene(a, z, head, mark, from, to, size = 92) {
  return scene(a, z, (c) => {
    const h = H(c, head, 290, size);
    const chips = [];
    CHIPS.forEach((row, ri) => { const r = at(el(c, "crow"), null, 570 + ri * 140); row.forEach((x, k) => { const e = el(r, "chip" + (ri === CHIPS.length - 1 ? " more" : ""), x); e.r = [-2, 1.5, -1, 2][(ri + k) % 4]; chips.push(e); }); });
    const t0 = WW(from), t1 = WW(to), tK = WW(mark);
    chips.forEach((e, i) => { e.t0 = t0 - .1 + i * (t1 + .2 - t0) / chips.length; sfx("POP", e.t0, -18); });
    sfx("IMP_SOFT", tK, -12);
    return (lt, t) => { markIn(h, t, tK - .05); chips.forEach(e => pop(e, t, e.t0, .5, 2.6, .55, `rotate(${e.r}deg)`)); };
  });
}

// nagłówek + B-rol w ramce
function FrameScene(a, z, head, mark, clip, o = {}) {
  return scene(a, z, (c) => {
    const h = H(c, head, o.hy ?? 290, o.size ?? 92);
    const f = Frame(c, clip, o.y ?? 560, o.h ?? 660);
    sfx("POP", a + .15, -14); if (o.imp) sfx("IMP_SOFT", WW(mark), -12);
    return (lt, t) => { markIn(h, t, WW(mark) - .05, 0, o.md ?? .35); pop(f, t, a + (o.d0 ?? .12), o.from ?? .7, 2.2, .6, `rotate(${o.r ?? -1}deg)`); show(f, t, a); };
  });
}

// nagłówek + telefon z rolką + naklejka obok (bez zasłaniania twarzy w rolce)
function PhoneSticker(a, z, head, mark, clip, sticker, stAt, o = {}) {
  return scene(a, z, (c) => {
    const h = H(c, head, 290, o.size ?? 96);
    el(c, "aitag dk", "AI");
    const p = Phone(c, clip, 170, 580, 370);
    const st = at(el(c, "sticker " + (o.cls || ""), sticker), 500, 1110);
    const tT = WW(stAt);
    sfx("POP", a + .1, -14); sfx("POP", tT, -10);
    return (lt, t) => { markIn(h, t, WW(mark) - .05); pop(p, t, a + .08, .7, 2.2, .6, "rotate(-3deg)"); play(p, t, a); pop(st, t, tT - .05, .4, 2.8, .5, "rotate(4deg)"); };
  });
}

// duży napis (krótka linia, np. „Mówię do Ciebie.”)
function BigText(a, z, head, mark, y = 640, size = 150) {
  return scene(a, z, (c) => {
    const h = H(c, head, y, size);
    sfx("IMP_SOFT", WW(mark), -12);
    return (lt, t) => { markIn(h, t, WW(mark) - .05, 0, .25); };
  });
}

// trzy kroki: czarna plakietka KROK n, nagłówek, treść z build(c) -> upd(t)
function Step(key, next, n, head, mw, build) {
  return scene(LS(key), LS(next), (c) => {
    const s = at(el(c, "step", "KROK " + n), null, 270);
    const h = H(c, head, 360, 84);
    const upd = build(c);
    return (lt, t) => { pop(s, t, LS(key) + .05, .6, 2.6, .55, "translateX(-50%)"); markIn(h, t, W(key, mw) - .05); upd(t); };
  });
}
function StepFrame(key, next, n, head, mw, clip, r = 1, imp = false) {
  return Step(key, next, n, head, mw, (c) => {
    const f = Frame(c, clip, 680, 550);
    sfx("POP", LS(key) + .2, -14); if (imp) sfx("IMP_SOFT", W(key, mw), -14);
    return (t) => { pop(f, t, LS(key) + .18, .7, 2.2, .6, `rotate(${r}deg)`); show(f, t, LS(key)); };
  });
}
// krok 3: powiadomienia o zgłoszeniach (max 3 dźwięki powiadomień w filmie, feedback N1 pkt 8)
function NotesStep(key, next, n, head, mw, words, notes) {
  return Step(key, next, n, head, mw, (c) => {
    const N = notes.map(([i, who, what], k) => at(el(c, "note", `<i>${i}</i><div><b>Nowe zgłoszenie</b><span>${who} · ${what}</span></div><small>teraz</small>`), null, 650 + k * 190));
    words.forEach((w, k) => { const t0 = W(key, w); N[k].t0 = t0 - .05; sfx("DING", t0, -13); });
    return (t) => N.forEach((e, k) => pop(e, t, e.t0, .6, 2.6, .55, `rotate(${[-1, 1, -.5][k]}deg)`));
  });
}

// minimum 30 spotkań w 90 dni: licznik + 30 kratek
function CounterScene(key, next) {
  return scene(LS(key), LS(next), (c) => {
    const top = at(el(c, "pill w0 c", "Gwarancja"), null, 280);
    const lab = at(el(c, "sub", "minimum"), null, 420); lab.style.font = "800 52px/1.2 var(--d)";
    const big = at(el(c, "big", `<span class="n">0</span><small>spotkań w 90 dni</small>`), null, 490);
    const n = big.querySelector(".n");
    const g = at(el(c, "grid30", Array.from({ length: 30 }, () => "<i></i>").join("")), null, 980);
    const cells = [...g.querySelectorAll("i")];
    const tT = W(key, "trzydziesci");
    sfx("IMP_BASS", tT, -12);
    return (lt, t) => {
      pop(top, t, LS(key) + .05, .6, 2.4, .55, "translateX(-50%)");
      rise(lab, t, W(key, "minimum") - .05, 30, .3);
      const k = Math.round(30 * P(t, tT - .05, tT + .9, E.out));
      n.textContent = k; big.style.opacity = t < tT - .1 ? 0 : 1;
      cells.forEach((e, i) => e.classList.toggle("on", i < k));
    };
  });
}

// gdy mniej, pracujemy dalej bez opłaty za obsługę (pieczęć)
function SealScene(key, next) {
  return scene(LS(key), LS(next), (c) => {
    const h = H(c, "Gdy jest ich mniej,<br>[pracujemy dalej].", 280, 80);
    const seal = el(c, "seal", `<div class="ring"></div><small>GWARANCJA</small><span>bez opłaty<br>za obsługę</span><em>aż je dowieziemy</em>`);
    const em = seal.querySelector("em"), ring = seal.querySelector(".ring");
    const tB = W(key, "bez"), tA = W(key, "az");
    sfx("IMP_BASS", tB - .05, -12); sfx("POP", tA, -12);
    return (lt, t) => {
      markIn(h, t, W(key, "pracujemy") - .05);
      pop(seal, t, tB - .1, 1.8, 2.6, .45, `rotate(${(-6 + 3 * Math.sin(t * 2)).toFixed(2)}deg)`);
      ring.style.transform = `rotate(${(t * 20).toFixed(1)}deg)`; em.style.opacity = t >= tA - .05 ? 1 : 0;
    };
  });
}

// CTA: formularz form6 (4 pytania), przycisk wjeżdża na „Sprawdzimy”, kursor klika
function FormCta(key, ctaKey, head, mark, rowsFrom) {
  return scene(LS(key), T.DUR + 1, (c) => {
    const h = H(c, head, 280, 88);
    const f = at(el(c, "form", `<h4>Formularz<em>4 pytania</em></h4>` +
      ["Wartość klienta", "Budżet", "Kiedy start", "Nazwa firmy lub link"].map(q => `<div class="row"><b>${ICO.chk}</b>${q}</div>`).join("")), null, 510);
    const rows = [...f.querySelectorAll(".row")];
    const cta = at(el(c, "cta", `Wypełnij formularz${ARROW}`), null, 1035);
    const cur = at(el(c, "cursor", ICO.cursor), 0, 0), rip = el(c, "ripple");
    const tR = WW(rowsFrom), tS = W(ctaKey, "sprawdzimy"), tClick = tS + .6;
    rows.forEach((r, i) => { r.t0 = tR + i * .18; sfx("POP", r.t0, -16); });
    sfx("CLICK", tClick, -4);
    return (lt, t) => {
      markIn(h, t, WW(mark) - .05);
      pop(f, t, LS(key) + .1, .7, 2.2, .6, "rotate(-1deg)");
      rows.forEach(r => r.classList.toggle("on", t >= r.t0));
      const u = rise(cta, t, tS - .25, 50, .35), press = t >= tClick && t < tClick + .16 ? 1 : 0;
      if (u >= 1) cta.style.transform = `translate(${press * 10}px, ${press * 10}px)`;
      cta.style.boxShadow = press ? "6px 6px 0 #111113" : "";
      const v = P(t, tClick - .7, tClick - .05, E.io);
      at(cur, mix(940, 780, v), mix(1540, 1145, v)); cur.style.opacity = t < tClick - .75 ? 0 : 1;
      const r = clamp((t - tClick) / .5); at(rip, 820, 1171); rip.style.opacity = t < tClick ? 0 : 1 - r; rip.style.transform = `scale(${1 + r * 4})`;
    };
  });
}
