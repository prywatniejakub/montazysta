"use strict";
// Film 1, part 2 (48.5-105.4 s): krok 1 rozmowa (the call, the clients' questions, answers -> reels), krok 2 wybór
// (timeline -> best fragments -> a reel with a strong first line), krok 3 montaż (captions, zoom, music, cover -> real reels).

// big step number on ink (the card from the map zooms into the screen)
function stepPunch(a, z, n, title, key) {
  S(a, z, (cam, e) => {
    const big = el(cam, "div", "bign num", "0" + n); big.style.left = px(-FW / 2 - 330); big.style.top = px(-200);
    const tt = HX(cam, title, 20, 150, [W(key, title.slice(0, 4))], { inCam: true, x: 330, cls: "", color: "#fff" });
    const k = kx(cam, `krok ${n} z 4`, 330, 130); k.style.color = "rgba(255,255,255,.55)";
    const bars = [0, 1, 2, 3].map(i => { const b = ctr(cam, "", "", 170 + i * 90, 210, 74, 12); Object.assign(b.style, { position: "absolute", borderRadius: "6px", background: i < n ? "#ffd60a" : "rgba(255,255,255,.18)" }); b.k = i; return b; });
    sfx("IMP_SOFT", a + .12, -21);
    return (lt, t) => {
      const u = P(t, a, a + .6, ioe); big.style.transform = `translateY(${(1 - u) * 120}px)`; big.style.opacity = u; big.style.filter = u < .99 ? `blur(${(1 - u) * 16}px)` : "";
      tt.up(t); appear(k, t, a + .25, .5, 20, "translateX(-50%)");
      bars.forEach(b => { const v = P(t, a + .3 + b.k * .06, a + .7 + b.k * .06, oc); b.style.transform = `scaleX(${v})`; b.style.opacity = v; });
      camSet(cam, [mix(-40, 20, P(t, a, z, ios)), 0, mix(1.08, 1, P(t, a, z, ioc)), 0, mix(-6, 4, P(t, a, z, ios))]);
    };
  }, { inD: .25, outD: .35 });
  const ink = SCN[SCN.length - 1]; ink.e.classList.add("ink");
}
stepPunch(48.5, 50.55, 1, "Rozmowa", "a1");

// ---------------------------------------------------------------- K. Łączymy się online na godzinę / bez przygotowań / My pytamy, Ty odpowiadasz
S(50.5, 58.65, (cam, e) => {
  const h1 = HX(e, "[Online.] [Godzina.] Bez przygotowań.", 130, 84, [W("a2", "online"), W("a2", "godzin"), W("a2", "niczego"), W("a2", "przygot")]);
  const h2 = HX(e, "My pytamy. [Ty] [odpowiadasz].", 130, 88, [W("a3", "my"), W("a3", "pytamy"), W("a3", "ty"), W("a3", "odpow")]);
  const cw = callWin(cam, -150, 80, 1040, 660);
  const doc = bcard(cam, 630, 20, 300, 380, `<span class="ic2" style="width:70px;height:70px">${IK.doc}</span><div style="font:900 30px var(--d);margin-top:16px">scenariusz.docx</div><div style="margin-top:22px;width:200px">${[1, 2, 3, 4, 5].map(i => `<div style="height:12px;border-radius:6px;background:#e7e5de;margin:10px 0;width:${100 - i * 9}%"></div>`).join("")}</div>`);
  Object.assign(doc.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const X = xmark(cam, 630, 20, 280, 360);
  const c1 = yp(cam, `${ico(IK.check)}bez przygotowań`, 630, 280, "gr sm"), c2 = yp(cam, `${ico(IK.check)}bez scenariusza`, 630, 350, "gr sm");
  const q = bub(cw.bd, "Ile trwa realizacja?", 560, 70, true), ans = yp(cam, `${ico(IK.coffee)}tak, jak klientom`, -410, 380, "w");
  const tO = W("a2", "online"), tX = W("a2", "scenar"), tQ = W("a3", "pytamy"), tA = W("a3", "ty"), tK = W("a3", "klientom");
  sfx("CLICK", tO, -24); sfx("WH_SWING", tX - .1, -22); sfx("POP", tQ, -22);
  return (lt, t) => {
    h1.up(t, W("a3", "my") - .35); h2.up(t);
    const w = P(t, 50.55, 51.2, ioe); cw.style.opacity = w; cw.style.transform = `translateY(${(1 - w) * 80}px) scale(${.94 + .06 * w})`;
    cw.clock(Math.min(3600, (t - 50.6) * 60 * 8)); cw.talk(t, t > tQ - .1 && t < tA - .1 ? 1 : t >= tA - .1 && t < 58.3 ? 0 : -1);
    inout(doc, t, W("a2", "niczego") - .1, tX + .75, { pop: true }); X.up(t, tX + .1); X.style.opacity = 1 - P(t, tX + .75, tX + 1.1);
    inout(c1, t, W("a2", "przygot"), 1e9, { pop: true }); inout(c2, t, tX + .05, 1e9, { pop: true });
    inout(q, t, tQ - .05, 1e9, { pop: true }); inout(ans, t, W("a3", "tak"), 1e9, { pop: true });
    camSet(cam, [mix(0, 60, P(t, 50.5, 58.6, ios)), 0, mix(1.0, 1.04, P(t, 50.5, 58.6, ios)), 0, mix(-3, 3, P(t, 50.5, 58.6, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- L. Pytamy o to, o co pytają Cię klienci -> 1 odpowiedź = 1 rolka -> 30+ pytań
S(58.6, 70.25, (cam, e) => {
  const h1 = HX(e, "Pytamy o to, o co [pytają] [klienci]", 130, 84, [W("a4", "pytamy"), W("a4", "o", 0), W("a4", "to"), W("a4", "o", 1), W("a4", "co"), W("a4", "pytają"), W("a4", "klienci")]);
  const h2 = HX(e, "1 odpowiedź = [1 rolka]", 130, 96, [W("a5", "jedna"), W("a5", "odpow"), W("a5", "to"), W("a5", "jedna", 1), W("a5", "rolka")]);
  const h3 = HX(e, "W godzinę: [30+ pytań]", 130, 96, [W("a5", "w", 0), W("a5", "godzin"), W("a5", "trzydzie"), W("a5", "pytań")]);
  // the client's inbox: real-looking DMs from clients
  const ib = ctr(cam, "ph4", "", -380, 100, 420, 747); ib.style.background = "#fbfaf6";
  el(ib, "div", "", `<div style="position:absolute;left:0;right:0;top:0;height:92px;border-bottom:3px solid #111113;display:flex;align-items:flex-end;padding:0 26px 14px;font:900 30px var(--d)">Wiadomości</div>`);
  const DM = [["Anna", "Ile to kosztuje?", "kosztuje"], ["Marek", "Ile to trwa?", "trwa"], ["Ola", "Jaki błąd ludzie popełniają najczęściej?", "błąd"]]
    .map(([n, m, w], k) => { const r = at(ib, "ab", `<div style="display:flex;gap:14px;align-items:center"><div style="width:62px;height:62px;border-radius:50%;background:#ffd60a;border:3px solid #111113;display:flex;align-items:center;justify-content:center;font:900 26px var(--d);flex:none">${n[0]}</div><div style="white-space:normal"><b style="font:800 24px var(--b)">${n}</b><div style="font:600 21px/1.25 var(--b);color:#2b2b30;width:270px">${m}</div></div></div>`, 20, 116 + k * 118, 356, 104);
      r.k = k; r.a = W("a4", w) - .25; r.m = m; sfx("CLICK", r.a, -24); return r; });
  // our question list (the call script): each client question lands here
  const ql = bcard(cam, 330, 90, 640, 560, `<div style="position:absolute;left:28px;top:24px;font:900 32px var(--d)">Pytania do rozmowy</div>`); ql.style.display = "block";
  const QL = DM.map((d, k) => { const r = at(ql, "ab", `<span class="ic2" style="width:30px;height:30px;color:#1f9d55">${IK.check}</span><span style="white-space:normal;width:440px;display:inline-block;vertical-align:middle;margin-left:12px">${d.m}</span>`, 28, 92 + k * 100, 500, 90); r.style.font = "700 25px/1.25 var(--b)"; r.k = k; return r; });
  const arrow = el(cam, "div", "hx", "→"); Object.assign(arrow.style, { left: "-1040px", top: "40px", fontSize: "90px" });
  // 1 odpowiedź = 1 rolka: the answer bubble turns into a reel; then 30 reels
  const ansB = bub(cam, "„To zależy od metrażu…”", -800, -10, false), eq = el(cam, "div", "hx", "="); Object.assign(eq.style, { left: "-900px", top: "-20px", fontSize: "140px" });
  const ph = phone4(cam, 420, 90, 320, "c08", { tag: "rolka 1" });
  const g30 = [...Array(30)].map((_, i) => { const c = ctr(cam, "", `<img src="${thumbUrl(rclip(i + 2), 15 + (i * 29) % 140)}" style="width:100%;height:100%;object-fit:cover;display:block">`, -560 + (i % 10) * 124, -20 + Math.floor(i / 10) * 160, 110, 146);
    Object.assign(c.style, { position: "absolute", borderRadius: "12px", overflow: "hidden", border: "3px solid #111113" }); c.k = i; return c; });
  const n30 = yp(cam, `<span class="num v">0</span> pytań = <span class="num v2">0</span> rolek`, 0, 330, "dk"), v1 = n30.querySelector(".v"), v2 = n30.querySelector(".v2");
  const tR = W("a5", "jedna") - .1, tG = W("a5", "w", 0) - .1;
  sfx("WH_SOFT", tR, -22); sfx("IMP_SOFT", W("a5", "rolka"), -22); sfx("RISER", tG + .1, -26);
  return (lt, t) => {
    h1.up(t, tR - .3); h2.up(t, tG - .2); h3.up(t);
    const part1 = 1 - P(t, tR - .3, tR + .2, E.inCubic);
    ib.style.opacity = P(t, 58.65, 59.2) * part1; ib.style.transform = `translateX(${(1 - P(t, 58.65, 59.3, ioe)) * -200}px)`;
    ql.style.opacity = P(t, 59.2, 59.7) * part1; ql.style.transform = `translateX(${(1 - P(t, 59.2, 59.9, ioe)) * 200}px)`; arrow.style.opacity = P(t, 59.6, 60) * part1;
    DM.forEach(r => inout(r, t, r.a, 1e9, { pop: true }));
    QL.forEach((r, k) => { const a = DM[k].a + .45, u = P(t, a, a + .45, ioe); r.style.opacity = u; r.style.transform = `translateY(${(1 - u) * 16}px)`; if (u > 0 && u < 1) r.style.filter = `blur(${(1 - u) * 8}px)`; else r.style.filter = ""; });
    // 1 answer = 1 reel
    const on2 = P(t, tR - .1, tR + .3) * (1 - P(t, tG - .15, tG + .2, E.inCubic));
    ansB.style.opacity = on2; ansB.style.transform = `scale(${.9 + .1 * P(t, tR, tR + .4, oc)})`; eq.style.opacity = on2 * P(t, W("a5", "to"), W("a5", "to") + .3);
    ph.style.opacity = on2 * P(t, W("a5", "jedna", 1) - .1, W("a5", "jedna", 1) + .2); ph.style.transform = `scale(${.7 + .3 * Math.min(1, spring(t - W("a5", "jedna", 1) + .1, 2, .6))})`; ph.draw(lt);
    // 30 reels burst
    g30.forEach(c => { const a = tG + .6 + c.k * .045, s = spring(t - a, 2.2, .55); c.style.opacity = clamp((t - a) / .1); c.style.transform = `scale(${t < a ? 0 : Math.min(1.1, s)}) rotate(${(hash(c.k, 3) - .5) * 6}deg)`; });
    inout(n30, t, tG + .4, 1e9, { pop: true }); v1.textContent = Math.round(30 * P(t, tG + .6, tG + .6 + 30 * .045, E.lin)) + (t > tG + 2.1 ? "+" : ""); v2.textContent = Math.round(30 * P(t, tG + .6, tG + .6 + 30 * .045, E.lin));
    camSet(cam, [mix(-40, 40, P(t, 58.6, 70.2, ios)), 0, mix(1.12, 1.0, P(t, tG - .2, tG + .6, ioe)), 0, mix(3, -3, P(t, 58.6, 70.2, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- M. Dla Ciebie zwykła rozmowa | dla klienta odpowiedź, z którą by zadzwonił (split light | ink)
S(70.2, 76.35, (cam, e) => {
  const sp = el(e, "div", "ab"); Object.assign(sp.style, { left: "960px", top: 0, width: "960px", height: "1080px", background: "#111113", transformOrigin: "0 50%" });
  const hl = HX(e, "Dla Ciebie", 170, 80, [W("a6", "dla"), W("a6", "ciebie")], { x: 0, w: 960 });
  const hr = HX(e, "Dla [klienta]", 170, 80, [W("a6", "dla", 1), W("a6", "klienta")], { x: 960, w: 960, cls: "", color: "#fff" });
  const L = bcard(e, 480, 560, 600, 420, `<span class="ic2" style="width:120px;height:120px">${IK.coffee}</span><div style="font:900 44px/1.1 var(--d);margin-top:20px;text-align:center">zwykła rozmowa<br>o pracy</div>`);
  Object.assign(L.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const ph = phone4(e, 1300, 600, 300, "c08");
  const call = yp(e, `${ico(IK.call)}Klient chciał zadzwonić z tym pytaniem`, 1440, 330, "w sm");
  const ok = yp(e, `${ico(IK.check)}odpowiedź już jest w rolce`, 1440, 960, "sm");
  const tC = W("a6", "klienta"), tZ = W("a6", "z", 0);
  sfx("WH_SOFT", tC - .2, -22); sfx("CLICK", tZ, -24);
  return (lt, t) => {
    const s = P(t, 70.25, 70.9, ioe); sp.style.transform = `scaleX(${s})`;
    hl.up(t); hr.up(t); inout(L, t, W("a6", "zwykła") - .1, 1e9, { pop: true, base: drift(t, 1, 4) });
    inout(ph, t, tC - .05, 1e9, { pop: true }); ph.draw(lt, { zoom: 1 + .08 * Math.sin(lt * .8) });
    inout(call, t, tZ - .15, 1e9, { pop: true }); inout(ok, t, W("a6", "zadzwo") - .1, 1e9, { pop: true });
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- N. A pytanie z końca rozmowy? Za chwilę. (the golden card, locked)
S(76.3, 79.05, (cam, e) => {
  const h = HX(e, "Pytanie z końca rozmowy?", 150, 92, [W("a7", "pytanie"), W("a7", "z"), W("a7", "końca"), W("a7", "rozmowy")]);
  const G = step4(cam, 0, 90, 360, 460, "", "Pytanie", { gold: true }); const q = el(G.fr, "div", "", "?"); Object.assign(q.style, { font: "900 150px/1 var(--d)" });
  G.querySelector(".lk").style.cssText = "width:90px;height:90px";
  const st = ctr(cam, "stamp4", "za chwilę", 250, 290, 400, 90); st.style.transformOrigin = "50% 50%";
  const tZ = W("a7", "za"); sfx("IMP_SOFT", tZ, -20);
  return (lt, t) => {
    h.up(t);
    const g = spring(t - 76.35, 1.6, .6), sh = t > 77.1 && t < 77.9 ? Math.sin(t * 40) * 5 : 0;
    G.style.transform = `scale(${Math.min(1, g)}) rotate(${sh}deg) rotateY(${(1 - Math.min(1, g)) * 90}deg)`; G.style.opacity = clamp((t - 76.35) / .15);
    stampIn(st, t, tZ, -10); if (t < tZ) st.style.opacity = 0;
    camSet(cam, [0, 0, mix(1.1, 1.0, P(t, 76.3, 79, ioc)), 0, mix(-6, 6, P(t, 76.3, 79, ios))]);
  };
}, { light: true, inD: .3, outD: .35 });

stepPunch(79.0, 80.75, 2, "Wybór", "b1");

// ---------------------------------------------------------------- P. Z godzinnego nagrania wycinamy najlepsze fragmenty -> 1 myśl + mocne 1. zdanie -> masz sekundę
S(80.7, 91.8, (cam, e) => {
  const h1 = HX(e, "Z godziny: [najlepsze] [fragmenty]", 130, 86, [W("b2", "z"), W("b2", "godzin"), W("b2", "najlep"), W("b2", "fragm")]);
  const h2 = HX(e, "1 myśl + [mocne] [pierwsze] [zdanie]", 130, 86, [W("b3", "każdy"), W("b3", "myśl"), W("b3", "i"), W("b3", "mocne"), W("b3", "pierwsze"), W("b3", "zdanie")]);
  const h3 = HX(e, "Masz [sekundę], żeby ktoś się zatrzymał", 130, 80, [W("b3", "masz"), W("b3", "sekund"), W("b3", "żeby"), W("b3", "ktoś"), W("b3", "się"), W("b3", "zatrzym")]);
  const tl = tline(cam, 0, 60, 1500, { segs: [["0:24", 6, 9], ["0:38", 30, 12], ["0:31", 55, 10], ["0:27", 80, 9]] });
  const tF = W("b2", "najlep") - .05, tS = W("b2", "dwadzie") - .1, tM = W("b3", "każdy") - .15, tB = W("b3", "bo") - .1;
  tl.segs.forEach((g, i) => sfx("CLICK", tF + i * .18, -24));
  // one fragment becomes a reel: morph box from the segment to a phone
  const sh = el(cam, "div", "ab"); Object.assign(sh.style, { border: "4px solid #111113", background: "rgba(255,214,10,.55)", overflow: "hidden", opacity: 0 });
  const ph = phone4(cam, 0, 70, 330, "c01"); ph.style.opacity = 0; const cp = el(ph, "div", "");
  const c1 = yp(cam, `${ico(IK.bulb)}1 myśl`, -420, -40, "w"), c2 = yp(cam, `${ico(IK.text)}mocne 1. zdanie`, 440, -120, "");
  const ln = ctr(cam, "", "", 300, -60, 240, 5); Object.assign(ln.style, { position: "absolute", background: "#111113", transform: "rotate(18deg)", transformOrigin: "50% 50%" });
  // the feed: fast swipes through other reels, stop on ours, "1 s"
  const one = yp(cam, `${ico(IK.clock)}1 sekunda`, 420, 260, "dk"); const stop = ctr(cam, "stamp4 gr", "stop", -380, 250, 220, 90);
  sfx("WH_DATA", tB + .3, -24); sfx("IMP_SOFT", W("b3", "zatrzym"), -22);
  return (lt, t) => {
    h1.up(t, tM - .25); h2.up(t, tB - .2); h3.up(t);
    const tlo = P(t, 80.75, 81.3, ioe) * (1 - P(t, tM, tM + .5, E.inCubic)); tl.style.opacity = tlo; tl.style.transform = `translateY(${(1 - P(t, 80.75, 81.3, ioe)) * 80}px)`;
    tl.ph.style.left = mix(1, 97, clamp((t - 80.8) / 3)) + "%";
    tl.segs.forEach((g, i) => { const a = tF + i * .18; g.style.opacity = P(t, a, a + .2); const lift = P(t, tS + i * .12, tS + i * .12 + .5, ioe); g.style.transform = `translateY(${-lift * 70}px) scale(${1 + lift * .08})`; });
    // morph: segment 1 box (in cam coords) -> phone
    const m = P(t, tM - .1, tM + .7, ioe), ss = [-750 + 28 + 1444 * .30 + 1444 * .06, -24, 1444 * .12, 126];
    if (t > tM - .1) { const [cx, cy, w, h, r] = [mix(ss[0], 0, m), mix(ss[1], 70, m), mix(ss[2], 330, m), mix(ss[3], 587, m), mix(12, 38, m)];
      Object.assign(sh.style, { left: px(cx - w / 2), top: px(cy - h / 2), width: px(w), height: px(h), borderRadius: px(r), opacity: 1 - P(t, tM + .6, tM + .8) }); } else sh.style.opacity = 0;
    ph.style.opacity = P(t, tM + .55, tM + .75);
    const q = t < tB + .3 ? { name: "c01", lt } : t < W("b3", "zatrzym") - .1 ? { name: ["c07", "c10", "c09", "c11", "c06", "c12"][Math.floor((t - tB - .3) / .28) % 6], lt: (t * 3) % 4 } : { name: "c01", lt: lt };
    ph.set(q.name); ph.draw(q.lt); cp.style.opacity = q.name === "c01" ? 1 : 0;
    const swp = t > tB + .3 && t < W("b3", "zatrzym") - .1 ? ((t - tB - .3) / .28) % 1 : 0; ph.firstChild.style.transform = `translateY(${-swp * 60}px)`; ph.firstChild.style.filter = swp ? "blur(6px)" : "";
    inout(c1, t, W("b3", "myśl") - .1, tB, { pop: true }); inout(c2, t, W("b3", "mocne") - .1, tB, { pop: true }); ln.style.opacity = P(t, W("b3", "mocne"), W("b3", "mocne") + .3) * (1 - P(t, tB, tB + .3));
    inout(one, t, W("b3", "sekund") - .1, 1e9, { pop: true }); stampIn(stop, t, W("b3", "zatrzym"), -8); if (t < W("b3", "zatrzym")) stop.style.opacity = 0;
    camSet(cam, [0, mix(0, 10, P(t, tM, tM + 1, ioe)), mix(1.0, 1.06, P(t, tM, 91.8, ios)), 0, mix(-3, 3, P(t, 80.7, 91.8, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- Q. Nie oglądasz godzinnego nagrania. Dostajesz gotowe rolki.
S(91.75, 95.55, (cam, e) => {
  const h = HX(e, "Dostajesz [gotowe] [rolki]", 150, 96, [W("b4", "dostaj"), W("b4", "gotowe"), W("b4", "rolki")]);
  const tl = tline(cam, -420, -20, 700, { segs: [] }); const X = xmark(cam, -420, -20, 660, 250);
  const P5 = [0, 1, 2, 3, 4].map(i => { const p = phone4(cam, -60 + i * 190, 110, 190, rclip(i), { ok: true, tag: `Rolka ${i + 1}` }); p.k = i; return p; });
  const fold = yp(cam, `${ico(IK.folder)}Gotowe rolki: 30`, 320, -250, "");
  const tN = W("b4", "nie"), tD = W("b4", "dostaj");
  sfx("WH_SWING", tN + .5, -22); P5.forEach(p => sfx("POP", tD + .15 + p.k * .1, -25));
  return (lt, t) => {
    h.up(t);
    const o = P(t, 91.8, 92.2) * (1 - P(t, tD - .1, tD + .3)); tl.style.opacity = o; X.style.opacity = o; X.up(t, W("b4", "godzin") - .1);
    inout(fold, t, tD, 1e9, { pop: true });
    P5.forEach(p => { const a = tD + .15 + p.k * .1, s = spring(t - a, 1.9, .6); p.style.opacity = clamp((t - a) / .1); p.style.transform = `translateY(${(1 - Math.min(1, s)) * 200}px) rotate(${(p.k - 2) * 4 * Math.min(1, s)}deg)`; p.draw(lt + p.k); });
    camSet(cam, [mix(-200, 80, P(t, 91.75, 95.5, ios)), 0, mix(1.05, .98, P(t, 91.75, 95.5, ios)), 0, mix(5, -4, P(t, 91.75, 95.5, ios))]);
  };
}, { light: true, inD: .3, outD: .35 });

stepPunch(95.5, 97.45, 3, "Montaż", "c1");

// ---------------------------------------------------------------- S. Napisy (bez dźwięku) / Zbliżenia / Muzyka / Okładka -> the phone flips to its cover
S(97.4, 103.0, (cam, e) => {
  const h = HX(e, "Montaż, który [zatrzymuje]", 130, 88, [W("c2", "napisy")]);
  const ph = phone4(cam, 260, 80, 380, "c12"); const cp = el(ph, "div", ""), cw4 = [];
  const mute = yp(ph, `${ico(IK.mute)}bez dźwięku`, 190, 60, "sm w");
  const eqb = at(ph, "ab", "", 90, 590, 200, 60); Object.assign(eqb.style, { display: "flex", gap: "6px", alignItems: "flex-end" }); const EQ = [...Array(10)].map(() => { const b = el(eqb, "i", ""); Object.assign(b.style, { width: "12px", background: "#ffd60a", border: "2px solid #111113", borderRadius: "4px" }); return b; });
  const cover = el(ph, "div", "ab", `<div style="font:900 64px/1.02 var(--d);letter-spacing:-.04em;text-align:center">Ile to<br><span style="background:#111113;color:#ffd60a;padding:0 .15em;border-radius:10px">kosztuje?</span></div>`);
  Object.assign(cover.style, { inset: 0, background: "#ffd60a", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0 });
  const L = [["Napisy", IK.text, "napisy"], ["Zbliżenia", IK.zoom, "zbliż"], ["Muzyka", IK.music, "muzyka"], ["Okładka", IK.img, "okładka"]].map(([tt, i, w], k) => {
    const c = at(cam, "task4", `${ico(i)}${tt}<span class="ic2 ck" style="margin-left:auto;color:#1f9d55;opacity:0">${IK.check}</span>`, -700, -150 + k * 100, 380, 70); c.style.background = "#fff"; c.a = W("c2", w) - .08; c.k = k; sfx("CLICK", c.a, -24); return c; });
  const tZ = W("c2", "zbliż"), tMu = W("c2", "muzyka"), tO = W("c2", "okładka");
  sfx("WH_SWING", tO + .1, -22);
  return (lt, t) => {
    h.up(t);
    L.forEach(c => { inout(c, t, c.a, 1e9, { pop: true }); c.querySelector(".ck").style.opacity = P(t, c.a + .3, c.a + .5); c.style.background = t > c.a + .3 ? "#ffd60a" : "#fff"; });
    const tN = W("c2", "napisy"); ph.draw(lt, { zoom: mix(1.9, 1.0, P(t, tN - .05, tN + .6, ioe)) + .3 * P(t, tZ - .05, tZ + .3, ioe) * (1 - P(t, tMu, tMu + .5, ioe)), cy: .5 });  // raw centre crop -> the edited reel with its captions
    cw4.forEach((w, i) => { const a = W("c2", "napisy") + i * .12; w.style.opacity = P(t, a, a + .1); });
    inout(mute, t, W("c2", "dźwięk") - .2, tZ, { pop: true });
    EQ.forEach((b, i) => { b.style.height = px(t > tMu - .1 ? 12 + 40 * Math.abs(Math.sin(t * (6 + i) + i)) : 0); }); eqb.style.opacity = P(t, tMu - .1, tMu + .1);
    const f = P(t, tO - .05, tO + .5, ioe); ph.style.transform = `rotateY(${f * 180}deg)`; cover.style.opacity = f > .5 ? 1 : 0; cover.style.transform = "rotateY(180deg)";
    ph.firstChild.style.opacity = f > .5 ? 0 : 1; cp.style.opacity = f > .5 ? 0 : 1;
    camSet(cam, [mix(-80, 60, P(t, 97.4, 103, ios)), 0, mix(1.0, 1.05, P(t, 97.4, 103, ios)), 0, mix(-4, 4, P(t, 97.4, 103, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- T. Tak to wygląda na prawdziwych rolkach (a 3D row of real reels)
S(102.95, 105.45, (cam, e) => {
  const h = HX(e, "[Gotowe] [rolki]", 130, 100, [W("c3", "gotowe"), W("c3", "rolki")]);
  const R = ["c06", "c01", "c07", "c10", "c08"].map((n, i) => { const p = phone4(cam, -760 + i * 380, 90, 300, n, { ok: true }); p.k = i; return p; });
  return (lt, t) => {
    h.up(t);
    R.forEach(p => { const a = 103.0 + p.k * .08, u = P(t, a, a + .5, ioe); p.style.opacity = u; p.style.transform = `translateY(${(1 - u) * 150}px) rotateY(${(p.k - 2) * -10}deg)`; p.draw(lt + p.k * .7); });
    camSet(cam, [mix(-120, 120, P(t, 102.95, 105.45, E.lin)), 0, 1, 0, mix(8, -8, P(t, 102.95, 105.45, E.lin))]);
  };
}, { light: true, inD: .3, outD: .35 });
