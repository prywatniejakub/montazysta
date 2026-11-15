"use strict";
// Lesson 1 (SaaS style) — part 1: hook, tease, who I am.  Continuity chain: price -> listing field -> 38 client sites ->
// factory/office -> laptop -> into the screen -> clouds -> the clouds were a monitor on a rock -> the card table.
const IMG = "../l1/img/";
const LIST = {
  web:   { src: "web_subscription_245k.png", w: 1219, crop: [60, 30, 765, 465], price: [133, 119], mult: [300, 119], month: [124, 379], profit: [336, 256], v: 245000, name: "Subscription web agency" },
  b2b:   { src: "b2b_leads_3m.png", w: 1137, crop: [38, 18, 750, 447], v: 3200000, name: "B2B lead generation agency" },
  video: { src: "ai_video_350k.png", w: 1118, crop: [45, 14, 756, 443], v: 350000, name: "AI video tool" },
  clip:  { src: "clipping_170k.png", w: 1160, crop: [48, 18, 752, 450], v: 170000, name: "Clipping app" },
  li:    { src: "linkedin_leads_125k.png", w: 937, crop: [14, 12, 726, 442], v: 125000, name: "LinkedIn lead agency" },
  studio:{ src: "web_studio_250k.png", w: 1188, crop: [67, 28, 771, 460], v: 250000, name: "Web design studio" },
};
// a crop of a screenshot as a card of width W centred at (cx, cy); .at(ix, iy) = image pixel -> parent coords
function cropImg(parent, k, cx, cy, W) {
  const L = LIST[k], [x0, y0, x1, y1] = L.crop, s = W / (x1 - x0), H = (y1 - y0) * s;
  const e = ctr(parent, "", `<img src="${IMG + L.src}" style="position:absolute;display:block;left:${-x0 * s}px;top:${-y0 * s}px;width:${L.w * s}px">`, cx, cy, W, H);
  Object.assign(e.style, { position: "absolute", overflow: "hidden", borderRadius: "18px", background: "#2a2459" });
  e.at = (ix, iy) => [cx - W / 2 + (ix - x0) * s, cy - H / 2 + (iy - y0) * s]; e.s = s; e.h = H; return e;
}
// glowing highlight box (instead of a marker ring): centre (x, y) in parent coords
function glow(parent, x, y, w, h, col = "#8fa8ff") {
  const e = ctr(parent, "", "", x, y, w, h); Object.assign(e.style, { position: "absolute", borderRadius: "12px", border: `3px solid ${col}`, boxShadow: `0 0 30px ${col}, inset 0 0 20px ${col}55`, opacity: 0, pointerEvents: "none" });
  e.up = (t, a, z = 1e9) => { const u = P(t, a, a + .35, oc) * (1 - P(t, z, z + .3)); e.style.opacity = u; e.style.transform = `scale(${1.25 - .25 * u})`; }; return e;
}
function miniSite(parent, cx, cy, w, h, k) {
  const hue = Math.floor(hash(k, 3) * 360), e = ctr(parent, "", "", cx, cy, w, h);
  Object.assign(e.style, { position: "absolute", borderRadius: "12px", overflow: "hidden", background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,.45)" });
  e.innerHTML = `<div style="height:20%;background:hsl(${hue},70%,58%)"></div><div style="margin:10% 10% 0;height:9%;width:60%;border-radius:4px;background:#1b2033"></div>
    <div style="margin:5% 10% 0;height:6%;width:75%;border-radius:4px;background:#c9cedb"></div><div style="margin:8% 10% 0;height:14%;width:34%;border-radius:6px;background:hsl(${hue},70%,55%)"></div>`;
  return e;
}

// ---------------------------------------------------------------- 1. light studio: "Someone is selling this business for $245,000"
S(0, 3.95, (cam, e) => {
  const h = words(e, "Someone is selling this business", 390, 86, wt("h1").slice(0, 5), { grad: [2] });
  const n = el(e, "div", "hl gradd num", ""); Object.assign(n.style, { top: "490px", fontSize: "200px", fontWeight: 700, height: "240px" });
  const c0 = W("h1", "two") - .1, c1 = W("h1", "dollars") + .15;
  sfx("CLICK", c0, -26); sfx("IMP_SOFT", c1, -22);
  return (lt, t) => { h.up(t); appear(n, t, W("h1", "for") - .1, .5, 30); n.textContent = money(245000 * P(t, c0, c1, ioc));
    camSet(cam, [0, 0, 1]); e.style.backgroundPosition = `0 ${lt * 6}px`; };
}, { light: true, inD: 0, outD: .45 });

// ---------------------------------------------------------------- 2. the price lands in the real listing; the listing is one of 38 client sites
S(3.85, 9.05, (cam, e) => {
  const w = win(cam, 0, 20, 1320, 820, { url: "marketplace  ·  listing  ·  subscription web agency" });
  const card = cropImg(w.bd, "web", 660, 387, 1180), L = LIST.web;
  const [pxl, pyl] = card.at(...L.price), g = glow(w.bd, pxl, pyl, 150, 60);
  const chip = el(e, "div", "hl gradw num", "$245,000"); Object.assign(chip.style, { fontWeight: 700 });
  // price target in screen coords (cam identity while it flies): window top-left (-660, -390) + body 46
  const tx = 960 - 660 + pxl, ty = 540 - 390 + 46 + pyl;
  const SL = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) SL.push([-804 + c * 204 + 90, -328 + r * 136 + 56]);
  const me = 19, tiles = SL.map((p, i) => i === me || i === 32 || i === 39 ? null : miniSite(cam, p[0], p[1], 180, 112, i)).filter(Boolean);
  const tOrd = tiles.map(t2 => t2).sort((a, b) => Math.hypot(parseFloat(a.style.left) + 90 + 102, parseFloat(a.style.top) + 56) - Math.hypot(parseFloat(b.style.left) + 90 + 102, parseFloat(b.style.top) + 56));
  const t38 = W("h2", "Thirty"), tPay = W("h2", "pays"), tShrink = W("h2", "website") - .1;
  tOrd.forEach((x, i) => x.at0 = t38 - .15 + i * .018);
  const badges = tOrd.map((x, i) => { const b = el(x, "div", "", "+$"); Object.assign(b.style, { position: "absolute", right: "6px", top: "6px", height: "26px", padding: "0 8px", borderRadius: "13px", background: "#3ddc97", color: "#04150b", font: "800 15px/26px var(--font)", opacity: 0 }); b.at0 = tPay + i * .012; return b; });
  const n38 = icoPill(e, IC.users, "#8fb4ff", "38 clients", 960, 930), mrr = icoPill(e, IC.cal, "#3ddc97", "Each pays every month", 960, 930);
  sfx("WH_SOFT", tShrink + .2, -22); sfx("CLICK", tPay, -22);
  return (lt, t) => {
    // the number from the light scene flies into the price field
    const f = P(t, 3.85, 4.55, ioe); chip.style.fontSize = px(mix(200, 40, f)); chip.style.top = px(mix(610, ty, f) - mix(200, 40, f) * .6);
    chip.style.left = px(mix(0, tx - 960, f)); chip.style.opacity = 1 - P(t, 4.4, 4.6); g.up(t, 4.45, tShrink);
    // camera: hold, then the window shrinks into its slot among 38 sites
    const k = P(t, tShrink, t38 + .1, ioe);
    w.style.transform = `translate(${mix(0, -102, k)}px, ${mix(0, -20, k)}px) scale(${mix(1, 180 / 1320, k)})`; w.style.transformOrigin = "50% 50%";
    camSet(cam, [0, 0, mix(1, 1.08, P(t, t38, 9.05, ios)), mix(0, 14, k), mix(0, -10, k)]);
    tOrd.forEach(x => { const s = spring(t - x.at0, 1.8, .6); x.style.opacity = clamp((t - x.at0) / .12); x.style.transform = `scale(${t < x.at0 ? 0 : Math.max(0, s)})`; });
    badges.forEach(b => { b.style.opacity = clamp((t - b.at0) / .1); b.style.transform = `scale(${t < b.at0 ? .4 : Math.min(1, .4 + (t - b.at0) * 5)})`; });
    appear(n38, t, W("h2", "clients") - .15, .45, 20, "translateX(-50%)"); vanish(n38, t, tPay - .3, .25);
    appear(mrr, t, tPay - .05, .45, 20, "translateX(-50%)");
  };
}, { inD: .3, outD: .5 });

// ---------------------------------------------------------------- 3. light: no factory, no office -> just software (a laptop) -> into its screen
S(9.0, 13.42, (cam, e) => {
  const tw = wt("h3"), h = words(e, "No factory. No office. Just software, and a simple service.", 190, 70, tw, { grad: [5, 9] });
  const card = (x, icon, name) => { const c = ctr(cam, "gll", `<div class="ico" style="position:absolute;left:100px;top:70px;width:220px;height:220px;color:#1b2140">${icon}</div><div style="position:absolute;left:0;right:0;bottom:48px;text-align:center;font:600 38px var(--font);color:#1b2140">${name}</div>`, x, 90, 420, 420);
    c.st = [45, -45].map(r => { const x = el(c, "div", "ab"); Object.assign(x.style, { left: "50%", top: "50%", width: "400px", height: "12px", margin: "-6px 0 0 -200px", borderRadius: "8px", background: "#ff4d5e", boxShadow: "0 0 24px rgba(255,77,94,.55)", transform: `rotate(${r}deg) scaleX(0)` }); x.r = r; return x; }); return c; };
  const fac = card(-260, IC.factory, "Factory"), off = card(260, IC.office, "Office");
  const lap = at(cam, "ab", "", 0, 0); const scr = ctr(lap, "", "", 0, 60, 860, 500);
  Object.assign(scr.style, { position: "absolute", borderRadius: "18px", overflow: "hidden", border: "12px solid #1b1f2c", background: "linear-gradient(135deg,#0d1124,#1b1640)", boxShadow: "0 50px 120px rgba(30,40,90,.35)" });
  scr.innerHTML = `<div style="position:absolute;left:0;top:0;bottom:0;width:150px;background:rgba(255,255,255,.04)"></div>
    ${[0, 1, 2].map(i => `<div style="position:absolute;left:${180 + i * 210}px;top:40px;width:190px;height:120px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)"><div style="margin:18px;height:12px;width:70px;border-radius:6px;background:${["#6e8bff", "#3ddc97", "#c77dff"][i]}"></div><div style="margin:0 18px;height:30px;width:110px;border-radius:6px;background:rgba(255,255,255,.18)"></div></div>`).join("")}
    <div style="position:absolute;left:180px;top:190px;width:610px;height:240px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)">${Array.from({ length: 12 }, (_, i) => `<i style="position:absolute;bottom:20px;left:${30 + i * 48}px;width:28px;height:${40 + hash(i, 5) * 150}px;border-radius:6px;background:linear-gradient(180deg,#8fa8ff,#5a6cff)"></i>`).join("")}</div>`;
  const base = ctr(lap, "", "", 0, 322, 1010, 26); Object.assign(base.style, { position: "absolute", borderRadius: "4px 4px 18px 18px", background: "linear-gradient(180deg,#c9ceda,#8d93a4)" });
  const svc = ctr(cam, "pill", `<span style="color:#5b4bff;display:flex">${IC.hand}</span>Simple service`, 390, -200, 330, 64);
  const tS = W("h3", "Just");
  [W("h3", "factory"), W("h3", "office")].forEach(a => sfx("CLICK", a + .1, -20));
  return (lt, t) => {
    h.up(t);
    [[fac, tw[0], tw[1]], [off, tw[2], tw[3]]].forEach(([c, a, s], i) => {
      const u = appear(c, t, a - .1, .45, 40), k = P(t, tS - .1, tS + .5, ioe);
      c.st.forEach((x, j) => { x.style.transform = `rotate(${x.r}deg) scaleX(${P(t, s + .05 + j * .15, s + .3 + j * .15, oc)})`; }); c.querySelector(".ico").style.opacity = t > s + .2 ? .35 : 1; c.style.opacity = (t < a - .1 ? 0 : (1 - k) * (t > s + .25 ? .55 : 1)).toFixed(3);
      c.style.transform = `translate(${(i ? 1 : -1) * k * 700}px, ${(1 - u) * 40}px)`; });
    const r = P(t, tS, tS + .8, ioe); lap.style.opacity = r; lap.style.transform = `translateY(${(1 - r) * 380}px)`;
    appear(svc, t, W("h3", "simple") - .1, .45, 20);
    const z = P(t, 12.95, 13.42, E.inExpo); camSet(cam, [0, mix(0, 60, z), 1 + z * 3.4, 0, 0]);
  };
}, { light: true, inD: .35, outD: 0 });

// ---------------------------------------------------------------- 4. inside the screen: words through the clouds -> it was a monitor on a rock
S(13.4, 18.25, (cam, e) => {
  const SKY = "linear-gradient(180deg,#070a1f 0%,#1a1c4d 45%,#4b3f8f 80%,#7f67b8 100%)";
  e.style.background = SKY;
  const far = clouds(e, { seed: 5, tint: [200, 196, 245], cover: .42 }); far.style.opacity = .55;
  const mon = at(e, "ab", "", 0, 0);
  const neck = ctr(mon, "", "", 960, 800, 120, 170), foot = ctr(mon, "", "", 960, 885, 380, 28), rock = ctr(mon, "", "", 960, 960, 980, 200);
  Object.assign(neck.style, { position: "absolute", background: "linear-gradient(90deg,#1a1e2c,#343b52 50%,#151926)" });
  Object.assign(foot.style, { position: "absolute", borderRadius: "10px", background: "linear-gradient(180deg,#3a4058,#141824)" });
  Object.assign(rock.style, { position: "absolute", borderRadius: "46% 54% 38% 44% / 62% 58% 42% 38%", background: "radial-gradient(ellipse at 42% 28%, #5a5f78, #262a3e 50%, #0c0d16)", boxShadow: "inset 0 12px 30px rgba(255,255,255,.14), 0 40px 90px rgba(0,0,0,.6)" });
  const scr = at(e, "ab", "", 0, 0, 1920, 1080); Object.assign(scr.style, { overflow: "hidden", background: SKY });
  const inner = at(scr, "ab", "", 0, 0, 1920, 1080); inner.style.transformOrigin = "0 0";
  const L1 = clouds(inner, { seed: 3, tint: [226, 222, 255], cover: .5 }), L2 = clouds(inner, { seed: 9, tint: [236, 232, 255], cover: .42 });
  const tw = wt("h4"), txt = at(inner, "ab", "", 0, 0, 1920, 1080);
  const a = words(txt, "In the next few minutes,", 400, 56, tw.slice(0, 5), { cls: "dimw" }), b = words(txt, "I'll show you why this changed", 520, 92, tw.slice(5, 11)), c = words(txt, "the way I think about work.", 640, 92, tw.slice(11), { grad: [5] });
  a.style.color = "rgba(235,238,255,.75)";
  const L3 = clouds(inner, { seed: 17, tint: [245, 242, 255], cover: .36 });
  const tR = W("h4", "work") - .35;
  sfx("WH_SWING", tR + .1, -22);
  return (lt, t) => {
    a.up(t); b.up(t); c.up(t);
    // fly forward through the layers
    [[L1, .03, 0], [L2, .07, 1], [L3, .22, 2]].forEach(([L, sp, k]) => { const s = 1 + lt * sp; L.style.transform = `scale(${s}) translate(${Math.sin(lt * .3 + k) * 30}px, ${k * 20}px)`; L.style.opacity = k === 2 ? clamp(1.9 - s) : 1; });
    far.style.transform = `scale(${1.1 + lt * .01}) translateX(${-lt * 12}px)`;
    // reveal: the whole view shrinks into a monitor screen on a rock
    const r = P(t, tR, tR + 1.25, ioe), W2 = mix(1920, 900, r), H2 = mix(1080, 506, r), cx = 960, cy = mix(540, 420, r);
    Object.assign(scr.style, { left: px(cx - W2 / 2), top: px(cy - H2 / 2), width: px(W2), height: px(H2), borderRadius: px(18 * r),
      boxShadow: r > 0 ? `0 0 0 ${12 * r}px #10131d, 0 0 0 ${13 * r}px rgba(255,255,255,.14), 0 60px 140px rgba(0,0,0,${.6 * r})` : "" });
    inner.style.transform = `scale(${W2 / 1920})`;
    mon.style.opacity = r; mon.style.transform = `translateY(${(1 - r) * 200}px)`;
    e.style.transform = e.style.transform;  // (scene transform handled by scUp)
  };
}, { inD: .25, inBlur: 0, outD: .7 });

// ---------------------------------------------------------------- 5. the table: six face-down cards, "$4,000,000+"
S(18.2, 27.95, (cam, e) => {
  const tw = wt("t1"), h = words(e, "Six real businesses for sale right now.", 150, 72, [tw[5], tw[6], tw[7], tw[11], tw[12], tw[13], tw[14]], { grad: [0] });
  const plane = ctr(cam, "gl p3", "", 0, 0, 1400, 820); plane.style.borderRadius = "40px";
  const SL = [[-360, -150], [0, -150], [360, -150], [-360, 150], [0, 150], [360, 150]];
  const cards = SL.map(([x, y], i) => { const c = ctr(plane, "p3", `<div style="position:absolute;inset:0;border-radius:22px;background:linear-gradient(145deg,#2b3470,#171b3a 60%,#2a1f55);border:1px solid rgba(160,170,255,.35);box-shadow:0 30px 60px rgba(0,0,0,.5)"></div>
      <div style="position:absolute;left:26px;top:18px;font:700 64px var(--font);color:rgba(200,210,255,.25);letter-spacing:-.04em">0${i + 1}</div><div style="position:absolute;right:26px;top:26px;width:44px;height:44px;color:rgba(200,210,255,.55)">${IC.lock}</div>
      <div style="position:absolute;left:26px;bottom:24px;height:12px;width:150px;border-radius:6px;background:rgba(200,210,255,.18)"></div>`, x + 700, y + 410, 320, 250); c.style.position = "absolute"; c.at0 = tw[5] + i * .11; return c; });
  const tOne = W("t1", "One"), tTog = W("t2", "Together"), c0 = W("t2", "four") - .1, c1 = W("t2", "dollars") + .3;
  const lab = el(e, "div", "sub", "Listed for more than"); lab.style.top = "780px";
  const tot = el(e, "div", "hl gradw num", ""); Object.assign(tot.style, { top: "820px", fontSize: "150px", fontWeight: 700 });
  cards.forEach(c => sfx("CLICK", c.at0, -26)); [0, 1, 2].forEach(i => sfx("CLICK", tOne + i * .22, -22));
  sfx("IMP_BASS", 23.55, -15);
  return (lt, t) => {
    h.up(t); vanish(h, t, tTog - .3, .35);
    const sw = P(t, tTog - .2, tTog + 1.4, ioe);
    camSet(cam, [0, mix(-40, 60, sw), mix(.82, .78, sw) + lt * .004, mix(52, 38, sw), 0, mix(-14, 10, sw) + lt * 1.2]);
    cards.forEach((c, i) => { const d = t - c.at0, s = spring(d, 1.6, .65), fl = i < 3 ? Math.sin(Math.PI * clamp((t - tOne - i * .22) / .5)) : 0;
      c.style.opacity = clamp(d / .1); c.style.transform = `translateZ(${(1 - Math.min(1, Math.max(0, s))) * 400 + fl * 120}px) rotateX(${fl * -35}deg)`;
      c.firstChild.style.boxShadow = sw > 0 ? `0 30px 60px rgba(0,0,0,.5), 0 0 ${40 * sw}px rgba(140,130,255,${.6 * sw})` : "0 30px 60px rgba(0,0,0,.5)"; });
    appear(lab, t, tTog + .1, .5, 16); appear(tot, t, c0 - .2, .5, 20); tot.textContent = money(4000000 * P(t, c0, c1, ioc)) + (t > c1 ? "+" : "");
  };
}, { outD: .6 });

// ---------------------------------------------------------------- 6. light: I'm Kuba — never studied programming, started from zero; error dialogs
S(27.9, 36.55, (cam, e) => {
  const ph = ctr(cam, "", `<img src="${IMG}kuba.webp" style="width:100%;height:100%;object-fit:cover;display:block">`, -440, 10, 470, 590);
  Object.assign(ph.style, { position: "absolute", borderRadius: "34px", overflow: "hidden", boxShadow: "0 50px 120px rgba(30,40,90,.35), 0 0 0 1px rgba(20,30,60,.08)" }); ph.sh = el(ph, "div", "sheen");
  const tag = ctr(cam, "pill", `<span style="color:#5b4bff;display:flex">${IC.spark}</span>Kuba Builds AI`, -440, 350, 300, 64);
  const tw = wt("m1"), nm = words(e, "I'm Kuba.", 330, 130, tw.slice(0, 2), { x: 1010, w: 900, align: "left", grad: [1] });
  const r1 = at(e, "pill", `<span style="color:#e0303f;display:flex">${IC.x}</span>Never studied programming`, 1010, 440);
  const r2 = at(e, "pill", `<span style="color:#5b4bff;display:flex">${IC.bolt}</span>Started from <b class="num" style="font-size:40px;margin-left:6px">0</b>`, 1010, 530);
  const D = [["Minecraft Mod Loader", "Installation failed.<br>Could not find the <b>mods</b> folder.", 1130, 640, W("m2", "install")], ["cheats.exe", "Windows protected your PC.<br>Access is denied.", 1250, 760, W("m2", "cheats")]];
  const dl = D.map(([ti, tx, x, y, a]) => { const d = ctr(e, "dlg", `<div class="ht">${ti}</div><div class="bd2"><div class="x">✕</div><div>${tx}</div></div><div class="bt"><span>OK</span></div>`, x, y, 560, 230); d.a = a; sfx("IMP_SOFT", a, -24); return d; });
  return (lt, t) => {
    nm.up(t); camSet(cam, [0, 0, 1 + lt * .006, 0, mix(8, 2, P(t, 27.9, 30, ios))]);
    appear(ph, t, 27.95, .6, 40); ph.sh.style.backgroundPosition = `${mix(130, -30, P(t, 28.4, 29.6, ios))}% 0`; appear(tag, t, 28.3, .5, 20);
    appear(r1, t, W("m1", "never") - .1, .45, 20); appear(r2, t, W("m1", "started") - .1, .45, 20);
    dl.forEach(d => { const s = spring(t - d.a, 2.2, .5), j = t > d.a && t < d.a + .35 ? Math.sin((t - d.a) * 70) * 10 * (1 - (t - d.a) / .35) : 0;
      d.style.opacity = clamp((t - d.a) / .08); d.style.transform = `translateX(${j}px) scale(${t < d.a ? .6 : .6 + .4 * Math.min(1.05, Math.max(0, s))})`; });
    ph.style.filter = t > D[0][4] ? `saturate(${1 - .5 * P(t, D[0][4], D[0][4] + .5)})` : "";
  };
}, { light: true, inD: .6, outD: .35 });

// ---------------------------------------------------------------- 7. the error dialog becomes the prompt: "Today I build my own software with AI"
S(36.45, 41.3, (cam, e) => {
  const tw = wt("m3"), h = words(e, "Today, I build my own software with AI.", 190, 70, tw.slice(0, 8), { grad: [5, 7] }), h2 = words(e, "Just by talking to it.", 280, 44, tw.slice(8));
  h2.style.color = "rgba(226,232,250,.7)";
  const shell = el(e, "div", "ab"); const dlgL = el(shell, "div", "ab"), glL = el(shell, "div", "ab gl");
  Object.assign(dlgL.style, { inset: 0, background: "#f3f4f8", borderRadius: "inherit" }); Object.assign(glL.style, { inset: 0, borderRadius: "inherit" });
  const tx = at(glL, "ab", "", 110, 0); Object.assign(tx.style, { height: "100%", display: "flex", alignItems: "center", font: "500 40px var(--font)", color: "#fff", whiteSpace: "nowrap", letterSpacing: "-.02em" });
  const plus = at(glL, "ab", `<div style="width:30px;height:30px;color:rgba(255,255,255,.7)">${IC.spark}</div>`, 50, 0); Object.assign(plus.style, { height: "100%", display: "flex", alignItems: "center" });
  const send = at(glL, "ab", `<div style="width:34px;height:34px;color:#fff">${IC.send}</div>`, 0, 0, 84, 84); Object.assign(send.style, { right: "44px", left: "auto", top: "43px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#4f7cff,#8b6cff)", boxShadow: "0 10px 30px rgba(110,110,255,.5)" });
  const mic = at(glL, "ab", "", 0, 0, 120, 44); Object.assign(mic.style, { right: "150px", left: "auto", top: "63px" }); const bars = Array.from({ length: 9 }, (_, i) => { const b = el(mic, "i", ""); Object.assign(b.style, { position: "absolute", left: px(i * 13), width: "6px", borderRadius: "3px", background: "#9fb8ff" }); return b; });
  const PR = "Build me a booking app for my barber shop", tType = tw[0], tEnter = W("m3", "AI");
  const rip = ripple(e, 1600, 590, "150,160,255");
  const APPS = [["Bookings", IC.cal, "#6e8bff"], ["Clients", IC.users, "#3ddc97"], ["Payments", IC.card, "#c77dff"]];
  const cards = APPS.map(([n, i, c], k) => { const x = ctr(e, "gl", `<div style="position:absolute;left:26px;top:24px;width:52px;height:52px;border-radius:15px;background:${c}30;color:${c};display:flex;align-items:center;justify-content:center"><div style="width:28px;height:28px">${i}</div></div>
      <div style="position:absolute;left:96px;top:34px;font:700 28px var(--font);color:#fff">${n}</div>${[0, 1, 2].map(j => `<div style="position:absolute;left:26px;right:26px;top:${104 + j * 44}px;height:30px;border-radius:9px;background:rgba(255,255,255,${.1 - j * .025})"></div>`).join("")}`, 560 + k * 400, 800, 360, 250); x.at0 = tEnter + .25 + k * .22; return x; });
  sfx("CLICK", tEnter, -14); cards.forEach(c => sfx("CLICK", c.at0, -24));
  return (lt, t) => {
    h.up(t); h2.up(t);
    morph(shell, [[0, 0, 1250, 760, 560, 230, 18], [36.45, .8, 960, 590, 1300, 170, 50]], t);
    const m = P(t, 36.5, 37.1, oc); dlgL.style.opacity = 1 - m; glL.style.opacity = m;
    typeInto(tx, PR, t, tType + .2, 26);
    const pr = pulse(t, tEnter, .2) * (t >= tEnter ? 1 : 0); send.style.transform = `scale(${1 - pr * .15})`; shell.style.transform = `scale(${1 + pr * .015})`;
    rip(t, tEnter); shell.style.filter = t > tEnter && t < tEnter + .6 ? `drop-shadow(0 0 ${30 * (1 - (t - tEnter) / .6)}px rgba(140,150,255,.8))` : "";
    const tk = W("m3", "talking"); bars.forEach((b, i) => { const a = t > tk - .3 ? (.3 + .7 * Math.abs(Math.sin(t * 9 + i * 1.3))) : .15; b.style.height = px(8 + a * 36); b.style.top = px(22 - (4 + a * 18)); });
    cards.forEach(c => appear(c, t, c.at0, .6, 80));
  };
}, { inD: .15, inBlur: 0, outD: .5 });

// ---------------------------------------------------------------- 8. the three parts become one product with a price; a target locks on it
S(41.25, 46.15, (cam, e) => {
  const tw = wt("m4"), h = words(e, "What these businesses sell for…", 190, 64, tw.slice(4, 9)), h2 = words(e, "I knew exactly what I wanted.", 190, 78, tw.slice(9), { grad: [2] });
  const KE3 = [[560, 800], [960, 800], [1360, 800]], cols = ["#6e8bff", "#3ddc97", "#c77dff"];
  const parts = KE3.map(([x, y], k) => { const p = ctr(e, "gl", `<div style="position:absolute;left:26px;top:24px;width:52px;height:52px;border-radius:15px;background:${cols[k]}30"></div>`, x, y, 360, 250); return p; });
  const app = ctr(e, "gl", `<div style="position:absolute;left:30px;top:28px;display:flex;align-items:center;gap:16px;font:700 34px var(--font);color:#fff"><div style="width:60px;height:60px;border-radius:17px;background:linear-gradient(135deg,#4f7cff,#c77dff)"></div>Your software</div>
    ${[0, 1, 2].map(j => `<div style="position:absolute;left:30px;right:30px;top:${120 + j * 50}px;height:34px;border-radius:10px;background:rgba(255,255,255,${.1 - j * .025})"></div>`).join("")}`, 960, 600, 560, 300);
  const tag = ctr(e, "", "", 1280, 420, 300, 84); Object.assign(tag.style, { position: "absolute", borderRadius: "20px", background: "linear-gradient(135deg,#3ddc97,#2fb8d6)", display: "flex", alignItems: "center", justifyContent: "center", font: "800 42px var(--font)", color: "#04150b", boxShadow: "0 20px 60px rgba(61,220,151,.45)" });
  tag.classList.add("num");
  const ret = ctr(e, "", `<svg viewBox="0 0 200 200" width="100%" height="100%" fill="none" stroke="#9fb8ff" stroke-width="3"><circle cx="100" cy="100" r="92" stroke-dasharray="30 18"/><path d="M100 0v30M100 170v30M0 100h30M170 100h30"/></svg>`, 960, 600, 820, 820); ret.style.position = "absolute";
  const ok = ctr(e, "ok", `${IC.check}The goal`, 960, 850, 190, 52);
  const tSell = W("m4", "sell"), tKnew = W("m4", "knew"), PR = [48000, 120000, 350000, 3200000, 170000, 245000];
  sfx("WH_SOFT", 41.6, -22); sfx("IMP_SOFT", tKnew + .3, -20);
  return (lt, t) => {
    h.up(t); vanish(h, t, tKnew - .3, .3); h2.up(t);
    const m = P(t, 41.4, 42.2, ioe);
    parts.forEach((p, k) => { p.style.transform = `translate(${(960 - KE3[k][0]) * m}px, ${-200 * m}px) scale(${1 - m * .3})`; p.style.opacity = 1 - P(t, 41.9, 42.3); });
    app.style.opacity = P(t, 41.9, 42.3); app.style.transform = `scale(${.85 + .15 * P(t, 41.9, 42.5, oc)})`;
    const sp = P(t, tSell - .1, tKnew, E.lin); tag.style.opacity = P(t, tSell - .1, tSell + .1); tag.style.transform = `rotate(-6deg) scale(${.8 + .2 * P(t, tSell - .1, tSell + .3, oc)})`;
    const idx = t < tKnew ? Math.floor(sp * 14) % 5 : 5; tag.textContent = money(PR[idx]);
    const r = P(t, tKnew - .1, tKnew + .7, ioe); ret.style.opacity = r * .9; ret.style.transform = `scale(${mix(1.9, 1, r)}) rotate(${(1 - r) * 90}deg)`;
    appear(ok, t, W("m4", "wanted") - .1, .45, 16);
  };
}, { inD: .2, outD: .5 });
