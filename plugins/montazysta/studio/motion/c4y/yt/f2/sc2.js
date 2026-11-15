"use strict";
// Film 2 part 2 (46.4-112.2 s): way 2 (freelance editor), way 3 (full-time editor), way 4 (agency), way 5 (us: your time
// = 1 hour, no prices: the price list is on the site), payoff: the most expensive reel = the one you never posted.

punch(46.4, 49.25, 2, "Na zlecenie", "b1", "sposób", 5);

// ---------------------------------------------------------------- K. Płacisz za sztukę, ale montuje tylko to, co wyślesz / reszta na Twojej głowie
S(49.2, 58.9, (cam, e) => {
  const h1 = HX(e, "Montuje tylko to, [co wyślesz]", 150, 92, [W("b2", "ale"), W("b2", "montaż"), W("b2", "montuje"), W("b2", "tylko"), W("b2", "co"), W("b2", "wyślesz")]);
  const h2 = HX(e, "Reszta [na Twojej głowie]", 150, 96, [W("b3", "tematy"), W("b3", "na"), W("b3", "twojej"), W("b3", "głowie")]);
  const rc = receipt(cam, -520, -150, 480, "Montaż na zlecenie", [["Rolka 1", "za sztukę", W("b2", "płacisz"), ""], ["Rolka 2", "za sztukę", W("b2", "sztukę"), ""], ["Rolka 3", "za sztukę", W("b2", "sztukę") + .25, ""]]);
  const up = bcard(cam, 160, 60, 360, 300, `<span class="ic2" style="width:80px;height:80px">${IK.folder}</span><div style="font:900 30px var(--d);margin-top:10px">Twoje nagrania</div><div style="font:700 22px var(--b);color:#6b6b74">wysyłasz sam</div>`);
  Object.assign(up.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const ed = bcard(cam, 620, 60, 300, 300, `<span class="ic2" style="width:80px;height:80px">${IK.cut}</span><div style="font:900 30px var(--d);margin-top:10px">Montażysta</div>`);
  Object.assign(ed.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const fl = ctr(cam, "", `<span class="ic2" style="width:60px;height:60px">${IK.video}</span>`, 160, 60, 90, 90); Object.assign(fl.style, { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffd60a", border: "4px solid #111113", borderRadius: "18px" });
  // your head: the jobs that stay with you
  const head = bcard(cam, 0, 230, 260, 260, `<span class="ic2" style="width:130px;height:130px">${IK.user}</span>`); Object.assign(head.style, { display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" });
  const J = [["Tematy", IK.bulb, "tematy"], ["Nagrywanie", IK.video, "nagryw"], ["Publikacja", IK.up, "publik"]].map(([tt, i, w], k) => { const c = yp(cam, `${ico(i)}${tt}`, 0, 40 - k * 88, k % 2 ? "w" : ""); c.a = W("b3", w) - .1; c.k = k; sfx("POP", c.a, -24); return c; });
  const clk = yp(cam, `${ico(IK.clock)}najwięcej czasu`, 420, 250, "rd");
  const tW = W("b2", "wyślesz"), tT = W("b3", "tematy") - .15;
  sfx("WH_SOFT", tW - .3, -24);
  return (lt, t) => {
    h1.up(t, tT - .1); h2.up(t);
    const o1 = 1 - P(t, tT - .2, tT + .2, E.inCubic);
    rc.style.opacity = P(t, 49.25, 49.6) * o1; rc.up(t);
    up.style.opacity = P(t, W("b2", "montuje") - .2, W("b2", "montuje") + .2) * o1; ed.style.opacity = up.style.opacity;
    const m = P(t, tW - .3, tW + .4, ioe); fl.style.opacity = (m > 0 && m < 1 ? 1 : 0) * o1; fl.style.transform = `translateX(${m * 460}px) rotate(${m * 20}deg)`;
    inout(head, t, tT, 1e9, { pop: true }); J.forEach(c => inout(c, t, c.a, 1e9, { pop: true, base: `translateY(${Math.sin(t * 3 + c.k) * 4}px)` }));
    inout(clk, t, W("b3", "zabier") - .1, 1e9, { pop: true });
    const zh = P(t, tT - .1, tT + .8, ioe); camSet(cam, [mix(mix(-100, 60, P(t, 49.2, 58.9, ios)), 60, zh), mix(0, 90, zh), mix(1.0, 1.2, zh), 0, mix(-4, 4, P(t, 49.2, 58.9, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(58.85, 61.6, 3, "Etat", "c1", "sposób", 5);

// ---------------------------------------------------------------- M. 6-8 tys. zł / mies. + sprzęt, urlopy, ktoś musi mu mówić, co robić. Czyli Ty.
S(61.55, 70.5, (cam, e) => {
  const h1 = HX(e, "[6–8 tys. zł] miesięcznie", 150, 96, [W("c2", "sześć"), W("c2", "sześć"), W("c2", "ośmiu"), W("c2", "miesięcz")]);
  const h2 = HX(e, "Kto nim zarządza? [Ty.]", 150, 96, [W("c3", "ktoś"), W("c3", "kto"), W("c3", "musi"), W("c3", "czyli")]);
  const pay = bcard(cam, -420, 40, 660, 380, `<div style="font:800 26px var(--b);color:#6b6b74">Montażysta · etat</div><div class="num" style="white-space:nowrap;font:900 82px/1 var(--d);letter-spacing:-.04em;margin-top:14px"><span class="pv">0</span> zł</div><div style="font:700 24px var(--b);color:#6b6b74;margin-top:10px">miesięcznie z kosztami pracodawcy</div>`);
  Object.assign(pay.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }); const pv = pay.querySelector(".pv");
  const X = [["+ sprzęt", IK.video, "sprzęt"], ["+ urlopy", IK.cal, "urlopy"]].map(([tt, i, w], k) => { const c = yp(cam, `${ico(i)}${tt}`, 330, -60 + k * 110, "w"); c.a = W("c3", w) - .1; sfx("POP", c.a, -24); return c; });
  // org chart: Ty -> montażysta
  const ty = bcard(cam, 330, -60, 300, 170, `<div style="font:900 50px var(--d)">Ty</div><div style="font:700 22px var(--b);color:#6b6b74">szef od rolek</div>`, "y");
  const mo = bcard(cam, 330, 250, 300, 150, `<div style="font:900 34px var(--d)">Montażysta</div>`);
  [ty, mo].forEach(x => Object.assign(x.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }));
  const ln = ctr(cam, "", "", 330, 95, 6, 150); Object.assign(ln.style, { position: "absolute", background: "#111113" });
  const tK = W("c3", "ktoś") - .1, tY = W("c3", "czyli");
  sfx("RISER", 61.2, -27); sfx("WH_SOFT", tK, -23); sfx("IMP_SOFT", W("c3", "ty"), -20);
  return (lt, t) => {
    h1.up(t, tK - .1); h2.up(t);
    inout(pay, t, 61.6, 1e9, { pop: true }); const v = P(t, W("c2", "sześć") - .1, W("c2", "ośmiu") + .5, ioc);
    pv.textContent = t < W("c2", "ośmiu") ? sp(Math.min(6000, 6000 * v / .7)) : `6 000–${sp(mix(6000, 8000, P(t, W("c2", "ośmiu"), W("c2", "ośmiu") + .4, ioc)))}`;
    X.forEach(c => inout(c, t, c.a, tK - .1, { pop: true }));
    inout(mo, t, tK, 1e9, { pop: true }); ln.style.opacity = P(t, tK + .3, tK + .6); inout(ty, t, tY - .1, 1e9, { pop: true });
    camSet(cam, [mix(-80, 60, P(t, 61.55, 70.5, ios)), 0, mix(1.02, 1.0, P(t, 61.55, 70.5, ios)), 0, mix(3, -3, P(t, 61.55, 70.5, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(70.45, 73.3, 4, "Agencja", "d1", "sposób", 5);

// ---------------------------------------------------------------- O. Pakiet (posty, raporty, spotkania) -> 4 rolki = 1 200-3 000 zł -> 30 rolek = kilkanaście tys.
S(73.25, 86.45, (cam, e) => {
  const h1 = HX(e, "Rolki w [pakiecie]", 150, 100, [W("d2", "rolki"), W("d2", "w"), W("d2", "pakiec")]);
  const h2 = HX(e, "[4 rolki]: 1 200–3 000 zł", 150, 96, [W("d3", "cztery"), W("d3", "cztery"), W("d3", "tysiąca"), W("d3", "trzech")]);
  const h3 = HX(e, "30 rolek: [kilkanaście tysięcy]", 150, 92, [W("d4", "trzydzie"), W("d4", "rolkach"), W("d4", "kilkana"), W("d4", "tysięcy")]);
  const box = bcard(cam, 0, 160, 440, 300, `<div style="font:900 50px var(--d)">PAKIET</div><div style="font:700 24px var(--b);color:#6b6b74">agencja marketingowa</div>`, "y"); Object.assign(box.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const IT = [["Posty", IK.img, "postami", -520, -60], ["Raporty", IK.doc, "raport", -170, -170], ["Spotkania", IK.cal, "spotkan", 180, -170], ["Rolki", IK.phone, "rolki", 520, -60]].map(([tt, i, w, x, y], k) => {
    const c = yp(cam, `${ico(i)}${tt}`, x, y, k === 3 ? "" : "w"); c.a = k === 3 ? 73.35 : W("d2", w) - .1; c.x = x; c.y = y; c.k = k; sfx("POP", c.a, -24); return c; });
  const rc = receipt(cam, -360, -150, 560, "Agencja: 4 rolki", [["Rolka × 4", "", W("d3", "cztery"), ""], ["Cena", "1 200–3 000 zł", W("d3", "tysiąca"), "#e5383b"]]);
  const mul = bcard(cam, 380, 30, 560, 360, `<div style="font:800 26px var(--b);color:#6b6b74">30 rolek w miesiącu</div><div class="num" style="font:900 110px/1 var(--d);letter-spacing:-.04em;margin-top:10px">× 7,5</div><div style="font:900 44px var(--d);margin-top:14px;background:#fde6e6;color:#e5383b;border-radius:12px;padding:4px 14px">kilkanaście tys. zł</div>`);
  Object.assign(mul.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const tC = W("d3", "w", 0) - .15, tM = W("d4", "przy") - .1;
  sfx("WH_SOFT", tC, -23); sfx("IMP_BASS", W("d4", "kilkana"), -23);
  return (lt, t) => {
    h1.up(t, tC); h2.up(t, tM - .1); h3.up(t);
    const o1 = 1 - P(t, tC - .1, tC + .3, E.inCubic);
    box.style.opacity = P(t, 73.3, 73.6) * o1; IT.forEach(c => inout(c, t, c.a, tC - .1, { pop: true, base: drift(t, c.k, 4) }));
    if (t < 73.3 + .5) IT[3].style.transform += ` scale(${1 + .3 * Math.sin(P(t, 73.35, 73.8) * Math.PI)})`;
    rc.style.opacity = P(t, tC, tC + .3); rc.up(t); rc.style.transform = `scale(${mix(1, .9, P(t, tM, tM + .5, ioe))})`;
    inout(mul, t, tM, 1e9, { pop: true });
    camSet(cam, [mix(0, 60, P(t, tC, 86.4, ios)), 0, mix(1.18, 1.0, P(t, tC - .2, tC + .6, ioe)), 0, mix(-3, 3, P(t, 73.25, 86.4, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(86.4, 89.15, 5, "Clips4you", "m1", "sposób", 5);

// ---------------------------------------------------------------- Q. Twój czas: 1 h (vs 30-60 h) -> 30 rolek, codziennie -> bez etatu, sprzętu, umowy; cennik na stronie
S(89.1, 99.2, (cam, e) => {
  const h1 = HX(e, "Twój czas: [1 godzina]", 150, 100, [W("m2", "jedna"), W("m2", "czasu"), W("m2", "jedna"), W("m2", "godzina")]);
  const h2 = HX(e, "Bez etatu. Bez sprzętu. [Bez umowy.]", 150, 88, [W("m3", "bez", 0), W("m3", "etatu"), W("m3", "bez", 1), W("m3", "sprzęt"), W("m3", "bez", 2), W("m3", "umowy")]);
  const ch = bcard(cam, -380, 60, 620, 520, `<div style="position:absolute;left:30px;top:24px;font:900 32px var(--d)">Twój czas w miesiącu</div>`); ch.style.display = "block";
  const B1 = at(ch, "ab", "", 110, 110, 150, 340), B2 = at(ch, "ab", "", 360, 440, 150, 10), T1 = at(ch, "ab", "30–60 h", 90, 64, 190, 40), T2 = at(ch, "ab", "1 h", 340, 394, 190, 40);
  [T1, T2].forEach(x => Object.assign(x.style, { textAlign: "center", font: "900 32px var(--d)" }));
  Object.assign(B1.style, { background: "#fde6e6", border: "4px solid #e5383b", borderRadius: "12px 12px 0 0", transformOrigin: "50% 100%" }); Object.assign(B2.style, { background: "#ffd60a", border: "4px solid #111113", borderRadius: "8px 8px 0 0" });
  const l1 = at(ch, "ab", "Sam", 110, 462, 150, 40), l2 = at(ch, "ab", "Clips4you", 340, 462, 190, 40); [l1, l2].forEach(x => Object.assign(x.style, { textAlign: "center", font: "800 24px var(--b)" }));
  const R = [["30 rolek", IK.phone, "trzydzie"], ["Publikacja codziennie", IK.cal, "publik"]].map(([tt, i, w], k) => { const c = yp(cam, `${ico(i)}${tt}`, 380, -40 + k * 120, ""); c.a = W("m2", w) - .1; sfx("POP", c.a, -24); return c; });
  const N = [["etat", "etatu"], ["sprzęt", "sprzęt"], ["umowa na rok", "umowy"]].map(([tt, w], k) => { const c = yp(cam, `${ico(IK.x, "#e5383b")}<s>${tt}</s>`, 380, -120 + k * 110, "w"); c.a = W("m3", w) - .1; sfx("CLICK", c.a, -24); return c; });
  const site = bcard(cam, 380, 250, 520, 120, `<span class="ic2" style="width:44px;height:44px">${IK.money}</span><div style="font:900 34px var(--d)">Cennik: clips4you.pl</div>`, "y"); Object.assign(site.style, { display: "flex", alignItems: "center", justifyContent: "center", gap: "18px" });
  const tB = W("m3", "bez", 0) - .15;
  sfx("IMP_SOFT", W("m2", "godzina"), -22); sfx("POP", W("m3", "cennik"), -22);
  return (lt, t) => {
    h1.up(t, tB - .1); h2.up(t);
    const g = P(t, 89.15, 89.6); ch.style.opacity = g; B1.style.transform = `scaleY(${P(t, 89.3, 89.9, ioe)})`; B2.style.opacity = P(t, W("m2", "godzina") - .1, W("m2", "godzina") + .2); T2.style.opacity = B2.style.opacity; T1.style.opacity = P(t, 89.5, 89.9);
    R.forEach(c => inout(c, t, c.a, tB - .1, { pop: true })); N.forEach(c => inout(c, t, c.a, 1e9, { pop: true }));
    inout(site, t, W("m3", "cennik") - .1, 1e9, { pop: true });
    camSet(cam, [mix(-60, 60, P(t, 89.1, 99.2, ios)), 0, mix(1.02, 1.0, P(t, 89.1, 99.2, ios)), 0, mix(-3, 3, P(t, 89.1, 99.2, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- S. PAYOFF: najdroższa rolka = ta, której nie wrzuciłeś -> klient dzwoni do konkurencji -> strata poza fakturą
S(99.15, 112.4, (cam, e) => {
  const h1 = HX(e, "Która rolka [kosztuje najwięcej]?", 150, 90, [W("q1", "która"), W("q1", "rolka"), W("q1", "kosztuje"), W("q1", "najwię")]);
  const h3 = HX(e, "Klient dzwoni [do konkurencji]", 150, 92, [W("q3", "klient"), W("q3", "zadzwon"), W("q3", "do"), W("q3", "firmy")]);
  const h4 = HX(e, "Tej straty [nie ma na fakturze]", 150, 92, [W("q4", "tej"), W("q4", "straty"), W("q4", "nie"), W("q4", "zobaczysz"), W("q4", "na", 0), W("q4", "fakturze")]);
  const G = step4(cam, 0, 90, 360, 460, "", "Najdroższa rolka", { gold: true, back: `<div style="font:900 150px/1 var(--d);color:#ffd60a">?</div>` }); const q = el(G.fr, "div", "", "?"); Object.assign(q.style, { font: "900 150px/1 var(--d)" });
  const lk = G.querySelector(".lk"); lk.style.cssText = "width:90px;height:90px"; G.querySelector(".t").style.fontSize = "34px";
  const tU = W("q1", "odpow"), tF = W("q1", "która") + .1, tA = LS("q2") - .15;
  // ink: "Ta, której nie wrzuciłeś." + a ghost (empty dashed) reel
  const ink = el(e, "div", "ab"); Object.assign(ink.style, { inset: 0, background: "#111113", opacity: 0 });
  const ans = HX(ink, "Ta, której [nie wrzuciłeś.]", 300, 110, wt("q2"), { cls: "", color: "#fff" });
  const ghost = ctr(ink, "", `<div style="font:900 30px var(--d);color:rgba(255,255,255,.45)">0 wyświetleń</div>`, 960, 700, 250, 380); Object.assign(ghost.style, { position: "absolute", border: "6px dashed rgba(255,255,255,.35)", borderRadius: "34px", display: "flex", alignItems: "center", justifyContent: "center" });
  // q3: the client's call goes to the competitor
  const cl = bcard(cam, -560, 100, 300, 300, `<span class="ic2" style="width:100px;height:100px">${IK.user}</span><div style="font:900 32px var(--d);margin-top:10px">Klient</div>`); Object.assign(cl.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const you = bcard(cam, 380, -60, 420, 180, `<div style="font:900 36px var(--d)">Twoja firma</div><div style="font:700 22px var(--b);color:#6b6b74">0 rolek w tym miesiącu</div>`); Object.assign(you.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: .5 });
  const comp = bcard(cam, 380, 250, 420, 180, `<div style="font:900 36px var(--d)">Konkurencja</div><div style="font:700 22px var(--b);color:#6b6b74">rolka wczoraj na Instagramie</div>`, "y"); Object.assign(comp.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const call = ctr(cam, "", `<span class="ic2" style="width:60px;height:60px">${IK.call}</span>`, -560, 100, 110, 110); Object.assign(call.style, { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", background: "#1f9d55", color: "#fff", borderRadius: "50%", border: "4px solid #111113" });
  const inv = receipt(cam, 0, -120, 620, "Faktura", [["Rolki", "—", W("q4", "straty"), ""], ["Utracony klient", "", W("q4", "fakturze") - .3, ""]]);
  const st = ctr(cam, "stamp4", "niewidoczna strata", 0, 250, 560, 100);
  const tC = W("q3", "zadzwon") - .1, tI = LS("q4") - .15;
  sfx("CLICK", tU, -20); sfx("WH_SWING", tF + .2, -21); sfx("IMP_BASS", tA + .1, -23); sfx("WH_SOFT", LS("q3") - .1, -22); sfx("CLICK", tC, -22); sfx("IMP_SOFT", W("q4", "fakturze"), -20);
  return (lt, t) => {
    h1.up(t, tA); h3.up(t, tI - .1); h4.up(t);
    const g = spring(t - 99.2, 1.6, .6), open = P(t, tU, tU + .3); lk.innerHTML = open > .5 ? IK.unlock : IK.lock; lk.style.transform = `translateY(${-open * 16}px) rotate(${open * -14}deg)`;
    const f = P(t, tF, tF + .6, ioe), gOut = 1 - P(t, LS("q3") - .2, LS("q3"));
    G.style.transform = `scale(${Math.min(1, g) * (1 + f * .1)}) rotateY(${f * 180}deg)`; G.style.opacity = clamp((t - 99.2) / .15) * gOut;
    const ib = P(t, tA - .1, tA + .3, ioe) * (1 - P(t, LS("q3") - .2, LS("q3") + .1)); ink.style.opacity = ib; ans.up(t); ghost.style.transform = `rotate(${Math.sin(t * 2) * 2}deg)`;
    const o3 = P(t, LS("q3") - .1, LS("q3") + .3) * (1 - P(t, tI - .2, tI + .2, E.inCubic)); [cl, comp].forEach(x => { x.style.opacity = o3; }); you.style.opacity = o3 * .5;
    const m = P(t, tC, tC + .7, ioe); call.style.opacity = o3 * (t > tC - .1 ? 1 : 0); call.style.transform = `translate(${m * 940}px, ${m * 150}px) rotate(${Math.sin(t * 30) * 10 * (1 - m)}deg)`;
    comp.style.boxShadow = t > tC + .7 ? `0 0 0 ${6 + 4 * Math.sin(t * 12)}px #1f9d55, 12px 12px 0 #111113` : "";
    inv.style.opacity = P(t, tI, tI + .3); inv.up(t); stampIn(st, t, W("q4", "fakturze") + .1, -6); if (t < W("q4", "fakturze") + .1) st.style.opacity = 0;
    camSet(cam, [0, 0, mix(1.04, 1.0, P(t, 99.15, 112.4, ios)), 0, mix(-4, 4, P(t, 99.15, 112.4, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });
