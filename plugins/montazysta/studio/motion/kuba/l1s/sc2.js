"use strict";
// Lesson 1 (SaaS style) — part 2: what it's worth, 6 of 6, it's an asset, every guru method.
// Continuity: monthly chart -> for sale; listing close-up -> the multiple equation; coverflow -> grid -> the cards
// fold into a glowing cube (the asset); guru tiles lift to reveal the software under them -> real apps; a service is
// wrapped by a box (a product).

// ---------------------------------------------------------------- 9. light: a business that earns every month can be sold
S(46.1, 50.95, (cam, e) => {
  const tw = wt("v1"), h = words(e, "When a business earns money every month, it can be sold.", 170, 64, tw.slice(4), { grad: [3, 4, 10] });
  const pl = ctr(cam, "gll p3", "", 0, 60, 1180, 560);
  const lab = at(pl, "lbl", "Revenue · last 12 months", 50, 40);
  const M = "JFMAMJJASOND", bars = [...M].map((m, i) => { const b = at(pl, "ab", "", 70 + i * 88, 0, 56, 0); Object.assign(b.style, { bottom: "70px", top: "auto", borderRadius: "12px 12px 4px 4px", background: "linear-gradient(180deg,#6e8bff,#4f5bff)", boxShadow: "0 10px 30px rgba(79,91,255,.35)" });
    const l = at(pl, "ab", m, 70 + i * 88, 505, 56); Object.assign(l.style, { textAlign: "center", font: "600 20px var(--font)", color: "rgba(20,30,60,.45)" }); b.hh = 150 + i * 20 + hash(i, 4) * 60; b.at0 = W("v1", "earns") - .1 + i * .12; return b; });
  const tag = ctr(cam, "", `<span style="width:34px;height:34px;display:flex">${IC.card}</span>For sale`, 470, -210, 280, 90);
  Object.assign(tag.style, { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", borderRadius: "24px", background: "linear-gradient(135deg,#3ddc97,#2fb8d6)", color: "#04150b", font: "800 38px var(--font)", boxShadow: "0 30px 70px rgba(47,184,214,.45)" });
  const tS = W("v1", "sold"); sfx("IMP_SOFT", tS, -20);
  return (lt, t) => {
    h.up(t); camSet(cam, [0, 20, .95 + lt * .01, mix(34, 22, P(t, 46.1, 49, ios)), mix(-12, 6, lt / 5)]);
    bars.forEach(b => { const u = P(t, b.at0, b.at0 + .5, oc); b.style.height = px(b.hh * u); b.style.opacity = clamp((t - b.at0) / .1); });
    popIn(tag, t, tS - .05, "rotate(-8deg) translateZ(80px)"); pl.style.transform = `translateZ(${P(t, tS, tS + .6, oc) * 40}px)`;
  };
}, { light: true, outD: .5 });

// ---------------------------------------------------------------- 10. the real listing: price, last month, the multiple -> the equation
S(50.9, 65.45, (cam, e) => {
  const w = win(cam, 0, 0, 1400, 860, { url: "marketplace  ·  listing  ·  subscription web agency" });
  const card = cropImg(w.bd, "web", 700, 407, 1280), L = LIST.web, cc = (ix, iy) => { const [x, y] = card.at(ix, iy); return [x - 700, y - 430 + 46]; };
  const G = [["price", 230, 76, W("v2", "Asking") - .05, W("v3", "Last") - .2], ["month", 180, 76, W("v3", "nine") - .1, W("v3", "price") - .2], ["mult", 330, 76, W("v3", "two") - .1, 62.3], ["profit", 240, 76, W("v3", "yearly") - .1, 62.3]]
    .map(([k, gw, gh, a, z]) => { const [x, y] = card.at(...L[k]); const g2 = glow(w.bd, x + (k === "mult" ? 40 : 0), y, gw, gh); g2.a = a; g2.z = z; return g2; });
  const [pX, pY] = cc(...L.price);
  const pc = ctr(cam, "pill num", "", pX + 40, pY - 110, 280, 70); pc.style.fontSize = "36px"; pc.style.justifyContent = "center";
  const c0 = W("v2", "two") - .1, c1 = W("v2", "dollars") + .2;
  // the equation (screen space)
  const eq = at(e, "ab", "", 0, 0, 1920, 1080);
  const EQ = [["$98.6k", "Yearly profit", 520, W("v3", "yearly")], ["× 2.5", "The multiple", 960, W("v3", "two")], ["≈ $245k", "Asking price", 1400, 63.0]];
  const eqs = EQ.map(([n, l, x, a], i) => { const b = ctr(eq, "gl", `<div class="num" style="font:700 84px var(--font);letter-spacing:-.04em;color:#fff;text-align:center;margin-top:44px">${n}</div><div class="lbl" style="position:static;text-align:center;margin-top:16px;font-size:18px">${l}</div>`, x, 560, 360, 230); b.a = Math.max(a, 62.45 + i * .15); b.k = i; return b; });
  const mulL = eqs[1].querySelector(".num"); const tMul = W("v3", "multiple");
  sfx("WH_DATA", 62.45, -24); sfx("IMP_SOFT", tMul, -18);
  G.forEach(g2 => sfx("CLICK", g2.a, -24));
  return (lt, t) => {
    const K = [[0, 0, 0, 0, .95, 8, -6], [W("v2", "Asking") - .3, 1, -330, -200, 1.65, 0, 0], [W("v3", "Last") - .1, 1.1, -380, 220, 1.6, 0, 0], [W("v3", "And") - .1, 1.1, -260, -60, 1.2, 0, -3], [62.3, 1, 0, 0, .9, 10, 0]];
    camSet(cam, keysAt(K, t));
    G.forEach(g2 => g2.up(t, g2.a, g2.z));
    appear(pc, t, c0 - .2, .4, 16); vanish(pc, t, W("v3", "Last") - .3); pc.textContent = money(245000 * P(t, c0, c1, ioc));
    const d = P(t, 62.3, 62.9, oc); w.style.filter = d > .01 ? `blur(${d * 10}px) brightness(${1 - d * .55})` : "";
    eqs.forEach(b => appear(b, t, b.a, .5, 40));
    const g = P(t, tMul - .1, tMul + .4, oc); eqs[1].style.boxShadow = `0 50px 140px rgba(0,0,0,.55), 0 0 ${80 * g}px rgba(140,130,255,${.8 * g})`; mulL.className = g > .5 ? "num grad" : "num";
    eqs[1].style.transform += ` scale(${1 + g * .08})`;
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 11. all six listings: coverflow -> grid, "$4,340,000 combined"
const REV = [["web", 0, 0, 0], ["b2b", W("v4", "lead") - .35, W("v4", "three") - .1, W("v4", "million") + .3], ["video", W("v4", "AI") - .35, W("v4", "three", 1) - .1, W("v4", "thousand") + .3],
  ["clip", W("v4", "clipping") - .45, W("v4", "one", 1) - .1, W("v4", "thousand", 1) + .3], ["li", W("w1", "LinkedIn") - .3, W("w1", "one") - .1, W("w1", "thousand") + .3], ["studio", W("w1", "web") - .3, W("w1", "two") - .1, W("w1", "thousand", 1) + .3]];
window.REVEALS = [W("v2", "Asking") - .1, ...REV.slice(1).map(r => r[1] + .3)];
S(65.35, 90.3, (cam, e) => {
  const tAll = W("w2", "That's"), c0 = W("w2", "Four") - .1, c1 = W("w2", "dollars") + .3;
  const cards = REV.map(([k, a, p0, p1], i) => { const g = at(cam, "ab p3", "", 0, 0); const c = cropImg(g, k, 0, 0, 760); c.style.boxShadow = "0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.12)";
    const b = ctr(g, "pill num", "", 0, -c.h / 2 - 70, 300, 70); b.style.justifyContent = "center"; b.style.fontSize = "36px";
    const n = ctr(g, "", LIST[k].name, 0, c.h / 2 + 50, 760, 40); Object.assign(n.style, { position: "absolute", textAlign: "center", font: "600 30px var(--font)", color: "rgba(230,236,255,.8)" });
    g.c = c; g.b = b; g.n = n; g.a = a; g.p0 = p0; g.p1 = p1; g.v = LIST[k].v; g.i = i; if (i) { sfx("WH_SOFT", a + .1, -26); sfx("CLICK", p1 - .3, -24); } return g; });
  const totL = el(e, "div", "sub", "Combined"); totL.style.top = "70px";
  const tot = el(e, "div", "hl gradw num", ""); Object.assign(tot.style, { top: "100px", fontSize: "120px", fontWeight: 700 });
  const run = icoPill(e, IC.target, "#9fb8ff", "", 960, 960); const runN = el(run, "span", "num", "");
  sfx("IMP_BASS", c0, -16);
  return (lt, t) => {
    let a = 0; cards.forEach((g, i) => { if (i && t >= g.a) a = i - 1 + P(t, g.a, g.a + .8, ioe); });
    const gk = P(t, tAll - .1, tAll + 1.1, ioe);
    let sum = 0;
    cards.forEach((g, i) => {
      const d = i - a, ad = Math.abs(d), sd = clamp(d, -1, 1);
      const cf = { x: d * 540, z: -ad * 420, ry: -sd * 40, s: 1, o: clamp(1.25 - ad * .45) };
      const gr = { x: (i % 3 - 1) * 560, y: (Math.floor(i / 3) - .5) * 360 + 90, s: .62 };
      g.style.transform = `translate3d(${mix(cf.x, gr.x, gk)}px, ${mix(0, gr.y, gk)}px, ${mix(cf.z, 0, gk)}px) rotateY(${mix(cf.ry, 0, gk)}deg) scale(${mix(1, gr.s, gk)})`;
      g.style.opacity = mix(cf.o, 1, gk).toFixed(3); g.style.zIndex = 10 - Math.round(ad * 2);
      const pv = i === 0 ? 245000 : g.v * P(t, g.p0, g.p1, ioc); g.b.textContent = money(pv); g.b.style.opacity = i === 0 ? 1 : clamp((t - g.p0 + .2) / .2); g.n.style.opacity = clamp(1 - ad) * (1 - gk);
      if (i === 0 || t >= g.p0) sum += pv;
    });
    camSet(cam, [0, 0, mix(.95, .95, gk) + lt * .002, mix(4, 18, gk), mix(0, 0, gk)]);
    runN.textContent = "Listed so far: " + money(sum); run.style.opacity = 1 - gk;
    appear(totL, t, c0 - .3, .45, 12); appear(tot, t, c0 - .2, .45, 20); tot.textContent = money(4340000 * P(t, c0, c1, ioc));
  };
}, { outD: .6 });

// ---------------------------------------------------------------- 12. recurring revenue is an asset: the six cards fold into a glowing cube
function cube(parent, S2, face) {
  const c = at(parent, "ab p3", "", 0, 0); const F = ["translateZ", "rotateY(180deg) translateZ", "rotateY(90deg) translateZ", "rotateY(-90deg) translateZ", "rotateX(90deg) translateZ", "rotateX(-90deg) translateZ"];
  c.f = F.map((tr, i) => { const f = ctr(c, "", face(i), 0, 0, S2, S2); Object.assign(f.style, { position: "absolute", borderRadius: "26px", background: "linear-gradient(145deg, rgba(110,139,255,.55), rgba(139,108,255,.35) 60%, rgba(199,125,255,.45))", border: "2px solid rgba(190,200,255,.8)", boxShadow: "inset 0 0 60px rgba(160,170,255,.5), 0 0 40px rgba(140,130,255,.35)", backfaceVisibility: "hidden" }); f.tr = tr; return f; });
  c.set = ex => c.f.forEach(f => { f.style.transform = `${f.tr}(${S2 / 2 + ex}px)`; }); return c;
}
S(90.25, 97.15, (cam, e) => {
  const tw = wt("v5"), h = words(e, "Recurring revenue is an asset.", 160, 76, tw.slice(0, 5), { grad: [4] });
  const h2 = words(e, "Build it once. It keeps paying. One day, sell it.", 940, 44, [tw[6], tw[6], tw[6], tw[10], tw[10], tw[10], tw[13], tw[13], tw[17], tw[17]]); h2.style.color = "rgba(226,232,250,.75)";
  const cb = cube(cam, 280, i => i < 4 ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 40px var(--font);color:#fff;letter-spacing:-.02em">Software</div>` : "");
  const orb = at(cam, "ab p3", "", 0, 0), coins = Array.from({ length: 7 }, (_, i) => { const c = ctr(orb, "", "$", 0, 0, 64, 64); Object.assign(c.style, { position: "absolute", borderRadius: "50%", background: "linear-gradient(135deg,#3ddc97,#2fb8d6)", color: "#04150b", font: "800 32px/64px var(--font)", textAlign: "center", boxShadow: "0 0 30px rgba(61,220,151,.6)" }); c.ph = i / 7 * Math.PI * 2; return c; });
  const ringE = ctr(orb, "", "", 0, 0, 900, 900); Object.assign(ringE.style, { position: "absolute", borderRadius: "50%", border: "2px dashed rgba(160,240,210,.45)", transform: "rotateX(90deg)" });
  const tag = ctr(cam, "", "For sale", 330, -170, 220, 76); Object.assign(tag.style, { position: "absolute", borderRadius: "22px", background: "linear-gradient(135deg,#ffd84a,#ff9a4a)", color: "#1a1204", font: "800 32px/76px var(--font)", textAlign: "center", boxShadow: "0 20px 60px rgba(255,190,80,.45)" });
  const tB = W("v5", "build"), tK = W("v5", "keeps"), tSell = W("v5", "sell");
  sfx("WH_SOFT", tB, -22); sfx("IMP_SOFT", tB + .6, -20); sfx("IMP_SOFT", tSell, -22);
  return (lt, t) => {
    h.up(t); h2.up(t);
    const b = P(t, tB - .2, tB + .7, ioe); cb.set(mix(700, 0, b)); cb.style.opacity = P(t, 90.3, 91.2); cb.f.forEach(f => { f.style.opacity = clamp(.25 + b); });
    cb.style.transform = `translateY(20px) rotateX(-18deg) rotateY(${lt * 32 + 20}deg)`;
    camSet(cam, [0, 0, .9, 0, 0]);
    const k = P(t, tK - .2, tK + .5, oc); ringE.style.opacity = k; orb.style.transform = "translateY(20px) rotateX(-18deg)";
    coins.forEach(c => { const an = c.ph + t * 1.6, x = Math.cos(an) * 450, z = Math.sin(an) * 450; c.style.opacity = k * (z > -300 ? 1 : .5); c.style.transform = `translate3d(${x}px, 0, ${z}px) rotateX(18deg) scale(${k})`; });
    popIn(tag, t, tSell - .05, "rotate(8deg) translateZ(200px)");
  };
}, { outD: .5 });
S(97.05, 101.6, (cam, e) => {
  const tw = wt("v6"), h = words(e, "That was my motivation.", 330, 78, tw.slice(0, 4), { grad: [3] });
  const a = el(e, "div", "hl", "Not another job."); Object.assign(a.style, { top: "480px", fontSize: "120px", fontWeight: 700, color: "var(--ink)" });
  const st = el(a, "div", "strike"); Object.assign(st.style, { left: "1130px", top: "70px", height: "12px" });
  const b = el(e, "div", "hl gradd", "An asset."); Object.assign(b.style, { top: "480px", fontSize: "170px", fontWeight: 700, height: "210px" });
  const tJob = W("v6", "job"), tAn = W("v6", "An");
  sfx("CLICK", tJob + .2, -20); sfx("IMP_SOFT", tAn, -18);
  return (lt, t) => {
    h.up(t); appear(a, t, W("v6", "Not") - .1, .45, 30); vanish(a, t, tAn - .1, .3); st.style.width = px(300 * P(t, tJob + .15, tJob + .45, oc)); st.style.left = "1080px";
    appear(b, t, tAn - .05, .5, 50); b.style.transform += ` scale(${1.1 - .1 * P(t, tAn, tAn + .6, oc)})`;
  };
}, { light: true, outD: .4 });

// ---------------------------------------------------------------- 13. every guru has a method -> they all work (give them a year)
const GT = [["Digital products", IC.book, "#4f7cff,#7b5cff", W("g1", "Build")], ["Edit reels", IC.short, "#ff5fa2,#c24bff", W("g1", "Edit")], ["Dropshipping", IC.box, "#ffb35c,#ff6b4a", W("g1", "Dropshipping")], ["Start an agency", IC.brief, "#2fd49a,#1fa3c9", W("g1", "Start")]];
const GPOS = [[-290, -175], [290, -175], [-290, 175], [290, 175]];
function guruTiles(cam) { return GT.map(([n, ic, g], i) => { const x = ctr(cam, "tile p3", `<div class="ic" style="background:rgba(255,255,255,.2)">${ic}</div>${n}<small>${["Build once, sell forever", "Money per video", "Store + suppliers", "Services for businesses"][i]}</small>`, GPOS[i][0], GPOS[i][1], 540, 310);
  x.style.background = `linear-gradient(135deg, ${g})`; x.style.boxShadow = "0 40px 90px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.4)"; return x; }); }
const GCAM = [0, 0, .86, 24, 0, -4];
S(101.55, 112.35, (cam, e) => {
  const tw = wt("g1"), h = words(e, "Every guru online has a method.", 120, 66, tw.slice(1, 7), { grad: [1] });
  const tiles = guruTiles(cam), checks = tiles.map(x => { const c = ctr(x, "", IC.check, 470, 60, 64, 64); Object.assign(c.style, { position: "absolute", borderRadius: "50%", background: "#fff", color: "#16a36a", padding: "12px" }); return c; });
  const yr = ctr(e, "", `<svg viewBox="0 0 200 200" width="100%" height="100%"><circle cx="100" cy="100" r="86" fill="rgba(10,12,24,.8)" stroke="rgba(255,255,255,.15)" stroke-width="10"/><circle class="pr" cx="100" cy="100" r="86" fill="none" stroke="url(#coolG)" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 100 100)"/></svg><div class="num" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 64px var(--font);color:#fff">12<small style="font:600 20px var(--font);color:var(--dim);letter-spacing:.1em">MONTHS</small></div>`, 960, 590, 260, 260);
  yr.style.position = "absolute"; const pr = yr.querySelector(".pr");
  GT.forEach(g => sfx("CLICK", g[3], -22)); const tW = W("g2", "work"), tY = W("g2", "give");
  return (lt, t) => {
    h.up(t); camSet(cam, [0, 40, .86, mix(34, 24, P(t, 101.6, 104, ios)), mix(-8, 0, lt / 10), -4 + lt * .3]);
    tiles.forEach((x, i) => { const a = GT[i][3] - .1, s = spring(t - a, 1.6, .62); x.style.opacity = clamp((t - a) / .15); x.style.transform = `translateZ(${(1 - Math.min(1, Math.max(0, s))) * -600}px)`; });
    checks.forEach((c, i) => popIn(c, t, tW - .1 + i * .1));
    appear(yr, t, tY - .2, .4, 20); pr.setAttribute("stroke-dashoffset", 1 - P(t, tY, tY + 1.1, ioc));
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 14. under every one of them: your own software -> store, course platform, tools
S(112.3, 123.85, (cam, e) => {
  const g3 = wt("g3"), h = words(e, "But here's what nobody tells you.", 120, 60, g3.slice(0, 6)), h2 = words(e, "Under every one, put your own software.", 120, 64, [g3[6], g3[7], g3[8], g3[13], g3[14], g3[15], g3[16]], { grad: [6] });
  const tiles = guruTiles(cam), plates = GPOS.map(([x, y]) => { const p = ctr(cam, "", `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 34px var(--font);letter-spacing:.14em;color:#fff">YOUR SOFTWARE</div>`, x, y, 540, 310);
    Object.assign(p.style, { position: "absolute", borderRadius: "26px", background: "linear-gradient(135deg, rgba(110,139,255,.35), rgba(199,125,255,.35))", border: "2px solid rgba(190,200,255,.7)" }); return p; });
  const tUnder = W("g3", "Under"), tSoft = W("g3", "software"), g4 = wt("g4"), tSt = W("g4", "store") - .3;
  const WN = [["store", "Your own store", -600], ["course", "Your own course platform", 0], ["tools", "Your own tools", 600]];
  const wins = WN.map(([k, ttl, x], i) => { const w = win(e, 960 + x, 600, 560, 420, { light: true, url: ttl.toLowerCase().replace(/ /g, "") + ".app" }); w.a = [W("g4", "store"), W("g4", "course"), W("g4", "tools")][i] - .15;
    const B = w.bd;
    if (k === "store") B.innerHTML = [0, 1, 2, 3].map(j => `<div style="position:absolute;left:${24 + (j % 2) * 262}px;top:${20 + Math.floor(j / 2) * 170}px;width:240px;height:150px;border-radius:14px;background:#f1f3f9"><div style="margin:14px;height:78px;border-radius:10px;background:linear-gradient(135deg,hsl(${j * 70 + 200},70%,70%),hsl(${j * 70 + 240},70%,60%))"></div><div style="margin:0 14px;display:flex;justify-content:space-between;font:700 18px var(--font);color:#1b2140"><span>Item ${j + 1}</span><span>$${[29, 49, 19, 99][j]}</span></div></div>`).join("");
    if (k === "course") B.innerHTML = `<div style="position:absolute;left:24px;top:20px;width:300px;height:170px;border-radius:14px;background:linear-gradient(135deg,#1b2140,#4b3f8f);display:flex;align-items:center;justify-content:center;color:#fff"><div style="width:54px;height:54px">${IC.play}</div></div>` + [0, 1, 2, 3, 4].map(j => `<div style="position:absolute;left:340px;right:22px;top:${20 + j * 64}px;height:52px;border-radius:12px;background:#f1f3f9;display:flex;align-items:center;gap:10px;padding:0 12px;font:600 17px var(--font);color:#1b2140"><span style="width:22px;height:22px;border-radius:50%;background:${j < 2 ? "#3ddc97" : "#dfe3ee"}"></span>Lesson ${j + 1}</div>`).join("");
    if (k === "tools") { B.innerHTML = ["Send invoices", "Follow up leads", "Post content", "Weekly report"].map((n2, j) => `<div class="row" style="position:absolute;left:22px;right:22px;top:${22 + j * 82}px;height:66px;border-radius:14px;background:#f1f3f9;display:flex;align-items:center;padding:0 18px;font:600 20px var(--font);color:#1b2140">${n2}<div class="sw" style="position:absolute;right:18px;top:17px;width:56px;height:32px;border-radius:18px;background:#d6dae6"><i style="position:absolute;left:4px;top:4px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2)"></i></div></div>`).join(""); w.sws = [...B.querySelectorAll(".sw")]; }
    sfx("WH_SOFT", w.a, -26); return w; });
  const h3 = words(e, "Your own store. Your own course platform. Your own tools.", 200, 58, g4.slice(0, 9), { grad: [2, 6, 8] });
  const tBor = W("g4", "boring"); wins[2].sws.forEach((s, j) => sfx("CLICK", tBor - .6 + j * .25, -24));
  sfx("IMP_SOFT", tSoft, -20);
  return (lt, t) => {
    h.up(t); vanish(h, t, tUnder - .3, .3); h2.up(t); vanish(h2, t, tSt - .2, .3);
    const lift = P(t, tUnder - .1, tUnder + 1.2, ioe), back = P(t, tSt - .3, tSt + .6, ioe);
    camSet(cam, [0, 40, mix(.86, .8, lift), mix(GCAM[3], 62, lift * (1 - back)), 0, mix(-4, 12, lift) * (1 - back)]);
    tiles.forEach((x, i) => { x.style.transform = `translateZ(${lift * 230}px)`; x.style.opacity = 1 - back; });
    plates.forEach(p => { const gl2 = P(t, tSoft - .1, tSoft + .4, oc); p.style.opacity = clamp(lift * 1.5) * (1 - back); p.style.boxShadow = `0 0 ${20 + 80 * gl2}px rgba(150,140,255,${.4 + .5 * gl2})`; });
    h3.up(t); wins.forEach(w => appear(w, t, w.a, .6, 90));
    if (wins[2].sws) wins[2].sws.forEach((s, j) => { const on = t >= tBor - .6 + j * .25; s.style.background = on ? "#3ddc97" : "#d6dae6"; s.firstChild.style.transform = `translateX(${on ? 24 : 0}px)`; });
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 15. a service, wrapped in a product (a box folds around it)
S(123.8, 129.25, (cam, e) => {
  const tw = wt("g5"), h = words(e, "A service, wrapped in a product.", 150, 76, tw.slice(3, 9), { grad: [1, 5] });
  const h2 = words(e, "That's exactly what I built.", 950, 48, tw.slice(10)); h2.style.color = "rgba(226,232,250,.8)";
  const box = at(cam, "ab p3", "", 0, 0), S2 = 340, hf = S2 / 2;
  const chip = ctr(box, "pill", `<span style="color:#9ff5cf;display:flex">${IC.hand}</span>Service`, 0, -120, 250, 70); chip.style.boxShadow = "0 0 60px rgba(61,220,151,.5)";
  const face = (tr, extra = "") => { const f = ctr(box, "", extra, 0, 0, S2, S2); Object.assign(f.style, { position: "absolute", borderRadius: "18px", background: "linear-gradient(145deg,#2c3673,#1a1e44 60%,#3a2a6e)", border: "2px solid rgba(170,180,255,.7)", boxShadow: "inset 0 0 50px rgba(140,150,255,.35)", transformOrigin: "50% 100%", backfaceVisibility: "visible" }); f.tr = tr; return f; };
  const sides = [["", 0], ["rotateY(90deg) ", 1], ["rotateY(180deg) ", 2], ["rotateY(-90deg) ", 3]].map(([r]) => face(r, ""));
  sides[0].innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font:700 40px var(--font);color:#fff"><div class="lg" style="width:120px;height:120px;border-radius:30px;background:linear-gradient(145deg,#5a86ff,#7b5cff 55%,#c56bff);position:relative;overflow:hidden">${KBA}</div>Product</div>`;
  const lg = sides[0].querySelector(".lg"); lg.firstChild.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  const lid = face("", ""), bottom = face("", "");
  const tWr = W("g5", "wrapped"), tPr = W("g5", "product"), tB = W("g5", "built");
  sfx("WH_SWING", tWr, -22); sfx("IMP_SOFT", tPr + .45, -18); sfx("CLICK", tB, -20);
  return (lt, t) => {
    h.up(t); h2.up(t);
    const u = P(t, tWr - .1, tWr + .8, ioe), l = P(t, tPr, tPr + .5, ioe);
    sides.forEach(f => { f.style.transform = `${f.tr}translateY(${-hf}px) translateZ(${hf}px) rotateX(${mix(-92, 0, u)}deg)`; });
    bottom.style.transformOrigin = lid.style.transformOrigin = "50% 50%"; bottom.style.transform = "rotateX(90deg)"; lid.style.transform = `translateY(${-S2 - 420 * (1 - l)}px) rotateX(90deg)`; lid.style.opacity = l;
    lg.style.opacity = P(t, tB - .3, tB + .2); lg.style.transform = `scale(${.6 + .4 * P(t, tB - .3, tB + .3, oc)})`;
    chip.style.opacity = 1 - P(t, tPr + .2, tPr + .5);
    box.style.transform = `translateY(200px) rotateX(-24deg) rotateY(${mix(38, -14, P(t, 123.8, 128.8, ios))}deg)`;
    camSet(cam, [0, 0, .95, 0, 0]);
  };
}, { outD: .5 });
