"use strict";
// Film 1, part 1 (0-48.5 s): hook (1 h = 30 rolek, thumbnail alive), the map (4 steps + a locked question), the problem,
// the team behind the brands that post daily -> "My jesteśmy tymi ludźmi" -> 1 hour in your month -> zoom into it.
const REELS = ["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12", "c02", "c03", "c04", "c05", "c13", "c14", "c15", "c16", "c17"];
const rclip = i => REELS[i % REELS.length];
const MAP = [[-660, "1", "Rozmowa"], [-330, "2", "Wybór"], [0, "3", "Montaż"], [330, "4", "Publikacja"]];

// ---------------------------------------------------------------- 1. HOOK: 1 godzina rozmowy = 30 rolek (frame 0 = the thumbnail)
S(-0.2, 3.62, (cam, e) => {
  const h = HX(e, "1 godzina rozmowy = [30 rolek]", 150, 100, 0, { stat: true });
  const card = bcard(cam, -560, 70, 520, 520, `<div style="position:absolute;left:0;right:0;top:40px;text-align:center"><div class="kx" style="position:static">rozmowa online</div></div>
    <div class="num" style="position:absolute;left:0;right:0;top:120px;text-align:center;font:900 150px/1 var(--d);letter-spacing:-.05em"><span class="tm">00:00</span></div>
    <div style="position:absolute;left:0;right:0;top:300px;text-align:center;font:800 44px var(--d)">1 godzina</div>`);
  Object.assign(card.style, { display: "block" }); const tm = card.querySelector(".tm");
  const mic = ctr(card, "", `<div class="pill yp sm" style="position:relative">${ico(IK.video)}nagrywamy</div>`, 260, 440, 300, 60); Object.assign(mic.style, { position: "absolute", display: "flex", justifyContent: "center" });
  const eq = el(cam, "div", "hx", "="); Object.assign(eq.style, { left: "-1030px", top: "10px", fontSize: "120px" });
  // 30 reels: 6 x 5 grid on the right, a calendar grows around them on "na cały miesiąc"
  const G = [], gx0 = 90, gy0 = -150, cw = 118, chh = 96;
  const frame = bcard(cam, gx0 + 2.5 * (cw + 12), gy0 + 2 * (chh + 12) + 18, 6 * (cw + 12) + 44, 5 * (chh + 12) + 90, `<div style="position:absolute;left:26px;top:16px;font:900 30px var(--d)">Twój miesiąc</div><div style="position:absolute;right:26px;top:22px;font:700 22px var(--b);color:#6b6b74">30 dni</div>`);
  frame.style.display = "block";
  for (let i = 0; i < 30; i++) {
    const c = i % 6, r = Math.floor(i / 6), x = gx0 + c * (cw + 12), y = gy0 + r * (chh + 12) + 44;
    const t = ctr(cam, "", `<img src="${thumbUrl(rclip(i), 10 + (i * 37) % 140)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"><s style="position:absolute;left:7px;top:5px;font:800 17px/1 var(--b);color:#fff;text-decoration:none;text-shadow:0 1px 3px rgba(0,0,0,.8);opacity:0">${i + 1}</s>`, x, y, cw, chh);
    Object.assign(t.style, { position: "absolute", borderRadius: "12px", overflow: "hidden", border: "3px solid #111113", background: "#e9e6dc" }); t.d = t.querySelector("s"); t.k = i; G.push(t);
  }
  const cnt30 = yp(cam, `<span class="num c3">30</span> rolek`, gx0 + 2.5 * (cw + 12), 330);
  const n3 = cnt30.querySelector(".c3"), tA = W("h1", "trzydzie"), tM = W("h1", "cały");
  sfx("CLICK", .5, -24); sfx("POP", tA, -22); sfx("IMP_SOFT", tM, -24);
  return (lt, t) => {
    h.up(t, 3.45);
    tm.textContent = (() => { const s = 3600 * P(t, .25, 1.25, ioc), m = Math.floor(s / 60); return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; })();
    card.style.transform = drift(t, 1, 4);
    G.forEach(g => { const a = tA - .1 + g.k * .022; g.style.transform = `scale(${1 + .2 * Math.sin(clamp((t - a) / .35) * Math.PI)})`; g.d.style.opacity = P(t, tM + g.k * .012, tM + g.k * .012 + .2); });
    frame.style.opacity = 1; n3.textContent = Math.round(30 * P(t, tA - .1, tA + .6, ioc)) || 30;
    if (t < tA - .1) n3.textContent = "30";
    camSet(cam, [mix(0, 60, P(t, 0, 3.6, ios)), 0, mix(.97, 1.04, P(t, 0, 3.6, ios)), 0, mix(-3, 2, P(t, 0, 3.6, ios))]);
  };
}, { light: true, inD: 0, outD: .45 });

// ---------------------------------------------------------------- 2. dla firm, które nie mają czasu (a phone buried in notifications) -> "jak to działa"
S(3.55, 8.4, (cam, e) => {
  const h1 = HX(e, "Dla firm, które [nie mają] [czasu]", 150, 92, [W("h2", "dla"), W("h2", "firm"), W("h2", "które"), W("h2", "nie", 0), W("h2", "mają"), W("h2", "czasu")]);
  const h2 = HX(e, "Pokażemy Ci, [jak to działa]", 150, 92, wt("h2").slice(-5));
  const ph = ctr(cam, "ph4", "", -330, 110, 380, 676); ph.style.background = "#111113";
  el(ph, "div", "", `<div style="position:absolute;left:0;right:0;top:70px;text-align:center;font:800 96px/1 var(--d);color:#fff" class="num">16:42</div><div style="position:absolute;left:0;right:0;top:180px;text-align:center;font:600 22px var(--b);color:#bbb">wtorek, 14 października</div>`);
  const N = [["Klient", "Kiedy możecie przyjechać?", IK.chat], ["Faktura", "Do wystawienia: 3 szt.", IK.doc], ["Nieodebrane", "2 połączenia", IK.call], ["Dostawa", "Dziś 14:00, podpisz odbiór", IK.shop], ["Spotkanie", "16:30, klient na miejscu", IK.cal]]
    .map(([a, b, i], k) => { const n = note4(cam, i, a, b, -610, 0, k ? `${k * 3} min` : "teraz"); n.k = k; return n; });
  const tN = W("h2", "firm"), tP = W("h2", "pokaż");
  N.forEach(n => { n.at0 = tN - .15 + n.k * .26; sfx("CLICK", n.at0, -27); });
  // blueprint: 4 dashed slots (they become the map in the next scene)
  const slots = MAP.map(([x], i) => { const s = ctr(cam, "", `<div style="font:900 80px var(--d);color:#c9c5b8">${i + 1}</div>`, 230 + i * 190, 110, 170, 230);
    Object.assign(s.style, { position: "absolute", border: "4px dashed #b9b5a8", borderRadius: "22px", display: "flex", alignItems: "center", justifyContent: "center" }); s.k = i; return s; });
  return (lt, t) => {
    h1.up(t, tP - .35); h2.up(t);
    N.forEach(n => { const s = spring(t - n.at0, 2, .6), v = P(t, tP - .2, tP + .3, E.inCubic);
      n.style.opacity = clamp((t - n.at0) / .12) * (1 - v); n.style.transform = `translate(${n.k * 6}px, ${-150 + n.k * 104 - (1 - Math.min(1, s)) * 40 - v * 60}px) scale(${.86 + .14 * Math.min(1, s)})`; n.style.zIndex = 10 + n.k; });
    const slide = P(t, tP - .1, tP + .6, ioe); ph.style.transform = `translateX(${-slide * 40}px) rotate(${-slide * 4}deg) scale(${1 - slide * .08})`;
    slots.forEach(s => inout(s, t, tP + .15 + s.k * .12, 1e9, { pop: true }));
    camSet(cam, [mix(-160, 120, P(t, 3.55, 8.4, ios)), 0, mix(1.04, .98, P(t, 3.55, 8.4, ios)), 0, mix(4, -3, P(t, 3.55, 8.4, ios))]);
  };
}, { light: true, inD: .35, outD: .45 });

// ---------------------------------------------------------------- 3. THE MAP: 4 kroki + a locked golden card -> "najważniejsza rolka na Twoim profilu"
S(8.35, 16.05, (cam, e) => {
  const h3 = HX(e, "[4 kroki] + 1 pytanie", 150, 96, [W("h3", "cztery"), W("h3", "cztery"), W("h3", "jedno"), W("h3", "pytanie")]);
  const h4 = HX(e, "Najważniejsza rolka [na Twoim profilu]", 150, 88, [W("h4", "najważ"), W("h4", "rolka"), W("h4", "na", 1), W("h4", "twoim"), W("h4", "profilu")]);
  const C = MAP.map(([x, n, tt], i) => { const c = step4(cam, x - 40, 60, 280, 360, n, tt); c.k = i; c.at0 = W("h3", "cztery") - .05 + i * .14; sfx("CLICK", c.at0, -25); return c; });
  const G = step4(cam, 700, 60, 280, 360, "", "Pytanie", { gold: true }); const tG = W("h3", "jedno") - .1; sfx("WH_SOFT", tG, -22);
  const q = el(G.fr, "div", "", "?"); Object.assign(q.style, { font: "900 110px/1 var(--d)", marginTop: "-10px" });
  // the most important reel: a phone rises from the golden card, blurred (we reveal it at the end)
  const rph = phone4(cam, 700, 40, 250, "c08"); rph.style.zIndex = 5; const cv = rph.cv; cv.style.filter = "blur(14px) saturate(.4)";
  const qm = el(rph, "div", "", "?"); Object.assign(qm.style, { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "900 170px/1 var(--d)", color: "#ffd60a", WebkitTextStroke: "8px #111113" });
  const pinC = yp(cam, `${ico(IK.pin)}przypięta na górze profilu`, 700, 330); const tR = W("h4", "najważ") - .05;
  sfx("WH_SOFT", tR, -22); sfx("IMP_SOFT", W("h4", "profilu"), -24);
  return (lt, t) => {
    h3.up(t, tR - .2); h4.up(t);
    C.forEach(c => { const s = spring(t - c.at0, 1.9, .6), dim = P(t, tG, tG + .4) * .55 * (1 - P(t, tR, tR + .5)) ; c.style.opacity = clamp((t - c.at0) / .12) * (1 - dim);
      c.style.transform = `translateY(${(1 - Math.min(1, s)) * 160}px) rotateY(${(1 - Math.min(1, s)) * -70}deg) ${drift(t, c.k, 3)}`; });
    const g = spring(t - tG, 1.7, .55), shake = Math.sin(t * 38) * 6 * Math.exp(-(t - W("h3", "zadaj")) * 4) * (t > W("h3", "zadaj") ? 1 : 0);
    G.style.opacity = clamp((t - tG) / .12); G.style.transform = `translateX(${(1 - Math.min(1, g)) * 500}px) rotate(${shake * .6}deg) scale(${1 + .06 * Math.sin(Math.min(1, P(t, tG, tG + .6)) * Math.PI)})`;
    const r = P(t, tR, tR + .8, ioe); rph.style.opacity = r; rph.style.transform = `translateY(${(1 - r) * 200}px) scale(${.6 + .4 * r})`;
    rph.draw(lt); inout(pinC, t, W("h4", "twoim") - .1, 1e9, { pop: true });
    const k = P(t, tR - .2, tR + 1.2, ioe);
    camSet(cam, [mix(mix(-80, 180, P(t, tG, tG + 1.4, ioe)), 520, k), mix(0, 20, k), mix(mix(.92, .9, P(t, tG, tG + 1, ioe)), 1.18, k), 0, mix(mix(6, -4, P(t, 8.4, 12.5, ios)), -8, k)]);
  };
}, { light: true, inD: .3, outD: .5 });

// ---------------------------------------------------------------- 4. Wiesz, że Twoja firma powinna wrzucać rolki / Klienci oglądają / Konkurencja wrzuca
S(16.0, 21.6, (cam, e) => {
  const h1 = HX(e, "Twoja firma powinna [wrzucać] [rolki]", 150, 92, [W("l1", "twoja"), W("l1", "firma"), W("l1", "powinna"), W("l1", "wrzuca"), W("l1", "rolki")]);
  const h2 = HX(e, "Klienci [oglądają]. Konkurencja [wrzuca].", 150, 92, [W("l2", "klienci"), W("l2", "ogląd"), W("l2", "konkur"), W("l2", "wrzuca")]);
  const ph = phone4(cam, -120, 90, 330, "c06"); const seq = [[16.0, "c06"], [17.3, "c01"], [18.5, "c07"], [19.6, "c10"]];
  const eye = yp(cam, `${ico(IK.eye)}<span class="num v">0</span> wyświetleń`, -120, -270, "w"), v = eye.querySelector(".v");
  const hearts = [0, 1, 2, 3, 4].map(i => { const hh = ctr(cam, "", `<span class="ic2" style="color:#e5383b;width:54px;height:54px">${IK.heart}</span>`, -280 + i * 70, 300, 60, 60); hh.style.position = "absolute"; hh.k = i; return hh; });
  const pr = prof4(cam, 470, 60, 470, { name: "Konkurencja", posts: 12, fol: "8 930", rows: 3, pic: IK.building });
  pr.cells.forEach((c, i) => { if (i >= 3) pr.put(i, rclip(i + 2), 40 + i * 9); });
  const tK = W("l2", "konkur"), tO = W("l2", "ogląd");
  [0, 1, 2].forEach(i => sfx("POP", tK + .45 + i * .32, -24));
  return (lt, t) => {
    h1.up(t, W("l2", "klienci") - .2); h2.up(t);
    const q = seqAt(seq, t); ph.set(q.name); ph.draw(q.lt);
    const sw = seq.map(s => P(t, s[0] - .12, s[0] + .1, E.inOutCubic)).reduce((a, b) => a + (b > 0 && b < 1 ? b : 0), 0); ph.style.transform = `translateY(${-Math.sin(sw * Math.PI) * 30}px)`;
    inout(eye, t, tO - .2, 1e9, { pop: true }); v.textContent = Math.round(12480 * P(t, tO - .1, 21.5, E.outCubic)).toLocaleString("pl-PL");
    hearts.forEach(hh => { const a = tO + hh.k * .22, u = (t - a) / 1.4; hh.style.opacity = u > 0 && u < 1 ? 1 - u : 0; hh.style.transform = `translate(${Math.sin(u * 6 + hh.k) * 20}px, ${-u * 300}px) scale(${.6 + u * .5})`; });
    const pin = P(t, tK - .4, tK + .3, ioe); pr.style.opacity = pin; pr.style.transform = `translateX(${(1 - pin) * 300}px)`;
    [0, 1, 2].forEach(i => { const c = pr.cells[2 - i], a = tK + .45 + i * .32; if (t >= a && !c.firstChild) pr.put(2 - i, rclip(i + 5), 60); if (t < a && c.firstChild) c.innerHTML = ""; const s = spring(t - a, 2.2, .55); c.style.transform = `scale(${t < a ? 1 : Math.min(1.08, s)})`; });
    pr.posts(12 + [0, 1, 2].filter(i => t >= tK + .45 + i * .32).length);
    camSet(cam, [mix(-120, 120, P(t, 16, 21.6, ios)), 0, mix(1.04, .98, P(t, 16, 21.6, ios)), 0, mix(-5, 4, P(t, 16, 21.6, ios))]);
  };
}, { light: true, inD: .35, outD: .45 });

// ---------------------------------------------------------------- 5. Tylko kiedy? The day planner is full; "Nagrać rolkę" bounces to "jutro"
S(21.55, 26.2, (cam, e) => {
  const h = HX(e, "Tylko |kiedy?|", 150, 110, [W("l3", "tylko"), W("l3", "kiedy")]);
  const pl = bcard(cam, -140, 90, 760, 660, `<div style="position:absolute;left:30px;top:22px;font:900 34px var(--d)">Twój dzień</div><div style="position:absolute;right:30px;top:28px;font:700 22px var(--b);color:#6b6b74">wtorek</div>`); pl.style.display = "block";
  const HRS = ["8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  HRS.forEach((hh, i) => { const r = at(pl, "ab", `<span style="font:700 20px var(--b);color:#6b6b74">${hh}</span>`, 26, 80 + i * 70, 700, 70); r.style.borderTop = "2px solid #eeebe2"; });
  const B = [[0, 4.3, "Klienci", "#ffd60a", W("l3", "obsług")], [5, 1, "Faktury", "#fff", W("l3", "faktury")], [6, 1, "Telefony", "#fff", W("l3", "telefony")]]
    .map(([r0, n, tx, bg, a]) => { const b = at(pl, "task4", `${tx}`, 120, 86 + r0 * 70, 600, n * 70 - 12); Object.assign(b.style, { background: bg, height: px(n * 70 - 12) }); b.a = a; return b; });
  const task = ctr(cam, "task4", `${ico(IK.video)}Nagrać rolkę`, 470, -120, 300, 64); Object.assign(task.style, { background: "#fff", boxShadow: "5px 5px 0 #111113" });
  const nope = yp(cam, `${ico(IK.x, "#e5383b")}brak miejsca`, 470, -30, "rd sm"), tom = yp(cam, `przenoszę na jutro →`, 470, 200, "w sm");
  const tB = W("l3", "telefony") + .3; sfx("CLICK", B[0].a, -24); sfx("CLICK", B[1].a, -26); sfx("CLICK", B[2].a, -26);
  return (lt, t) => {
    h.up(t);
    B.forEach(b => { const u = P(t, b.a - .1, b.a + .3, ioe); b.style.opacity = u; b.style.transform = `scaleX(${.2 + .8 * u})`; b.style.transformOrigin = "0 50%"; });
    // the task tries a slot, shakes, gets pushed to "jutro"
    const x = mix(470, 60, P(t, 22.2, 23.0, ioe)) + mix(0, 90, P(t, tB, tB + .5, ioe)), y = mix(-120, 60, P(t, 22.2, 23.0, ioe)) + mix(0, 420, P(t, tB, tB + .6, ioe));
    const sh = t > 24.0 && t < 24.9 ? Math.sin(t * 50) * 10 : 0;
    task.style.transform = `translate(${x - 470 + sh}px, ${y + 120}px) rotate(${sh * .4 + P(t, tB, tB + .6) * 12}deg)`; task.style.borderColor = t > 24.0 && t < tB + .3 ? "#e5383b" : "#111113";
    task.style.opacity = clamp((t - 21.8) / .2);
    inout(nope, t, 24.05, tB + .1, { pop: true }); inout(tom, t, tB + .2, 1e9, { pop: true });
    camSet(cam, [mix(-60, 80, P(t, 21.55, 26.2, ios)), 0, mix(1.02, 1.07, P(t, 21.55, 26.2, ios)), 0, mix(4, -3, P(t, 21.55, 26.2, ios))]);
  };
}, { light: true, inD: .35, outD: .45 });

// ---------------------------------------------------------------- 6. A jedna rolka to temat, nagranie, montaż, napisy i opis (5 jobs -> 1 reel)
S(26.15, 30.35, (cam, e) => {
  const h = HX(e, "Jedna rolka to [5 zadań]", 150, 96, [W("l4", "jedna"), W("l4", "rolka"), W("l4", "to"), W("l4", "temat"), W("l4", "nagran")]);
  const J = [["temat", IK.bulb], ["nagranie", IK.video], ["montaż", IK.cut], ["napisy", IK.text], ["opis", IK.doc]]
    .map(([w, i], k) => { const c = bcard(cam, -640 + k * 250, 70 + (k % 2 ? 110 : -60), 220, 200, `<span class="ic2" style="width:64px;height:64px">${i}</span><div style="font:900 32px var(--d);margin-top:14px">${w[0].toUpperCase() + w.slice(1)}</div><div class="num" style="position:absolute;left:16px;top:10px;font:800 22px var(--b);color:#6b6b74">${k + 1}/5</div>`);
      Object.assign(c.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }); c.k = k; c.a = W("l4", w) - .08; sfx("CLICK", c.a, -24); return c; });
  const eqs = el(cam, "div", "hx", "="); Object.assign(eqs.style, { left: "-440px", top: "10px", fontSize: "120px", width: "1920px" });
  const ph = phone4(cam, 720, 70, 250, "c10", { ok: true, tag: "1 rolka" }); const tE = W("l4", "opis") + .15;
  sfx("IMP_SOFT", tE, -23);
  return (lt, t) => {
    h.up(t, 30.25);
    J.forEach(c => inout(c, t, c.a, 1e9, { pop: true, base: drift(t, c.k, 4) }));
    eqs.style.opacity = P(t, tE - .1, tE + .2); inout(ph, t, tE, 1e9, { pop: true }); ph.draw(lt);
    camSet(cam, [mix(-220, 40, P(t, 26.2, 30.3, ioc)), 0, mix(1.05, .96, P(t, 26.2, 30.3, ioc)), 0, mix(-5, 4, P(t, 26.2, 30.3, ios))]);
  };
}, { light: true, inD: .3, outD: .4 });

// ---------------------------------------------------------------- 7. Wrzucasz jedną. A potem trzy tygodnie ciszy (your profile: 1 reel, then silence)
S(30.3, 33.5, (cam, e) => {
  const h = HX(e, "Wrzucasz jedną. Potem |3 tygodnie ciszy.|", 150, 90, [W("l5", "wrzuc"), W("l5", "jedn"), W("l5", "potem"), W("l5", "trzy"), W("l5", "tygod"), W("l5", "ciszy")]);
  const pr = prof4(cam, -220, 110, 480, { name: "Twoja Firma", posts: 0, fol: "1 240", rows: 2, ar: 1.15 });
  pr.cells.forEach((c, i) => { if (i) { c.style.background = "transparent"; c.style.border = "3px dashed #d6d2c6"; } });
  const ld = bcard(cam, 460, 60, 460, 300, `<div style="font:700 26px var(--b);color:#6b6b74">Ostatnia rolka</div><div style="font:900 110px/1 var(--d);letter-spacing:-.04em"><span class="num d">0</span> dni</div><div style="font:700 26px var(--b);color:#e5383b">temu</div>`);
  Object.assign(ld.style, { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "6px" }); const dd = ld.querySelector(".d");
  const tJ = W("l5", "jedn"), tT = W("l5", "trzy");
  sfx("POP", tJ, -22);
  return (lt, t) => {
    h.up(t);
    const u = P(t, tJ - .2, tJ + .3, ioe); if (t >= tJ - .2 && !pr.cells[0].firstChild) pr.put(0, "c10", 25); if (t < tJ - .2) pr.cells[0].innerHTML = "";
    pr.cells[0].style.transform = `scale(${t < tJ - .2 ? 1 : Math.min(1.06, spring(t - tJ + .2, 2, .55))})`; pr.posts(t >= tJ - .2 ? 1 : 0);
    inout(ld, t, tT - .3, 1e9, { pop: true }); dd.textContent = Math.round(21 * P(t, tT - .1, tT + 1.1, E.outCubic));
    e.style.filter = `grayscale(${P(t, tT, tT + 1) * .6})`;
    camSet(cam, [mix(-40, 60, P(t, 30.3, 33.5, ios)), 0, mix(1.03, .98, P(t, 30.3, 33.5, ios)), 0, mix(3, -3, P(t, 30.3, 33.5, ios))]);
  };
}, { light: true, inD: .3, outD: .45 });

// ---------------------------------------------------------------- 8. Firmy, które wrzucają codziennie, nie mają więcej czasu -> behind them: people
S(33.45, 42.2, (cam, e) => {
  const h1 = HX(e, "Oni wrzucają [codziennie]", 150, 92, [W("p1", "firmy"), W("p1", "które"), W("p1", "codzien")]);
  const h2 = HX(e, "Mają więcej czasu? [Nie.]", 150, 92, [W("p1", "nie", 0), W("p1", "mają"), W("p1", "więcej"), W("p1", "czasu"), W("p1", "ty")]);
  const h3 = HX(e, "Mają za sobą [ludzi]", 150, 96, [W("p2", "mają"), W("p2", "za"), W("p2", "sobą"), W("p2", "ludzi")]);
  const pr = prof4(cam, 0, 40, 500, { name: "Konkurencja", posts: 312, fol: "24,1 tys.", rows: 2, ar: 1.1, pic: IK.building });
  pr.cells.forEach((c, i) => pr.put(i, rclip(i + 3), 20 + i * 13));
  const DAYS = ["PN", "WT", "ŚR", "CZ", "PT", "SB", "ND"], week = ctr(cam, "", "", 0, 360, 900, 70); week.style.cssText += ";display:flex;gap:10px;justify-content:center;position:absolute";
  const dk = DAYS.map((d, i) => { const b = el(week, "div", "pill yp sm", `${d}${ico(IK.check)}`); b.style.position = "relative"; b.k = i; return b; });
  const clkA = bcard(cam, -560, 60, 300, 220, `<div style="font:700 24px var(--b);color:#6b6b74">Ty</div><div style="font:900 90px/1 var(--d)">24 h</div>`),
    clkB = bcard(cam, 560, 60, 300, 220, `<div style="font:700 24px var(--b);color:#6b6b74">Oni</div><div style="font:900 90px/1 var(--d)">24 h</div>`);
  [clkA, clkB].forEach(c => Object.assign(c.style, { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }));
  // the team behind: 3 role cards (no faces: icons), linked to the profile
  const R = [["Pomysły", IK.bulb, "wymyśla"], ["Montaż", IK.cut, "montuje"], ["Publikacja", IK.up, "publikuje"]].map(([tt, i, w], k) => {
    const c = bcard(cam, -620 + k * 620, 250, 300, 280, `<div class="av4" style="position:relative;left:auto;top:auto;margin:0;width:120px;height:120px">${ico(i)}</div><div style="font:900 34px var(--d);margin-top:18px">${tt}</div><div style="font:700 22px var(--b);color:#6b6b74">ktoś ${w}</div>`);
    Object.assign(c.style, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }); c.querySelector(".ic2").style.cssText = "width:60px;height:60px";
    c.k = k; c.a = W("p2", w) - .1; sfx("POP", c.a, -23); return c; });
  const lines = R.map((c, k) => { const dx = -620 + k * 620, dy = 250 - (-90), len = Math.hypot(dx, dy), l = ctr(cam, "", "", dx / 2, -90 + dy / 2, len - 330, 5);
    Object.assign(l.style, { position: "absolute", background: "repeating-linear-gradient(90deg,#111113 0 14px,transparent 14px 24px)", transform: `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`, opacity: 0 }); l.k = k; return l; });
  const tC = W("p1", "codzien"), tN = W("p1", "nie", 0), tL = W("p2", "mają") - .15;
  sfx("WH_SOFT", tL, -21);
  return (lt, t) => {
    h1.up(t, tN - .4); h2.up(t, tL - .4); h3.up(t);
    dk.forEach(b => inout(b, t, tC - .2 + b.k * .07, tL - .3, { pop: true }));
    inout(clkA, t, tN + .5, tL, { pop: true }); inout(clkB, t, tN + .7, tL, { pop: true });
    // pull back: the profile shrinks up, the team appears below it
    const k = P(t, tL, tL + 1.1, ioe); pr.style.transform = `translateY(${-k * 130}px) scale(${1 - k * .42})`; lines.forEach(l => { l.style.opacity = P(t, R[l.k].a, R[l.k].a + .4); });
    R.forEach(c => inout(c, t, c.a, 1e9, { pop: true }));
    camSet(cam, [0, mix(0, 60, k), mix(1.02, .95, k), mix(0, 6, k), mix(-3, 3, P(t, 33.5, 42.2, ios))]);
  };
}, { light: true, inD: .35, outD: .45 });

// ---------------------------------------------------------------- 9. My jesteśmy tymi ludźmi -> 1 godzina w Twoim miesiącu -> zoom into it
S(42.15, 48.6, (cam, e) => {
  const h1 = HX(e, "[My] jesteśmy tymi ludźmi", 150, 96, [W("p3", "my"), W("p3", "jesteś"), W("p3", "tymi"), W("p3", "ludź")]);
  const h2 = HX(e, "Od Ciebie: [1 godzina] w miesiącu", 150, 92, [W("p3", "od"), W("p3", "ciebie"), W("p3", "jednej"), W("p3", "godziny"), W("p3", "w", 1), W("p3", "miesiąc")]);
  const R = [["Pomysły", IK.bulb], ["Montaż", IK.cut], ["Publikacja", IK.up]].map(([tt, i], k) => {
    const c = ctr(cam, "st4", `<div class="fr" style="gap:10px"><div class="av4" style="position:relative;left:auto;top:auto;margin:0;width:120px;height:120px">${ico(i)}</div><div class="t">${tt}</div></div><div class="bk" style="background:#ffd60a;color:#111113;box-shadow:10px 10px 0 #111113"><div class="logo4" style="position:relative;font-size:40px"><i>${STAR()}</i></div><div class="t">${tt}</div><div style="font:800 22px var(--b)">Clips4you</div></div>`, -620 + k * 620, 150, 300, 300);
    c.querySelector(".fr .ic2").style.cssText = "width:60px;height:60px"; c.k = k; return c; });
  const tM = W("p3", "my"), tJ = W("p3", "jednej"), tZ = W("p4", "zobacz");
  R.forEach(c => sfx("CLICK", tM + .05 + c.k * .12, -24));
  const cal = cal4(cam, 0, 90, 900, { title: "Twój miesiąc", sub: "30 dni", ratio: .62 });
  const hit = cal.days[15]; const lbl = el(hit, "div", "", "1 h"); Object.assign(lbl.style, { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "900 34px var(--d)", opacity: 0 });
  sfx("IMP_SOFT", tJ + .1, -22); sfx("WH_SWING", tZ, -20);
  return (lt, t) => {
    h1.up(t, tJ - .75); h2.up(t, tZ + .1);
    R.forEach(c => { const f = P(t, tM + c.k * .12, tM + c.k * .12 + .6, ioe), out = P(t, tJ - .8, tJ - .3, E.inCubic);
      c.style.transform = `translateY(${-out * 80}px) rotateY(${180 * f}deg) scale(${1 - out * .3})`; c.style.opacity = 1 - out; });
    const ci = P(t, tJ - .6, tJ - .1, ioe); cal.style.opacity = ci; cal.style.transform = `translateY(${(1 - ci) * 120}px)`;
    const hh = P(t, tJ + .05, tJ + .35); hit.classList.toggle("hit", hh > .5); lbl.style.opacity = hh; hit.style.transform = `scale(${1 + .25 * Math.sin(hh * Math.PI)})`;
    // "Zobacz, jak ona wygląda": fly into the yellow hour
    const z = P(t, tZ - .1, 48.6, E.inExpo);
    camSet(cam, [mix(0, 0, z), mix(0, 116, z), mix(1, 26, z), 0, mix(3, 0, z)]);
  };
}, { light: true, inD: .3, outD: .25 });
