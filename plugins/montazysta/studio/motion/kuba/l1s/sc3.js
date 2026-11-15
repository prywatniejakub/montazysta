"use strict";
// Lesson 1 (SaaS style) — part 3: my 3 businesses, real numbers, your move.
// Continuity: "01" morphs into a website; a social ad is clicked -> becomes a lead -> lands in the dashboard -> charges the
// balance; a long video drops into a machine -> phones come out -> the film's own timeline (meta); Stripe on a monitor on a
// pedestal -> the asset cube returns; the cube drops into the Marketplace -> a kit opens -> download; lesson 2 card -> logo.
function bizHead(e, n, key, title, grad) {
  const k = el(e, "div", "hl kick", `Business 0${n}`); k.style.top = "118px"; k.style.fontSize = "24px";
  const tw = wt(key), h = words(e, title, 205, 80, tw.slice(3), { grad });
  return t => { appear(k, t, tw[0] - .1, .4, 14); h.up(t); };
}
const DENT = `<div style="position:absolute;inset:0;background:#fbfcff">
  <div style="height:64px;display:flex;align-items:center;gap:26px;padding:0 34px;font:700 20px var(--font);color:#1b2140"><span style="width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#2fb8d6,#4f7cff)"></span>Bright Smile Dental<span style="margin-left:auto;font:600 16px var(--font);color:#6b7390">Services · Team · Contact</span></div>
  <div style="position:absolute;left:34px;top:110px;width:46%;font:800 50px/1.05 var(--font);letter-spacing:-.03em;color:#0e1222">Healthy smiles, made simple.</div>
  <div style="position:absolute;left:34px;top:250px;width:44%;font:500 19px/1.5 var(--font);color:#6b7390">Modern dental care in the heart of the city. Book online in 30 seconds.</div>
  <div style="position:absolute;left:34px;top:330px;height:54px;padding:0 28px;border-radius:14px;background:#2f5bff;color:#fff;font:700 19px/54px var(--font)">Book a visit</div>
  <div style="position:absolute;right:34px;top:100px;width:44%;height:300px;border-radius:22px;background:linear-gradient(135deg,#bfe9ff,#7aa8ff 50%,#b39cff)"></div>
  ${[0, 1, 2].map(i => `<div style="position:absolute;left:${34 + i * 300}px;top:430px;width:280px;height:90px;border-radius:16px;background:#eef1f8"></div>`).join("")}</div>`;

// ---------------------------------------------------------------- 16. business 01: websites with hosting — two strategies
S(129.1, 148.75, (cam, e) => {
  const head = bizHead(e, 1, "b1", "Websites, with hosting.", [0, 2]);
  const shell = el(cam, "div", "ab"); Object.assign(shell.style, { overflow: "hidden", boxShadow: "0 60px 160px rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.18)" });
  const big = el(shell, "div", "ab gradw", ""); Object.assign(big.style, { inset: 0, display: "flex", alignItems: "center", justifyContent: "center", font: "700 260px var(--font)", letterSpacing: "-.06em", background: "linear-gradient(145deg,#2b3470,#171b3a)" });
  big.innerHTML = '<span class="wd grad">01</span>';
  const site = el(shell, "div", "ab", DENT); site.style.inset = "0";
  const tb = el(shell, "div", "ab", `<div class="tb" style="position:absolute;left:0;right:0;top:0;height:40px;display:flex;align-items:center;gap:8px;padding-left:16px;background:#eef0f6"><i style="width:11px;height:11px;border-radius:50%;background:#ff5f57"></i><i style="width:11px;height:11px;border-radius:50%;background:#febc2e"></i><i style="width:11px;height:11px;border-radius:50%;background:#28c840"></i><span style="margin-left:auto;margin-right:auto;font:500 14px var(--font);color:#6b7390">brightsmile-dental.com</span></div>`); tb.style.inset = "0";
  const b2 = wt("b2"), b3 = wt("b3"), tS1 = b2[0], tS2 = b3[0], tMorph = W("b1", "websites") + .3;
  const card = (title, sub) => { const c = at(cam, "gl", `<div class="lbl" style="left:40px;top:34px;color:rgba(190,205,255,.75)">${sub}</div><div style="position:absolute;left:40px;top:64px;font:700 46px var(--font);color:#fff;letter-spacing:-.03em">${title}</div>`, 150, -250, 600, 600); return c; };
  const c1 = card("Strategy 1", "For beginners"), c2 = card("Strategy 2", "For higher prices");
  const row = (c, y, icon, col, name, right) => { const r = at(c, "ab", `<div style="width:52px;height:52px;border-radius:15px;background:${col}26;color:${col};display:flex;align-items:center;justify-content:center"><div style="width:28px;height:28px">${icon}</div></div><div style="font:600 28px var(--font);color:#fff">${name}</div><div class="rt" style="margin-left:auto">${right}</div>`, 40, y, 520, 76);
    Object.assign(r.style, { display: "flex", alignItems: "center", gap: "18px", padding: "0 18px", borderRadius: "18px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)" }); return r; };
  const tagH = (txt, bg, fg = "#04150b") => `<span style="display:inline-block;height:46px;padding:0 18px;border-radius:14px;background:${bg};color:${fg};font:800 24px/46px var(--font)">${txt}</span>`;
  const r11 = row(c1, 150, IC.app, "#6e8bff", "Website", tagH("FREE", "#3ddc97")), r12 = row(c1, 250, IC.server, "#5ee7ff", "Hosting", tagH("$ / month", "#5ee7ff"));
  const months = at(c1, "ab", "", 40, 370, 520, 170); const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const mcs = MN.map((m, i) => { const x = at(months, "ab", `<div style="font:600 18px var(--font);color:rgba(220,228,255,.6)">${m}</div><div class="cn" style="margin-top:10px;width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font:800 24px var(--font);color:#04150b">$</div>`, i * 88, 20, 70, 110); x.style.textAlign = "center"; x.cn = x.querySelector(".cn"); x.a = W("b2", "every") + i * .16; return x; });
  const r21 = row(c2, 150, IC.app, "#6e8bff", "Website", tagH("High price", "#ffd84a", "#1a1204")), r22 = row(c2, 250, IC.server, "#5ee7ff", "Hosting", tagH("Small fee", "rgba(94,231,255,.25)", "#bff5ff"));
  const steady = at(c2, "ab", `<svg viewBox="0 0 520 120" width="520" height="120"><path class="ln" d="M0 100 C60 90 90 60 140 62 S240 50 300 46 S420 36 520 30" fill="none" stroke="url(#coolG)" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg><div class="lbl" style="left:0;top:-26px">Steady money</div>`, 40, 380, 520, 120);
  const ln = steady.querySelector(".ln");
  const stay = at(c2, "ab", "", 40, 520, 520, 56); const avs = Array.from({ length: 8 }, (_, i) => { const a = at(stay, "ab", "", i * 44, 0, 52, 52); Object.assign(a.style, { borderRadius: "50%", background: `linear-gradient(135deg,hsl(${i * 45},80%,70%),#1a1f30)`, border: "3px solid #151a2b" }); a.a = W("b3", "clients") - .2 + i * .06; return a; });
  const stayL = at(stay, "ab", "Clients who stay", 390, 12); Object.assign(stayL.style, { font: "600 20px var(--font)", color: "#9ff5cf", whiteSpace: "nowrap" });
  [W("b2", "free"), W("b3", "high"), W("b3", "monthly")].forEach(a => sfx("CLICK", a, -22)); mcs.forEach(m => sfx("CLICK", m.a, -30)); sfx("WH_SOFT", tS2 - .1, -24);
  return (lt, t) => {
    head(t);
    const m = [[0, 0, -120, 80, 340, 340, 60], [tMorph, 1, 0, 80, 1100, 640, 22], [tS1 - .2, .9, -400, 110, 900, 520, 20]];
    morph(shell, m, t); const k = P(t, tMorph, tMorph + .7, ioc); big.style.opacity = 1 - k; site.style.opacity = k; tb.style.opacity = k;
    shell.style.opacity = P(t, 129.3, 129.8); shell.style.transform = `rotateY(${mix(0, 10, P(t, tS1, tS1 + 1, ios))}deg)`;
    camSet(cam, [0, 0, .95 + lt * .003, 4, 0]);
    const s1 = P(t, tS1 - .1, tS1 + .6, oc), s2 = P(t, tS2 - .2, tS2 + .5, oc);
    c1.style.opacity = s1 * (1 - s2); c1.style.transform = `translateX(${(1 - s1) * 200 - s2 * 120}px)`;
    c2.style.opacity = s2; c2.style.transform = `translateX(${(1 - s2) * 200}px)`;
    appear(r11, t, W("b2", "website") - .1, .4, 16); appear(r12, t, W("b2", "client") - .1, .4, 16); r11.querySelector(".rt").style.transform = `scale(${t > W("b2", "free") ? 1 : .01})`;
    mcs.forEach(x => { const on = t >= x.a; x.style.opacity = clamp((t - W("b2", "client") + .2) / .3); x.cn.style.background = on ? "linear-gradient(135deg,#3ddc97,#2fb8d6)" : "rgba(255,255,255,.08)"; x.cn.style.transform = `scale(${on ? 1 + .25 * pulse(t, x.a, .15) : .9})`; });
    appear(r21, t, W("b3", "sell") - .1, .4, 16); r21.querySelector(".rt").style.transform = `scale(${t > W("b3", "high") ? 1 : .01})`;
    appear(r22, t, W("b3", "keep") - .1, .4, 16); r22.querySelector(".rt").style.transform = `scale(${t > W("b3", "small") ? 1 : .01})`;
    appear(steady, t, W("b3", "Steady") - .1, .4, 10); ln.setAttribute("stroke-dashoffset", 1 - P(t, W("b3", "Steady"), W("b3", "Steady") + 1, ioc));
    avs.forEach(a => popIn(a, t, a.a)); appear(stayL, t, W("b3", "stay") - .1, .4, 10);
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 17. business 02: selling leads — ad -> lead -> dashboard -> balance
S(148.7, 168.1, (cam, e) => {
  const head = bizHead(e, 2, "b4", "Selling leads.", [1]);
  const b5 = wt("b5"), tFuel = W("b5", "fuel"), tIn = W("b5", "In"), tComes = W("b5", "comes"), tApp = W("b5", "app"), tCh = W("b5", "charges");
  const fuel = words(e, "Leads are fuel for every business.", 500, 84, b5.slice(0, 6), { grad: [0, 2] });
  const gauge = ctr(e, "", `<svg viewBox="0 0 400 220" width="100%" height="100%"><path d="M30 200 A170 170 0 0 1 370 200" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="24" stroke-linecap="round"/><path class="gv" d="M30 200 A170 170 0 0 1 370 200" fill="none" stroke="url(#coolG)" stroke-width="24" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`, 960, 760, 420, 230);
  gauge.style.position = "absolute"; const gv = gauge.querySelector(".gv");
  // the ad (left) -> becomes a lead notification -> flies into the dashboard (right)
  const ad = el(e, "div", "ab"); Object.assign(ad.style, { overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px rgba(0,0,0,.5)" });
  ad.innerHTML = `<div class="adc" style="position:absolute;inset:0"><div style="height:64px;display:flex;align-items:center;gap:12px;padding:0 20px;font:700 18px var(--font);color:#1b2140"><span style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#2fb8d6,#4f7cff)"></span>Bright Smile Dental<span style="font:500 14px var(--font);color:#8a90a6;margin-left:6px">Sponsored</span></div>
    <div style="margin:0 20px;height:230px;border-radius:14px;background:linear-gradient(135deg,#bfe9ff,#7aa8ff 50%,#b39cff)"></div><div style="padding:16px 20px 0;font:700 24px var(--font);color:#0e1222">Free consultation this week</div>
    <div class="btn" style="position:absolute;left:20px;right:20px;bottom:20px;height:56px;border-radius:14px;background:#2f5bff;color:#fff;font:700 20px/56px var(--font);text-align:center">Book a free consult</div></div>
    <div class="ld" style="position:absolute;inset:0;display:flex;align-items:center;gap:18px;padding:0 22px;background:rgba(28,32,50,.95);opacity:0"><span style="width:52px;height:52px;border-radius:14px;flex:none;background:linear-gradient(135deg,#3ddc97,#2fb8d6);display:flex;align-items:center;justify-content:center;color:#04150b"><span style="width:28px;height:28px;display:flex">${IC.users}</span></span><div><b style="display:block;font:700 21px var(--font);color:#fff">New lead · Anna K.</b><span style="font:500 17px var(--font);color:rgba(226,232,250,.6)">Dental implants · just now</span></div></div>`;
  const adc = ad.querySelector(".adc"), ld = ad.querySelector(".ld"), btn = ad.querySelector(".btn");
  const dash = win(e, 1330, 590, 860, 600, { url: "lead-engine.app / clients / bright-smile" });
  dash.bd.innerHTML = `<div class="lbl" style="left:30px;top:26px">Leads</div>${[0, 1, 2, 3].map(i => `<div class="rw" style="position:absolute;left:30px;right:330px;top:${64 + i * 70}px;height:58px;border-radius:14px;background:rgba(255,255,255,${.06 - i * .01});display:flex;align-items:center;gap:14px;padding:0 16px;font:600 19px var(--font);color:rgba(235,240,255,.85)"><span style="width:32px;height:32px;border-radius:50%;background:hsl(${i * 80 + 20},70%,65%)"></span>${["Mark T.", "Julia R.", "Omar S.", "Eva L."][i]}<span style="margin-left:auto;font:500 15px var(--font);color:rgba(226,232,250,.5)">${i + 1}h ago</span></div>`).join("")}
    <div class="bal" style="position:absolute;right:30px;top:64px;width:270px;height:200px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)"><div class="lbl" style="left:22px;top:20px">Client balance</div><div class="bv num" style="position:absolute;left:22px;top:56px;font:700 60px var(--font);color:#fff;letter-spacing:-.03em">$500</div><div class="bm num" style="position:absolute;left:22px;top:136px;font:800 26px var(--font);color:#ff6b7a;opacity:0">−$25 lead</div></div>`;
  const rows = [...dash.bd.querySelectorAll(".rw")], bv = dash.bd.querySelector(".bv"), bm = dash.bd.querySelector(".bm"), bal = dash.bd.querySelector(".bal");
  const rip = ripple(e, 560, 830, "120,150,255");
  const cur = el(e, "div", "cur", CURSOR); const CUR = [[0, 0, 900, 1000], [tComes - 1.1, .8, 560, 830], [tComes + .6, .6, 700, 1100]];
  const b6 = wt("b6"), sw = swapWord(e, [[b6[0] - .05, "You don't sell marketing.", ""], [b6[4] - .05, "You sell results.", "grad"]], 960, 440, 110, { center: true });
  const tLow = W("b6", "lower"), mo = at(e, "ab", "", 0, 0, 1920, 1080); const months = Array.from({ length: 8 }, (_, i) => { const m = ctr(mo, "", `<b style="display:block;font:700 22px var(--font)">M${i + 1}</b>`, 960 + (i - 3.5) * 150, 760, 120, 90); Object.assign(m.style, { position: "absolute", borderRadius: "18px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", textAlign: "center", paddingTop: "30px" }); m.a = W("b6", "stay") - .1 + i * .12; return m; });
  const lowTag = pill(mo, `<span style="color:#9ff5cf;display:flex">${IC.bolt}</span>Lower price to start`, 960, 610);
  sfx("CLICK", tComes, -14); sfx("WH_SWING", tComes + .45, -22); sfx("CLICK", tApp, -20); sfx("IMP_SOFT", tCh + .2, -22); sfx("IMP_SOFT", b6[4], -18);
  return (lt, t) => {
    head(t); const hv = P(t, tFuel - .3, tFuel, oc) * (1 - P(t, tIn - .3, tIn + .1));
    fuel.up(t); fuel.style.opacity = t < tIn - .3 ? 1 : 1 - P(t, tIn - .3, tIn + .1); gauge.style.opacity = hv; gv.setAttribute("stroke-dashoffset", 1 - P(t, tFuel, tFuel + 1.2, ioc) * .92);
    e.querySelector(".kick").style.opacity = t > tFuel - .3 ? 1 - P(t, tFuel - .3, tFuel) : e.querySelector(".kick").style.opacity;
    const on = P(t, tIn - .2, tIn + .5, oc);
    // ad -> lead card -> into the dashboard
    const fl = P(t, tComes + .35, tApp, ioe), sh = P(t, tComes + .1, tComes + .45, ioc);
    morph(ad, [[0, 0, 560, 600, 520, 520, 26], [tComes + .1, .35, 560, 600, 470, 92, 22], [tComes + .45, tApp - tComes - .45, 1180, 380, 470, 92, 22]], t);
    ad.style.opacity = on * (1 - P(t, tApp + .05, tApp + .25)); adc.style.opacity = 1 - sh; ld.style.opacity = sh; ad.style.transform = `translateY(${(1 - on) * 60}px)`;
    btn.style.transform = `scale(${1 - .05 * pulse(t, tComes, .2) * (t >= tComes ? 1 : 0)})`; rip(t, tComes);
    appear(dash, t, tIn + .1, .6, 60);
    rows.forEach((r, i) => { const d = P(t, tApp - .1, tApp + .3, oc); r.style.transform = `translateY(${d * 70}px)`; });
    if (!dash.nr) { dash.nr = at(dash.bd, "ab", `<span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3ddc97,#2fb8d6)"></span>Anna K.<span style="margin-left:auto;font:600 15px var(--font);color:#9ff5cf">NEW</span>`, 30, 64, 500, 58);
      Object.assign(dash.nr.style, { borderRadius: "14px", background: "rgba(61,220,151,.16)", border: "1px solid rgba(61,220,151,.5)", display: "flex", alignItems: "center", gap: "14px", padding: "0 16px", font: "600 19px var(--font)", color: "#fff" }); }
    dash.nr.style.opacity = P(t, tApp, tApp + .2); dash.nr.style.transform = `scale(${.9 + .1 * P(t, tApp, tApp + .3, oc)})`;
    const c = P(t, tCh, tCh + .6, ioc); bv.textContent = "$" + Math.round(500 - 25 * c); bm.style.opacity = P(t, tCh, tCh + .2) * (1 - P(t, tCh + 1.2, tCh + 1.5)); bm.style.transform = `translateY(${-c * 16}px)`;
    bal.style.boxShadow = t > tCh ? `0 0 ${50 * pulse(t, tCh + .1, .5)}px rgba(255,107,122,.6)` : "";
    const [cx, cy] = keysAt(CUR, t, ios); cur.style.transform = `translate(${cx}px,${cy}px)`; cur.style.display = t > tComes - 1.2 && t < tComes + 1.3 ? "" : "none";
    // results
    const dm = P(t, b6[0] - .3, b6[0] + .2, oc); [ad, dash].forEach(x => { x.style.filter = dm > .01 ? `blur(${dm * 14}px) brightness(${1 - dm * .6})` : x === dash && x.style.filter.startsWith("blur") ? "" : x.style.filter; });
    dash.style.opacity = Math.min(+dash.style.opacity || 0, 1 - dm * .7);
    sw.up(t); sw.style.opacity = 1 - P(t, tLow - .4, tLow - .1);
    appear(lowTag, t, tLow - .1, .45, 20, "translateX(-50%)"); months.forEach(m => { const u = appear(m, t, m.a, .4, 20); m.style.background = t > m.a + .2 ? "rgba(61,220,151,.22)" : "rgba(255,255,255,.06)"; m.style.borderColor = t > m.a + .2 ? "rgba(61,220,151,.6)" : ""; });
    camSet(cam, [0, 0, 1]);
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 18. business 03: video — long video in, short clips out -> this very film (meta)
S(168.0, 192.75, (cam, e) => {
  const head = bizHead(e, 3, "b7", "Video.", [0]);
  const b7 = wt("b7"), tDrop = W("b7", "Drop"), tOut = W("b7", "short"), b8 = wt("b8"), tClip = W("b8", "clipping"), tSell = W("b8", "sell"), b9 = wt("b9"), tMeta = b9[0] - .2, tTold = W("b9", "told"), tMore = W("b10", "more");
  const strip = at(e, "ab", "", 0, 0); const CL = ["green", "farm", "zomb", "obsi", "tunnel", "green", "zomb", "farm"];
  const frames = CL.map((c, i) => { const f = ctr(strip, "", `<img src="${frameUrl(c, 20 + i * 12)}" style="width:100%;height:100%;object-fit:cover;display:block">`, 0, 0, 260, 146); Object.assign(f.style, { position: "absolute", borderRadius: "10px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,.5)" }); return f; });
  const mach = win(e, 700, 620, 700, 440, { url: "ai-clip-studio.app" });
  mach.bd.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#fff;font:600 26px var(--font)"><div class="sp" style="width:120px;height:120px;border-radius:50%;border:6px solid rgba(255,255,255,.12);border-top-color:#8fa8ff"></div><span class="st">Finding the best moments…</span></div>`;
  const spin = mach.bd.querySelector(".sp"), st = mach.bd.querySelector(".st");
  const PH = [["farm", 1260], ["zomb", 1500], ["obsi", 1740]], VIEWS = [48200, 12900, 103400], PRICE = ["$5", "$12", "$20"];
  const phones = PH.map(([c, x], i) => { const g = at(e, "ab", "", x, 600); const p = el(g, "div", "phone"); p.style.transform = "scale(.62)"; const sc = el(p, "div", "scr"); p.cv = canvas(sc, 405, 880); el(p, "div", "isl");
    const v = ctr(g, "pill num", "", 0, 250, 210, 56); v.style.fontSize = "22px"; v.style.justifyContent = "center";
    const pr = ctr(g, "", PRICE[i], 70, -230, 110, 60); Object.assign(pr.style, { position: "absolute", borderRadius: "16px", background: "linear-gradient(135deg,#ffd84a,#ff9a4a)", color: "#1a1204", font: "800 30px/60px var(--font)", textAlign: "center", boxShadow: "0 12px 30px rgba(255,190,80,.4)" });
    g.p = p; g.c = c; g.v = v; g.pr = pr; g.i = i; return g; });
  const per = icoPill(e, IC.eye, "#9fb8ff", "Paid per 1,000 views", 1500, 920);
  // meta: the editor that made this very video
  const ed = win(e, 960, 560, 1500, 800, { url: "ai-editor · Lesson 1 — What's possible" });
  ed.bd.innerHTML = `<div class="pv" style="position:absolute;left:30px;top:24px;width:760px;height:428px;border-radius:14px;overflow:hidden;background:#04050b;display:flex;align-items:center;justify-content:center"><div style="font:600 46px var(--font);color:#fff;letter-spacing:-.03em">Lesson 1 · <span class="grad">What's possible</span></div></div>
    <div class="ch" style="position:absolute;left:820px;right:30px;top:24px;height:428px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)"></div>
    <div class="tl" style="position:absolute;left:30px;right:30px;top:480px;height:250px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)"></div>`;
  const tl = ed.bd.querySelector(".tl"), chat = ed.bd.querySelector(".ch"), TLW = 1380;
  const COLS = ["#4f7cff", "#8b6cff", "#3ddc97", "#ff9a4a", "#e86bd0", "#2fb8d6", "#ffd84a", "#6e8bff", "#ff6b7a", "#9ff5cf"];
  T.chapters.forEach((c, i) => { const x = at(tl, "ab", `<span>${c.title}</span>`, 20 + c.a / DUR * TLW, 30, Math.max(40, (c.z - c.a) / DUR * TLW - 6), 70);
    Object.assign(x.style, { borderRadius: "10px", background: COLS[i % 10] + "55", border: `1px solid ${COLS[i % 10]}`, font: "600 15px/70px var(--font)", color: "#fff", padding: "0 10px", overflow: "hidden", whiteSpace: "nowrap" }); });
  [0, 1].forEach(r => { const w2 = at(tl, "ab", "", 20, 120 + r * 56, TLW, 44); w2.style.borderRadius = "10px"; w2.style.background = r ? "rgba(255,154,74,.18)" : "rgba(91,140,255,.18)"; });
  const ph = at(tl, "ab", `<div style="position:absolute;left:-60px;top:-38px;width:120px;text-align:center;font:700 15px var(--font);color:#ffd84a;white-space:nowrap">YOU ARE HERE</div>`, 0, 20, 3, 220); ph.style.background = "#ffd84a"; ph.style.boxShadow = "0 0 12px #ffd84a";
  const aiChip = ctr(ed.bd, "ok", `${IC.spark}Edited by AI`, 410, 380, 210, 52);
  const me = at(chat, "bub me", "", 40, 40); me.style.maxWidth = "380px"; me.style.fontSize = "22px"; const ai = at(chat, "bub them", "Done. Clean, premium, on the beat ✓", 20, 200); ai.style.maxWidth = "380px"; ai.style.fontSize = "22px";
  const LK = [["Coming soon", -380], ["Coming soon", 0], ["Coming soon", 380]].map(([n, x], i) => { const c = ctr(e, "gl", `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:rgba(226,232,250,.8);font:600 26px var(--font)"><div style="width:56px;height:56px">${IC.lock}</div>${n}</div>`, 960 + x, 620, 320, 240); c.a = tMore + i * .15; return c; });
  sfx("WH_SWING", tDrop, -22); sfx("IMP_SOFT", tOut, -22); phones.forEach((g, i) => sfx("CLICK", tSell + .4 + i * .2, -22)); sfx("WH_SOFT", tMeta, -22); sfx("CLICK", tTold + .6, -18);
  return (lt, t) => {
    head(t); const hd = P(t, tDrop - .3, tDrop, oc); e.querySelectorAll(".hl").forEach(x => { if (x !== aiChip) x.style.opacity = t > tDrop - .3 ? 1 - hd : x.style.opacity; });
    const mIn = P(t, tDrop - .2, tDrop + .4, oc), meta = P(t, tMeta - .1, tMeta + .7, ioe), more = P(t, tMore - .3, tMore + .1);
    mach.style.opacity = mIn * (1 - meta); mach.style.transform = `translateY(${(1 - mIn) * 60}px) scale(${1 - meta * .3})`;
    spin.style.transform = `rotate(${t * 400}deg)`; st.textContent = t > tOut ? "3 clips ready ✓" : "Finding the best moments…";
    frames.forEach((f, i) => { const d = P(t, tDrop + i * .08, tDrop + .9 + i * .08, E.inCubic); f.style.left = px(mix(300 + i * 190, 700, d) - 130); f.style.top = px(mix(250, 600, d) - 73); f.style.opacity = (t > tDrop - .5 ? 1 : 0) * (1 - P(t, tDrop + .7 + i * .08, tDrop + .95 + i * .08)); f.style.transform = `scale(${1 - d * .6}) rotate(${(i - 3.5) * 3 * (1 - d)}deg)`; });
    phones.forEach(g => { const a = tOut - .1 + g.i * .15, u = P(t, a, a + .6, ioe); g.style.opacity = clamp((t - a) / .2) * (1 - meta); g.style.transform = `translateX(${(1 - u) * -300}px) scale(${.8 + .2 * u})`;
      drawClip(g.p.cv, g.c, Math.max(0, t - a));
      appear(g.v, t, tClip + g.i * .12, .4, 12); g.v.textContent = Math.round(VIEWS[g.i] * P(t, tClip, W("b8", "views") + .4, ioc)).toLocaleString("en-US") + " views";
      popIn(g.pr, t, W("b8", "five") - .1 + g.i * .2, "rotate(8deg)"); });
    appear(per, t, W("b8", "pay") - .1, .45, 16, "translateX(-50%)"); vanish(per, t, tMeta - .2);
    ed.style.opacity = meta * (1 - more); ed.style.transform = `scale(${.85 + .15 * meta})`;
    ph.style.left = px(20 + t / DUR * TLW);
    appear(aiChip, t, W("b9", "AI") - .1, .45, 12);
    typeInto(me, "Edit lesson 1. Clean SaaS style, on the beat.", t, tTold, 34, false); me.style.opacity = t > tTold - .05 ? 1 : 0;
    appear(ai, t, W("b9", "wanted") + .1, .45, 16);
    LK.forEach(c => appear(c, t, c.a, .5, 50));
    camSet(cam, [0, 0, 1]);
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 19. real numbers: Stripe on a monitor on a pedestal
const STR = { w: 854, h: 419 };
S(192.7, 210.35, (cam, e) => {
  const tw = wt("p1"), h = words(e, "Real numbers.", 130, 70, tw.slice(1, 3), { grad: [1] });
  const scrW = 1100, scrH = 600, M = monitor(cam, 0, -60, scrW, scrH);
  const pd = ctr(cam, "", "", 0, 420, 700, 140); Object.assign(pd.style, { position: "absolute", borderRadius: "30px", background: "linear-gradient(180deg,#2a3048,#0e1120)", boxShadow: "0 60px 120px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.12)", transform: "rotateX(70deg)" });
  M.scr.style.background = "#f6f8fb"; const s = 1040 / STR.w;
  const im = at(M.scr, "ab", `<img src="${IMG}stripe_pln.png" style="width:100%;display:block">`, 30, (scrH - STR.h * s) / 2, 1040, STR.h * s);
  const pt = (ix, iy) => [-scrW / 2 + 30 + ix * s, -60 - scrH / 2 + (scrH - STR.h * s) / 2 + iy * s];
  const [gx, gy] = pt(518, 61), g = glow(cam, gx, gy, 200, 46, "#6e8bff");
  const pl = ctr(cam, "pill num", "", gx + 260, gy - 20, 250, 58); pl.style.fontSize = "28px"; pl.style.justifyContent = "center";
  const usd = ctr(cam, "", "", gx + 60, gy + 90, 320, 90); Object.assign(usd.style, { position: "absolute", borderRadius: "22px", background: "linear-gradient(135deg,#3ddc97,#2fb8d6)", color: "#04150b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", font: "800 38px var(--font)", boxShadow: "0 20px 60px rgba(61,220,151,.45)" });
  usd.innerHTML = `<span class="num">≈ $13,000</span><small style="font:600 15px var(--font);opacity:.7">PLN → USD at 3.84</small>`;
  const p3 = wt("p3"), CH = [["Not millions", IC.x, "#ff6b7a", W("p3", "Not")], ["On the side", IC.moon, "#9fb8ff", W("p3", "side")], ["My own software", IC.app, "#c77dff", W("p3", "software")], ["No hard selling", IC.hand, "#3ddc97", W("p3", "pushing")]];
  const chips = CH.map(([n, i, c, a], k) => { const x = icoPill(e, i, c, n, 960 + (k - 1.5) * 380, 950); x.a = a; sfx("CLICK", a, -24); return x; });
  const c0 = W("p2", "About") - .1, c1 = W("p2", "February") + .2, tU = W("p2", "roughly") - .1;
  sfx("IMP_SOFT", W("p1", "Stripe"), -20);
  return (lt, t) => {
    h.up(t); vanish(h, t, c0 - .4, .3);
    const K = [[0, 0, 0, -40, .62, 12, 34], [W("p1", "This") - .3, 1.6, 0, -60, .78, 4, 8], [c0 - .2, 1.1, gx, gy + 40, 1.7, 0, 0], [tU + .6, 1.4, gx + 60, gy + 40, 1.5, 0, -6], [W("p3", "Not") - .3, 1.2, 0, 0, .74, 8, -14]];
    camSet(cam, keysAt(K, t));
    g.up(t, c0, W("p3", "Not") - .4); appear(pl, t, c0, .4, 12); vanish(pl, t, W("p3", "Not") - .4); pl.textContent = "zł " + Math.round(49595 * P(t, c0, c1, ioc)).toLocaleString("en-US");
    popIn(usd, t, tU, "rotate(-4deg)"); usd.style.opacity = Math.min(+usd.style.opacity, 1 - P(t, W("p3", "Not") - .4, W("p3", "Not")));
    chips.forEach(c => appear(c, t, c.a - .1, .45, 16, "translateX(-50%)"));
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 20. money isn't the point: the software stays (the cube returns), every single day
S(210.3, 219.45, (cam, e) => {
  const tw = wt("p4"), h = words(e, "The money isn't the point.", 150, 70, tw.slice(1, 6));
  const h2 = words(e, "The software stays.", 150, 78, tw.slice(6, 9), { grad: [1] });
  const h3 = words(e, "That's the asset.", 900, 96, tw.slice(16), { grad: [2] });
  const cb = cube(cam, 260, i => i === 0 ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 38px var(--font);color:#fff">Software</div>` : "");
  const DY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], ring = at(cam, "ab p3", "", 0, 0);
  const days = DY.map((d, i) => { const x = ctr(ring, "", `<b style="display:block;font:700 22px var(--font)">${d}</b><span style="display:inline-block;margin-top:6px;width:30px;height:30px;color:#04150b;border-radius:50%;background:#3ddc97;padding:5px">${IC.check}</span>`, 0, 0, 110, 110);
    Object.assign(x.style, { position: "absolute", borderRadius: "22px", background: "rgba(20,24,40,.8)", border: "1px solid rgba(255,255,255,.15)", color: "#fff", textAlign: "center", paddingTop: "18px" }); x.an = i / 7 * Math.PI * 2; x.a = W("p4", "every") - .2 + i * .1; return x; });
  const cnt = icoPill(e, IC.cal, "#3ddc97", "", 960, 780); const cn = el(cnt, "span", "num", "");
  const tS = W("p4", "software"), tE = W("p4", "every");
  sfx("IMP_SOFT", tS, -20); days.forEach(d => sfx("CLICK", d.a, -30));
  return (lt, t) => {
    h.up(t); vanish(h, t, tS - .5, .3); h2.up(t); vanish(h2, t, tw[16] - .4, .3); h3.up(t);
    const b = P(t, tS - .3, tS + .6, ioe); cb.set(mix(600, 0, b)); cb.style.opacity = b; cb.style.transform = `rotateX(-18deg) rotateY(${lt * 30}deg)`;
    ring.style.transform = "rotateX(-18deg)";
    days.forEach(d => { const an = d.an + t * .5, u = P(t, d.a, d.a + .4, oc); d.style.opacity = u; d.style.transform = `translate3d(${Math.cos(an) * 400}px, 0, ${Math.sin(an) * 400}px) rotateX(18deg) scale(${.6 + .4 * u})`; });
    appear(cnt, t, tE - .1, .45, 16, "translateX(-50%)"); cn.textContent = "Working for me: day " + (1 + Math.floor(364 * P(t, tE, tw[16], E.inCubic)));
    vanish(cnt, t, tw[16] - .3);
    camSet(cam, [0, 0, .95, 0, 0]);
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 21. into the Marketplace: a kit opens -> scripts, strategy, ads, instructions -> download
const KITS = [["Websites + Hosting", IC.app, "#4f7cff,#7b5cff"], ["Lead Engine", IC.target, "#2fd49a,#1fa3c9"], ["AI Clip Studio", IC.film, "#ff5fa2,#c24bff"], ["YouTube Gaming Studio", IC.play, "#ffb35c,#ff6b4a"]];
S(219.4, 236.8, (cam, e) => {
  const k1 = wt("k1"), h = words(e, "Every business I've built goes into my Marketplace.", 120, 58, k1.slice(5), { grad: [7] });
  const mk = win(e, 960, 590, 1500, 780, { url: "kubabuildsai.com / kits" });
  mk.bd.innerHTML = `<div style="position:absolute;left:40px;top:30px;display:flex;align-items:center;gap:16px;font:700 30px var(--font);color:#fff"><span class="lgo" style="position:relative;width:48px;height:48px;border-radius:14px;overflow:hidden;background:linear-gradient(145deg,#5a86ff,#7b5cff 55%,#c56bff)">${KBA}</span>Marketplace</div>`;
  mk.bd.querySelector(".lgo svg").style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  const kc = KITS.map(([n, i, g], k) => { const c = at(mk.bd, "ab", `<div style="height:190px;background:linear-gradient(135deg,${g});display:flex;align-items:center;justify-content:center;color:#fff"><div style="width:70px;height:70px">${i}</div></div><div style="padding:18px 20px;font:700 24px var(--font);color:#fff">${n}</div><div style="padding:0 20px;font:500 16px var(--font);color:rgba(226,232,250,.55)">App · Know-how · Marketing · Videos</div>`, 40 + k * 356, 110, 330, 330);
    Object.assign(c.style, { borderRadius: "20px", overflow: "hidden", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }); c.a = k1[5] + .1 + k * .35; sfx("CLICK", c.a, -26); return c; });
  const k2 = wt("k2"), tClick = k2[0] - .15, tDl = W("k3", "Download");
  const cur = el(e, "div", "cur", CURSOR); const CUR = [[0, 0, 1500, 1000], [tClick - .9, .8, 380, 420], [tClick + .7, .7, 1040, 860], [tDl - .6, .5, 1240, 860], [tDl + .6, .6, 1700, 1100]];
  const rp = ripple(e, 380, 420, "150,160,255"), rp2 = ripple(e, 1240, 860, "120,240,190");
  // the detail panel (morphs out of the first card)
  const dp = el(e, "div", "ab gl"); dp.style.overflow = "hidden";
  dp.innerHTML = `<div style="position:absolute;left:0;top:0;right:0;height:220px;background:linear-gradient(135deg,${KITS[0][2]});"></div><div style="position:absolute;left:44px;top:250px;font:700 48px var(--font);color:#fff;letter-spacing:-.03em">Websites + Hosting</div>`;
  const IT = [["The app", IC.app, "#6e8bff", W("k2", "app")], ["Sales scripts", IC.chat, "#3ddc97", W("k2", "sales")], ["Marketing strategy", IC.mega, "#e86bd0", W("k2", "marketing")], ["Ads", IC.spark, "#ffb35c", W("k2", "ads")], ["How to run it", IC.book, "#5ee7ff", W("k2", "instructions")]];
  const its = IT.map(([n, i, c, a], k) => { const x = at(dp, "ab", `<span style="width:44px;height:44px;border-radius:13px;background:${c}26;color:${c};display:flex;align-items:center;justify-content:center"><span style="width:24px;height:24px;display:flex">${i}</span></span>${n}`, 44 + (k % 3) * 340, 340 + Math.floor(k / 3) * 84, 320, 68);
    Object.assign(x.style, { display: "flex", alignItems: "center", gap: "14px", padding: "0 14px", borderRadius: "16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", font: "600 22px var(--font)", color: "#fff" }); x.a = a; sfx("CLICK", a, -26); return x; });
  const dl = at(dp, "ab", `<span style="width:28px;height:28px;display:flex">${IC.download}</span><span class="dt">Download kit</span>`, 0, 0, 300, 70); Object.assign(dl.style, { right: "44px", left: "auto", bottom: "40px", top: "auto", borderRadius: "18px", background: "linear-gradient(95deg,#3ddc97,#2fb8d6)", color: "#04150b", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", font: "800 24px var(--font)" });
  const dt = dl.querySelector(".dt"), bar = at(dp, "ab", "", 44, 0, 780, 10); Object.assign(bar.style, { bottom: "70px", top: "auto", borderRadius: "6px", background: "rgba(255,255,255,.1)", overflow: "hidden" }); const barF = el(bar, "div", ""); Object.assign(barF.style, { height: "100%", width: "0", background: "linear-gradient(90deg,#3ddc97,#5ee7ff)" });
  const k3 = wt("k3"), tNext = W("k3", "next"), tLook = W("k3", "looking"), tBu = W("k3", "built"), tTe = W("k3", "tested");
  const tom = ctr(e, "gl", `<div class="lbl" style="left:0;right:0;top:22px;text-align:center">Tomorrow</div><div class="num" style="position:absolute;left:0;right:0;top:52px;text-align:center;font:800 90px var(--font);color:#fff">1</div>`, 380, 820, 220, 190);
  const lead = at(e, "note", `<div class="ic" style="background:linear-gradient(135deg,#3ddc97,#2fb8d6);color:#04150b">${IC.users}</div><div><b>New client inquiry</b><span>“Can you build our website?”</span></div>`, 560, 740);
  const st = (txt, x, a) => { const s = ctr(e, "", `<span style="width:30px;height:30px;display:flex">${IC.check}</span>${txt}`, x, 950, 230, 70); Object.assign(s.style, { position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", borderRadius: "18px", border: "3px solid #3ddc97", color: "#9ff5cf", font: "800 28px var(--font)", letterSpacing: ".06em" }); s.a = a; sfx("IMP_SOFT", a, -24); return s; };
  const s1 = st("BUILT", 1380, tBu), s2 = st("TESTED", 1640, tTe);
  sfx("CLICK", tClick, -14); sfx("CLICK", tDl, -14); sfx("WH_SOFT", tClick + .1, -24);
  return (lt, t) => {
    h.up(t); vanish(h, t, tClick - .3, .3);
    appear(mk, t, 219.5, .7, 80); kc.forEach(c => appear(c, t, c.a, .5, 40));
    const op = P(t, tClick + .05, tClick + .75, ioe);
    morph(dp, [[0, 0, 380 + 0, 110 + 165 + 46 + 180, 330, 330, 20], [tClick + .05, .7, 960, 560, 1300, 700, 30]], t); dp.style.opacity = P(t, tClick, tClick + .15);
    mk.style.filter = op > .01 ? `blur(${op * 10}px) brightness(${1 - op * .5})` : "";
    its.forEach(x => appear(x, t, x.a - .1, .45, 20));
    const [cx, cy] = keysAt(CUR, t, ios); cur.style.transform = `translate(${cx}px,${cy}px)`; cur.style.display = t > tClick - 1 && t < tDl + 1 ? "" : "none";
    rp(t, tClick); rp2(t, tDl);
    const p = P(t, tDl, tDl + .8, ioc); barF.style.width = (p * 100) + "%"; dt.textContent = p >= 1 ? "Downloaded ✓" : p > 0 ? `Downloading ${Math.round(p * 100)}%` : "Download kit";
    const moveOut = P(t, tNext - .4, tNext + .3, ioe); dp.style.transform = `translateY(${-moveOut * 120}px) scale(${1 - moveOut * .35})`;
    const tu = appear(tom, t, tNext - .1, .45, 30); tom.querySelector(".num").textContent = t > tNext + .3 ? "Day 1" : "1"; tom.querySelector(".num").style.fontSize = t > tNext + .3 ? "64px" : "90px";
    appear(lead, t, tLook - .1, .5, 30);
    [s1, s2].forEach(s => popIn(s, t, s.a - .05, "rotate(-6deg)"));
    camSet(cam, [0, 0, 1]);
  };
}, { outD: .5 });

// ---------------------------------------------------------------- 22. first, the skill (free) — or let AI pass you by
S(236.75, 247.75, (cam, e) => {
  const k4 = wt("k4"), h = words(e, "But first, you need the skill.", 440, 100, k4.slice(0, 6), { grad: [5] });
  const fr = ctr(e, "", "FREE", 960, 650, 360, 130); Object.assign(fr.style, { position: "absolute", borderRadius: "36px", background: "linear-gradient(135deg,#3ddc97,#2fb8d6)", color: "#04150b", font: "800 84px/130px var(--font)", textAlign: "center", letterSpacing: ".06em", overflow: "hidden", boxShadow: "0 30px 90px rgba(61,220,151,.5)" }); fr.sh = el(fr, "div", "sheen");
  const k5 = wt("k5"), tStay = W("k5", "stay"), tPass = W("k5", "pass"), tNot = W("k5", "This");
  const g = words(e, "Stay where you are…", 470, 76, [k5[4], k5[5], k5[6], k5[7]]); g.style.color = "rgba(200,206,225,.8)";
  const g2 = words(e, "This isn't for you.", 610, 56, k5.slice(13)); g2.style.color = "rgba(200,206,225,.55)";
  const dot = ctr(e, "", "", 960, 800, 26, 26); Object.assign(dot.style, { position: "absolute", borderRadius: "50%", background: "#c8cee1" });
  const streaks = Array.from({ length: 34 }, (_, i) => { const s = el(e, "div", "ab"); Object.assign(s.style, { left: 0, top: px(120 + hash(i, 2) * 840), width: px(300 + hash(i, 3) * 700), height: px(2 + hash(i, 4) * 4), borderRadius: "4px", background: `linear-gradient(90deg, transparent, rgba(${hash(i, 6) > .5 ? "140,160,255" : "200,140,255"},.9), #fff)` }); s.d = hash(i, 5) * 1.2; s.sp = 2600 + hash(i, 7) * 2400; return s; });
  sfx("IMP_SOFT", W("k4", "free"), -18); sfx("WH_DATA", tPass - .2, -20); sfx("WH_SWING", tPass + .3, -24);
  return (lt, t) => {
    h.up(t); const out = P(t, tStay - .7, tStay - .3); h.style.opacity = 1 - out;
    popIn(fr, t, W("k4", "free") - .1); fr.style.opacity = Math.min(+fr.style.opacity, 1 - out); fr.sh.style.backgroundPosition = `${mix(130, -30, P(t, W("k4", "free") + .2, W("k4", "free") + 1.1, ios))}% 0`;
    g.up(t); g2.up(t); appear(dot, t, tStay - .2, .5, 0);
    streaks.forEach(s => { const a = tPass - .4 + s.d, u = t - a; s.style.opacity = u > 0 && u < .9 ? 1 : 0; s.style.transform = `translateX(${-1200 + u * s.sp}px)`; });
  };
}, { outD: .45 });

// ---------------------------------------------------------------- 23. lesson two -> the card becomes the logo
S(247.7, DUR, (cam, e) => {
  const k6 = wt("k6"), h = words(e, "But if you want in…", 160, 64, k6.slice(0, 5));
  const card = el(e, "div", "ab"); Object.assign(card.style, { overflow: "hidden", background: "linear-gradient(145deg,#5a86ff 0%,#7b5cff 55%,#c56bff 100%)", boxShadow: "0 50px 140px rgba(100,110,255,.5), inset 0 2px 0 rgba(255,255,255,.4)" });
  const cc = el(card, "div", "ab", `<div style="position:absolute;left:60px;top:70px;font:600 26px var(--font);letter-spacing:.24em;color:rgba(255,255,255,.75)">LESSON 2</div><div style="position:absolute;left:60px;top:116px;font:700 84px/1 var(--font);letter-spacing:-.04em;color:#fff">Your first app</div>
    <div style="position:absolute;right:70px;top:120px;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;color:#fff"><div style="width:64px;height:64px;margin-left:8px">${IC.play}</div></div>`); cc.style.inset = "0";
  const lg = el(card, "div", "ab", KBA); lg.style.inset = "0"; lg.firstChild.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  const ch1 = icoPill(e, IC.x, "#ff6b7a", "No code", 800, 780), ch2 = icoPill(e, IC.mic, "#9ff5cf", "Just you + AI", 1110, 780);
  const wm = el(e, "div", "hl gradw", ""); wm.innerHTML = '<span class="wd">Kuba Builds AI</span>'; Object.assign(wm.style, { top: "640px", fontSize: "88px", fontWeight: 700 });
  const url = el(e, "div", "sub", "kubabuildsai.com"); url.style.top = "760px"; url.style.fontWeight = 600;
  const tL = W("k6", "lesson"), tSee = W("k7", "See");
  sfx("WH_SOFT", tL - .2, -22); sfx("CLICK", W("k6", "No"), -22); sfx("WH_SWING", tSee - .3, -22); sfx("IMP_SOFT", tSee + .3, -16);
  return (lt, t) => {
    h.up(t); vanish(h, t, tSee - .5, .3);
    const m = morph(card, [[0, 0, 960, 520, 1100, 440, 40], [tSee - .4, 1, 960, 400, 190, 190, 50]], t);
    card.style.opacity = P(t, tL - .3, tL + .2); card.style.transform = `translateY(${(1 - P(t, tL - .3, tL + .4, oc)) * 80}px)`;
    const k = P(t, tSee - .4, tSee + .4, ioc); cc.style.opacity = 1 - k; lg.style.opacity = k;
    appear(ch1, t, W("k6", "No") - .1, .45, 16, "translateX(-50%)"); appear(ch2, t, W("k6", "Just") - .1, .45, 16, "translateX(-50%)"); [ch1, ch2].forEach(c => vanish(c, t, tSee - .5, .3));
    appear(wm, t, tSee + .3, .6, 24); appear(url, t, tSee + .7, .6, 14);
  };
}, { outD: .01 });
