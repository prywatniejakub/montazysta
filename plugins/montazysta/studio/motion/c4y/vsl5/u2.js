"use strict";
// u2.js — VSL v5: 5 plan tematów (scena z v4, ten sam głos), 6 rolki pod Twoją firmę
// ============================================================ 4. PLAN TEMATÓW
(() => {
  const a = LS("k1") - .35, z = LS("f1") - .35, t2 = LS("k2"), tNaj = W("k2", "najwięcej"), tR = W("k2", "rozpisujemy"), t3 = LS("k3"), t4 = LS("k4"), tAcc = W("k4", "akceptujesz"), tBez = W("k4", "bez");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Zaczynamy od [planu].", HY, 62, ws("k1", "zaczynamy", 3));
    const H2 = HX(e, "Tematy, które w Twojej branży [już działają]", HY, 62, [W("k2", "tematy"), W("k2", "które"), W("k2", "w"), W("k2", "twojej"), W("k2", "branży"), W("k2", "już"), W("k2", "zebrały")]);
    const H2b = HX(e, "Rozpisane na [formaty], które niosą zasięgi", HY, 62, [tR, W("k2", "na", 1), W("k2", "formaty"), W("k2", "które", 1), W("k2", "niosą"), W("k2", "zasięgi")]);
    const H3 = HX(e, "Na przykład [ranking]: A czy B?", HY, 62, [...ws("k3", "na", 3), W("k3", "a"), W("k3", "a") + .2, W("k3", "b")]);
    const H4 = HX(e, "Plan na cały miesiąc [akceptujesz Ty]", HY, 62, [...ws("k4", "plan", 5), W("k4", "akceptujesz") + .2]);
    const H5 = HX(e, "Bez Twojej zgody [nic nie wychodzi].", HY, 62, ws("k4", "bez", 6));
    const sh = shell(cam);
    // layer 1: the plan document (k1)
    const L1 = layer(sh); Object.assign(L1.style, { width: "640px", height: "560px" });
    ttl(L1, IK.doc, "Plan tematów", 36, 34); at(L1, "sub", "15 rolek · do akceptacji", 36, 96);
    [0, 1, 2, 3, 4, 5].forEach(i => at(L1, "sk", "", 36, 160 + i * 62, 320 + (i * 97) % 220, 14));
    // layer 2: industry topics sorted by views + formats (k2)
    const L2 = layer(sh); Object.assign(L2.style, { width: "1400px", height: "700px" });
    L2.innerHTML = `<div style="position:absolute;left:0;right:0;top:0;height:50px;background:#f7f7f9;border-bottom:1px solid rgba(17,17,19,.08);display:flex;align-items:center;gap:9px;padding-left:20px">
      <i style="width:13px;height:13px;border-radius:50%;background:#ff5f57"></i><i style="width:13px;height:13px;border-radius:50%;background:#febc2e"></i><i style="width:13px;height:13px;border-radius:50%;background:#28c840"></i></div>`;
    const sb = at(L2, "", `<span class="ic2" style="width:26px;height:26px;color:#8b8b95">${IK.zoom}</span><span class="q" style="font:600 24px/1 var(--font)"></span>`, 40, 80, 560, 60);
    Object.assign(sb.style, { position: "absolute", display: "flex", alignItems: "center", gap: "14px", padding: "0 22px", boxSizing: "border-box", borderRadius: "16px", background: "#f5f5f7" });
    const q = sb.querySelector(".q");
    const sort = at(L2, "", chip(IK.eye, "najwięcej wyświetleń", "y"), 624, 94); sort.style.position = "absolute";
    const TH8 = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const c = i % 4, r = Math.floor(i / 4), x = 40 + c * 214, y = 170 + r * 248;
      const th = at(L2, "shot", `<div style="position:absolute;left:10px;bottom:10px;display:flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:9px;background:rgba(17,17,19,.75);color:#fff;font:700 16px/1 var(--font)"><span class="ic2" style="width:17px;height:17px">${IK.eye}</span>${VIEWS[i]}</div>`, x, y, 196, 230);
      th.style.backgroundImage = `url(${TH(REELS[i], 50)})`; return th; });
    at(L2, "sub", "przykładowe dane", 40, 664).style.fontSize = "15px";
    const fx = 930, FCOL = at(L2, "", "", fx, 80, 430, 580); Object.assign(FCOL.style, { position: "absolute", borderRadius: "20px", background: "#f7f7f9" });
    ttl(FCOL, IK.star, "Formaty", 26, 26);
    const FM = [["Ranking A / B", 0], ["Mit czy fakt?", 1], ["Ile to kosztuje?", 2], ["Błąd, który robi każdy", 3]];
    const FR = FM.map(([f, i]) => { const r = at(FCOL, "", `<div style="width:54px;height:72px;border-radius:9px;background:url(${TH(REELS[i], 50)}) center 30%/cover;flex:none"></div><span>${f}</span>`, 26, 104 + i * 112, 378, 90);
      Object.assign(r.style, { position: "absolute", display: "flex", alignItems: "center", gap: "16px", padding: "9px 14px", boxSizing: "border-box", borderRadius: "16px", background: "#fff", boxShadow: "0 6px 16px rgba(17,17,19,.06)", font: "700 22px/1.2 var(--font)", whiteSpace: "nowrap" });
      return r; });
    // layer 3: ranking A / B / C (k3)
    const L3 = layer(sh); Object.assign(L3.style, { width: "1180px", height: "600px" });
    ttl(L3, IK.star, "Format: ranking", 36, 30);
    const ROWS = [["A", "linear-gradient(160deg,#ffe45c,#ffc400)"], ["B", "#fff1a6"], ["C", "#ececf1"]].map(([l, bg], r) => {
      const row = at(L3, "tier", `<div class="lb" style="background:${bg}">${l}</div>`, 36, 98 + r * 162, 1108, 138); row.style.position = "absolute"; row.th = [];
      for (let k = 0; k < (r === 2 ? 3 : 5); k++) { const th = el(row, "div", "th"); th.style.backgroundImage = `url(${TH(REELS[(r * 5 + k + 3) % REELS.length], 45)})`; row.th.push(th); }
      return row; });
    // layer 4: the month plan + accept (k4)
    const L4 = layer(sh); Object.assign(L4.style, { width: "1240px", height: "660px" });
    ttl(L4, IK.doc, "Plan tematów na miesiąc", 36, 30); at(L4, "sub", "15 rolek", 1110, 44);
    const PR = Array.from({ length: 15 }, (_, i) => { const c = Math.floor(i / 8), r = i % 8, x = 36 + c * 600, y = 100 + r * 54;
      const tg = [["Ranking", IK.star], ["Mit czy fakt", IK.text], ["Ile kosztuje", IK.money], ["Błąd", IK.x]][i % 4];
      return at(L4, "row", `<b class="num" style="width:36px;height:36px;border-radius:50%;background:${i % 4 ? "#f1f1f4" : "#ffd60a"};display:flex;align-items:center;justify-content:center;font:700 16px/1 var(--font)">${i + 1}</b><i style="display:block;width:${170 + (i * 53) % 130}px;height:12px;border-radius:7px;background:#e8e8ee"></i>${chip(tg[1], tg[0])}`, x, y); });
    const btn = ctr(L4, "btn", `${IK.check}Akceptuję plan`, 470, 590, 340, 76), btnOk = ctr(L4, "btn okg", `${IK.check}Zaakceptowany`, 470, 590, 340, 76);
    const lock = at(L4, "", chip(IK.lock, "Bez Twojej zgody nic nie wychodzi", "dk"), 680, 574); lock.style.position = "absolute"; lock.firstChild.style.height = "44px"; lock.firstChild.style.fontSize = "19px"; lock.firstChild.style.padding = "0 16px";
    const cur = cursor4(cam), rp = rip4(cam, -150, 330);
    const KEYS = [[a, 0, 0, 60, 640, 560, 28], [t2 - .05, 1.0, 0, 70, 1400, 700, 24], [t3 - .1, .9, 0, 70, 1180, 600, 28], [t4 - .1, .9, 0, 70, 1240, 660, 28]];
    sfx("CLICK", tAcc + .05, -18); sfx("DING", tAcc + .2, -24); sfx("WH_SOFT", t2, -26); sfx("WH_SOFT", t3, -26); sfx("WH_SOFT", t4, -26);
    [0, 1, 2, 3].forEach(i => sfx("POP", tR + .25 + i * .3, -30));
    return (lt, t) => {
      H1.up(t, t2 - .4); H2.up(t, tR - .4); H2b.up(t, t3 - .4); H3.up(t, t4 - .4); H4.up(t, tBez - .4); H5.up(t);
      const [cx, cy, w, h, r] = morph(sh, KEYS, t);
      const si = P(t, a + .05, a + .8, oc); sh.style.opacity = si.toFixed(3); sh.style.transform = `translateY(${(1 - si) * 120}px) rotateX(${mix(24, 0, si)}deg)`;
      fadeIO(L1, t, a, t2 + .1, .4); fadeIO(L2, t, t2 + .3, t3 + .05, .45); fadeIO(L3, t, t3 + .25, t4 + .05, .45); fadeIO(L4, t, t4 + .25, 1e9, .45);
      typeInto(q, "Twoja branża", t, t2 + .7, 18);
      sort.style.opacity = P(t, tNaj - .2, tNaj + .2).toFixed(3);
      TH8.forEach((th, i) => { const s = t2 + .9 + i * .08, v = spring(t - s, 2, .62); th.style.opacity = t > s ? 1 : 0; th.style.transform = `scale(${t > s ? Math.min(1.04, .5 + .5 * v) : 0})`;
        const on = i < 4 && t > tNaj + i * .15; th.style.outline = on ? "5px solid #ffbf00" : "none"; th.style.outlineOffset = "4px"; });
      FCOL.style.opacity = P(t, tR - .3, tR + .2).toFixed(3);
      FR.forEach((r, i) => { const s = tR + .25 + i * .3, v = P(t, s, s + .55, ioe); r.style.opacity = clamp((t - s) / .2).toFixed(3); r.style.transform = `translateX(${(1 - v) * -320}px) scale(${mix(.8, 1, v)})`; });
      ROWS.forEach((row, ri) => { const s0 = [W("k3", "a") - .1, W("k3", "b") - .1, LE("k3") + .1][ri];
        row.th.forEach((th, k) => { const s = s0 + k * .08, v = spring(t - s, 2.1, .6); th.style.opacity = t > s ? 1 : 0; th.style.transform = `translateY(${t > s ? (1 - Math.min(1, v)) * -70 : -70}px)`; }); });
      PR.forEach((rw, i) => { const s = t4 + .5 + i * .06; rw.style.opacity = P(t, s, s + .3).toFixed(3); rw.style.transform = `translateX(${(1 - P(t, s, s + .4, oc)) * 24}px)`; });
      const ok = t > tAcc + .05; btn.style.display = ok ? "none" : ""; btnOk.style.display = ok ? "" : "none";
      const bp = ok ? spring(t - tAcc - .05, 2.4, .5) : 1; btnOk.style.transform = `scale(${ok ? Math.min(1.06, .85 + .15 * bp) : 1})`;
      lock.style.opacity = P(t, tBez - .1, tBez + .3).toFixed(3); lock.style.transform = `translateX(${(1 - P(t, tBez - .1, tBez + .5, oc)) * 30}px)`;
      // button in cam coords (shell top-left + 470, 590)
      const bx = cx - w / 2 + 470, by = cy - h / 2 + 590;
      curAt(cur, t, [[0, 0, 700, 600, 0], [tAcc - 1.2, .2, 700, 600, 1], [tAcc - 1.1, 1.0, bx + 20, by + 8, 1], [tAcc + .6, .4, bx + 20, by + 8, 0]]);
      rp(t, tAcc + .05);
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 5, 0, 0], [a, 2, 0, 0, 1, 4, 0, 0], [tNaj - .3, 1.2, -160, 50, 1.05, 3, -3, 0], [tR, 1.2, 0, 30, 1.02, 3, 0, 0], [t3 - .1, 1.1, 0, 0, 1, 4, 0, 0],
        [t4 - .1, 1.1, 0, 0, 1, 3, 0, 0], [tAcc - .7, 1, 0, 100, 1.05, 2, 0, 0], [tBez + .6, 1.2, 0, 40, 1.02, 3, 0, 0]], t));
    };
  }, { inD: .7, outD: .55 });
})();

// ============================================================ 6. ROLKI POD TWOJĄ FIRMĘ: edukacyjne z ekspertem / Twoi ludzie i realizacje / postać marki -> dobierzemy na rozmowie
(() => {
  const a = LS("f1") - .35, z = LS("w1") - .35, t2 = LS("f2"), tEd = W("f2", "edukacyjne"), tTw = W("f2", "twoimi"), t3 = LS("f3"), tPo = W("f3", "postać"), t4 = LS("f4"), tDo = W("f4", "dobierzemy");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Każda firma potrzebuje [czegoś innego]", HY, 62, ws("f1", "każda", 5));
    const H2 = HX(e, "Rolki [edukacyjne] z ekspertem", HY, 62, [W("f2", "rolki"), tEd, W("f2", "z"), W("f2", "ekspertem")]);
    const H2b = HX(e, "Z Twoimi [ludźmi i realizacjami]", HY, 62, [W("f2", "z", 1), tTw, W("f2", "ludźmi"), W("f2", "i"), W("f2", "realizacjami")]);
    const H3 = HX(e, "Albo [postać dla Twojej marki]", HY, 62, [W("f3", "albo"), tPo, W("f3", "dla"), W("f3", "twojej"), W("f3", "marki")]);
    const H4 = HX(e, "Na rozmowie [dobierzemy], co pasuje", HY, 62, [W("f4", "na"), W("f4", "rozmowie"), tDo, W("f4", "co"), W("f4", "pasuje")]);
    const X = [-520, 0, 520], SL = X.map((x, i) => { const s = ctr(cam, "slot", `?<small>Twoja firma</small>`, x, 60, 300, 520); s.i = i; return s; });
    const PH = [["c13", IK.bulb, "Edukacyjne z ekspertem", tEd], ["c07", IK.building, "Twoi ludzie i realizacje", tTw], ["ad12_hook", IK.user, "Postać dla Twojej marki", tPo]].map(([c, ic, lb, tt], i) => {
      const p = phoneX(cam, X[i], 60, 300, c); p.tt = tt; p.lb = vp(cam, ic, lb, X[i], 380, i === 2 ? "dk" : ""); p.i = i;
      if (i === 2) { const ai = el(p.scr, "div", "aic", "AI"); }  // brand rule: only a small, barely visible "AI" circle top-right
      return p; });
    const dob = vp(e, IK.chat, "Dobierzemy na rozmowie", 960, 1000, "y lg");
    sfx("WH_SOFT", a + .3, -26); PH.forEach(p => { sfx("WH_SWING", p.tt - .15, -26); sfx("POP", p.tt, -26); }); [0, 1, 2].forEach(i => sfx("CLICK", tDo + .1 + i * .35, -26));
    return (lt, t) => {
      H1.up(t, t2 - .4); H2.up(t, tTw - .4); H2b.up(t, t3 - .4); H3.up(t, t4 - .4); H4.up(t);
      SL.forEach(s => { const si = P(t, a + .2 + s.i * .12, a + .8 + s.i * .12, oc), so = P(t, PH[s.i].tt - .3, PH[s.i].tt, E.inCubic);
        s.style.opacity = (si * (1 - so)).toFixed(3); s.style.display = so >= 1 ? "none" : ""; s.style.transform = `translateY(${(1 - si) * 90}px)`; });
      const pick = t > tDo + .1 ? Math.min(2, Math.floor((t - tDo - .1) / .35)) : -1;
      PH.forEach(p => { const s = p.tt - .2, v = spring(t - s, 1.8, .64), on = t > s;
        p.style.opacity = clamp((t - s) / .2).toFixed(3); p.style.display = on ? "" : "none";
        p.style.transform = `translateY(${Math.sin(t * 1.2 + p.i) * 7}px) rotateY(${(p.i - 1) * -7}deg) scale(${on ? Math.min(1.05, .6 + .4 * v) : 0})`;
        if (on) p.draw(t - s + .5);
        p.classList.toggle("ring", pick === p.i || (pick === 2 && t > tDo + 1.4));
        const lv = spring(t - s - .25, 2, .62); p.lb.style.opacity = t > s + .25 ? 1 : 0; p.lb.style.transform = `scale(${t > s + .25 ? Math.min(1.05, lv) : 0})`; });
      const dv = spring(t - tDo + .1, 1.9, .6); dob.style.opacity = t > tDo - .1 ? 1 : 0; dob.style.transform = `scale(${t > tDo - .1 ? Math.min(1.06, dv) : 0})`;
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.2, 0, 0, 1, 3, 0, 0], [tEd - .2, 1.2, -60, 10, 1.03, 2, 0, 0], [tTw - .2, 1.2, 0, 10, 1.03, 2, 0, 0], [tPo - .2, 1.2, 60, 10, 1.03, 2, 0, 0], [t4, 1.2, 0, 0, 1, 3, 0, 0]], t));
    };
  }, { inD: .6, outD: .55 });
})();
