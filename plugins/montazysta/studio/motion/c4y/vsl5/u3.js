"use strict";
// u3.js — VSL v5: 7 paczka co tydzień (scena z v4, ten sam głos), 8 kto za tym stoi, 9 gwarancja, 10 umów rozmowę
// ============================================================ 7. PACZKA CO TYDZIEŃ
(() => {
  const a = LS("w1") - .35, z = LS("b1") - .35, tTg = W("w1", "telegramie"), tPk = W("w1", "paczkę"), tO = W("w1", "opisy"), tG = W("w1", "godzinę"),
    t2 = LS("w2"), tPora = W("w2", "porze"), tNie = W("w2", "nie");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Co tydzień na Telegramie: [paczka]", HY, 62, [...ws("w1", "co", 4), tPk]);
    const H2 = HX(e, "Wrzucasz o [wskazanej porze]", HY, 62, ws("w2", "wrzucasz", 4));
    const H3 = HX(e, "Nie myślisz, [co dziś wrzucić].", HY, 62, ws("w2", "nie", 5));
    const ph = phoneUI(cam, -380, 70, 390);
    ph.ui.style.background = "linear-gradient(170deg, #fff8d6 0%, #ffe680 55%, #ffd23f 100%)";
    const lock = el(ph.ui, "div", "", `<div style="position:absolute;left:0;right:0;top:70px;text-align:center;font:500 22px/1 var(--font);color:rgba(17,17,19,.6)">poniedziałek</div><div class="num" style="position:absolute;left:0;right:0;top:100px;text-align:center;font:700 108px/1 var(--font);letter-spacing:-.04em;color:#111113">9:00</div>`);
    Object.assign(lock.style, { position: "absolute", inset: 0 });
    const nt = at(ph.ui, "ntf", `<i>${TGI}</i><div><b>Clips4you</b><span>Paczka na ten tydzień 📦</span><span style="color:#8b8b95">4 rolki gotowe do wrzucenia</span></div><small>teraz</small>`, 14, 250, ph.sw - 28);
    const ch = el(ph.ui, "div", ""); Object.assign(ch.style, { position: "absolute", inset: 0, background: "#eef1f5" });
    ch.innerHTML = `<div style="position:absolute;left:0;right:0;top:0;height:90px;background:#fff;border-bottom:1px solid #e3e6eb;display:flex;align-items:flex-end;gap:12px;padding:0 18px 14px;box-sizing:border-box">
      <div style="width:44px;height:44px;border-radius:50%;background:#111113;display:flex;align-items:center;justify-content:center"><span class="ic2" style="width:24px;height:24px">${STAR()}</span></div>
      <div><div style="font:700 19px/1.2 var(--font)">Clips4you · Twoja paczka</div><div style="font:500 15px/1.2 var(--font);color:#8b8b95">tydzień 2</div></div></div>`;
    const DAYS = [["Pon", "18:00"], ["Śr", "12:30"], ["Pt", "19:00"], ["Nd", "17:30"]];
    const MS = DAYS.map(([d, h], i) => { const m = at(ch, "", `<div style="width:78px;height:108px;border-radius:12px;background:url(${TH(REELS[i * 3 + 1], 40)}) center 30%/cover;flex:none"></div>
      <div style="display:flex;flex-direction:column;gap:8px;min-width:0"><div class="o" style="display:flex;align-items:center;gap:6px;font:600 15px/1 var(--font);color:#1f9d55"><span class="ic2" style="width:16px;height:16px">${IK.check}</span>Opis gotowy</div>
      <div class="hh" style="position:relative;height:30px"><span class="h">${chip(IK.clock, `<span class="num">${d} ${h}</span>`, "y")}</span><span class="pb" style="position:absolute;left:0;top:0;opacity:0">${chip(IK.check, "Opublikowano", "cg")}</span></div>
      <div class="p" style="display:flex;gap:4px">${PLAT.map(k => `<span style="width:20px;height:20px;border-radius:5px;overflow:hidden;display:block">${plogo(k)}</span>`).join("")}</div></div>`, 14, 102 + i * 130, ph.sw - 28, 120);
      Object.assign(m.style, { position: "absolute", display: "flex", gap: "14px", padding: "6px", boxSizing: "border-box", borderRadius: "16px", background: "#fff", boxShadow: "0 4px 12px rgba(17,17,19,.06)" });
      m.o = m.querySelector(".o"); m.h = m.querySelector(".h"); m.pb = m.querySelector(".pb"); m.p = m.querySelector(".p"); return m; });
    const wk = vcard(cam, 410, 40, 640, 470, "");
    ttl(wk, IK.cal, "Ten tydzień", 32, 28);
    const WD = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"], SL = { 0: 0, 2: 1, 4: 2, 6: 3 };
    const WC = WD.map((d, i) => { const c = at(wk, "", `<div style="font:700 18px/1 var(--font);color:#8b8b95;text-align:center;margin-top:12px">${d}</div>`, 28 + i * 84, 96, 76, 344);
      Object.assign(c.style, { position: "absolute", borderRadius: "14px", background: "#f6f6f8" });
      if (i in SL) { const k = SL[i], s = el(c, "div", "", `<div class="num" style="position:absolute;left:4px;right:4px;bottom:6px;height:24px;border-radius:7px;background:rgba(17,17,19,.78);color:#fff;text-align:center;font:700 14px/24px var(--font)">${DAYS[k][1]}</div>`);
        Object.assign(s.style, { position: "absolute", left: "6px", right: "6px", top: px(48 + k * 44), height: "150px", borderRadius: "10px", background: `url(${TH(REELS[k * 3 + 1], 40)}) center 30%/cover`, boxShadow: "0 8px 18px rgba(17,17,19,.16)" }); c.s = s; c.k = k; }
      return c; });
    const done = at(wk, "", `<span class="ic2" style="width:28px;height:28px;color:#fff">${IK.check}</span>`, 28 + 38 - 26, 96 + 48 + 75 - 26, 52, 52);
    Object.assign(done.style, { position: "absolute", borderRadius: "50%", background: "#1f9d55", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(31,157,85,.4)" });
    const free = vp(e, IK.coffee, "Wracasz do pracy", 1370, 905, "dk");
    sfx("DING", tTg + .05, -18); sfx("CLICK", tPk, -22); sfx("CLICK", tPora + .2, -20); sfx("DING", tPora + .3, -26);
    return (lt, t) => {
      H1.up(t, t2 - .4); H2.up(t, tNie - .4); H3.up(t);
      const pi = P(t, a + .05, a + .9, ioe);
      ph.style.opacity = pi.toFixed(3); ph.style.transform = `translate(${(1 - pi) * -220}px, ${Math.sin(t * 1.1) * 7}px) rotateY(${mix(26, 9, pi)}deg)`;
      const ns = spring(t - tTg + .1, 1.8, .66); nt.style.opacity = t > tTg - .1 ? 1 : 0; nt.style.transform = `translateY(${t > tTg - .1 ? (1 - Math.min(1, ns)) * -160 : -160}px)`;
      const cv = P(t, tPk - .05, tPk + .45, ioe); ch.style.opacity = cv.toFixed(3); ch.style.transform = `translateY(${(1 - cv) * 60}px)`; lock.style.opacity = (1 - cv).toFixed(3); nt.style.display = cv >= 1 ? "none" : "";
      MS.forEach((m, i) => { const s = tPk + .2 + i * .14, v = P(t, s, s + .4, oc); m.style.opacity = v.toFixed(3); m.style.transform = `translateY(${(1 - v) * 30}px)`;
        m.o.style.opacity = P(t, tO - .1 + i * .08, tO + .2 + i * .08).toFixed(3); m.h.style.opacity = P(t, tG - .1 + i * .08, tG + .2 + i * .08).toFixed(3); m.p.style.opacity = P(t, tG + .3 + i * .08, tG + .6 + i * .08).toFixed(3);
        if (!i) { const pb = P(t, tPora + .15, tPora + .4); m.pb.style.opacity = pb.toFixed(3); m.h.style.opacity = Math.min(+m.h.style.opacity, 1 - pb).toFixed(3); } });
      const wi = P(t, tPk, tPk + .8, ioe);
      wk.style.opacity = wi.toFixed(3); wk.style.transform = `translate(${(1 - wi) * 240}px, 0) rotateY(${mix(-26, -7, wi)}deg)`;
      WC.forEach(c => { if (c.s) { const s = tG + c.k * .15, v = spring(t - s, 2, .62); c.s.style.opacity = t > s ? 1 : 0; c.s.style.transform = `scale(${t > s ? Math.min(1.05, v) : 0})`; } });
      const dv = spring(t - tPora - .3, 2.4, .55); done.style.opacity = t > tPora + .3 ? 1 : 0; done.style.transform = `scale(${t > tPora + .3 ? Math.min(1.1, dv) : 0})`;
      io(free, t, W("w2", "wracasz") - .1);
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.4, 0, 0, 1, 3, 0, 0], [tPk, 1.2, 0, 0, 1, 3, -2, 0], [t2, 1.2, -120, 30, 1.05, 3, 2, 0], [tNie, 1.2, 0, 0, 1, 3, 0, 0]], t));
    };
  }, { inD: .7, outD: .55 });
})();

// ============================================================ 8. KTO ZA TYM STOI: Kuba -> opinia klienta z OZE -> wyniki kampanii (zbliżenie) -> konto twórczyni (zbliżenie)
(() => {
  const a = LS("b1") - .35, z = LS("g1") - .35, tKu = W("b1", "kuba"), tOd = W("b1", "od"), t2 = LS("b2"), tOze = W("b2", "oze"), t3 = LS("b3"), tOs = W("b3", "osiemnaście"),
    tSi = W("b3", "siedemnaście"), tPi = W("b3", "piętnaście"), t4 = LS("b4"), tPr = W("b4", "prawie"), tWys = W("b4", "wyświetleń");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Kto [za tym stoi]?", HY, 66, ws("b1", "kto", 4));
    const H1b = HX(e, "Kuba, założyciel [Clips4you]", HY, 62, [tKu, W("b1", "założyciel"), W("b1", "clips")]);
    const H1c = HX(e, "Od 7 lat [marketing dla firm]", HY, 62, [tOd, W("b1", "siedmiu"), W("b1", "lat"), W("b1", "marketing"), W("b1", "dla"), W("b1", "firm")]);
    const H2 = HX(e, "Wcześniej: marketing firmy z [branży OZE]", HY, 62, [W("b2", "wcześniej"), W("b2", "marketing"), W("b2", "firmy"), W("b2", "z", 2), W("b2", "branży"), tOze]);
    const H3 = HX(e, "18 miesięcy · [15 mln zł przychodu]", HY, 62, [tOs, W("b3", "miesięcy"), W("b3", "miesięcy"), tPi, W("b3", "milionów"), W("b3", "złotych"), W("b3", "przychodu")]);
    const H4 = HX(e, "Konto twórczyni: [prawie 2 mln] wyświetleń", HY, 62, [W("b4", "konto"), W("b4", "twórczyni"), tPr, W("b4", "dwa"), W("b4", "miliony"), tWys]);
    // Kuba
    const kc = vcard(cam, 0, 80, 760, 520, `<div class="photo" style="left:0;top:0;width:340px;height:520px;background-image:url(kuba.jpg);background-position:center 25%"></div>
      <div style="position:absolute;left:390px;top:120px;font:800 64px/1 var(--d);letter-spacing:-.03em">Kuba</div>
      <div style="position:absolute;left:392px;top:200px;font:600 26px/1.3 var(--font);color:#6b6b74">założyciel Clips4you</div>
      <div class="kch" style="position:absolute;left:390px;top:290px">${chip(IK.clock, "7 lat marketingu dla firm", "y")}</div>
      <div style="position:absolute;left:390px;top:350px">${chip(IK.check, "reklamy i rolki", "")}</div>`);
    el(PRE, "img").src = "kuba.jpg";
    const kch = kc.querySelector(".kch"); kch.style.opacity = 0; [...kc.querySelectorAll(".chip")].forEach(c => { c.style.height = "46px"; c.style.fontSize = "21px"; c.style.padding = "0 18px"; });
    // the client's review (surname blurred)
    const rv = vcard(cam, 260, 60, 720, 437, `<img src="img/opinia.png" style="position:absolute;left:0;top:0;width:720px;height:437px">`);
    const rvTag = vp(cam, IK.star, "Opinia klienta z branży OZE", 260, -230, "dk");
    // campaign screenshot + zoom box on the totals
    const SW = 1300, SH = Math.round(SW * 761 / 2000), sk = SW / 2000;
    const cp = vcard(cam, 0, 70, SW, SH, `<img src="img/kampania.png" style="position:absolute;left:0;top:0;width:${SW}px;height:${SH}px">`);
    const hb = at(cp, "hlb", "", 560 * sk, 628 * sk, 205 * sk, 70 * sk);
    const STATS = [["18 miesięcy", IK.cal, tOs, 520], ["17 785 zgłoszeń", IK.user, tSi, 960], ["15 mln zł+ przychodu", IK.money, tPi, 1420]].map(([s, ic, tt, x]) => { const p = vp(e, ic, s, x, 990, "y lg"); p.tt = tt; return p; });
    // creator account screenshot + zoom
    const IW = 840, IH = Math.round(IW * 415 / 842);
    const ig = vcard(cam, 0, 70, IW, IH, `<img src="img/konto.png" style="position:absolute;left:0;top:0;width:${IW}px;height:${IH}px">`, "dk");
    const hb2 = at(ig, "hlb", "", 50 * IW / 842, 146 * IW / 842, 284 * IW / 842, 152 * IW / 842);
    const igTag = vp(e, IK.eye, "konto twórczyni · 30 dni", 960, 990, "dk lg");
    ["img/opinia.png", "img/kampania.png", "img/konto.png"].forEach(s => { el(PRE, "img").src = s; });
    sfx("WH_SOFT", a + .3, -26); sfx("POP", tKu, -24); sfx("POP", tOd, -26); sfx("WH_SWING", t2, -25); sfx("WH_SOFT", t3, -25);
    STATS.forEach(p => sfx("POP", p.tt, -24)); sfx("CLICK", tSi + .1, -24); sfx("WH_SOFT", t4, -25); sfx("DING", tPr + .3, -25);
    return (lt, t) => {
      H1.up(t, tKu - .35); H1b.up(t, tOd - .35); H1c.up(t, t2 - .4); H2.up(t, t3 - .4); H3.up(t, t4 - .4); H4.up(t);
      const ki = P(t, a + .05, a + .9, ioe), kl = P(t, t2 - .1, t2 + .8, ioe), ko = P(t, t3 - .3, t3 + .2, E.inCubic);
      kc.style.opacity = (ki * (1 - ko)).toFixed(3); kc.style.display = ko >= 1 ? "none" : "";
      kc.style.transform = `translate(${mix(0, -440, kl)}px, ${(1 - ki) * 140}px) rotateY(${mix(0, 8, kl)}deg) scale(${mix(1, .78, kl)})`;
      kch.style.opacity = P(t, tOd - .1, tOd + .2).toFixed(3);
      const ri = P(t, t2 + .1, t2 + .9, ioe);
      rv.style.opacity = (ri * (1 - ko)).toFixed(3); rv.style.display = ri > 0 && ko < 1 ? "" : "none";
      rv.style.transform = `translate(${(1 - ri) * 240}px, 0) rotateY(${mix(-18, -4, ri)}deg)`;
      io(rvTag, t, tOze - .2, t3 - .3);
      const ci = P(t, t3 - .1, t3 + .7, ioe), co = P(t, t4 - .3, t4 + .2, E.inCubic);
      cp.style.opacity = (ci * (1 - co)).toFixed(3); cp.style.display = ci > 0 && co < 1 ? "" : "none";
      cp.style.transform = `translateY(${(1 - ci) * 120}px) rotateX(${mix(18, 0, ci)}deg)`;
      const hv = P(t, tSi - .1, tSi + .3, oc); hb.style.opacity = hv.toFixed(3); hb.style.transform = `scale(${mix(1.4, 1, hv)})`;
      STATS.forEach(p => { const v = spring(t - p.tt, 2, .62), o = 1 - P(t, t4 - .3, t4, E.inCubic); p.style.opacity = (t > p.tt ? o : 0).toFixed(3); p.style.transform = `scale(${t > p.tt ? Math.min(1.05, v) : 0})`; });
      const gi = P(t, t4 - .05, t4 + .7, ioe);
      ig.style.opacity = gi.toFixed(3); ig.style.display = gi > 0 ? "" : "none";
      ig.style.transform = `translateY(${(1 - gi) * 120}px) scale(${mix(.92, 1, gi)})`;
      const h2v = P(t, tPr - .1, tPr + .3, oc); hb2.style.opacity = h2v.toFixed(3); hb2.style.transform = `scale(${mix(1.4, 1, h2v)})`;
      io(igTag, t, tPr + .2);
      // camera: zoom into the totals of the campaign, then into the views card
      const zx = -SW / 2 + 662 * sk, zy = 70 - SH / 2 + 663 * sk, ix = -IW / 2 + 192 * IW / 842, iy = 70 - IH / 2 + 222 * IW / 842;
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.4, 0, 0, 1, 3, 0, 0], [t2, 1.2, 0, 0, 1, 2, 0, 0], [t3, .9, 0, 0, 1, 2, 0, 0], [tSi - .3, 1.1, zx, zy - 160, 1.25, 0, 0, 0],
        [tPi + .4, 1.1, 0, 0, 1, 2, 0, 0], [t4 + .3, .9, 0, 0, 1, 2, 0, 0], [tPr - .3, 1.1, ix, iy, 1.5, 0, 0, 0], [tWys + .9, 1.2, ix * .4, iy * .4, 1.15, 0, 0, 0]], t));
    };
  }, { inD: .6, outD: .55 });
})();

// ============================================================ 9. GWARANCJA
(() => {
  const a = LS("g1") - .35, z = LS("c1") - .35, tJe = W("g1", "jedno"), tPi = W("g1", "piętnastu"), tKo = W("g1", "kolejny"), tDa = W("g1", "darmo");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "I jeszcze [jedno].", HY, 66, [W("g1", "i"), W("g1", "jeszcze"), tJe]);
    const H2 = HX(e, "Nie dowieziemy 15 rolek? [Kolejny miesiąc za darmo]", HY, 58, [W("g1", "nie"), W("g1", "dowieziemy"), tPi, W("g1", "rolek"), tKo, W("g1", "miesiąc", 1), W("g1", "za"), tDa]);
    const card = vcard(cam, 0, 90, 720, 420, `<div style="position:absolute;left:44px;top:44px;display:flex;align-items:center;gap:14px;font:700 30px/1 var(--font)"><span class="ic2" style="width:34px;height:34px">${IK.cal}</span>Twój miesiąc</div>
      <div class="num" style="position:absolute;left:44px;top:120px;font:800 140px/1 var(--d);letter-spacing:-.05em"><span class="n">0</span><span style="font-size:60px;color:#8b8b95"> / 15</span></div>
      <div style="position:absolute;left:44px;top:300px">${chip(IK.check, "rolek dowiezionych", "cg")}</div>`);
    const cn = card.querySelector(".n");
    const seal = ctr(cam, "seal", `<svg class="rt" viewBox="0 0 300 300"><defs><path id="sg5" d="M150 150 m-106 0 a106 106 0 1 1 212 0 a106 106 0 1 1 -212 0"/></defs><text font-family="Inter" font-weight="800" font-size="21" letter-spacing="3.5" fill="#111113"><textPath href="#sg5">GWARANCJA • GWARANCJA • GWARANCJA •</textPath></text></svg><div class="in">15 rolek<br>albo kolejny<br>miesiąc<br>za darmo</div>`, 330, -40, 300, 300);
    const rot = seal.querySelector(".rt");
    sfx("WH_SOFT", a + .3, -26); sfx("POP", tJe, -24); sfx("IMP_SOFT", tKo - .1, -22);
    return (lt, t) => {
      H1.up(t, W("g1", "jeśli") - .35); H2.up(t);
      const ci = P(t, a + .05, a + .9, ioe), sh = P(t, tKo - .3, tKo + .5, ioe);
      card.style.opacity = ci.toFixed(3); card.style.transform = `translate(${-200 * sh}px, ${(1 - ci) * 120}px) rotateX(${mix(18, 0, ci)}deg) scale(${mix(1, .92, sh)})`;
      cn.textContent = Math.round(15 * P(t, tPi - .6, tPi + .6, ioc));
      stampIn(seal, t, tKo - .15, -10); seal.style.opacity = t > tKo - .15 ? 1 : 0;
      rot.style.transform = `rotate(${t * 25}deg)`; rot.style.transformOrigin = "50% 50%";
      camSet(cam, keysAt([[a, 0, 0, 0, 1.04, 3, 0, 0], [a, 2.2, 0, 0, 1, 3, 0, 0], [tKo, 1.1, 60, -20, 1.05, 2, 0, 0]], t));
    };
  }, { inD: .6, outD: .55 });
})();

// ============================================================ 10. UMÓW ROZMOWĘ: przycisk pod filmem -> termin -> pół godziny z Kubą: plan rolek -> profil się zapełnia -> przycisk ↓
(() => {
  const a = LS("c1") - .35, z = DUR + 1, tKl = W("c1", "kliknij"), tPrz = W("c1", "przycisk"), tWyb = W("c1", "wybierz"), tTer = W("c1", "termin"), t2 = LS("c2"), tTem = W("c2", "tematy"),
    tPlan = W("c2", "plan"), t3 = LS("c3"), t4 = LS("c4"), tDay = tWyb + .3, tSlot = tWyb + .8, tWiec = W("c3", "więc");
  VS(a, z, (cam, e) => {
    const H1 = HX(e, "Kliknij przycisk [pod filmem]", HY, 62, [tKl, tPrz, W("c1", "pod"), W("c1", "filmem")]);
    const H2 = HX(e, "Wybierz [termin], który Ci pasuje", HY, 62, [tWyb, tTer, W("c1", "który"), W("c1", "ci"), W("c1", "pasuje")]);
    const H3 = HX(e, "Pół godziny: [plan rolek] dla Twojej firmy", HY, 62, [W("c2", "pół"), W("c2", "godziny"), tPlan, W("c2", "rolek"), W("c2", "dla"), W("c2", "twojej"), W("c2", "firmy")]);
    const H4 = HX(e, "Im szybciej zaczniemy, tym szybciej [pełny profil]", HY, 60, [W("c3", "im"), W("c3", "szybciej"), W("c3", "zaczniemy"), W("c3", "tym"), W("c3", "szybciej", 1), W("c3", "zapełnią"), W("c3", "rolkami")]);
    const H4b = HX(e, "Więc [nie zwlekaj].", HY, 66, [tWiec, W("c3", "nie"), W("c3", "zwlekaj")]);
    const H5 = HX(e, "Kliknij przycisk [poniżej]", HY, 66, [W("c4", "kliknij"), W("c4", "przycisk"), W("c4", "poniżej")]);
    // the page: film on top, button under it -> click -> pick a time
    const pg = wnd(cam, 0, 80, 1100, 650, "clips4you.pl/start");
    const LA = layer(pg.bd); Object.assign(LA.style, { width: "1100px", height: "600px" });
    const vid = at(LA, "", `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:16px;color:#fff;font:900 34px/1 var(--d);letter-spacing:-.03em"><span style="width:52px;height:52px;border-radius:14px;background:#ffd60a;display:flex;align-items:center;justify-content:center"><span class="ic2" style="width:30px;height:30px;color:#111113">${STAR("#111113")}</span></span>Clips4you</div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:8px;background:rgba(255,255,255,.18)"><div style="width:88%;height:100%;background:#ffd60a"></div></div>`, 230, 34, 640, 330);
    Object.assign(vid.style, { position: "absolute", borderRadius: "18px", overflow: "hidden", background: "linear-gradient(150deg,#1b1b1f,#0d0d0f)" });
    const pbtn = ctr(LA, "btn", `${IK.cal}Umów rozmowę`, 550, 440, 460, 84); pbtn.style.fontSize = "32px";
    at(LA, "sub", "30 minut · online", 480, 506);
    const LB = layer(pg.bd); Object.assign(LB.style, { width: "1100px", height: "600px" });
    ttl(LB, IK.cal, "Wybierz termin rozmowy", 40, 32);
    const DG = at(LB, "", "", 40, 108, 560, 440); DG.style.position = "absolute";
    const DN = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
    DN.forEach((d, i) => { const h = at(DG, "", d, i * 80, 0, 72, 30); Object.assign(h.style, { position: "absolute", textAlign: "center", font: "700 17px/30px var(--font)", color: "#8b8b95" }); });
    const DC = []; for (let i = 0; i < 28; i++) { const c = i % 7, r = Math.floor(i / 7), on = (c < 5 && i > 8);
      const d = at(DG, "", String(i + 1), c * 80, 44 + r * 80, 72, 70); Object.assign(d.style, { position: "absolute", borderRadius: "14px", textAlign: "center", font: `700 22px/70px var(--font)`, background: on ? "#f5f5f7" : "transparent", color: on ? "#111113" : "#c4c4cc" }); DC.push(d); }
    const SEL = DC[17];
    const SLOTS = ["9:00", "10:30", "12:00", "14:30", "16:00"].map((h, i) => { const s = at(LB, "", `<span class="num">${h}</span>`, 660, 108 + i * 88, 380, 72);
      Object.assign(s.style, { position: "absolute", borderRadius: "16px", border: "2px solid rgba(17,17,19,.1)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 26px/1 var(--font)", boxSizing: "border-box" }); return s; });
    const PICK = SLOTS[1];
    const okc = at(LB, "", chip(IK.check, "Termin zarezerwowany", "cg"), 700, 560); okc.style.position = "absolute";
    const cur = cursor4(cam), rp = rip4(cam, 0, 80 - 325 + 50 + 440);
    // the call (c2): you + Kuba, topics from your industry
    const cw = wnd(cam, -330, 80, 1000, 580, "rozmowa · 30 minut");
    cw.bd.style.background = "#f6f6f8";
    const tA = at(cw.bd, "", `<div style="position:absolute;left:50%;top:44%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;color:#8b8b95"><span class="ic2" style="width:74px;height:74px">${IK.user}</span></div><div style="position:absolute;left:16px;bottom:16px;padding:8px 14px;border-radius:10px;background:#111113;color:#fff;font:700 20px/1 var(--font)">Ty</div>`, 24, 24, 464, 400);
    const tK = at(cw.bd, "photo", `<div style="position:absolute;left:16px;bottom:16px;padding:8px 14px;border-radius:10px;background:#111113;color:#fff;font:700 20px/1 var(--font);white-space:nowrap">Kuba · Clips4you</div>`, 512, 24, 464, 400);
    [tA, tK].forEach(x => Object.assign(x.style, { position: "absolute", borderRadius: "18px", overflow: "hidden" })); tA.style.background = "#ececf1";
    tK.style.backgroundImage = "url(kuba.jpg)"; tK.style.backgroundPosition = "center 25%"; el(PRE, "img").src = "kuba.jpg";
    const tc = vcard(cam, 590, 20, 520, 520, "");
    ttl(tc, IK.star, "Tematy z Twojej branży", 28, 28); tc.querySelector(".ttl").style.fontSize = "25px";
    const TR = [["A", "linear-gradient(160deg,#ffe45c,#ffc400)"], ["B", "#fff1a6"]].map(([l, bg], r) => { const row = at(tc, "tier", `<div class="lb" style="background:${bg};width:80px;height:108px;font-size:46px">${l}</div>`, 24, 96 + r * 146, 472, 128); row.style.position = "absolute"; row.th = [];
      for (let k = 0; k < 3; k++) { const th = el(row, "div", "th"); th.style.width = "84px"; th.style.height = "108px"; th.style.backgroundImage = `url(${TH(REELS[(r * 3 + k + 6) % REELS.length], 45)})`; row.th.push(th); } return row; });
    const pm = at(tc, "", chip(IK.doc, "Plan rolek dla Twojej firmy", "y"), 28, 420); pm.style.position = "absolute"; pm.firstChild.style.height = "44px"; pm.firstChild.style.fontSize = "19px"; pm.firstChild.style.padding = "0 16px";
    // the sooner we start, the sooner your profile is full (c3)
    const pf = prof(cam, 0, 60, 640, { name: "Twoja firma", posts: 2, last: chip(IK.check, "nowa rolka", "cg"), rows: 2 });
    pf.put(0, "c10", 50); pf.put(1, "c04", 50); const pfLs = pf.ls; const PFC = ["ad3_hook", "c07", "ad12_hook", "c13"];
    const fF0 = W("c3", "zaczniemy"), fF1 = W("c3", "rolkami") + .3;
    // final: logo + the button + arrow down to the real button under the video
    const lg = logo4(e, 960, 330, 64);
    const fb = ctr(e, "btn", `${IK.cal}Umów rozmowę`, 960, 520, 560, 108); fb.style.fontSize = "42px"; fb.style.borderRadius = "24px";
    const arr = ctr(e, "", `<svg viewBox="0 0 60 80" style="width:60px;height:80px"><path d="M30 6v60M10 46l20 22 20-22" fill="none" stroke="#111113" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`, 960, 690, 60, 80); arr.style.position = "absolute";
    const fs = el(e, "div", "kx", "30 minut · online · wybierz termin"); Object.assign(fs.style, { left: "960px", top: "770px", transform: "translateX(-50%)" });
    sfx("CLICK", tPrz + .25, -18); sfx("WH_SOFT", tWyb - .2, -24); sfx("CLICK", tDay, -20); sfx("CLICK", tSlot, -18); sfx("DING", tSlot + .15, -24); sfx("WH_SOFT", t2, -24);
    for (let i = 0; i < 4; i++) sfx("POP", mix(W("c3", "zaczniemy"), W("c3", "rolkami") + .3, i / 3), -28); sfx("IMP_SOFT", t4, -23);
    return (lt, t) => {
      H1.up(t, tWyb - .4); H2.up(t, t2 - .4); H3.up(t, t3 - .4); H4.up(t, tWiec - .4); H4b.up(t, t4 - .4); H5.up(t);
      // page -> picker
      const pi = P(t, a + .05, a + .9, ioe), po = P(t, t2 - .3, t2 + .2, E.inCubic);
      pg.style.opacity = (pi * (1 - po)).toFixed(3); pg.style.display = po >= 1 ? "none" : "";
      pg.style.transform = `translateY(${(1 - pi) * 160}px) rotateX(${mix(24, 0, pi)}deg) scale(${1 - po * .06})`;
      const pk = P(t, tWyb - .35, tWyb + .1, ioc); LA.style.opacity = (1 - pk).toFixed(3); LB.style.opacity = pk.toFixed(3); LA.style.display = pk >= 1 ? "none" : ""; LB.style.display = pk > 0 ? "" : "none";
      const bp = t > tPrz + .25 ? 1 - .06 * Math.max(0, Math.sin((t - tPrz - .25) * 18)) * (1 - P(t, tPrz + .25, tPrz + .5)) : 1; pbtn.style.transform = `scale(${bp})`;
      const dsel = t > tDay; SEL.style.background = dsel ? "#ffd60a" : "#f5f5f7"; SEL.style.boxShadow = dsel ? "0 10px 24px rgba(255,191,0,.35)" : "";
      const ps = t > tSlot; PICK.style.background = ps ? "linear-gradient(180deg,#ffe55c,#ffd000)" : ""; PICK.style.borderColor = ps ? "transparent" : "rgba(17,17,19,.1)";
      okc.style.opacity = P(t, tSlot + .15, tSlot + .45).toFixed(3);
      curAt(cur, t, [[0, 0, 400, 600, 0], [tPrz - .8, .2, 400, 600, 1], [tPrz - .7, .85, 20, 255, 1], [tWyb - .15, .45, -225, 158, 1], [tDay + .1, .45, 290, 45, 1], [tSlot + .6, .3, 290, 45, 0]], t);
      rp(t, tPrz + .25);
      // the call
      const ci = P(t, t2 - .1, t2 + .8, ioe), co = P(t, t3 - .35, t3 + .15, E.inCubic);
      cw.style.opacity = (ci * (1 - co)).toFixed(3); cw.style.display = ci > 0 && co < 1 ? "" : "none";
      cw.style.transform = `translate(${(1 - ci) * -200}px, 0) rotateY(${mix(20, 7, ci)}deg)`;
      tK.style.boxShadow = `inset 0 0 0 ${(4 + 3 * Math.abs(Math.sin(t * 6))).toFixed(1)}px #ffd60a`;
      const ti = P(t, tTem - .1, tTem + .7, ioe);
      tc.style.opacity = (ti * (1 - co)).toFixed(3); tc.style.display = ti > 0 && co < 1 ? "" : "none";
      tc.style.transform = `translate(${(1 - ti) * 220}px, 0) rotateY(${mix(-24, -7, ti)}deg)`;
      TR.forEach((row, r) => row.th.forEach((th, k) => { const s = tTem + .2 + r * .3 + k * .1, v = spring(t - s, 2, .6); th.style.opacity = t > s ? 1 : 0; th.style.transform = `scale(${t > s ? Math.min(1.05, v) : 0})`; }));
      pm.style.opacity = P(t, tTem + .9, tTem + 1.2).toFixed(3);
      // profile fills up
      const pfi = P(t, t3 - .15, t3 + .6, ioe), pfo = P(t, t4 - .35, t4 + .1, E.inCubic);
      pf.style.opacity = (pfi * (1 - pfo)).toFixed(3); pf.style.display = pfi > 0 && pfo < 1 ? "" : "none";
      pf.style.transform = `translateY(${(1 - pfi) * 140}px) rotateX(${mix(22, 4, pfi)}deg)`;
      let nf = 0;
      pf.cells.slice(2).forEach((c, i) => { const s = mix(fF0, fF1, i / 3), on = t > s; if (on) { if (c.classList.contains("e")) pf.put(i + 2, PFC[i], 45); nf++; } else if (!c.classList.contains("e")) { c.classList.add("e"); c.style.backgroundImage = ""; }
        const v = spring(t - s, 2.2, .6); c.style.transform = `scale(${on ? Math.min(1.06, .4 + .6 * v) : 1})`; });
      pf.np.textContent = 2 + nf + Math.round(13 * P(t, fF1, tWiec + .3, ioc)); pfLs.style.opacity = P(t, fF0, fF0 + .3).toFixed(3);
      // final card
      const fi = P(t, t4 - .1, t4 + .6, ioe);
      lg.style.opacity = fi.toFixed(3); lg.style.transform = `scale(${mix(.8, 1, fi)})`;
      const fbs = spring(t - t4 - .1, 1.8, .6); fb.style.opacity = t > t4 - .1 ? 1 : 0; fb.style.transform = `scale(${t > t4 - .1 ? Math.min(1.05, fbs) * (1 + .025 * Math.sin(t * 5)) : 0})`;
      arr.style.opacity = P(t, t4 + .4, t4 + .8).toFixed(3); arr.style.transform = `translateY(${Math.abs(Math.sin(t * 3.2)) * 18}px)`;
      fs.style.opacity = P(t, t4 + .6, t4 + 1).toFixed(3);
      camSet(cam, keysAt([[a, 0, 0, 0, 1.03, 3, 0, 0], [a, 2.2, 0, 0, 1, 3, 0, 0], [tPrz - .3, 1, 0, 90, 1.04, 2, 0, 0], [tWyb - .3, 1, 0, 0, 1, 3, 0, 0], [t2, 1.2, 60, 0, 1, 3, -2, 0], [t3, 1, 0, 0, 1, 4, 0, 0]], t));
    };
  }, { inD: .7, outD: .01 });
})();
