"use strict";
// u1.js — VSL v5: 1 hak (tysiąc kontra trzy wyświetlenia, bez kamery i nocnego montażu), 2 w skrócie (miesiąc z rolkami),
// 3 dlaczego rolki (klient sprawdza firmę, wybiera tę z rolkami), 4 psychologiczny montaż (wykresy utrzymania widza + 4 chwyty)
const HY = 122;  // headline line (screen y)
const fmtK = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// ============================================================ 1. HAK
(() => {
  const z = LS("q1") - .35, tRo = W("h1", "rolki"), tTy = W("h1", "tysiąc"), tIn = W("h1", "innych"), tTr = W("h1", "trzy"), t2 = LS("h2"), tTw = W("h2", "twoje"),
    tPie = W("h2", "pierwszej"), t3 = LS("h3"), tKam = W("h3", "kamerą"), tBez2 = W("h3", "bez", 1), tNoc = W("h3", "nocach"), tEnd = LE("h3");
  VS(0, z, (cam, e) => {
    const HA = HX(e, "W 2 minuty pokażę Ci,", HY, 62, [-1]);
    const HB = HX(e, "Jedne rolki ogląda [tysiąc osób], inne |trzy|", HY, 62, [tRo, tRo, W("h1", "ogląda"), tTy, W("h1", "osób"), tIn, tTr]);
    const HC = HX(e, "Jak sprawić, żeby Twoje były [w pierwszej grupie]", HY, 62, ws("h2", "jak", 8));
    const HD = HX(e, "Bez stawania przed [kamerą]", HY, 62, ws("h3", "bez", 4));
    const HE = HX(e, "Bez montowania [po nocach]", HY, 62, [tBez2, W("h3", "montowania"), W("h3", "po"), tNoc]);
    const A = phoneX(cam, -330, 70, 330, "c01"), B = phoneX(cam, 330, 70, 330, "c10");
    const cA = vp(cam, IK.eye, '<b class="num">0</b>&nbsp;wyświetleń', -330, -262, "y lg"), cB = vp(cam, IK.eye, '<b class="num">0</b>&nbsp;wyświetleń', 330, -262, "lg");
    const nA = cA.querySelector("b"), nB = cB.querySelector("b");
    const you = vp(cam, IK.building, "Twoja firma", -330, 420, "dk lg");
    const rec = vcard(e, 1340, 470, 420, 230, `<div style="position:absolute;left:32px;top:30px;display:flex;align-items:center;gap:12px;font:600 22px/1 var(--font);color:rgba(255,255,255,.6)"><span class="ic2" style="width:28px;height:28px;color:#ffd60a">${IK.video}</span>nagrywanie</div>
      <div style="position:absolute;left:32px;top:84px;display:flex;align-items:center;gap:18px;font:800 84px/1 var(--font);letter-spacing:-.03em"><span style="width:34px;height:34px;border-radius:50%;background:#ff3b3b;box-shadow:0 0 24px #ff3b3b"></span>REC</div>`, "dk");
    const night = vcard(e, 1340, 790, 420, 230, `<div style="position:absolute;left:32px;top:30px;display:flex;align-items:center;gap:12px;font:600 22px/1 var(--font);color:rgba(255,255,255,.6)"><span class="ic2" style="width:28px;height:28px;color:#ffd60a">${IC.moon}</span>montaż rolki</div>
      <div class="num" style="position:absolute;left:30px;top:74px;font:800 88px/1 var(--font);letter-spacing:-.04em">23:47</div>`, "dk");
    const xr = xmark(e, 1340, 470, 450, 260), xn = xmark(e, 1340, 790, 450, 260);
    sfx("WH_SOFT", tTy - .3, -24); sfx("DING", tTy + .6, -26); sfx("CLICK", tTr, -22); sfx("WH_SWING", t2, -25); sfx("IMP_SOFT", tPie, -24);
    sfx("CLICK", tKam + .05, -20); sfx("CLICK", tNoc + .05, -20);
    return (lt, t) => {
      HA.up(t, tRo - .35); HB.up(t, t2 - .4); HC.up(t, t3 - .4); HD.up(t, tBez2 - .4); HE.up(t);
      // two phones from frame 0; the right one greys out at "trzy" and leaves on h2, the left one becomes "Twoja firma"
      const out = P(t, t2 - .1, t2 + .6, E.inCubic), mid = P(t, t2 + .1, t2 + 1, ioe), side = P(t, t3 - .15, t3 + .7, ioe), ex = P(t, tEnd + .05, tEnd + .5, E.inCubic);
      const ax = mix(mix(-330, 0, mid), -360, side);
      A.style.transform = `translate(${ax + 330}px, ${Math.sin(t * 1.2) * 7}px) rotateY(${mix(mix(8, 0, mid), 8, side)}deg) scale(${mix(1, 1.08, mid) * (1 - ex * .05)})`;
      A.style.opacity = (1 - ex).toFixed(3); A.draw(t + 1.5);
      A.classList.toggle("ring", t > tPie - .1 && side < .9);
      B.style.opacity = (1 - out).toFixed(3); B.style.display = out >= 1 ? "none" : "";
      B.style.transform = `translate(${out * 220}px, ${Math.sin(t * 1.1 + 1) * 7}px) rotateY(-8deg) scale(${1 - out * .1})`;
      B.cv.style.filter = `grayscale(${P(t, tTr - .1, tTr + .3)}) brightness(${mix(1, .8, P(t, tTr - .1, tTr + .3))})`; if (out < 1) B.draw(t + .5);
      nA.textContent = fmtK(1000 * P(t, tTy - .3, tTy + .7, ioc)) + (t > tTy + .7 ? "+" : ""); nB.textContent = t > tTr - .05 ? "3" : "0";
      cA.style.opacity = (P(t, tRo - .2, tRo + .2) * (1 - P(t, t3 - .3, t3)) ).toFixed(3); cA.style.transform = `translateX(${ax + 330}px) scale(${1 + .06 * Math.max(0, Math.sin((t - tTy - .7) * 9)) * (1 - P(t, tTy + .7, tTy + 1.2))})`;
      cB.style.opacity = (P(t, tRo - .2, tRo + .2) * (1 - out)).toFixed(3); cB.style.transform = `translateX(${out * 220}px)`;
      io(you, t, tTw - .1, t3 - .3, `translateX(${ax + 330}px)`);
      const r1 = spring(t - t3 - .1, 1.8, .64), r2 = spring(t - tBez2 + .1, 1.8, .64);
      rec.style.opacity = (clamp((t - t3 - .1) / .15) * (1 - ex)).toFixed(3); rec.style.transform = `rotate(-2deg) scale(${t < t3 + .1 ? 0 : Math.max(0, r1)})`;
      night.style.opacity = (clamp((t - tBez2 + .1) / .15) * (1 - ex)).toFixed(3); night.style.transform = `rotate(2deg) scale(${t < tBez2 - .1 ? 0 : Math.max(0, r2)})`;
      xr.up(t, tKam + .05); xn.up(t, tNoc + .05); xr.style.opacity = xn.style.opacity = (1 - ex).toFixed(3);
      camSet(cam, keysAt([[0, 0, 0, 0, 1, 2, 0, 0], [tTy - .4, 1.2, -60, 20, 1.04, 2, 0, 0], [t2, 1.2, 0, 0, 1, 2, 0, 0], [t3, 1.2, 0, 0, 1, 2, 0, 0]], t));
    };
  }, { inD: 0, outD: .5 });
})();

// ============================================================ 2. W SKRÓCIE: miesiąc wypełnia się rolkami, plan + rolki + godziny, Ty tylko wrzucasz
(() => {
  const a = LS("q1") - .35, z = LS("d1") - .35, t2 = LS("q2"), tPl = W("q2", "plan"), tGo = W("q2", "gotowe"), tGd = W("q2", "godziny"), t3 = LS("q3");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "W skrócie: rolki, które [oglądają do końca]", HY, 62, [W("q1", "w"), W("q1", "skrócie"), W("q1", "rolki"), W("q1", "które"), W("q1", "oglądają"), W("q1", "do"), W("q1", "końca")]);
    const H2 = HX(e, "Co miesiąc: plan, rolki i [godziny publikacji]", HY, 62, [W("q2", "co"), W("q2", "miesiąc"), tPl, tGo, W("q2", "i"), tGd, W("q2", "publikacji")]);
    const H3 = HX(e, "Ty tylko [je wrzucasz].", HY, 66, ws("q3", "ty", 4));
    const CW = 1120, CH = 635, cal = vcard(cam, 0, 70, CW, CH, "");
    ttl(cal, IK.cal, "Twój miesiąc w social mediach", 36, 30);
    const cnt = at(cal, "", chip(IK.play, '<b class="num">0</b>&nbsp;<span class="w">rolek</span>', "y"), CW - 200, 34); cnt.style.position = "absolute";
    const cntN = cnt.querySelector("b"), cntW = cnt.querySelector(".w");
    const cw = 142, ch = 86, gap = 10, days = [], CL15 = ["c01", "c03", "c13", "c07", "ad12_hook", "c11", "c05", "c15", "c02", "c09", "c06", "c17", "c08", "c14", "c16"];
    for (let i = 0; i < 35; i++) {
      const c = i % 7, r = Math.floor(i / 7), d = i - 1, x = 36 + c * (cw + gap) - 3, y = 104 + r * (ch + gap);
      const b = at(cal, "", "", x, y, cw, ch); Object.assign(b.style, { position: "absolute", borderRadius: "14px", background: "#f5f5f7", overflow: "hidden" });
      if (d < 1 || d > 30) { b.style.opacity = .35; continue; }
      const yl = el(b, "div", ""); Object.assign(yl.style, { position: "absolute", inset: 0, background: "linear-gradient(160deg,#fff4b3,#ffe14d)", opacity: 0 });
      let th = null;
      if (d % 2) { th = el(b, "div", ""); Object.assign(th.style, { position: "absolute", right: "9px", top: "4px", width: "44px", height: "78px", borderRadius: "8px", background: `url(${TH(CL15[(d - 1) / 2], 40)}) center/cover`, boxShadow: "0 5px 12px rgba(17,17,19,.22)", opacity: 0 }); }
      const n = el(b, "div", "", String(d)); Object.assign(n.style, { position: "absolute", left: "10px", top: "8px", font: "700 17px/1 var(--font)", color: "#111113", zIndex: 2 });
      days.push({ b, yl, th, d });
    }
    const PL = [[IK.doc, "Plan tematów z Twojej branży", tPl, 470], [IK.play, "Gotowe rolki", tGo, 960], [IK.clock, "Godziny publikacji", tGd, 1400]].map(([ic, tx, s, x]) => { const p = vp(e, ic, tx, x, 985, "lg"); p.s = s; return p; });
    const you = vp(e, IK.coffee, "Ty tylko wrzucasz", 960, 985, "dk lg");
    const f0 = tGo - .2, f1 = tGd + .6;
    sfx("WH_SOFT", a + .4, -26); PL.forEach(p => sfx("POP", p.s, -26)); for (let i = 0; i < 15; i++) sfx("POP", mix(f0, f1, i / 14), -36); sfx("CLICK", t3 + .1, -22);
    return (lt, t) => {
      H1.up(t, t2 - .4); H2.up(t, t3 - .4); H3.up(t);
      const ci = P(t, a + .05, a + .9, ioe);
      cal.style.opacity = ci.toFixed(3); cal.style.transform = `translateY(${(1 - ci) * 140}px) rotateX(${mix(22, 0, ci)}deg) scale(${mix(.94, 1, ci)})`;
      let n = 0;
      days.forEach(q => { if (q.th) { const s = mix(f0, f1, (q.d - 1) / 29), v = spring(t - s, 2.2, .6); q.th.style.opacity = t > s ? 1 : 0; q.th.style.transform = `scale(${t > s ? Math.min(1.08, v) : 0})`; if (t > s) n++; }
        const tv = mix(f0, f1 + .4, (q.d - 1) / 29); q.yl.style.opacity = (P(t, tv, tv + .3, oc) * .95).toFixed(3); });
      cntN.textContent = n; cntW.textContent = rolek(n);
      PL.forEach(p => { const v = spring(t - p.s, 2, .62), o = 1 - P(t, t3 - .3, t3 + .05, E.inCubic); p.style.opacity = (t > p.s ? o : 0).toFixed(3); p.style.transform = `scale(${t > p.s ? Math.min(1.05, v) : 0})`; });
      const yv = spring(t - t3 - .05, 1.9, .6); you.style.opacity = t > t3 ? 1 : 0; you.style.transform = `scale(${t > t3 ? Math.min(1.06, yv) : 0})`;
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.4, 0, 0, 1, 3, 0, 0], [tGo, 1.4, 0, 20, 1.02, 2, 0, 0], [t3, 1, 0, 0, 1, 3, 0, 0]], t));
    };
  }, { inD: .6, outD: .55 });
})();

// ============================================================ 3. DLACZEGO ROLKI: klient sprawdza firmę -> profil z postem sprzed miesiąca kontra firma z rolek -> zaufanie
(() => {
  const a = LS("d1") - .35, z = LS("x1") - .35, tSp = W("d1", "sprawdza"), t2 = LS("d2"), tMi = W("d2", "miesiąc"), tWy = W("d2", "wybiera"), tZna = W("d2", "zna"), t3 = LS("d3"),
    tZos = W("d3", "zostaje"), tZau = W("d3", "zaufanie");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Zanim zadzwoni, [sprawdza Cię] w internecie", HY, 62, [W("d1", "zanim"), W("d1", "zadzwoni"), tSp, W("d1", "cię"), W("d1", "w"), W("d1", "internecie")]);
    const H2 = HX(e, "Ostatni post [miesiąc temu]?", HY, 62, [W("d2", "ostatni"), W("d2", "post"), tMi, W("d2", "temu")]);
    const H2b = HX(e, "Wybiera firmę, którą [zna z rolek]", HY, 62, [tWy, W("d2", "firmę"), W("d2", "którą"), tZna, W("d2", "z"), W("d2", "rolek")]);
    const H3 = HX(e, "Każda rolka [zostaje] i buduje [zaufanie]", HY, 62, [W("d3", "każda"), W("d3", "rolka"), tZos, W("d3", "i"), W("d3", "buduje"), tZau]);
    // the search
    const sw = wnd(cam, 0, 70, 1000, 560, "");
    const sb = at(sw.bd, "", `<span class="ic2" style="width:28px;height:28px;color:#8b8b95">${IK.zoom}</span><span class="q" style="font:600 28px/1 var(--font)"></span>`, 80, 50, 840, 74);
    Object.assign(sb.style, { position: "absolute", display: "flex", alignItems: "center", gap: "16px", padding: "0 26px", boxSizing: "border-box", borderRadius: "37px", background: "#fff", border: "2px solid #ececf1", boxShadow: "0 10px 28px rgba(17,17,19,.06)" });
    const q = sb.querySelector(".q");
    const RES = [0, 1, 2].map(i => { const r = at(sw.bd, "", `<i style="display:block;width:${260 + i * 70}px;height:16px;border-radius:8px;background:#dfe5ff"></i><i style="display:block;width:${520 - i * 60}px;height:12px;border-radius:7px;background:#ececf1;margin-top:14px"></i><i style="display:block;width:${430 - i * 40}px;height:12px;border-radius:7px;background:#ececf1;margin-top:10px"></i>`, 90, 170 + i * 110, 820, 90);
      r.style.position = "absolute"; return r; });
    // two profiles
    const me = prof(cam, -330, 70, 600, { name: "Twoja firma", posts: 2, last: chip(IK.clock, "ostatni post: miesiąc temu", "rd") });
    me.put(0, "c10", 50); me.put(1, "c04", 50); me.cells.slice(0, 2).forEach(c => { c.style.filter = "grayscale(.6)"; });
    const comp = prof(cam, 330, 70, 600, { name: "Firma z rolek", posts: 24, last: chip(IK.check, "nowa rolka dziś", "cg"), comp: 1 });
    ["c01", "c13", "c07", "c03", "c11", "c15"].forEach((c, i) => comp.put(i, c, 40));
    const pick = vp(cam, IK.call, "Ten klient dzwoni tutaj", 330, 360, "y lg");
    const cur = cursor4(cam), rp = rip4(cam, 330, 70);
    const hearts = [0, 1, 2, 3, 4, 5].map(i => { const h = ctr(cam, "", `<span class="ic2" style="width:42px;height:42px;color:#ff4d6d">${IK.heart}</span>`, 330 + (i - 2.5) * 70, -120, 50, 50); h.style.position = "absolute"; return h; });
    const trust = vp(e, IK.heart, "Zaufanie do marki rośnie", 960, 985, "dk lg");
    sfx("WH_SOFT", a + .4, -26); sfx("CLICK", tSp, -22); sfx("WH_SOFT", t2 - .1, -25); sfx("CLICK", tZna, -18); sfx("DING", tZna + .15, -26);
    return (lt, t) => {
      H1.up(t, t2 - .4); H2.up(t, tWy - .4); H2b.up(t, t3 - .4); H3.up(t);
      const si = P(t, a + .05, a + .9, ioe), so = P(t, t2 - .3, t2 + .25, E.inCubic);
      sw.style.opacity = (si * (1 - so)).toFixed(3); sw.style.display = so >= 1 ? "none" : "";
      sw.style.transform = `translateY(${(1 - si) * 140}px) rotateX(${mix(22, 0, si)}deg) scale(${1 - so * .05})`;
      typeInto(q, "Twoja firma opinie", t, a + .7, 20);
      RES.forEach((r, i) => { const s = tSp + .1 + i * .15, v = P(t, s, s + .4, oc); r.style.opacity = v.toFixed(3); r.style.transform = `translateY(${(1 - v) * 20}px)`; });
      const pi = P(t, t2 - .05, t2 + .8, ioe), mo = P(t, t3 - .2, t3 + .5, E.inCubic);
      me.style.opacity = (pi * (1 - mo)).toFixed(3); me.style.display = pi > 0 && mo < 1 ? "" : "none";
      me.style.transform = `translate(${(1 - pi) * -200 - mo * 120}px, 0) rotateY(${mix(14, 6, pi)}deg)`;
      me.ls.style.opacity = P(t, tMi - .2, tMi + .2).toFixed(3);
      const cx = mix(0, -330, P(t, t3 - .2, t3 + .8, ioe));
      comp.style.opacity = pi.toFixed(3); comp.style.display = pi > 0 ? "" : "none";
      comp.style.transform = `translate(${(1 - pi) * 200 + cx}px, 0) rotateY(${mix(-14, -6, pi) * (1 - P(t, t3, t3 + .8))}deg) scale(${mix(1, 1.08, P(t, t3, t3 + .8, ioe))})`;
      comp.classList.toggle("ring2", t > tZna);
      comp.np.textContent = 24 + Math.round(P(t, tZos - .2, tZau + .5) * 21);
      const pv = spring(t - tZna - .1, 2, .62); pick.style.opacity = (t > tZna ? 1 - mo : 0).toFixed(3); pick.style.transform = `scale(${t > tZna ? Math.min(1.05, pv) : 0})`;
      curAt(cur, t, [[0, 0, 600, 500, 0], [tWy - 1, .2, 600, 500, 1], [tWy - .9, .9, 380, 120, 1], [tZna + .5, .3, 380, 120, 0]]);
      rp(t, tZna);
      hearts.forEach((h, i) => { const s = tZos + i * .28, d = t - s; h.style.opacity = d > 0 && d < 1.6 ? (1 - d / 1.6).toFixed(3) : 0;
        h.style.transform = `translate(${Math.sin(d * 3 + i) * 24 - 330 * P(t, t3 - .2, t3 + .8, ioe)}px, ${-d * 150}px) scale(${.7 + (i % 3) * .2})`; });
      const tv = spring(t - tZau + .2, 1.9, .6); trust.style.opacity = t > tZau - .2 ? 1 : 0; trust.style.transform = `scale(${t > tZau - .2 ? Math.min(1.05, tv) : 0})`;
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.4, 0, 0, 1, 3, 0, 0], [t2, 1.2, 0, 0, 1, 2, 0, 0], [tWy, 1.1, 160, 0, 1.04, 2, -2, 0], [t3, 1.2, -60, 0, 1.02, 2, 0, 0]], t));
    };
  }, { inD: .6, outD: .55 });
})();

// ============================================================ 4. PSYCHOLOGICZNY MONTAŻ: zwykła rolka (ściana w dół) -> nasza (utrzymanie) + 4 chwyty + kolejne osoby
(() => {
  const a = LS("x1") - .35, z = LS("k1") - .35, tTr = W("x1", "trzech"), t2 = LS("x2"), tPrz = W("x2", "przewijają"), tPl = W("x2", "platforma"), tPok = W("x2", "pokazywać"),
    t3 = LS("x3"), tPs = W("x3", "psychologiczny"), t4 = LS("x4"), tPyt = W("x4", "pytanie"), tPow = W("x4", "powód"), tOb = W("x4", "obraz"), tWez = W("x4", "wezwanie"),
    t5 = LS("x5"), tKon = W("x5", "końca"), tKol = W("x5", "kolejnym");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Większość rolek przegrywa w [3 sekundy]", HY, 62, [W("x1", "większość"), W("x1", "rolek"), W("x1", "przegrywa"), W("x1", "w"), tTr, W("x1", "sekundach")]);
    const H2 = HX(e, "Ludzie [przewijają] dalej", HY, 62, ws("x2", "ludzie", 3));
    const H2b = HX(e, "Platforma przestaje je [pokazywać]", HY, 62, ws("x2", "platforma", 4));
    const H3 = HX(e, "Dlatego montujemy [inaczej].", HY, 62, ws("x3", "dlatego", 3));
    const H3b = HX(e, "[Psychologiczny montaż] rolek", HY, 70, [tPs, W("x3", "montaż"), W("x3", "rolek")], { cls: "big" });
    const H4a = HX(e, "Pytanie, które [zatrzymuje kciuk]", HY, 62, [tPyt, W("x4", "które"), W("x4", "zatrzymuje"), W("x4", "kciuk")]);
    const H4b = HX(e, "Potem powód, żeby [zostać]", HY, 62, [W("x4", "potem"), tPow, W("x4", "żeby"), W("x4", "zostać")]);
    const H4c = HX(e, "Obraz zmienia się [co sekundę]", HY, 62, [tOb, W("x4", "zmienia"), W("x4", "się"), W("x4", "co"), W("x4", "sekundę")]);
    const H4d = HX(e, "Na końcu [jedno wezwanie]", HY, 62, [W("x4", "na", 1), W("x4", "końcu"), W("x4", "jedno"), tWez]);
    const H5 = HX(e, "Ludzie oglądają [do końca]", HY, 62, ws("x5", "ludzie", 4));
    const H5b = HX(e, "Platforma pokazuje [kolejnym osobom]", HY, 62, [W("x5", "platforma"), W("x5", "pokazuje"), tKol, W("x5", "osobom")]);
    const AX = '<line x1="0" y1="300" x2="760" y2="300" stroke="#e3e3e9" stroke-width="2"/><text x="0" y="326" font-size="17" fill="#8b8b95" font-family="Inter">start</text>' +
      '<text x="380" y="326" font-size="17" fill="#8b8b95" font-family="Inter" text-anchor="middle">ilu widzów zostaje (schemat)</text><text x="760" y="326" font-size="17" fill="#8b8b95" font-family="Inter" text-anchor="end">koniec rolki</text>';
    const card = (x, title, cls) => { const c = vcard(cam, x, 90, 840, 520, `<div class="cn ${cls}">${title}</div><svg class="ch" viewBox="0 0 760 340" style="position:absolute;left:40px;top:110px;width:760px;height:340px;overflow:visible">${AX}</svg>`); return c; };
    const L = card(0, "Zwykła rolka", ""), R = card(440, `<span>${STAR("#111113")}</span>Psychologiczny montaż rolek`, "y");
    const RED = "M0 22 C 30 26, 60 210, 110 250 C 200 285, 480 290, 760 292", YEL = "M0 22 C 160 30, 360 44, 520 54 S 700 66, 760 70";
    const sv = L.querySelector("svg.ch"), sy = R.querySelector("svg.ch");
    sv.insertAdjacentHTML("beforeend", `<path class="ar" d="${RED} L760 300 L0 300 Z" fill="rgba(214,58,61,.10)"/><path class="ln" d="${RED}" fill="none" stroke="#d63a3d" stroke-width="8" stroke-linecap="round"/>
      <line class="m3" x1="76" y1="0" x2="76" y2="300" stroke="#d63a3d" stroke-width="3" stroke-dasharray="8 8"/><g class="m3"><rect x="90" y="96" width="72" height="38" rx="10" fill="#d63a3d"/><text x="126" y="122" font-size="22" font-weight="800" fill="#fff" font-family="Inter" text-anchor="middle">3 s</text></g>`);
    sy.insertAdjacentHTML("beforeend", `<path class="ar" d="${YEL} L760 300 L0 300 Z" fill="rgba(255,214,10,.18)"/><path class="ln" d="${YEL}" fill="none" stroke="#ffbf00" stroke-width="8" stroke-linecap="round"/>`);
    const DOTS = [[40, 23], [210, 34], [430, 48], [730, 68]].map(([x, y], i) => { sy.insertAdjacentHTML("beforeend", `<g class="dt" data-i="${i}"><circle cx="${x}" cy="${y}" r="20" fill="#111113"/><text x="${x}" y="${y + 7}" font-size="20" font-weight="900" fill="#ffd60a" font-family="Montserrat" text-anchor="middle">${i + 1}</text></g>`); return sy.lastElementChild; });
    const lnL = sv.querySelector(".ln"), arL = sv.querySelector(".ar"), m3 = [...sv.querySelectorAll(".m3")], lnR = sy.querySelector(".ln"), arR = sy.querySelector(".ar");
    [lnL, lnR].forEach(l => { l.style.strokeDasharray = 1000; l.style.strokeDashoffset = 1000; });
    const scroll = vp(cam, IK.x, "Platforma przestaje ją pokazywać", 0, 410, "rd lg");
    const swipe = ctr(cam, "", `<svg viewBox="0 0 40 60" style="width:40px;height:60px"><path d="M20 54V8M8 20l12-12 12 12" fill="none" stroke="#d63a3d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, -330, -60, 40, 60); swipe.style.position = "absolute";
    const CHW = [["Pytanie na start", tPyt], ["Powód, żeby zostać", tPow], ["Nowy obraz co 1-2 s", tOb], ["Jedno wezwanie", tWez]].map(([s, tt], i) => { const p = vp(e, `<b style="font:900 21px/1 var(--d)">${i + 1}</b>`, s, [300, 730, 1180, 1620][i], 985, ""); p.tt = tt; return p; });
    const PP = Array.from({ length: 10 }, (_, i) => ctr(cam, "ppl", IK.user, 440 - 270 + i * 60, 300, 48, 48));
    const end = vp(cam, IK.check, "do końca", 790, -70, "gr");
    sfx("WH_SOFT", a + .3, -26); sfx("IMP_SOFT", tTr, -24); sfx("WH_SWING", tPrz - .1, -25); sfx("WH_SOFT", t3 + .1, -24); sfx("IMP_SOFT", tPs, -22);
    [tPyt, tPow, tOb, tWez].forEach(x => sfx("POP", x, -24)); for (let i = 0; i < 10; i++) sfx("POP", tKol + i * .08, -34);
    return (lt, t) => {
      H1.up(t, t2 - .4); H2.up(t, tPl - .4); H2b.up(t, t3 - .4); H3.up(t, tPs - .4); H3b.up(t, t4 - .4); H4a.up(t, tPow - .3); H4b.up(t, tOb - .3); H4c.up(t, W("x4", "na", 1) - .3); H4d.up(t, t5 - .4);
      H5.up(t, W("x5", "platforma") - .4); H5b.up(t);
      // left card: centred while alone, then slides left when ours arrives
      const li = P(t, a + .05, a + .9, ioe), sl = P(t, t3 - .1, t3 + .9, ioe);
      L.style.opacity = (li * mix(1, .55, P(t, t4, t4 + .6))).toFixed(3);
      L.style.transform = `translate(${mix(0, -440, sl)}px, ${(1 - li) * 140}px) rotateX(${mix(20, 0, li)}deg) scale(${mix(1.06, .98, sl)})`;
      lnL.style.strokeDashoffset = (1000 * (1 - P(t, a + .6, tTr + .6, ioc))).toFixed(1); arL.style.opacity = P(t, tTr, tTr + .6).toFixed(3);
      m3.forEach(m => { m.style.opacity = P(t, tTr - .1, tTr + .3).toFixed(3); });
      swipe.style.opacity = (P(t, tPrz - .2, tPrz + .1) * (1 - sl)).toFixed(3); swipe.style.transform = `translateY(${-((t * 140) % 80)}px)`;
      const sc = spring(t - tPok + .2, 2, .62); scroll.style.opacity = (t > tPok - .2 ? 1 - sl : 0).toFixed(3); scroll.style.transform = `scale(${t > tPok - .2 ? Math.min(1.05, sc) : 0})`;
      // our card
      const ri = P(t, t3 + .1, t3 + 1, ioe);
      R.style.opacity = ri.toFixed(3); R.style.display = ri > 0 ? "" : "none";
      R.style.transform = `translate(${(1 - ri) * 260}px, 0) rotateY(${mix(-18, 0, ri)}deg) scale(${mix(.94, 1.02, ri)})`;
      lnR.style.strokeDashoffset = (1000 * (1 - P(t, tPyt - .3, tWez + .5, (x) => x))).toFixed(1); arR.style.opacity = P(t, tPyt, tWez + .6).toFixed(3);
      DOTS.forEach((d, i) => { const s = [tPyt, tPow, tOb, tWez][i], v = spring(t - s, 2.2, .55); d.style.opacity = t > s ? 1 : 0; d.style.transform = `scale(${t > s ? Math.min(1.15, v) : 0})`; d.style.transformBox = "fill-box"; d.style.transformOrigin = "50% 50%"; });
      CHW.forEach(p => { const v = spring(t - p.tt, 2, .62); p.style.opacity = t > p.tt ? 1 : 0; p.style.transform = `scale(${t > p.tt ? Math.min(1.05, v) : 0})`; });
      const ev = spring(t - tKon + .1, 2, .6); end.style.opacity = t > tKon - .1 ? 1 : 0; end.style.transform = `scale(${t > tKon - .1 ? Math.min(1.06, ev) : 0})`;
      PP.forEach((p, i) => { const s = tKol + i * .08, v = spring(t - s, 2, .6); p.style.opacity = t > s ? 1 : 0; p.style.transform = `scale(${t > s ? Math.min(1.08, v) : 0})`; });
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.4, 0, 0, 1, 3, 0, 0], [tTr - .3, 1, -120, 40, 1.08, 2, 0, 0], [t2 + .3, 1.2, 0, 0, 1, 3, 0, 0], [t3, 1.2, 0, 0, 1, 3, 0, 0],
        [tPs + .3, 1.2, 0, 20, 1.02, 2, 0, 0], [tWez + .2, 1.2, 0, 0, 1, 3, 0, 0], [tKol, 1, 0, 40, 1.03, 2, 0, 0]], t));
    };
  }, { inD: .6, outD: .55 });
})();
