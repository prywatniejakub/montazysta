"use strict";
// "Minecraft Story" template: gameplay frames (frames.js from kit.frames) in a pixel-framed square, XP bar + level,
// achievement toasts, big pixel overlays and phrase captions under the square.  Needs engine.js + pixel.js.
//   mcStory({ label, labelColor, ach: [{t, icon, title}], levels: [[t, "17", color]], xp: [[t, fill0..1]],
//             hi: {word: color}, big: [{a, z, text, color, s, y}], punch: [t], gray: [[a, z]] })
function mcStory(C) {
  const root = el(document.getElementById("scenes"), "div", "layer");
  const top = el(root, "div", "mc-top");
  pxText(top, C.label, 9, C.labelColor || "#80ff20");

  const win = el(root, "div", "mc-win"), view = el(win, "div", "mc-view");
  const cv = el(view, "canvas", "game"); cv.width = 948; cv.height = 948;
  const ctx = cv.getContext("2d");
  el(view, "div", "mc-shade");
  const flash = el(view, "div", "mc-flash");

  // ---------------------------------------------------------------- achievements
  const ACH = (C.ach || []).map((a, k, all) => {
    const e = el(view, "div", "mc-toast"); pxIcon(e, a.icon, 8);
    const tx = el(e, "div", "tx"); pxText(tx, a.head || "ACHIEVEMENT GET!", 5, a.headColor || "#ffff55");
    const tl = pxText(tx, a.title, 5, "#ffffff");
    const maxW = 800 - 26 * 2 - 96 - 22; if (tl.width > maxW) { const k2 = maxW / tl.width; tl.style.width = tl.width * k2 + "px"; tl.style.height = tl.height * k2 + "px"; }
    const nxt = all[k + 1] ? all[k + 1].t : 1e9;
    e.a = a.t; e.z = Math.min(a.t + (a.hold || 2.6), nxt - .05); e.style.opacity = 0; return e;
  });

  // ---------------------------------------------------------------- XP bar + level
  const xp = el(root, "div", "mc-xp"), trk = el(xp, "div", "trk"), fill = el(trk, "div", "fill");
  for (let k = 1; k < 18; k++) { const s = el(trk, "div", "seg"); s.style.left = `calc(${k * 100 / 18}% - 2px)`; }
  const lvlBox = el(root, "div", "mc-lvl"), LV = C.levels || [];
  const lvl = pxText(lvlBox, LV.length ? LV[0][1] : "0", 9, LV.length ? LV[0][2] || "#80ff20" : "#80ff20");
  let lvlShown = null;
  const XP = C.xp || [[0, 0], [DUR, 1]];
  const xpAt = t => { if (t <= XP[0][0]) return XP[0][1]; for (let i = 0; i < XP.length - 1; i++) { const [a, x0, e] = XP[i], [b, x1] = XP[i + 1]; if (t <= b) return mix(x0, x1, (e || E.inOutSine)(clamp((t - a) / Math.max(1e-6, b - a)))); } return XP[XP.length - 1][1]; };

  // ---------------------------------------------------------------- big pixel overlays
  const BIG = (C.big || []).map(b => { const h = el(view, "div", "mc-big"); h.style.top = (b.y ?? 380) + "px"; pxText(h, b.text, b.s || 14, b.color || "#ffff55"); h.b = b; h.style.opacity = 0; return h; });

  // ---------------------------------------------------------------- captions (phrases of up to 3 words)
  const capBox = el(root, "div", "mc-cap"), HI = C.hi || {};
  const CH = [];
  T.lines.forEach((L, li) => {
    const mine = [];
    let cur = null;
    L.words.forEach(w => {
      if (!norm(w.w)) return;
      const prev = cur && cur.words[cur.words.length - 1];
      if (!cur || cur.words.length >= 3 || cur.len + w.w.length > 17 || /[.,:;!?…]$/.test(prev.w)) { cur = { li, words: [], len: 0 }; mine.push(cur); }
      cur.words.push(w); cur.len += w.w.length + 1;
    });
    // a lone word left at the end of a sentence joins the phrase before it when that still fits
    for (let k = mine.length - 1; k > 0; k--) {
      const a = mine[k - 1], b = mine[k];
      if (b.words.length === 1 && a.len + b.len <= 22 && !/[.!?…]$/.test(a.words[a.words.length - 1].w)) { a.words.push(...b.words); a.len += b.len; mine.splice(k, 1); }
    }
    CH.push(...mine);
  });
  CH.forEach((c, k) => {
    const nx = CH[k + 1], end = c.words[c.words.length - 1].e;
    c.a = c.words[0].t - .05; c.z = nx ? Math.min(nx.words[0].t - .05, end + .8) : end + 1.4;
    const e = el(capBox, "div", "ch"), size = c.len <= 11 ? 116 : c.len <= 15 ? 104 : c.len <= 18 ? 92 : 80;
    e.style.fontSize = size + "px";
    c.spans = c.words.map((w, i) => {
      const s = el(e, "span", "", w.w.replace(/[“”"]/g, "").replace(/[.,:;]+$/, "")); if (i < c.words.length - 1) e.appendChild(document.createTextNode(" "));
      const key = Object.keys(HI).find(h => norm(w.w).startsWith(norm(h))); s.hi = key ? HI[key] : null; s.w = w; return s;
    });
    c.el = e; e.style.opacity = 0;
  });

  // ---------------------------------------------------------------- brand
  const brand = el(root, "div", "mc-brand"); pxBlock(brand, 62); pxText(brand, "KUBA BUILDS AI", 5, "#e9e9e9");

  // ---------------------------------------------------------------- gameplay frames (loaded on demand, awaited by render)
  const CUTS = window.CUTS, CACHE = new Map(); let last = -1;
  function frameAt(t) {
    for (const [a, b, base] of CUTS) if (t >= a && t < b) return [base + Math.floor((t - a) * GFPS), a, b];
    const L = t < CUTS[0][0] ? CUTS[0] : CUTS[CUTS.length - 1];
    return [t < CUTS[0][0] ? L[2] : L[2] + Math.floor((L[1] - L[0]) * GFPS) - 1, L[0], L[1]];
  }
  function load(i) {
    i = Math.max(0, Math.min(NFRAMES - 1, i));
    let p = CACHE.get(i);
    if (!p) { const im = new Image(); im.src = `frames/${String(i + 1).padStart(5, "0")}.jpg`; p = im.decode().then(() => im, () => im); CACHE.set(i, p); if (CACHE.size > 120) CACHE.delete(CACHE.keys().next().value); }
    return p;
  }
  async function drawGame(t) {
    const [i] = frameAt(t);
    for (let k = 1; k <= 6; k++) load(i + k);
    if (i !== last) { const im = await load(i); ctx.drawImage(im, 0, 0, 948, 948); last = i; }
  }

  function update(t) {
    // gameplay: slow push-in per cut, flash + punch on cuts, grayscale windows
    const [, a, b] = frameAt(t), ci = CUTS.findIndex(c => c[0] === a), dir = ci % 2 ? -1 : 1;
    let z = 1.04 + dir * .035 * (clamp((t - a) / Math.max(.1, b - a)) - .5);
    for (const p of C.punch || []) z += .06 * pulse(t, p, .22) * clamp((t - p + .02) / .02);
    tf(cv, `scale(${z.toFixed(4)})`);
    let f = 0; for (const [a0] of CUTS) if (a0 > .3) f += .32 * pulse(t, a0, .14) * clamp((t - a0 + .01) / .01);
    flash.style.opacity = Math.min(.6, f);
    let g = 0; for (const [ga, gz] of C.gray || []) g = Math.max(g, P(t, ga, ga + .35, E.lin) * (1 - P(t, gz - .2, gz, E.lin)));
    cv.style.filter = g > .01 ? `grayscale(${g}) brightness(${1 - .25 * g})` : "";
    // achievements: stepped slide in from the right
    ACH.forEach(e => {
      if (t < e.a - .01 || t > e.z + .01) { e.style.opacity = 0; return; }
      const u = P(t, e.a, e.a + .32, E.outCubic), o = P(t, e.z - .3, e.z, E.inCubic);
      const x = Math.round(((1 - u) * 860 + o * 860) / 8) * 8;
      e.style.opacity = 1; tf(e, `translateX(${x}px)`);
    });
    // level + xp
    let cur = LV.length ? LV[0] : null; for (const L of LV) if (t >= L[0]) cur = L;
    if (cur && cur !== lvlShown) { lvl.set(cur[1], cur[2] || "#80ff20"); lvlShown = cur; }
    const ls = cur ? spring(t - cur[0], 2.4, .45) : 1; tf(lvl, `scale(${(.6 + .4 * ls).toFixed(3)}) translateY(${(1 - clamp(ls)) * 20}px)`);
    fill.style.width = (clamp(xpAt(t)) * 100).toFixed(2) + "%";
    // big overlays
    BIG.forEach(h => { const b = h.b; if (t < b.a || t > b.z) { h.style.opacity = 0; return; } const s = spring(t - b.a, 2, .5), o = P(t, b.z - .25, b.z, E.inCubic); h.style.opacity = 1 - o; tf(h, `scale(${(Math.max(0, s) * (1 + .2 * o)).toFixed(3)})`); });
    // captions
    CH.forEach(c => {
      if (t < c.a || t > c.z) { c.el.style.opacity = 0; return; }
      const s = spring(t - c.a, 2.6, .55), o = P(t, c.z - .08, c.z, E.lin);
      c.el.style.opacity = 1 - o; tf(c.el, `scale(${(.8 + .2 * s).toFixed(3)})`);
      c.spans.forEach(sp => {
        const on = t >= sp.w.t - .03;
        sp.style.color = on ? (sp.hi || "#ffffff") : (sp.hi ? sp.hi : "#ffffff");
        sp.style.opacity = on ? 1 : .5;
        tf(sp, `scale(${(1 + .12 * pulse(t, sp.w.t, .18) * (on ? 1 : 0)).toFixed(3)})`);
      });
    });
  }

  const base = window.render;
  window.render = t => drawGame(t).then(() => { update(t); return base(t); });
}
