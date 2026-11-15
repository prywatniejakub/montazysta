"use strict";
// Film 3 "Jak rolki zamieniają się w telefony": the client's road in 4 stops (sees you -> sees you again -> needs someone ->
// checks your profile -> calls) + the "remembers you" meter; the locked spot = where firms give up (after 5 reels).
const REELS = ["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12", "c02", "c03", "c04", "c05", "c13", "c14", "c15", "c16", "c17"];
const rclip = i => REELS[i % REELS.length];
// the road: an svg path through 4 stops to the phone; draw(u) reveals it
function road(parent, o = {}) {
  const Wd = 1640, g = el(parent, "div", "ab"); Object.assign(g.style, { left: px(-Wd / 2), top: px(-160), width: px(Wd), height: "420px" });
  const d = "M 20 300 C 260 300 300 110 520 130 S 820 330 1020 250 S 1300 80 1620 120";
  g.innerHTML = `<svg width="${Wd}" height="420" viewBox="0 0 ${Wd} 420" style="position:absolute;left:0;top:0;overflow:visible"><path d="${d}" fill="none" stroke="#e2dfd4" stroke-width="26" stroke-linecap="round"/><path class="rd" d="${d}" fill="none" stroke="#111113" stroke-width="10" stroke-dasharray="24 18" stroke-linecap="round"/></svg>`;
  const P0 = g.querySelector(".rd"), L = P0.getTotalLength ? 2400 : 2400; const stops = [[300, 205], [700, 205], [1020, 250], [1330, 150]];
  const pins = ["Zauważa", "Widzi znowu", "Potrzebuje", "Sprawdza profil"].map((tt, i) => { const p = at(g, "ab", `<div style="width:84px;height:84px;border-radius:50%;background:#fff;border:5px solid #111113;box-shadow:5px 5px 0 #111113;display:flex;align-items:center;justify-content:center;font:900 44px var(--d)">${i + 1}</div><div style="position:absolute;left:50%;top:96px;transform:translateX(-50%);white-space:nowrap;font:800 26px var(--b)">${tt}</div>`, stops[i][0] - 42, stops[i][1] - 42); p.k = i; return p; });
  const start = at(g, "ab", `<div style="width:96px;height:96px;border-radius:26px;background:#ffd60a;border:5px solid #111113;display:flex;align-items:center;justify-content:center"><span class="ic2" style="width:54px;height:54px">${IK.eye}</span></div>`, -30, 250);
  const end = at(g, "ab", `<div style="width:120px;height:120px;border-radius:50%;background:#1f9d55;border:5px solid #111113;color:#fff;display:flex;align-items:center;justify-content:center"><span class="ic2" style="width:64px;height:64px">${IK.call}</span></div>`, 1580, 58);
  const gap = at(g, "ab", `<div style="width:120px;height:120px;border-radius:26px;background:#ffd60a;border:5px solid #111113;box-shadow:6px 6px 0 #111113;display:flex;align-items:center;justify-content:center"><span class="ic2 lk" style="width:60px;height:60px">${IK.lock}</span></div>`, 800, 200); gap.style.opacity = 0;
  g.draw = u => { P0.style.strokeDasharray = `24 18`; g.querySelector("svg").style.clipPath = `inset(0 ${(1 - u) * 100}% 0 0)`; };
  Object.assign(g, { pins, start, end, gap }); return g;
}
// "Klient Cię pamięta" meter (0..1)
function memMeter(parent, cx, cy, w = 520) {
  const e = bcard(parent, cx, cy, w, 150, `<div style="display:flex;justify-content:space-between;align-items:center;font:800 26px var(--b)"><span>Klient Cię pamięta</span><b class="num pc" style="font:900 34px var(--d)">0%</b></div><div class="sg" style="display:flex;gap:8px;margin-top:16px"></div>`);
  e.style.padding = "22px 26px"; const sg = e.querySelector(".sg"), pc = e.querySelector(".pc"), S10 = [...Array(10)].map(() => { const b = el(sg, "i", ""); Object.assign(b.style, { flex: 1, height: "26px", borderRadius: "7px", background: "#e7e5de", border: "3px solid #111113" }); return b; });
  e.set = v => { pc.textContent = Math.round(v * 100) + "%"; S10.forEach((b, i) => { b.style.background = i < Math.round(v * 10) ? (v >= .99 ? "#1f9d55" : "#ffd60a") : "#e7e5de"; }); pc.style.color = v >= .99 ? "#1f9d55" : "#111113"; };
  e.set(0); return e;
}
// a ringing phone (call screen)
function ringPhone(parent, cx, cy, w, who = "Nowy klient") {
  const e = ctr(parent, "ph4", `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#1b1b1f,#0b0b0c);display:flex;flex-direction:column;align-items:center;padding-top:70px;color:#fff"><div style="font:700 22px var(--b);color:#bbb">połączenie przychodzące</div><div style="font:900 38px var(--d);margin-top:14px;text-align:center">${who}</div>
    <div style="position:absolute;bottom:60px;left:0;right:0;display:flex;justify-content:center;gap:70px"><div style="width:78px;height:78px;border-radius:50%;background:#e5383b;display:flex;align-items:center;justify-content:center"><span class="ic2" style="width:40px;height:40px;transform:rotate(135deg)">${IK.call}</span></div><div class="acc" style="width:78px;height:78px;border-radius:50%;background:#1f9d55;display:flex;align-items:center;justify-content:center"><span class="ic2" style="width:40px;height:40px">${IK.call}</span></div></div></div>`, cx, cy, w, w * 16 / 9);
  const R = [0, 1, 2].map(i => { const r = ctr(parent, "rip4", "", cx, cy, w * 1.1, w * 1.1); r.style.borderColor = "#1f9d55"; return r; });
  e.ring = (t, on = 1) => { e.style.transform = `rotate(${on ? Math.sin(t * 42) * 3 * (Math.sin(t * 3) > 0 ? 1 : 0) : 0}deg)`; R.forEach((r, i) => { const u = ((t * .9 + i / 3) % 1); r.style.opacity = on ? (1 - u) * .8 : 0; r.style.transform = `scale(${.9 + u * .9})`; }); };
  return e;
}

// ---------------------------------------------------------------- A. HOOK (frame 0 = thumbnail): rolka -> dzwoni telefon
S(-0.2, 3.3, (cam, e) => {
  const h = HX(e, "Rolka → [telefon]", 150, 110, 0, { stat: true });
  const ph = phone4(cam, -420, 110, 320, "c09");
  const arr = el(cam, "div", "hx", "→"); Object.assign(arr.style, { left: "-960px", top: "30px", fontSize: "130px" });
  const rp = ringPhone(cam, 420, 110, 320); const tD = W("h1", "dzwoni");
  sfx("POP", tD, -21);
  return (lt, t) => {
    h.up(t, 3.15); ph.draw(lt); rp.ring(t, t > tD - .1 ? 1 : .0001);
    camSet(cam, [mix(-40, 40, P(t, 0, 3.3, ios)), 0, mix(1.0, 1.05, P(t, 0, 3.3, ios)), 0, mix(-3, 3, P(t, 0, 3.3, ios))]);
  };
}, { light: true, inD: 0, outD: .4 });

// ---------------------------------------------------------------- B+C. the road from the first view to the call + the spot where firms stop (locked)
S(3.25, 10.95, (cam, e) => {
  const h1 = HX(e, "Droga: [obejrzenie] → [telefon]", 150, 92, [W("h2", "pokaż"), W("h2", "obejrz"), W("h2", "do"), W("h2", "telefon")]);
  const h2 = HX(e, "Tu większość firm [przerywa]", 150, 92, [W("h3", "miejsce"), W("h3", "większ"), W("h3", "firm"), W("h3", "przery")]);
  const rd = road(cam); const stay = yp(cam, `${ico(IK.clock)}zostań do końca`, 0, 360, "dk");
  const t0 = W("h2", "drogę") - .1, t1 = W("h2", "telefon") + .2, tG = W("h3", "przery") - .1;
  rd.pins.forEach(p => sfx("CLICK", t0 + .35 + p.k * .32, -26)); sfx("IMP_SOFT", tG + .1, -21); sfx("POP", t1, -22);
  return (lt, t) => {
    h1.up(t, W("h3", "miejsce") - .3); h2.up(t);
    rd.draw(P(t, t0, t1, ioc)); inout(rd.start, t, 3.3, 1e9, { pop: true }); inout(rd.end, t, t1 - .1, 1e9, { pop: true });
    rd.pins.forEach(p => inout(p, t, t0 + .35 + p.k * .32, 1e9, { pop: true }));
    const g = spring(t - tG, 2, .5); rd.gap.style.opacity = clamp((t - tG) / .1); rd.gap.style.transform = `scale(${t < tG ? 0 : Math.min(1.1, g)}) rotate(${t > tG + .5 ? Math.sin(t * 20) * 4 * Math.exp(-(t - tG - .5) * 2) : 0}deg)`;
    inout(stay, t, W("h3", "zostań") - .1, 1e9, { pop: true });
    camSet(cam, [mix(-200, 0, P(t, 3.3, t1, ioc)), mix(0, 20, P(t, tG - .3, tG + .5, ioe)), mix(1.15, .95, P(t, 3.3, t1, ioc)) * mix(1, 1.08, P(t, tG, 10.9, ios)), 0, mix(-4, 3, P(t, 3.3, 10.9, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- D. Wyświetlenia, serduszka… telefon milczy
S(10.9, 15.7, (cam, e) => {
  const h = HX(e, "Wyświetlenia są. [Telefonów] |brak.|", 150, 92, [W("l1", "były"), W("l1", "wyświet"), W("l1", "telefon"), W("l1", "telefon"), W("l1", "milczał")]);
  const ph = phone4(cam, -420, 100, 320, "c10");
  const ST = [["Wyświetlenia", IK.eye, 1204, W("l1", "wyświet")], ["Serduszka", IK.heart, 37, W("l1", "serdusz")], ["Telefony", IK.call, 0, W("l1", "telefon")]].map(([tt, i, v, a], k) => {
    const c = bcard(cam, 280, -120 + k * 170, 620, 140, `<span class="ic2" style="width:56px;height:56px;color:${k === 2 ? "#e5383b" : "#111113"}">${i}</span><span style="flex:1;font:800 34px var(--b)">${tt}</span><b class="num v" style="font:900 60px var(--d);color:${k === 2 ? "#e5383b" : "#111113"}">0</b>`);
    Object.assign(c.style, { display: "flex", alignItems: "center", gap: "24px", padding: "0 34px" }); c.v = c.querySelector(".v"); c.val = v; c.a = a - .1; c.k = k; sfx(k === 2 ? "IMP_SOFT" : "CLICK", a, -23); return c; });
  return (lt, t) => {
    h.up(t); ph.draw(lt);
    ST.forEach(c => { inout(c, t, c.a, 1e9, { pop: true }); c.v.textContent = c.k === 2 ? "0" : Math.round(c.val * P(t, c.a, c.a + 1.2, ioc)).toLocaleString("pl-PL"); if (c.k === 2 && t > c.a + .4) c.style.transform += ` translateX(${Math.sin(t * 40) * 5 * Math.exp(-(t - c.a - .4) * 4)}px)`; });
    camSet(cam, [mix(-60, 60, P(t, 10.9, 15.7, ios)), 0, mix(1.02, 1.0, P(t, 10.9, 15.7, ios)), 0, mix(3, -3, P(t, 10.9, 15.7, ios))]);
  };
}, { light: true, inD: .3, outD: .4 });

// ---------------------------------------------------------------- E. Wniosek: w mojej branży rolki nie działają
S(15.65, 18.4, (cam, e) => {
  const k = kx(e, "wniosek", 960, 230);
  const q = HX(e, "„W mojej branży rolki |nie działają.|”", 470, 96, [W("l2", "w", 0), W("l2", "mojej"), W("l2", "branży"), W("l2", "rolki"), W("l2", "nie"), W("l2", "działają")]);
  const qm = yp(cam, "?", 560, 180, ""); qm.style.fontSize = "80px"; qm.style.height = "110px";
  return (lt, t) => {
    appear(k, t, 15.7, .5, 20, "translateX(-50%)"); q.up(t); inout(qm, t, W("l2", "działają") + .3, 1e9, { pop: true }); qm.style.transform += ` rotate(${Math.sin(t * 4) * 12}deg)`;
    camSet(cam, [0, 0, mix(1.05, 1.0, P(t, 15.65, 18.4, ios)), 0, 0]);
  };
}, { light: true, inD: .3, outD: .4 });

// ---------------------------------------------------------------- F. 1 rolka nie przynosi telefonu. Telefon przynosi seria.
S(18.35, 22.75, (cam, e) => {
  const h1 = HX(e, "1 rolka ≠ telefon", 150, 100, [W("l3", "jedna"), W("l3", "rolka"), W("l3", "przynosi")]);
  const h2 = HX(e, "[Seria] = telefon", 150, 110, [W("l3", "seria") - .5, W("l3", "seria"), W("l3", "seria")]);
  const one = phone4(cam, 0, 100, 250, "c01"); const X = xmark(cam, 0, 100, 250, 444);
  const row = [...Array(9)].map((_, i) => { const p = phone4(cam, -760 + i * 170, 100, 150, rclip(i + 1)); p.k = i; return p; });
  const rp = ringPhone(cam, 760, 90, 190); rp.style.opacity = 0;
  const tS = W("l3", "telefon", 1) - .1; sfx("WH_SOFT", tS, -22); row.forEach(p => sfx("POP", tS + .1 + p.k * .08, -28));
  return (lt, t) => {
    h1.up(t, tS - .1); h2.up(t);
    const o1 = 1 - P(t, tS - .1, tS + .2); one.style.opacity = P(t, 18.4, 18.7) * o1; one.draw(lt); X.up(t, W("l3", "nigdy")); X.style.opacity = o1;
    row.forEach(p => { inout(p, t, tS + .1 + p.k * .08, 1e9, { pop: true }); p.draw(lt + p.k * .3); });
    rp.style.opacity = P(t, W("l3", "seria") - .1, W("l3", "seria") + .2); rp.ring(t, t > W("l3", "seria") - .1 ? 1 : 0);
    camSet(cam, [mix(0, 120, P(t, tS, 22.7, ios)), 0, mix(1.05, .92, P(t, tS - .2, tS + .6, ioe)), 0, mix(-3, 3, P(t, 18.35, 22.7, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(22.85, 25.1, 1, "Zauważa", "a1");

// ---------------------------------------------------------------- G. przewija Instagram, widzi Twoją twarz, nie zna, nie potrzebuje… ale zapamiętuje
S(25.05, 34.1, (cam, e) => {
  const h1 = HX(e, "Widzi [Twoją twarz]", 150, 100, [W("a2", "widzi"), W("a2", "twoją"), W("a2", "twarz")]);
  const h2 = HX(e, "Ale [zapamiętuje]", 150, 110, [W("a3", "ale"), W("a3", "zapam")]);
  const ph = phone4(cam, -330, 100, 340, "c07"); const tag = el(ph, "div", "tg", "Twoja Firma"); tag.style.top = "14px"; tag.style.bottom = "auto";
  const cl = bcard(cam, 330, -40, 520, 230, `<span class="ic2" style="width:90px;height:90px">${IK.user}</span><div><div style="font:900 40px var(--d)">Klient</div><div class="st" style="font:700 26px var(--b);color:#6b6b74">przewija…</div></div>`);
  Object.assign(cl.style, { display: "flex", alignItems: "center", gap: "26px", padding: "0 34px" }); const stx = cl.querySelector(".st");
  const b1 = bub(cam, "nie znam", 120, 160, false), b2 = bub(cam, "dziś nie potrzebuję", 330, 250, false);
  const mm = memMeter(cam, 330, 330, 540); mm.style.opacity = 0;
  const seq = [[25.05, "c06"], [25.5, "c11"], [25.95, "c10"], [26.5, "c09"]], tA = W("a3", "zapam") - .1;
  sfx("WH_DATA", 25.3, -26); sfx("CLICK", W("a2", "twarz"), -22); sfx("POP", tA + .2, -22);
  return (lt, t) => {
    h1.up(t, W("a3", "ale") - .3); h2.up(t);
    const q = seqAt(seq, t); ph.set(q.name); ph.draw(q.lt); tag.style.opacity = q.name === "c09" ? 1 : 0;
    const sw = t < 26.5 ? ((t - 25.05) / .45) % 1 : 0; ph.firstChild.style.transform = `translateY(${-sw * 50}px)`; ph.firstChild.style.filter = sw ? "blur(5px)" : "";
    inout(cl, t, 25.2, 1e9, { pop: true }); stx.textContent = t < W("a2", "widzi") ? "przewija…" : t < W("a2", "nie") ? "widzi Twoją rolkę" : t < tA ? "przewija dalej" : "zapamiętuje Cię";
    inout(b1, t, W("a2", "zna") - .1, tA - .1, { pop: true }); inout(b2, t, W("a2", "potrzeb") - .1, tA - .1, { pop: true });
    mm.style.opacity = P(t, tA, tA + .3); mm.set(.1 * P(t, tA + .2, tA + .8));
    camSet(cam, [mix(-40, 40, P(t, 25, 34.1, ios)), 0, mix(1.02, 1.0, P(t, 25, 34.1, ios)), 0, mix(-3, 3, P(t, 25, 34.1, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

punch(34.25, 36.65, 2, "Widzi znowu", "b1");

// ---------------------------------------------------------------- H. tydzień po tygodniu: odpowiedź / realizacja / ile trwa -> „zaczyna mieć wrażenie, że Cię zna”
S(36.6, 46.55, (cam, e) => {
  const h1 = HX(e, "Tydzień po tygodniu", 150, 100, [W("b2", "przez"), W("b2", "kolejne"), W("b2", "tygodnie")]);
  const h2 = HX(e, "„Chyba [go] [znam]”", 150, 110, [W("b3", "zaczyna"), W("b3", "zna"), W("b3", "zna")]);
  const C = [["Tydzień 1", "c08", "", W("b2", "trafia")], ["Tydzień 2", "c10", "", W("b2", "pokaz")], ["Tydzień 3", "c02", "", W("b2", "mówisz")]].map(([wk, n, cp, a], k) => {
    const p = phone4(cam, -560 + k * 380, 110, 280, n); const w = yp(cam, wk, -560 + k * 380, -210, "w sm"); p.a = a - .1; p.w = w; p.k = k; sfx("POP", a, -23); return p; });
  const mm = memMeter(cam, 0, 420, 700);
  const tB = W("b3", "zaczyna") - .1;
  return (lt, t) => {
    h1.up(t, tB - .2); h2.up(t);
    C.forEach(p => { inout(p, t, p.a, 1e9, { pop: true }); inout(p.w, t, p.a + .05, 1e9, { pop: true }); p.draw(lt + p.k); });
    mm.style.opacity = P(t, 36.7, 37); const v = .1 + .2 * P(t, C[0].a, C[0].a + .5) + .2 * P(t, C[1].a, C[1].a + .5) + .2 * P(t, C[2].a, C[2].a + .5) + .1 * P(t, tB, tB + .8); mm.set(v);
    camSet(cam, [0, mix(0, 40, P(t, tB, tB + 1, ioe)), mix(.98, 1.02, P(t, 36.6, 46.5, ios)), 0, mix(-3, 3, P(t, 36.6, 46.5, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- I. Zapamiętaj ten krok: tu większość firm się poddaje (the road, stop 2 flagged, lock)
S(46.5, 51.0, (cam, e) => {
  const h = HX(e, "Tu większość firm [się] [poddaje]", 150, 92, [W("b4", "właśnie"), W("b4", "tu"), W("b4", "większ"), W("b4", "firm"), W("b4", "się"), W("b4", "poddaje")]);
  const rd = road(cam); rd.draw(1); [rd.start, rd.end, ...rd.pins].forEach(x => { x.style.opacity = 1; });
  const flag = yp(cam, `${ico(IK.x, "#e5383b")}tu się poddają`, -120, -150, "rd"); const tT = W("b4", "tu") - .1;
  sfx("IMP_SOFT", tT, -21);
  return (lt, t) => {
    h.up(t);
    rd.pins.forEach(p => { p.style.opacity = p.k === 1 ? 1 : mix(1, .3, P(t, tT, tT + .4)); p.style.transform = p.k === 1 ? `scale(${1 + .15 * Math.sin(P(t, 47.3, 47.8) * Math.PI)})` : ""; });
    rd.gap.style.opacity = P(t, tT, tT + .3); rd.gap.style.transform = `rotate(${Math.sin(t * 20) * 3}deg)`;
    inout(flag, t, tT + .1, 1e9, { pop: true });
    camSet(cam, [mix(0, -160, P(t, 46.6, 47.6, ioe)), mix(0, 40, P(t, 46.6, 47.6, ioe)), mix(.95, 1.3, P(t, 46.6, 47.6, ioe)), 0, mix(-3, 3, P(t, 46.5, 51, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });
