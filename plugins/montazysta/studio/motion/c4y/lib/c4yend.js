"use strict";
// c4yend.js — the shared ending of every Clips4you film (lines e1..e6, voiced once in yt/f1/vo/my): kim jesteśmy (7 lat,
// 150+ firm) -> the wall of our reels -> the month offer + guarantee + 5 firms -> the real site, the CTA click, the logo.
// NEVER prices (user 2026-09-30): the site screenshot is cropped above the price line.
(() => {
  const E1 = LS("e1"), E2 = LS("e2"), E3 = LS("e3"), E6 = LS("e6"), END = DUR;
  const WALL = ["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12", "c02", "c03", "c04", "c05", "c13", "c14", "c15", "c16", "c17"];

  // ---------------------------------------------------------------- kim jesteśmy: logo + 7 lat + 150+ firm
  S(E1 - .25, E2 - .05, (cam, e) => {
    const h = HX(e, "Nowa marka. [Doświadczony zespół.]", 130, 90, [W("e1", "clips"), W("e1", "nowa"), W("e1", "ale"), W("e1", "nowi"), W("e1", "ludzie")]);
    const lg = logo4(cam, 0, -40, 110); const nb4 = yp(cam, "nowa marka, 2026", 0, 70, "w sm");
    const A = bcard(cam, -330, 230, 520, 290, `<div style="font:900 130px/1 var(--d);letter-spacing:-.05em"><span class="num a">0</span>+ lat</div><div style="font:700 28px var(--b);color:#6b6b74;margin-top:8px;text-align:center">doświadczenia zespołu<br>w reklamie internetowej</div>`);
    const B = bcard(cam, 330, 230, 520, 290, `<div style="font:900 130px/1 var(--d);letter-spacing:-.05em"><span class="num b">0</span>+</div><div style="font:700 28px var(--b);color:#6b6b74;margin-top:8px;text-align:center">firm, dla których<br>zespół robił reklamy</div>`);
    [A, B].forEach(x => Object.assign(x.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }));
    const a = A.querySelector(".a"), b = B.querySelector(".b"), t7 = W("e1", "siedm"), t150 = W("e1", "stu");
    sfx("IMP_SOFT", E1 + .1, -21); sfx("POP", t7, -22); sfx("POP", t150, -22);
    return (lt, t) => {
      h.up(t);
      const l = P(t, E1 - .2, E1 + .5, ioe), up = P(t, t7 - .4, t7 + .2, ioe); lg.style.opacity = l; lg.style.transform = `translateY(${-up * 90}px) scale(${mix(1.25, .9, up)})`; inout(nb4, t, W("e1", "nowa") - .1, t7 - .3, { pop: true });
      inout(A, t, t7 - .15, 1e9, { pop: true }); inout(B, t, t150 - .15, 1e9, { pop: true });
      cnt(a, 7, t, t7 - .1, t7 + .5); cnt(b, 150, t, t150 - .1, t150 + .9);
      camSet(cam, [0, 0, mix(1.04, .98, P(t, E1, E2, ios)), 0, mix(-4, 4, P(t, E1, E2, ios))]);
    };
  }, { light: true, inD: .35, outD: .4 });

  // ---------------------------------------------------------------- te rolki zrobiliśmy my: the wall (3 rows scrolling, like the site)
  S(E2 - .1, E3 - .05, (cam, e) => {
    const h = HX(e, "Tak mogą wyglądać [Twoje rolki]", 130, 92, [W("e2", "tak"), W("e2", "mogą"), W("e2", "wygląd"), W("e2", "twoje"), W("e2", "rolki")]);
    const rows = [0, 1].map(r => { const g = el(cam, "div", "ab"); g.ph = [...Array(13)].map((_, i) => { const p = phone4(g, (i - 6) * 340, -200, 250, WALL[(i + r * 3) % WALL.length]); p.k = i; return p; }); g.r = r; return g; });
    return (lt, t) => {
      h.up(t);
      rows.forEach(g => { g.style.transform = `translate(${(g.r ? -1 : 1) * (lt * 120) + (g.r ? 80 : -160)}px, ${[90, 450][g.r]}px) scale(.75)`; g.ph.forEach(p => p.draw(lt + p.k * .5 + g.r)); });
      camSet(cam, [0, 0, 1, 8, mix(-6, 6, P(t, E2, E3, E.lin))]);
    };
  }, { light: true, inD: .3, outD: .4 });

  // ---------------------------------------------------------------- the month with us + guarantee + 5 firms a month (one card, the camera moves over it)
  S(E3 - .15, E6 - .1, (cam, e) => {
    const h1 = HX(e, "Miesiąc z [Clips4you]", 120, 90, [W("e3", "tak"), W("e3", "miesiąc")]);
    const h2 = HX(e, "[Gwarancja]", 120, 96, [W("e4", "jeśli")]);
    const h3 = HX(e, "Najwyżej [5 nowych firm] w miesiącu", 120, 84, [W("e5", "bierzemy"), W("e5", "najwy"), W("e5", "pięć"), W("e5", "nowych"), W("e5", "firm"), W("e5", "miesiąc")]);
    const card = bcard(cam, -250, 110, 820, 600, `<div style="position:absolute;left:40px;top:34px;display:flex;align-items:center;gap:18px"><div class="logo4" style="position:relative;font-size:44px"><i>${STAR()}</i>Clips4you</div></div>
      <div style="position:absolute;right:40px;top:44px;font:800 26px var(--b);color:#6b6b74">1 miesiąc</div>`); card.style.display = "block";
    const L = [["1 godzina rozmowy", IK.video, W("e3", "jedna")], ["30 rolek", IK.phone, W("e3", "trzydzie")], ["Publikacja codziennie", IK.cal, W("e3", "publik")]].map(([tx, i, a], k) => {
      const r = at(card, "ab", `<span class="ic2" style="width:54px;height:54px;flex:none">${i}</span><span style="flex:1">${tx}</span><span class="ic2 ck" style="width:50px;height:50px;color:#1f9d55">${IK.check}</span>`, 40, 150 + k * 110, 740, 90);
      Object.assign(r.style, { display: "flex", alignItems: "center", gap: "24px", font: "900 44px var(--d)", letterSpacing: "-.02em", borderBottom: "3px dashed #e2dfd4" }); r.a = a - .1; r.k = k; sfx("CLICK", a, -23); return r; });
    const st = ctr(cam, "stamp4 gr", "30 rolek albo<br>następny miesiąc gratis", 500, -30, 560, 150); const tG = W("e4", "darmo") - .1;
    const nb = yp(cam, `${ico(IK.x, "#e5383b")}Bez umowy na rok`, 500, 200, "w"); const tB = W("e4", "bez");
    const slots = [0, 1, 2, 3, 4].map(i => { const s = ctr(cam, "", `<span class="ic2" style="width:44px;height:44px">${IK.building}</span>`, -560 + i * 150, 520, 120, 120);
      Object.assign(s.style, { position: "absolute", borderRadius: "26px", border: "4px dashed #111113", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }); s.k = i; return s; });
    const f1 = yp(cam, `${ico(IK.check)}firma już działa`, 500, 470, "gr"), f2 = yp(cam, `${ico(IK.check)}ma klientów`, 500, 570, "gr");
    const t5 = W("e5", "pięć");
    sfx("IMP_BASS", tG + .05, -22); sfx("CLICK", tB, -22); slots.forEach(s => sfx("POP", t5 + s.k * .1, -25)); sfx("POP", W("e5", "działa"), -22); sfx("POP", W("e5", "klient"), -22);
    return (lt, t) => {
      h1.up(t, W("e4", "jeśli") - .3); h2.up(t, W("e5", "bierz") - .3); h3.up(t);
      inout(card, t, E3 - .1, 1e9, { pop: true });
      L.forEach(r => { const u = P(t, r.a, r.a + .4, oc); r.style.opacity = u; r.style.transform = `translateX(${(1 - u) * -60}px)`; r.querySelector(".ck").style.transform = `scale(${t < r.a + .3 ? 0 : Math.min(1.1, spring(t - r.a - .3, 2.4, .5))})`; });
      stampIn(st, t, tG, -7); if (t < tG) st.style.opacity = 0;
      inout(nb, t, tB - .1, 1e9, { pop: true });
      slots.forEach(s => inout(s, t, t5 + s.k * .1, 1e9, { pop: true }));
      inout(f1, t, W("e5", "działa") - .1, 1e9, { pop: true }); inout(f2, t, W("e5", "klient") - .1, 1e9, { pop: true });
      const k = P(t, t5 - .5, t5 + .4, ioe);
      camSet(cam, [mix(mix(-120, 60, P(t, W("e4", "jeśli") - .3, W("e4", "jeśli") + .6, ioe)), -60, k), mix(0, 170, k), mix(1.0, .9, k), 0, mix(-3, 3, P(t, E3, E6, ios))]);
    };
  }, { light: true, inD: .35, outD: .45 });

  // ---------------------------------------------------------------- CTA: the real site, the URL, the click -> logo + clips4you.pl
  S(E6 - .15, END + 1, (cam, e) => {
    const h = HX(e, "Zobacz, jakie rolki zrobilibyśmy [dla Ciebie]", 110, 76, [W("e6", "chcesz"), W("e6", "zobacz"), W("e6", "jakie"), W("e6", "rolki"), W("e6", "zrobil"), W("e6", "dla"), W("e6", "twojej")]);
    // site screenshot 1440x900, cropped to y < 760 (above the price line: prices never in films)
    const SW = 1300, sc = SW / 1440, SH = 760 * sc;
    const wn = ctr(cam, "wn", `<div class="tb4"><i></i><i></i><i></i><div class="u"><span class="url"></span></div></div><div class="bd4"><img src="../img/site_hero.png" style="position:absolute;left:0;top:0;width:${SW}px"></div>`, 0, 110, SW, SH + 52);
    const url = wn.querySelector(".url");
    const cur = cursor4(wn.querySelector(".bd4")), bx = 310 * sc, by = 682 * sc, r = rip4(wn.querySelector(".bd4"), bx, by);
    const fin = el(e, "div", "ab"); Object.assign(fin.style, { inset: 0, background: "#fbfaf6", opacity: 0 });
    const lg = logo4(fin, 960, 430, 120);
    const u2 = el(fin, "div", "hx", "clips4you.pl"); Object.assign(u2.style, { top: "560px", fontSize: "64px" });
    const ctaB = yp(fin, `Umów 15 minut rozmowy →`, 960, 720, ""); ctaB.style.fontSize = "40px"; ctaB.style.height = "92px";
    const tU = W("e6", "wejdź"), tC = W("e6", "umów"), tEnd = W("e6", "rozmowy") + .5;
    sfx("WH_SOFT", E6 - .1, -22); sfx("CLICK", tC + .45, -18); sfx("IMP_SOFT", tEnd, -20);
    return (lt, t) => {
      h.up(t, tEnd - .3);
      const w = P(t, E6 - .1, E6 + .5, ioe); wn.style.opacity = w; wn.style.transform = `translateY(${(1 - w) * 120}px) rotateX(${(1 - w) * 14}deg)`;
      const typed = "clips4you.pl", n = Math.floor(clamp((t - tU + .1) * 14, 0, typed.length)); url.textContent = t < tU - .1 ? "" : typed.slice(0, n) + (n < typed.length && Math.floor(t * 3) % 2 ? "|" : "");
      wn.querySelector(".u").style.background = t > tU + .8 && t < tC ? "#ffd60a" : "#fff";
      curAt(cur, t, [[0, 0, bx + 300, by - 250, 0], [tC - .6, .01, bx + 300, by - 250, 1], [tC - .55, .8, bx, by, 1]]); r(t, tC + .45);
      const f = P(t, tEnd, tEnd + .5, ioe); fin.style.opacity = f;
      lg.style.transform = `scale(${mix(.8, 1, f)})`; u2.style.opacity = P(t, tEnd + .2, tEnd + .5); inout(ctaB, t, tEnd + .35, 1e9, { pop: true });
      camSet(cam, [0, mix(0, 60, P(t, tU, tC + .6, ioe)), mix(.96, 1.1, P(t, tU, tC + .6, ioe)), mix(4, 0, w), 0]);
    };
  }, { light: true, inD: .35, outD: 0 });
})();
