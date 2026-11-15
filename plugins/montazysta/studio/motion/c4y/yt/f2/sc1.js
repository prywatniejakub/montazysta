"use strict";
// Film 2 "Ile kosztują rolki dla firmy", part 1 (0-46.4 s): price tag hook, 5 ways on a price scale, the locked golden
// card (the most expensive reel), everyone quotes something else, the example (30 reels a month), way 1: doing it yourself.
const REELS = ["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12", "c02", "c03", "c04", "c05", "c13", "c14", "c15", "c16", "c17"];
const rclip = i => REELS[i % REELS.length];
const zl = v => Math.round(v).toLocaleString("pl-PL") + " zł";
const sp = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// ---------------------------------------------------------------- A. HOOK (frame 0 = thumbnail): a reel with a price tag "??? zł"
S(-0.2, 2.15, (cam, e) => {
  const h = HX(e, "Ile kosztuje [rolka]?", 150, 110, 0, { stat: true });
  const ph = phone4(cam, -120, 90, 330, "c06");
  const tag = bcard(cam, 330, 40, 470, 190, `<div class="num" style="font:900 84px/1 var(--d);letter-spacing:-.05em"><span class="pv">???</span> zł</div>`, "y");
  Object.assign(tag.style, { display: "flex", alignItems: "center", justifyContent: "center", transformOrigin: "10% 50%" });
  const str = ctr(cam, "", "", 70, 40, 130, 6); Object.assign(str.style, { position: "absolute", background: "#111113" });
  const pv = tag.querySelector(".pv");
  sfx("CLICK", .75, -24);
  return (lt, t) => {
    h.up(t, 2.0); ph.draw(lt);
    tag.style.transform = `rotate(${-6 + Math.sin(t * 2.2) * 4}deg)`;
    pv.textContent = t < .7 ? "???" : ["50", "300", "990", "2 500", "8 000", "???"][Math.min(5, Math.floor((t - .7) / .22))];
    camSet(cam, [mix(0, 40, P(t, 0, 2.2, ios)), 0, mix(1.0, 1.06, P(t, 0, 2.2, ios)), 0, mix(-3, 3, P(t, 0, 2.2, ios))]);
  };
}, { light: true, inD: 0, outD: .4 });

// ---------------------------------------------------------------- B. 5 sposobów na skali cen: od 0 zł do kilkunastu tysięcy
S(2.1, 7.05, (cam, e) => {
  const h = HX(e, "[5 sposobów], 5 cen", 150, 100, [W("h2", "policz"), W("h2", "pięć"), W("h2", "sposob"), W("h2", "sposob")]);
  const bar = ctr(cam, "", "", 0, 230, 1400, 14); Object.assign(bar.style, { position: "absolute", borderRadius: "8px", background: "linear-gradient(90deg,#1f9d55,#ffd60a 50%,#e5383b)", border: "3px solid #111113", transformOrigin: "0 50%" });
  const lo = yp(cam, "0 zł", -700, 320, "gr"), hi = yp(cam, "kilkanaście tys. zł", 560, 320, "rd");
  const W5 = [["Sam", IK.phone], ["Na zlecenie", IK.cut], ["Etat", IK.users], ["Agencja", IK.building], ["Clips4you", STAR("#111113")]].map(([tt, i], k) => {
    const c = bcard(cam, -560 + k * 280, 0, 230, 250, `<span class="ic2" style="width:64px;height:64px">${i}</span><div style="font:900 30px var(--d);margin-top:14px">${tt}</div><div class="num" style="font:900 40px var(--d);color:#6b6b74;margin-top:6px">? zł</div>`, k === 4 ? "y" : "");
    Object.assign(c.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }); c.k = k; c.a = W("h2", "pięć") + k * .1; sfx("CLICK", c.a, -25); return c; });
  const tZ = W("h2", "zera"), tK = W("h2", "kilkun");
  return (lt, t) => {
    h.up(t);
    W5.forEach(c => inout(c, t, c.a, 1e9, { pop: true, base: drift(t, c.k, 3) }));
    bar.style.transform = `scaleX(${P(t, tZ - .1, tK + .6, ioc)})`; inout(lo, t, tZ - .1, 1e9, { pop: true }); inout(hi, t, tK - .1, 1e9, { pop: true });
    camSet(cam, [0, mix(0, 60, P(t, 2.1, 7, ios)), mix(1.02, .96, P(t, 2.1, 7, ios)), 0, mix(-4, 4, P(t, 2.1, 7, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- C. A najdroższa rolka? Nie ma jej na liście. Na końcu.
S(7.0, 10.9, (cam, e) => {
  const h = HX(e, "Najdroższa rolka? [Na końcu.]", 150, 96, [W("h3", "najdro"), W("h3", "rolka"), W("h3", "powiemy"), W("h3", "końcu")]);
  const row = [0, 1, 2, 3, 4].map(k => { const c = ctr(cam, "", "", -700 + k * 150, 90, 120, 150); Object.assign(c.style, { position: "absolute", borderRadius: "18px", border: "4px solid #111113", background: k === 4 ? "#ffd60a" : "#fff", boxShadow: "5px 5px 0 #111113", opacity: .5 }); return c; });
  const G = step4(cam, 300, 90, 360, 460, "", "Najdroższa rolka", { gold: true }); const q = el(G.fr, "div", "", "?"); Object.assign(q.style, { font: "900 150px/1 var(--d)" });
  G.querySelector(".lk").style.cssText = "width:90px;height:90px"; G.querySelector(".t").style.fontSize = "34px";
  const X = xmark(cam, -400, 90, 720, 190), st = ctr(cam, "stamp4", "poza listą", -400, 290, 360, 90);
  const tN = W("h3", "nie"), tE = W("h3", "końcu");
  sfx("WH_SOFT", 7.2, -22); sfx("IMP_SOFT", tN + .1, -22);
  return (lt, t) => {
    h.up(t);
    const g = spring(t - 7.15, 1.6, .6); G.style.opacity = clamp((t - 7.15) / .15); G.style.transform = `translateX(${(1 - Math.min(1, g)) * 400}px) rotate(${t > tE ? Math.sin(t * 40) * 3 * Math.exp(-(t - tE) * 3) : 0}deg)`;
    X.up(t, tN); stampIn(st, t, W("h3", "liście") - .1, -8); if (t < W("h3", "liście") - .1) st.style.opacity = 0;
    camSet(cam, [mix(-100, 100, P(t, 7, 10.9, ios)), 0, mix(1.0, 1.06, P(t, 7, 10.9, ios)), 0, mix(4, -4, P(t, 7, 10.9, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- D. Pytasz o cenę i słyszysz wszystko (price bubbles from everywhere)
S(10.85, 15.9, (cam, e) => {
  const h = HX(e, "Pytasz o cenę. Słyszysz [wszystko].", 150, 90, [W("l1", "pytasz"), W("l1", "o"), W("l1", "cenę"), W("l1", "słyszysz"), W("l1", "wszystko")]);
  const Q = [["50 zł za rolkę", -600, -120, 0], ["300 zł / sztuka", 420, -160, 1], ["od 990 zł / mies.", -300, 140, 0], ["2 500 zł pakiet", 560, 100, 1], ["„zależy”", 60, -40, 0], ["od 5 000 zł", -700, 330, 1], ["8 000 zł / mies.", 300, 340, 0]]
    .map(([tx, x, y, me], k) => { const b = bub(cam, tx, x - 160, y - 40, !!me); b.k = k; b.a = W("l1", "słyszysz") - .2 + k * .28; sfx("POP", b.a, -27); return b; });
  const me = bcard(cam, 0, 90, 220, 220, `<span class="ic2" style="width:110px;height:110px">${IK.user}</span>`); Object.assign(me.style, { display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" });
  const qm = yp(cam, "???", 110, -30, "sm");
  return (lt, t) => {
    h.up(t);
    Q.forEach(b => inout(b, t, b.a, 1e9, { pop: true, base: drift(t, b.k, 8) }));
    inout(me, t, 10.95, 1e9, { pop: true }); inout(qm, t, 13.9, 1e9, { pop: true }); qm.style.transform += ` rotate(${Math.sin(t * 5) * 8}deg)`;
    camSet(cam, [0, 0, mix(1.1, .95, P(t, 10.85, 15.9, ios)), 0, mix(-5, 5, P(t, 10.85, 15.9, ios))]);
  };
}, { light: true, inD: .3, outD: .4 });

// ---------------------------------------------------------------- E. Nikt nie mówi, co jest w środku (a closed box "pakiet")
S(15.85, 18.0, (cam, e) => {
  const h = HX(e, "Co jest [w środku]?", 150, 110, [W("l2", "nikt"), W("l2", "nie"), W("l2", "mówi"), W("l2", "środku")]);
  const box = bcard(cam, 0, 120, 480, 380, `<div style="font:900 60px var(--d)">PAKIET</div><div style="font:900 140px/1 var(--d);margin-top:4px">?</div>`, "y"); Object.assign(box.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
  const lid = bcard(cam, 0, -100, 540, 80, "", ""); lid.style.background = "#fff3b8";
  sfx("CLICK", W("l2", "środku"), -22);
  return (lt, t) => {
    h.up(t);
    const sh = Math.sin(t * 30) * 5 * P(t, W("l2", "co") - .1, W("l2", "co") + .1) * (1 - P(t, 17.6, 17.9));
    box.style.transform = `rotate(${sh}deg)`; lid.style.transform = `translateY(${-Math.abs(Math.sin(t * 12)) * 16 * P(t, 16.6, 17)}px) rotate(${sh * 1.5}deg)`;
    camSet(cam, [0, 0, mix(1.06, 1.0, P(t, 15.85, 18, ios)), 0, 0]);
  };
}, { light: true, inD: .3, outD: .4 });

// ---------------------------------------------------------------- F. Przykład: firma chce 30 rolek w miesiącu, jedną dziennie
S(17.95, 23.8, (cam, e) => {
  const h = HX(e, "Przykład: [30 rolek] w miesiącu", 150, 92, [W("l3", "policz"), W("l3", "trzydzie"), W("l3", "rolek"), W("l3", "w", 0), W("l3", "miesiąc")]);
  const cal = cal4(cam, 0, 120, 1000, { title: "Miesiąc firmy", sub: "1 rolka dziennie", ratio: .6 });
  cal.days.forEach((d, i) => cal.fill(i, rclip(i), 10 + (i * 19) % 140));
  const firm = yp(cam, `${ico(IK.building)}Twoja firma`, -380, -250, "w");
  const t0 = W("l3", "czyli") - .2;
  return (lt, t) => {
    h.up(t);
    cal.style.opacity = P(t, 18.0, 18.4); inout(firm, t, W("l3", "firma") - .1, 1e9, { pop: true });
    cal.days.forEach((d, i) => cal.pop(i, t, W("l3", "trzydzie") + i * .045));
    camSet(cam, [0, mix(30, 0, P(t, 18, 23.8, ios)), mix(.98, 1.03, P(t, 18, 23.8, ios)), 0, mix(3, -3, P(t, 18, 23.8, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(23.75, 27.05, 1, "Sam", "a1", "sposób", 5);

// ---------------------------------------------------------------- H. 0 zł… tylko że: temat, nagranie, montaż, napisy -> 1-2 h -> 30-60 h
S(27.0, 38.1, (cam, e) => {
  const h1 = HX(e, "Kosztuje [0 zł]. Tylko że…", 150, 96, [W("a2", "kosztuje"), W("a2", "zero"), W("a2", "zero"), W("a2", "tylko"), W("a2", "że")]);
  const h2 = HX(e, "[30–60 godzin] w miesiącu", 150, 96, [W("a3", "trzydzie"), W("a3", "trzydzie"), W("a3", "godzin"), W("a3", "w", 0), W("a3", "miesiąc")]);
  const rc = receipt(cam, -400, -150, 620, "Rolka: sam, telefonem", [
    ["Cena", "0 zł", W("a2", "zero") - .1, "#1f9d55"], ["Temat", "Twój czas", W("a2", "temat"), ""], ["Nagranie", "Twój czas", W("a2", "nagran"), ""], ["Montaż", "Twój czas", W("a2", "montaż"), ""], ["Napisy", "Twój czas", W("a2", "napisy"), ""], ["Razem", "1–2 h / rolka", W("a3", "realnie"), "#e5383b"]]);
  const hr = bcard(cam, 400, 60, 640, 420, `<span class="ic2" style="width:90px;height:90px">${IK.clock}</span><div class="num" style="font:900 112px/1 var(--d);letter-spacing:-.05em;margin-top:10px;white-space:nowrap"><span class="hv">0</span> h</div><div style="font:800 30px var(--b);color:#6b6b74">Twojego czasu w miesiącu</div>`);
  Object.assign(hr.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }); const hv = hr.querySelector(".hv");
  const tH = W("a3", "trzydzie") - .1;
  rc.rows.forEach(r => sfx("CLICK", r.t, -27)); sfx("RISER", tH, -26); sfx("IMP_SOFT", W("a3", "godzin"), -22);
  return (lt, t) => {
    h1.up(t, W("a3", "realnie") + .8); h2.up(t);
    rc.style.opacity = P(t, 27.05, 27.4); rc.up(t); rc.style.transform = `translateY(${(1 - P(t, 27.05, 27.6, ioe)) * -60}px)`;
    inout(hr, t, tH - .2, 1e9, { pop: true }); const v = P(t, tH, W("a3", "godzin") + .2, ioc); hv.textContent = t < W("a3", "sześć") - .1 ? Math.round(30 * v) : `30–${Math.round(mix(30, 60, P(t, W("a3", "sześć") - .1, W("a3", "godzin"), ioc)))}`;
    camSet(cam, [mix(-200, 60, P(t, 27, 38.1, ios)), 0, mix(1.05, .98, P(t, 27, 38.1, ios)), 0, mix(-4, 4, P(t, 27, 38.1, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- I. 60 h x 150 zł = 4 500-9 000 zł … i kończy się na trzech
S(38.05, 46.45, (cam, e) => {
  const h1 = HX(e, "Twój czas ma [cenę]", 150, 100, [W("a4", "jeśli"), W("a4", "godzina"), W("a4", "warta"), W("a4", "sto")]);
  const h2 = HX(e, "I zwykle kończy się [na trzech]", 150, 96, [W("a5", "i"), W("a5", "zwykle"), W("a5", "kończy"), W("a5", "się"), W("a5", "na"), W("a5", "trzech")]);
  const eq = bcard(cam, 0, 40, 1560, 300, `<div style="display:flex;align-items:center;gap:30px;font:900 78px/1 var(--d);white-space:nowrap;letter-spacing:-.04em" class="num"><span>30–60 h</span><span style="color:#6b6b74">×</span><span class="pp">150 zł</span><span style="color:#6b6b74">=</span><span class="tot" style="background:#ffd60a;padding:.1em .15em;border-radius:14px;line-height:1.15">0 zł</span></div>`);
  Object.assign(eq.style, { display: "flex", alignItems: "center", justifyContent: "center" }); const tot = eq.querySelector(".tot"), pp = eq.querySelector(".pp");
  const pr = prof4(cam, 0, 130, 520, { name: "Twoja Firma", posts: 3, fol: "1 240", rows: 2, ar: 1.1 }); pr.style.opacity = 0;
  pr.cells.forEach((c, i) => { if (i < 3) pr.put(i, rclip(i + 1), 40); else { c.style.background = "transparent"; c.style.border = "3px dashed #d6d2c6"; } });
  const st = ctr(cam, "stamp4", "3 z 30", 380, 220, 260, 100);
  const tP = W("a4", "sto"), tR = W("a4", "kosztują"), tT = W("a5", "i");
  sfx("CLICK", tP, -23); sfx("RISER", tR - .6, -27); sfx("IMP_BASS", W("a4", "dziewię"), -23); sfx("IMP_SOFT", W("a5", "trzech") + .1, -21);
  return (lt, t) => {
    h1.up(t, tT - .2); h2.up(t);
    const o = P(t, 38.1, 38.5) * (1 - P(t, tT - .2, tT + .2, E.inCubic)); eq.style.opacity = o; pp.style.opacity = P(t, tP - .1, tP + .2);
    tot.textContent = t < tR ? "? zł" : `${sp(4500 * P(t, tR, W("a4", "czter") + .4, ioc))}–${sp(9000 * P(t, tR, W("a4", "dziewię") + .4, ioc))} zł`;
    const p = P(t, tT - .1, tT + .4, ioe); pr.style.opacity = p; pr.style.transform = `translateY(${(1 - p) * 100}px)`;
    stampIn(st, t, W("a5", "trzech"), -8); if (t < W("a5", "trzech")) st.style.opacity = 0;
    camSet(cam, [0, 0, mix(1.0, 1.04, P(t, 38, 46.4, ios)), 0, mix(3, -3, P(t, 38, 46.4, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });
