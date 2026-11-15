"use strict";
// Rolka Go4Driver (pakiet 1): postać AI z ustami na pełnym ekranie, napisy po 1-3 słowa z głosem, emoji na puentach,
// karta Go4Driver na zdaniu o funkcji, wezwanie z offu, plansza końcowa. Konfiguracja: window.G4D (lib/g4d.py REELS).
// Potrzebuje c4y.js (scene, el, at, pop, rise, W, LS, sfx) i timing.js (DELAY: głos przesunięty względem ust).
(() => {
  const G = window.G4D, DUR = T.DUR, VEND = T.VEND;
  const FX = "C:/Users/komputer/Desktop/Youtube/motion/kuba/assets/sfx/";
  const CHK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#0c0d10" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const box = '<i class="chk">' + CHK + "</i>";
  const keys = T.lines.map(l => l.key), CTA = keys[keys.length - 1], CARDK = G.card_at[0];
  const word = (k, needle) => { const n = norm(needle); return LN(k).words.find(w => norm(w.w).startsWith(n)); };
  const tw = (k, needle, fb) => { const w = word(k, needle); return w ? w.t : fb; };
  const lastW = LN(CTA).words[LN(CTA).words.length - 1];
  const tCard = LS(CARDK), tCta = LS(CTA), tEnd = Math.max(lastW.e + .15, tCta + .8);
  const DISPLAY = { plus: "+" };

  // napisy: grupy wg split (reszta słów po 2), tylko do zdania z kartą
  const GROUPS = [];
  T.lines.forEach(l => {
    if (keys.indexOf(l.key) >= keys.indexOf(CARDK)) return;
    const sp = (G.split[l.key] || []).slice(); let i = 0;
    while (i < l.words.length) { const n = sp.length ? sp.shift() : 2; const ws = l.words.slice(i, i + n); i += n; if (!ws.length) break;
      const nx = l.words[i]; GROUPS.push({ a: ws[0].t, z: nx ? nx.t : ws[ws.length - 1].e + .3, ws }); }
  });
  GROUPS.forEach((g, i) => { if (GROUPS[i + 1] && GROUPS[i + 1].a - g.z < .3) g.z = GROUPS[i + 1].a; });
  const capHtml = g => g.ws.map(w => { const raw = w.w.replace(/[.,:?!]+$/, ""), k = norm(raw);
    return `<span class="${G.keys.includes(k) ? "k" : ""}">${DISPLAY[k] || raw}</span>`; }).join(" ");

  // ---- karty
  function card(c) {
    const lg = (s = "") => `<div class="lg"><span>Go<b>4</b>Driver</span>${s ? `<small>${s}</small>` : ""}</div>`;
    let e, upd = () => {};
    if (G.card === "add") {
      e = el(c, "card", lg("dla firm") + [["Stanowisko", "Kierowca C+E"], ["Pojazd", "Firanka"], ["Wynagrodzenie", "9 000 - 11 000 zł"], ["System", "Weekend w domu"]]
        .map(([a, b]) => `<div class="fld"><span>${a}</span><b>${b}</b></div>`).join("") + `<div class="fld"><span>Cena ogłoszenia</span><b>0 zł</b></div><div class="btn">Opublikuj ofertę</div>`);
      const f = [...e.querySelectorAll(".fld")], bt = e.querySelector(".btn"), t0 = tw(CTA, "darm", tCta + .5), tb = t0 + .45;
      f.slice(0, 4).forEach((x, i) => sfx("CLICK", tCard + .25 + i * .32, -12));
      sfx("POP", t0, -9); sfx("CLICK", tb, -8);
      upd = t => { f.forEach((x, i) => x.classList.toggle("on", i < 4 ? t >= tCard + .25 + i * .32 : t >= t0)); f[4].classList.toggle("hi", t >= t0); bt.classList.toggle("on", t >= tb); };
    } else if (G.card === "filter") {
      e = el(c, "card", lg("szukaj po aucie") + `<div class="lbl">Typ auta</div><div class="chips">` +
        ["Betoniarka (gruszka)", "Firanka", "Chłodnia", "Kontener", "Wywrotka"].map((x, i) => `<div class="chip${i ? "" : " a"}">${box}${x}</div>`).join("") +
        `</div><div class="lbl">Marka</div><div class="chips">` + ["Volvo", "Scania", "MAN", "Mercedes"].map((x, i) => `<div class="chip${i ? "" : " b"}">${box}${x}</div>`).join("") +
        `</div><div class="btn">Dodaj ofertę za darmo</div>`);
      const a = e.querySelector(".a"), b = e.querySelector(".b"), bt = e.querySelector(".btn");
      const ta = tw(CARDK, "typie", tCard + .6) + .15, tb2 = tw(CARDK, "marce", tCard + 1.4) + .15, tb = tw(CTA, "Dodaj", tCta) + .2;
      sfx("CLICK", ta, -8); sfx("CLICK", tb2, -8); sfx("CLICK", tb, -8);
      upd = t => { a.classList.toggle("on", t >= ta); b.classList.toggle("on", t >= tb2); bt.classList.toggle("on", t >= tb); };
    } else if (G.card === "offer") {
      e = el(c, "card", lg() + `<div class="ex">przykładowa oferta</div><div class="job">Kierowca C+E · firanka</div><div class="where">Trasy UE · start od zaraz</div>
        <div class="pay">Zadzwoń, to się dowiesz</div><div class="tags"><i>System 3/1</i><i>Weekend w domu</i></div><div class="btn">Załóż darmowe konto</div>`);
      const pay = e.querySelector(".pay"), bt = e.querySelector(".btn"), tp = tw(CARDK, "kwot", tCard + .8), tb = tw(CTA, "Załóż", tCta) + .2;
      sfx("POP", tp, -8); sfx("CLICK", tb, -8);
      upd = t => { const on = t >= tp; pay.classList.toggle("on", on); pay.textContent = on ? "9 500 - 11 000 zł" : "Zadzwoń, to się dowiesz"; bt.classList.toggle("on", t >= tb); };
    } else if (G.card === "cv") {
      e = el(c, "card", lg("darmowe CV") + `<div class="doc"><div class="nm">Twoje CV</div><div class="rl">Kierowca C+E</div>` +
        [["🚛", "5 lat w trasie"], ["❄️", "Chłodnia, trasy UE"], ["🪪", "C+E, karta kierowcy, ADR"], ["📄", "PDF gotowy do wysłania"]].map(([i, s]) => `<div class="ln"><em>${i}</em>${s}</div>`).join("") +
        `</div><div class="bar"><i></i></div><div class="btn">Załóż darmowe konto</div>`);
      const ln = [...e.querySelectorAll(".ln")], bar = e.querySelector(".bar i"), bt = e.querySelector(".btn");
      const ts = tw(CARDK, "samo", tCard + 2), tb = tw(CTA, "Załóż", tCta) + .2;
      ln.forEach((x, i) => sfx("CLICK", mix(tCard + .3, ts, i / (ln.length - 1)), -13)); sfx("POP", ts, -8); sfx("CLICK", tb, -8);
      upd = t => { ln.forEach((x, i) => { const ti = mix(tCard + .3, ts, i / (ln.length - 1)); x.style.opacity = clamp((t - ti) / .15); });
        bar.style.width = (P(t, tCard, ts, E.lin) * 100).toFixed(1) + "%"; bt.classList.toggle("on", t >= tb); };
    }
    return { e, upd };
  }

  scene(0, DUR + 1, c => {
    const cv = el(c, "full", `<canvas width="1080" height="1920"></canvas>`).firstChild, ctx = cv.getContext("2d");
    const fr = useClip(G.clip);
    // łatka: Kling czasem wypala w obrazie fałszywe „napisy” pod mową; zakrywamy je czystym kawałkiem z klatki bez nich
    // G.patch = { src: indeks czystej klatki, x, y, w, h (w 1080x1920), f: miękka krawędź }
    const PT = G.patch, off = PT && document.createElement("canvas"), pc = PT && document.createElement("canvas"), mk = PT && document.createElement("canvas");
    if (PT) {
      off.width = 1080; off.height = 1920; pc.width = mk.width = PT.w; pc.height = mk.height = PT.h;
      const m = mk.getContext("2d"), f = PT.f / PT.w, g = PT.f / PT.h;
      let gr = m.createLinearGradient(0, 0, PT.w, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(f, "#000"); gr.addColorStop(1 - f, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = gr; m.fillRect(0, 0, PT.w, PT.h); m.globalCompositeOperation = "destination-in";
      gr = m.createLinearGradient(0, 0, 0, PT.h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(g, "#000"); gr.addColorStop(1 - g, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = gr; m.fillRect(0, 0, PT.w, PT.h);
    }
    const patched = im => {
      if (!PT) return im;
      const clean = fr[PT.src], o = off.getContext("2d"), p = pc.getContext("2d");
      o.drawImage(im, 0, 0, 1080, 1920);
      if (clean && clean.complete && clean.naturalWidth) {
        const sx = clean.naturalWidth / 1080;
        p.globalCompositeOperation = "source-over"; p.clearRect(0, 0, PT.w, PT.h);
        p.drawImage(clean, PT.x * sx, PT.y * sx, PT.w * sx, PT.h * sx, 0, 0, PT.w, PT.h);
        p.globalCompositeOperation = "destination-in"; p.drawImage(mk, 0, 0);
        o.drawImage(pc, PT.x, PT.y);
      }
      return off;
    };
    el(c, "shade");
    const dim = el(c, "dim");
    const hook = at(el(c, "hook", G.hook), null, 190);
    const caps = GROUPS.map(g => { const e = at(el(c, "cap", capHtml(g)), null, 1270); e.g = g; return e; });
    const emos = G.emo.map(([k, n, ch]) => { const e = at(el(c, "emo", ch), null, 880); e.t0 = tw(k, n, null); return e; }).filter(e => e.t0 != null);
    emos.forEach((e, i) => { e.t1 = Math.min(e.t0 + 1.3, emos[i + 1] ? emos[i + 1].t0 : 99); sfx("POP", e.t0, -11); });
    const CR = card(c), K = at(CR.e, null, 960), cupd = CR.upd;
    const endbg = el(c, "endbg");
    const lg = at(el(c, "logo", "Go<b>4</b>Driver"), null, 600);
    const sub = at(el(c, "sub", G.sub), null, 820);
    const btn = at(el(c, "btnl", G.cta), null, 1130);
    const url = at(el(c, "url", "go4driver.com"), null, 1340);
    const rw = word(G.rim[0], G.rim[1]); if (rw) sfx(FX + "rimshot.mp3", rw.e + .12, -7);
    const punches = G.punch.map(([k, n]) => tw(k, n, null)).filter(x => x != null);
    sfx("WH_SOFT", tCard - .25, -13); sfx("IMP_SOFT", tEnd - .05, -8); sfx("POP", tEnd + .35, -10);
    return (lt, t) => {
      // kamera: lekki oddech + uderzenia zoomem na puentach (twarz zostaje na miejscu)
      let z = 1.04 + .025 * Math.sin(t * .6);
      punches.forEach(p => { if (t >= p - .05 && t < p + 1.2) z += .16 * clamp((t - p + .05) / .1) * (1 - P(t, p + .9, p + 1.2)); });
      if (t >= tCard - .2) z = mix(z, 1.0, P(t, tCard - .2, tCard + .3));
      const cy = 230 * (z - 1);
      const vt = Math.min(t, VEND - .04), i = Math.min(fr.length - 1, Math.max(0, Math.round(vt * 30))), im = fr[i];
      if (im && im.complete && im.naturalWidth) { const w = 1080 * z, h = 1920 * z; ctx.drawImage(patched(im), (1080 - w) / 2, (1920 - h) / 2 + cy, w, h); }
      dim.style.opacity = t >= tCard ? .55 * P(t, tCard - .2, tCard + .3) : 0;
      const t2 = LS(keys[1]);
      if (t < t2) { pop(hook, t, -1, .8, 2.2, .55, "translateX(-50%)"); } else { hook.style.opacity = clamp(1 - (t - t2) / .2); hook.style.transform = "translateX(-50%)"; }
      caps.forEach(e => { if (t >= e.g.a && t < e.g.z && t < tCard) pop(e, t, e.g.a, .78, 3.2, .6); else e.style.opacity = 0; });
      emos.forEach(e => { if (t >= e.t0 && t < e.t1 && t < tCard) pop(e, t, e.t0, .3, 2.6, .45, `rotate(${Math.sin((t - e.t0) * 24) * 7}deg)`); else e.style.opacity = 0; });
      if (t >= tCard - .2 && t < tEnd) { rise(K, t, tCard - .2, 700, .45); cupd(t); } else K.style.opacity = 0;
      if (t >= tEnd) { endbg.style.opacity = clamp((t - tEnd) / .2); pop(lg, t, tEnd, .7, 2.4, .55); rise(sub, t, tEnd + .2, 40, .4); pop(btn, t, tEnd + .35, .7, 2.6, .5); rise(url, t, tEnd + .5, 30, .4); }
      else { endbg.style.opacity = 0; [lg, sub, btn, url].forEach(hide); }
    };
  }, { push: 0, cut: true });

})();
