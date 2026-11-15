"use strict";
// Film 3 part 2 (50.9-89.2 s): step 3 (a need: he remembers your face, picks the one he has seen), step 4 (checks your
// profile: 3 months ago -> competitor, this week -> calls), payoff (5 reels and they quit before he remembers) -> 30 a month.
punch(50.85, 53.35, 3, "Potrzebuje", "c1");

// ---------------------------------------------------------------- J. potrzebuje kogoś takiego jak Ty -> przypomina sobie twarz -> wybiera tego, kogo widział
S(53.3, 64.75, (cam, e) => {
  const h1 = HX(e, "Potrzebuje kogoś [takiego jak Ty]", 150, 90, [W("c2", "potrzeb"), W("c2", "kogoś"), W("c2", "takiego"), W("c2", "jak"), W("c2", "ty")]);
  const h2 = HX(e, "Przypomina sobie [Twoją twarz]", 150, 90, [W("c3", "przypom"), W("c3", "sobie"), W("c3", "twarz"), W("c3", "twarz")]);
  const h3 = HX(e, "Wybiera tego, [kogo widział]", 150, 96, [W("c3", "wybieraj", 0), W("c3", "tego"), W("c3", "którego"), W("c3", "widzieli")]);
  const nt = note4(cam, IK.bell, "Trzeba to załatwić", "Szukam kogoś sprawdzonego…", -280, -60, "dziś");
  const think = bcard(cam, 0, 120, 420, 420, "", "soft"); think.style.borderRadius = "50%"; const mem = phone4(think, 210, 210, 180, "c09"); const tg4 = yp(think, "Twoja Firma", 210, 395, "sm");
  const A = bcard(cam, -330, 110, 520, 330, `<div style="font:900 40px var(--d)">Firma A</div><div style="font:800 30px var(--b);margin-top:8px">★ 4,9</div><div style="font:700 26px var(--b);color:#6b6b74;margin-top:14px">widziana: 0 razy</div>`);
  const B = bcard(cam, 330, 110, 520, 330, `<div style="font:900 40px var(--d)">Twoja Firma</div><div style="font:800 30px var(--b);margin-top:8px">★ 4,6</div><div style="font:800 26px var(--b);color:#1f9d55;margin-top:14px">widziana: 12 razy</div>`, "y");
  [A, B].forEach(x => Object.assign(x.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }));
  const cur = cursor4(cam), r = rip4(cam, 330, 110);
  const tR = W("c3", "przypom") - .1, tK = W("c3", "klienci") - .1, tC = W("c3", "widzieli");
  sfx("CLICK", 53.5, -24); sfx("WH_SOFT", tR, -22); sfx("WH_SOFT", tK, -22); sfx("CLICK", tC + .2, -20);
  return (lt, t) => {
    h1.up(t, tR - .2); h2.up(t, tK - .2); h3.up(t);
    inout(nt, t, 53.45, tR - .1, { pop: true });
    const th = P(t, tR - .1, tR + .5, ioe) * (1 - P(t, tK - .2, tK + .1)); think.style.opacity = th; think.style.transform = `scale(${.6 + .4 * th})`; mem.draw(lt);
    inout(A, t, tK, 1e9, { pop: true }); inout(B, t, tK + .15, 1e9, { pop: true });
    curAt(cur, t, [[0, 0, -40, 380, 0], [tK + .5, .01, -40, 380, 1], [W("c3", "tego") - .3, .9, 330, 110, 1]]); r(t, tC + .2);
    if (t > tC + .2) B.style.boxShadow = `0 0 0 ${6 + 4 * Math.sin(t * 10)}px #1f9d55, 12px 12px 0 #111113`;
    camSet(cam, [mix(0, 40, P(t, tK, 64.7, ios)), mix(-15, 0, P(t, tR - .3, tR + .5, ioe)), mix(1.45, 1.0, P(t, tR - .3, tR + .5, ioe)), 0, mix(3, -3, P(t, 53.3, 64.7, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(64.95, 67.45, 4, "Sprawdza profil", "d1");

// ---------------------------------------------------------------- K. ostatnia rolka 3 miesiące temu -> konkurencja | rolki z tego tygodnia -> dzwoni
S(67.4, 73.4, (cam, e) => {
  const h1 = HX(e, "Ostatnia rolka: |3 miesiące temu|", 150, 90, [W("d2", "ostatnia"), W("d2", "rolka"), W("d2", "trzech"), W("d2", "miesięcy"), W("d2", "miesięcy")]);
  const h2 = HX(e, "Rolki z tego tygodnia? [Dzwoni.]", 150, 90, [W("d3", "rolki"), W("d3", "z"), W("d3", "tego"), W("d3", "tygodnia"), W("d3", "dzwoni")]);
  const L = prof4(cam, -420, 110, 480, { name: "Firma bez rolek", posts: 4, fol: "320", rows: 2, ar: 1.1 });
  L.cells.forEach((c, i) => { if (i < 3) { L.put(i, rclip(i + 5), 20); c.style.filter = "grayscale(1)"; } else { c.style.background = "transparent"; c.style.border = "3px dashed #d6d2c6"; } });
  const old = yp(cam, "ostatnia: 3 mies. temu", -420, -230, "rd sm"), back = yp(cam, "← wraca do konkurencji", -420, 440, "w sm");
  const R = prof4(cam, 420, 110, 480, { name: "Twoja Firma", posts: 64, fol: "2 310", rows: 2, ar: 1.1 });
  R.cells.forEach((c, i) => R.put(i, rclip(i), 30 + i * 11));
  const fresh = yp(cam, "rolki z tego tygodnia", 420, -230, "gr sm"); const rp = ringPhone(cam, 700, 170, 170, "Nowy klient"); rp.style.opacity = 0;
  const tW = W("d2", "wraca") - .1, tD = W("d3", "dzwoni");
  sfx("WH_SWING", tW, -22); sfx("POP", tD, -20);
  return (lt, t) => {
    h1.up(t, W("d3", "rolki") - .3); h2.up(t);
    L.style.opacity = P(t, 67.45, 67.8) * mix(1, .45, P(t, W("d3", "rolki") - .2, W("d3", "rolki") + .3)); inout(old, t, W("d2", "trzech") - .1, 1e9, { pop: true }); inout(back, t, tW, 1e9, { pop: true });
    const r = P(t, W("d3", "rolki") - .3, W("d3", "rolki") + .2, ioe); R.style.opacity = r; R.style.transform = `translateX(${(1 - r) * 200}px)`; inout(fresh, t, W("d3", "tygodnia") - .1, 1e9, { pop: true });
    rp.style.opacity = P(t, tD - .1, tD + .15); rp.ring(t, t > tD - .1 ? 1 : 0);
    camSet(cam, [mix(-200, 200, P(t, W("d3", "rolki") - .5, W("d3", "rolki") + .6, ioe)), 0, 1.05, 0, mix(4, -4, P(t, 67.4, 73.4, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- L. PAYOFF: 5 rolek, 0 telefonów, stop -> klient zapomina
S(73.35, 81.8, (cam, e) => {
  const h1 = HX(e, "Dlaczego firmy [się] [poddają]?", 150, 92, [W("q1", "dlaczego"), W("q1", "więc"), W("q1", "firmy"), W("q1", "się"), W("q1", "poddają")]);
  const h2 = HX(e, "Po 5 rolkach. [Za wcześnie.]", 150, 96, [W("q2", "wrzucają"), W("q2", "pięć"), W("q2", "rolek"), W("q2", "zanim"), W("q2", "klient")]);
  const rd = road(cam); rd.draw(1); [rd.start, rd.end, ...rd.pins].forEach(x => { x.style.opacity = .25; }); rd.style.opacity = 0;
  const lk = rd.gap; const tU = W("q1", "firmy");
  const five = [0, 1, 2, 3, 4].map(k => { const p = phone4(cam, -600 + k * 190, 60, 170, rclip(k + 2)); p.k = k; p.a = W("q2", "pięć") + k * .09; sfx("POP", p.a, -26); return p; });
  const zero = yp(cam, `${ico(IK.call)}0 połączeń`, 420, -40, "rd"), stop = ctr(cam, "stamp4", "stop", 420, 90, 200, 90);
  const mm = memMeter(cam, 0, 380, 700); mm.style.opacity = 0;
  const tS = W("q2", "przest") - .1, tZ = W("q2", "zanim") - .1;
  sfx("CLICK", tU, -22); sfx("IMP_SOFT", tS, -21); sfx("WH_SOFT", tZ, -23);
  return (lt, t) => {
    h1.up(t, W("q2", "wrzucają") - .3); h2.up(t);
    const g = P(t, 73.4, 73.9) * (1 - P(t, W("q2", "wrzucają") - .3, W("q2", "wrzucają"))); rd.style.opacity = g;
    lk.style.opacity = g; lk.querySelector(".lk").innerHTML = t > tU ? IK.unlock : IK.lock; lk.style.transform = `scale(${1 + .3 * Math.sin(P(t, tU, tU + .4) * Math.PI)})`;
    const on2 = P(t, W("q2", "wrzucają") - .2, W("q2", "wrzucają") + .2);
    five.forEach(p => { inout(p, t, p.a, 1e9, { pop: true }); p.style.opacity = +p.style.opacity * on2; p.draw(t < tS ? lt + p.k : 0); p.style.filter = t > tS ? `grayscale(${P(t, tS, tS + .6)})` : ""; });
    inout(zero, t, W("q2", "telefon") - .1, 1e9, { pop: true }); stampIn(stop, t, tS, -8); if (t < tS) stop.style.opacity = 0;
    mm.style.opacity = on2; mm.set(Math.max(0, .3 * P(t, five[0].a, five[4].a + .3) - .3 * P(t, tZ, tZ + 1.6, ioc)));
    camSet(cam, [0, mix(0, 60, on2), mix(1.0, .95, on2), 0, mix(-3, 3, P(t, 73.35, 81.8, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- M. Dlatego 30 rolek w miesiącu, codziennie -> klient zdąży Cię zapamiętać (meter 100%, phone rings)
S(81.75, 89.3, (cam, e) => {
  const h1 = HX(e, "Dlatego: [30 rolek], [codziennie]", 150, 92, [W("q3", "dlatego"), W("q3", "trzydzie"), W("q3", "rolek"), W("q3", "codzien")]);
  const h2 = HX(e, "Żeby klient [Cię zapamiętał]", 150, 92, [W("q3", "tak"), W("q3", "klient"), W("q3", "cię"), W("q3", "zapam")]);
  const cal = cal4(cam, -300, 60, 860, { title: "Twój miesiąc", sub: "30 rolek", ratio: .6 }); cal.days.forEach((d, i) => cal.fill(i, rclip(i), 15 + (i * 17) % 140));
  const mm = memMeter(cam, 420, -60, 560), rp = ringPhone(cam, 470, 250, 170, "Nowy klient"); rp.style.opacity = 0;
  const t0 = W("q3", "trzydzie") - .1, t1 = W("q3", "codzien") + .4, tZ = W("q3", "zapam");
  sfx("RISER", t0, -26); sfx("IMP_SOFT", tZ + .2, -20);
  return (lt, t) => {
    h1.up(t, W("q3", "tak") - .3); h2.up(t);
    cal.style.opacity = P(t, 81.8, 82.2); cal.days.forEach((d, i) => cal.pop(i, t, t0 + (t1 - t0) * i / 30));
    mm.style.opacity = P(t, 81.9, 82.3); mm.set(Math.min(1, P(t, t0, tZ + .3, ioc)));
    rp.style.opacity = P(t, tZ + .1, tZ + .4); rp.ring(t, t > tZ + .1 ? 1 : 0);
    camSet(cam, [mix(-60, 60, P(t, 81.75, 89.3, ios)), 0, mix(1.02, 1.0, P(t, 81.75, 89.3, ios)), 0, mix(-3, 3, P(t, 81.75, 89.3, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });
