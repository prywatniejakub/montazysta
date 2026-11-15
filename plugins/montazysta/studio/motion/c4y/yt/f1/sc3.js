"use strict";
// Film 1, part 3 (105.4-139 s): krok 4 publikacja (approval -> a calendar filling daily on 4 platforms -> your day, callback),
// the payoff: the locked golden card opens -> the question -> the pinned reel on your profile.
stepPunch(105.4, 107.45, 4, "Publikacja", "d1");

// ---------------------------------------------------------------- V. Rolki dostajesz do akceptacji. Coś nie pasuje? Poprawiamy.
S(107.4, 111.15, (cam, e) => {
  const h1 = HX(e, "Rolki do [akceptacji]", 130, 92, [W("d2", "rolki"), W("d2", "do"), W("d2", "akcept")]);
  const h2 = HX(e, "Coś nie pasuje? [Poprawiamy.]", 130, 92, [W("d2", "coś"), W("d2", "nie"), W("d2", "pasuje"), W("d2", "popraw")]);
  const wn = ctr(cam, "wn", `<div class="tb4"><i></i><i></i><i></i><div class="u">Twoje rolki · do akceptacji</div></div><div class="bd4"></div>`, 0, 90, 1200, 640);
  const bd = wn.querySelector(".bd4"); bd.style.background = "#fbfaf6";
  const ph = phone4(bd, 260, 290, 280, "c10"); ph.style.boxShadow = "8px 8px 0 #111113";
  const inf = at(bd, "ab", `<div style="font:900 40px var(--d)">Rolka 7 z 30</div><div style="font:600 26px/1.4 var(--b);color:#6b6b74;margin-top:10px">„Łazienka 4 m² w 9 dni”<br>0:31 · napisy · muzyka · okładka</div>`, 480, 60, 640, 160);
  const bP = at(bd, "pill yp w", `${ico(IK.chat)}Popraw`, 480, 420); const bA = at(bd, "pill yp", `${ico(IK.check)}Akceptuj`, 740, 420);
  const cm = bub(bd, "Krótszy początek, proszę", 480, 270, false); cm.style.fontSize = "28px";
  const fx = yp(bd, `${ico(IK.check)}Poprawione`, 1000, 150, "gr sm");
  const cur = cursor4(bd), r1 = rip4(bd, 560, 455), r2 = rip4(bd, 830, 455);
  const tP = W("d2", "pasuje") - .15, tF = W("d2", "popraw");
  sfx("CLICK", tP + .35, -20); sfx("POP", tF + .25, -22); sfx("CLICK", tF + .9, -20);
  return (lt, t) => {
    h1.up(t, W("d2", "coś") - .3); h2.up(t);
    const w = P(t, 107.45, 108.0, ioe); wn.style.opacity = w; wn.style.transform = `translateY(${(1 - w) * 80}px)`;
    ph.draw(lt); inout(inf, t, W("d2", "akcept") - .2, 1e9);
    curAt(cur, t, [[0, 0, 900, 560, 0], [tP - .5, .01, 900, 560, 1], [tP - .45, .7, 560, 455, 1], [tF + .35, .5, 830, 455, 1]]);
    r1(t, tP + .35); r2(t, tF + .9); bP.style.transform = `scale(${1 - .08 * Math.sin(P(t, tP + .3, tP + .5) * Math.PI)})`; bA.style.transform = `scale(${1 - .08 * Math.sin(P(t, tF + .85, tF + 1.05) * Math.PI)})`;
    inout(cm, t, tP + .4, 1e9, { pop: true }); inout(fx, t, tF + .1, 1e9, { pop: true });
    camSet(cam, [mix(0, 60, P(t, 107.4, 111.1, ios)), 0, mix(1.0, 1.04, P(t, 107.4, 111.1, ios)), 0, mix(-3, 3, P(t, 107.4, 111.1, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- X. Publikujemy codziennie: Instagram, Facebook, TikTok i YouTube
S(111.1, 116.9, (cam, e) => {
  const h = HX(e, "Publikujemy [codziennie]", 130, 96, [W("d3", "potem"), W("d3", "codzien")]);
  const cal = cal4(cam, -250, 110, 980, { title: "Twój miesiąc", sub: "rolka dziennie", ratio: .64 });
  cal.days.forEach((d, i) => cal.fill(i, rclip(i + 1), 12 + (i * 23) % 140));
  const t0 = W("d3", "codzien") - .6, t1 = W("d3", "youtube") + .3;
  const PL = [["instagram", "instagram"], ["facebook", "facebook"], ["tiktok", "tiktok"], ["youtube", "youtube"]].map(([k, w], i) => {
    const c = ctr(cam, "", LOGOS[k], 560, -180 + i * 150, 120, 120); Object.assign(c.style, { position: "absolute", borderRadius: "30px", overflow: "hidden", border: "4px solid #111113", boxShadow: "6px 6px 0 #111113" });
    c.firstChild.style.cssText = "width:100%;height:100%;display:block"; c.a = W("d3", w) - .1; c.k = i; sfx("POP", c.a, -23); return c; });
  const cntP = yp(cam, `<span class="num v">0</span>/30 opublikowane`, -250, 470, "dk"), v = cntP.querySelector(".v");
  return (lt, t) => {
    h.up(t);
    cal.style.opacity = P(t, 111.15, 111.6); cal.days.forEach((d, i) => cal.pop(i, t, t0 + (t1 - t0) * i / 30));
    PL.forEach(c => inout(c, t, c.a, 1e9, { pop: true, base: drift(t, c.k, 3) }));
    inout(cntP, t, t0, 1e9, { pop: true }); v.textContent = Math.min(30, Math.floor(30 * clamp((t - t0) / (t1 - t0)) + (t > t0 ? 1 : 0)));
    camSet(cam, [mix(-120, 80, P(t, 111.1, 116.9, ios)), 0, mix(1.03, .97, P(t, 111.1, 116.9, ios)), 0, mix(4, -4, P(t, 111.1, 116.9, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- Y. Widoczna każdego dnia / A Ty prowadzisz firmę (callback: your day, the task done for you)
S(116.85, 122.35, (cam, e) => {
  const h1 = HX(e, "Widoczna [każdego] [dnia]", 130, 96, [W("d4", "przez"), W("d4", "każdego"), W("d4", "dnia")]);
  const h2 = HX(e, "A Ty [prowadzisz] [firmę]", 130, 96, [W("d4", "a"), W("d4", "ty"), W("d4", "prowadz"), W("d4", "firmę")]);
  const pr = prof4(cam, -420, 110, 480, { name: "Twoja Firma", posts: 30, fol: "1 240", rows: 2, ar: 1.15 });
  pr.cells.forEach((c, i) => pr.put(i, rclip(i + 4), 30 + i * 17));
  const N = [0, 1, 2].map(k => { const n = note4(cam, IK.up, "Opublikowano", `Rolka ${12 + k} z 30 · Instagram, TikTok`, 60, -160 + k * 118, `${3 - k} dni temu`); n.k = k; return n; });
  const pl = bcard(cam, 380, 120, 640, 460, `<div style="position:absolute;left:28px;top:20px;font:900 32px var(--d)">Twój dzień</div>`); pl.style.display = "block";
  [["Klienci", 70, 200, "#ffd60a"], ["Wycena", 280, 70, "#fff"], ["Realizacja", 360, 70, "#fff"]].forEach(([tx, y, hh, bg]) => { const b = at(pl, "task4", tx, 26, y, 588, hh); b.style.background = bg; });
  const done = yp(cam, `${ico(IK.check)}Rolki: robimy za Ciebie`, 380, -170, "gr");
  const tA = W("d4", "a") - .2;
  N.forEach(n => sfx("CLICK", 117.3 + n.k * .35, -26)); sfx("WH_SOFT", tA, -22); sfx("POP", tA + .6, -22);
  return (lt, t) => {
    h1.up(t, tA - .1); h2.up(t);
    const o1 = 1 - P(t, tA - .1, tA + .3, E.inCubic);
    pr.style.opacity = P(t, 116.9, 117.3) * o1; N.forEach(n => { inout(n, t, 117.2 + n.k * .35, tA - .1, { pop: true }); });
    inout(pl, t, tA + .05, 1e9, { pop: true }); inout(done, t, tA + .6, 1e9, { pop: true });
    camSet(cam, [mix(-100, 120, P(t, 116.85, 122.35, ios)), 0, mix(1.02, .98, P(t, 116.85, 122.35, ios)), 0, mix(-4, 4, P(t, 116.85, 122.35, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- Z1. PAYOFF: the golden card unlocks, flips, the question is typed on ink
S(122.3, 130.4, (cam, e) => {
  const h = HX(e, "Obiecane [pytanie]", 130, 96, [W("q1", "a"), W("q1", "pytanie")]);
  const G = step4(cam, 0, 90, 380, 480, "", "Pytanie", { gold: true, back: `<div style="font:900 170px/1 var(--d);color:#ffd60a">?</div>` }); const q = el(G.fr, "div", "", "?"); Object.assign(q.style, { font: "900 150px/1 var(--d)" });
  const lk = G.querySelector(".lk"); lk.style.cssText = "width:96px;height:96px";
  const call = yp(cam, `${ico(IK.video)}59:00 · koniec rozmowy`, 0, 400, "w");
  const tU = W("q1", "pytanie"), tF = W("q1", "zadaj") + .4, tQ = LS("q2") - .15;
  // the full-screen ink card with the question (typed)
  const ink = el(e, "div", "ab"); Object.assign(ink.style, { inset: 0, background: "#111113", opacity: 0 });
  const QT = "Co chcesz, żeby każdy klient wiedział, zanim do Ciebie zadzwoni?";
  const tx = el(ink, "div", "ab"); Object.assign(tx.style, { left: "210px", right: "210px", top: "300px", font: "900 92px/1.12 var(--d)", letterSpacing: "-.035em", color: "#fff", whiteSpace: "normal" });
  const k2 = kx(ink, "pytanie z końca każdej rozmowy", 960, 190); k2.style.color = "#ffd60a";
  sfx("CLICK", tU, -20); sfx("IMP_SOFT", tU + .25, -21); sfx("WH_SWING", tF, -21); sfx("IMP_BASS", tQ + .1, -24);
  const wq = wt("q2");
  return (lt, t) => {
    h.up(t, tQ - .2);
    const g = spring(t - 122.35, 1.6, .6), open = P(t, tU, tU + .3), sh = t > tU - .4 && t < tU ? Math.sin(t * 45) * 6 : 0;
    lk.innerHTML = open > .5 ? IK.unlock : IK.lock; lk.style.transform = `translateY(${-open * 16}px) rotate(${open * -14 + sh}deg)`;
    const f = P(t, tF, tF + .6, ioe); G.style.transform = `scale(${Math.min(1, g) * (1 + f * .1)}) rotateY(${f * 180}deg)`; G.style.opacity = clamp((t - 122.35) / .15);
    inout(call, t, W("q1", "końcu") - .1, tQ - .1, { pop: true });
    const ib = P(t, tQ - .1, tQ + .35, ioe); ink.style.opacity = ib;
    // typed with the voice: characters revealed up to the current spoken word
    let n = 0; const words = QT.split(" "); for (let i = 0; i < words.length; i++) if (t >= (wq[Math.min(i, wq.length - 1)] - .05)) n = i + 1;
    const shown = words.slice(0, n).join(" "), caret = Math.floor(t * 2.5) % 2 ? "|" : "";
    tx.innerHTML = shown.replace("zanim do Ciebie zadzwoni?", '<span style="background:#ffd60a;color:#111113;border-radius:10px;padding:0 .1em">zanim do Ciebie zadzwoni?</span>') + `<span style="color:#ffd60a">${n < words.length ? caret : ""}</span>`;
    appear(k2, t, tQ + .1, .5, 20, "translateX(-50%)");
    camSet(cam, [0, 0, mix(1.05, 1.0, P(t, 122.3, tF, ioc)) * (1 + f * .15), 0, mix(-5, 5, P(t, 122.3, tQ, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- Z2. Z tej odpowiedzi rolka przypięta na górze profilu -> ktoś wchodzi i od razu wie
S(130.35, 139.05, (cam, e) => {
  const h1 = HX(e, "Rolka [przypięta] na górze", 130, 92, [W("q3", "z"), W("q3", "rolkę"), W("q3", "przypin"), W("q3", "górze")]);
  const h2 = HX(e, "Od razu wie, [dlaczego Ty]", 130, 92, [W("q4", "od"), W("q4", "razu"), W("q4", "wie"), W("q4", "dlaczego"), W("q4", "ciebie")]);
  const pr = prof4(cam, -330, 110, 560, { name: "Twoja Firma", posts: 31, fol: "1 240", rows: 2, ar: 1.2 });
  pr.cells.forEach((c, i) => { if (i) pr.put(i, rclip(i + 3), 25 + i * 21); });
  const fly = phone4(cam, 420, 60, 240, "c08");
  const pinB = yp(cam, `${ico(IK.pin)}Przypięte`, -330, -250, "");
  const cur = cursor4(cam);
  const big = phone4(cam, 380, 90, 340, "c08"); const bigCap = cap4(big, "Dlaczego warto wybrać <b>właśnie nas?</b>", 80, 32); big.style.opacity = 0;  // centre crop hides the example reel's own captions
  const callB = yp(cam, `${ico(IK.call)}Zadzwoń`, 380, 470, ""); const r = rip4(cam, 380, 470);
  const tFly = W("q3", "robimy"), tPin = W("q3", "przypin"), tIn = W("q4", "ktoś"), tOpen = W("q4", "profil") + .3, tWhy = W("q4", "dlaczego");
  sfx("WH_SOFT", tFly, -22); sfx("POP", tPin, -20); sfx("CLICK", tOpen, -20); sfx("CLICK", tWhy + 1.1, -22);
  // grid cell 0 position in cam coords: card left + padding
  const c0x = -330 - 280 + 6 + (560 - 12 - 12) / 6, c0y = 110 - pr.H / 2 + 26 + 110 + 18 + (560 - 12 - 12) / 3 * 1.2 / 2;
  return (lt, t) => {
    h1.up(t, tIn - .2); h2.up(t);
    pr.style.opacity = P(t, 130.4, 130.8) * (1 - P(t, tOpen + .3, tOpen + .7) * .15);
    // the reel flies into the top-left cell, gets the pin
    const m = P(t, tFly, tFly + .9, ioe), fx = mix(420, c0x, m), fy = mix(60, c0y, m), fs = mix(1, (560 - 24) / 3 / 240, m);
    fly.style.transform = `translate(${fx - 420}px, ${fy - 60}px) scale(${fs})`; fly.style.opacity = P(t, tFly - .3, tFly) * (1 - P(t, tOpen, tOpen + .2)); fly.draw(lt, { zoom: 2.4, cy: .46 });
    inout(pinB, t, tPin - .05, 1e9, { pop: true });
    if (t >= tPin && !pr.cells[0].querySelector(".pin")) { pr.cells[0].innerHTML = `<img src="${thumbUrl("c08", 40)}"><div class="pin">${IK.pin}</div>`; }
    if (t < tPin) pr.cells[0].innerHTML = "";
    curAt(cur, t, [[0, 0, 300, 400, 0], [tIn - .1, .01, 300, 400, 1], [tIn, .8, c0x, c0y, 1], [tOpen + .2, .3, c0x, c0y, 0]]);
    const o = P(t, tOpen, tOpen + .5, ioe); big.style.opacity = o; big.style.transform = `translate(${(1 - o) * (c0x - 380)}px, ${(1 - o) * (c0y - 90)}px) scale(${mix(.3, 1, o)})`; big.draw(lt, { zoom: 2.4, cy: .46 });
    bigCap.style.opacity = P(t, tWhy - .1, tWhy + .2);
    inout(callB, t, tWhy + .6, 1e9, { pop: true }); r(t, tWhy + 1.1);
    camSet(cam, [mix(-60, 60, P(t, 130.35, 139, ios)), 0, mix(1.02, .98, P(t, 130.35, 139, ios)), 0, mix(4, -4, P(t, 130.35, 139, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });
