// izsec.js: grafiki rolek Izzi Therm (2026-10-27). Wymaga c4y.js + prem.js + iz.js.
// izSection = przekrój podłogi na kanwie (beton, rury, izolacja: płyty EPS albo masa, wylewka, płytka), pęknięcie, mostki, porównanie.
// izReceipt = paragon „co dochodzi do ceny płyty”, izStat = duża liczba ze źródłem, izSteps = pasek kroków 1..n.
const IZC = { beton: "#8f8f8a", betonD: "#77776f", eps: "#f3f3ef", epsL: "#dcdcd6", masa: "#8b5b47", masaD: "#6e4536", masaL: "#b07c62",
  wyl: "#bdbdb6", wylD: "#a6a69e", tile: "#e3d6c1", tileD: "#c9b89d", void: "#1b1b1d", red: "#ff4b3a", green: "#9be15d", blue: "#2f86e0", pipeR: "#d9473a" };
function izRnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
// geometria przekroju w układzie 0..1 (x) i 0..1 (y od góry)
const IZG = { tile: [.10, .18], wyl: [.18, .42], iso: [.42, .80], bet: [.80, 1], pipes: [[.17, "b"], [.285, "r"], [.40, "b"], [.68, "r"], [.795, "b"]], r: .062 };
// s: { build 0..5, mode "eps"|"masa"|"split", fill 0..1, gaps 0..1, crack 0..1, heat 0..1, t, labels true }
function izSection(ctx, X, Y, Wd, Hd, s) {
  const t = s.t || 0, b = s.build ?? 5, L = (i) => clamp(b - i);  // postęp warstwy i
  const yy = v => Y + v * Hd, xx = v => X + v * Wd;
  ctx.save(); ctx.beginPath(); ctx.rect(X, Y, Wd, Hd); ctx.clip();
  const drop = (u) => (1 - E.out4(u)) * -Hd * .25;   // warstwa spada z góry
  // 1. beton (z nierówną górą)
  if (L(0) > 0) {
    ctx.save(); ctx.globalAlpha = L(0); ctx.translate(0, drop(L(0)));
    ctx.fillStyle = IZC.beton; ctx.beginPath(); ctx.moveTo(X, yy(1));
    for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(xx(u), yy(IZG.bet[0]) + Math.sin(u * 23) * Hd * .008 + Math.sin(u * 7.3) * Hd * .006); }
    ctx.lineTo(xx(1), yy(1)); ctx.closePath(); ctx.fill();
    const r = izRnd(7); ctx.fillStyle = IZC.betonD; for (let i = 0; i < 220; i++) { ctx.fillRect(xx(r()), yy(IZG.bet[0] + .02 + r() * .18), 3 + r() * 4, 3 + r() * 3); }
    ctx.restore();
  }
  // 2. izolacja: płyty albo masa (pod rurami rysujemy pustki, rury na wierzchu)
  const pipe = (cx, col, a = 1) => {
    const px = xx(cx), py = yy(IZG.bet[0]) - IZG.r * Hd * 1.0, rr = IZG.r * Hd;
    ctx.save(); ctx.globalAlpha = a; const g = ctx.createRadialGradient(px - rr * .35, py - rr * .35, rr * .1, px, py, rr);
    g.addColorStop(0, col === "b" ? "#7cc0ff" : "#ff8b7d"); g.addColorStop(1, col === "b" ? IZC.blue : IZC.pipeR);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rr, 0, 7); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.stroke(); ctx.restore();
  };
  const isoEPS = (a) => {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, drop(a));
    const y0 = yy(IZG.iso[0]), y1 = yy(IZG.bet[0]);
    // pustki: cały pas jest najpierw ciemny, płyty go przykrywają tam, gdzie leżą
    ctx.fillStyle = IZC.void; ctx.fillRect(X, y0, Wd, y1 - y0 + Hd * .02);
    const joints = [0, .245, .55, .885, 1.01];
    for (let j = 0; j < joints.length - 1; j++) {
      const ax = joints[j] + .004, bx = joints[j + 1] - .004;
      ctx.fillStyle = IZC.eps; ctx.beginPath(); ctx.rect(xx(ax), y0, xx(bx) - xx(ax), (y1 - y0) - Hd * .022); ctx.fill();
      ctx.strokeStyle = IZC.epsL; ctx.lineWidth = 2; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(xx(ax), y0 + k * (y1 - y0) / 4); ctx.lineTo(xx(bx), y0 + k * (y1 - y0) / 4); ctx.stroke(); }
    }
    // wycięcia wokół rur: prostokątne okna (płyta prostokątna, rura okrągła)
    const cut = (x0, x1) => { ctx.fillStyle = IZC.void; ctx.fillRect(xx(x0), y1 - IZG.r * Hd * 2.55, xx(x1) - xx(x0), IZG.r * Hd * 2.6); };
    cut(.115, .455); cut(.625, .85);
    // pulsujące pustki (czerwone)
    if (s.gaps > 0) {
      const p = s.gaps * (.55 + .45 * Math.sin(t * 7));
      ctx.fillStyle = `rgba(255,75,58,${(.85 * p).toFixed(3)})`;
      ctx.fillRect(xx(.115), y1 - IZG.r * Hd * 2.55, xx(.455) - xx(.115), IZG.r * Hd * 2.6);
      ctx.fillRect(xx(.625), y1 - IZG.r * Hd * 2.55, xx(.85) - xx(.625), IZG.r * Hd * 2.6);
      joints.slice(1, -1).forEach(j => ctx.fillRect(xx(j - .006), y0, Wd * .012, y1 - y0));
      ctx.fillRect(X, y1 - Hd * .024, Wd, Hd * .024);
    }
    ctx.restore();
  };
  const isoMASA = (a, fill) => {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, drop(a));
    const y0 = yy(IZG.iso[0]), y1 = yy(IZG.bet[0]) + Hd * .02, fx = X + Wd * fill;
    ctx.beginPath(); ctx.rect(X, y0, fx - X, y1 - y0); ctx.clip();
    ctx.fillStyle = IZC.masa; ctx.fillRect(X, y0, Wd, y1 - y0);
    const r = izRnd(3); for (let i = 0; i < 900; i++) { ctx.fillStyle = r() < .5 ? IZC.masaL : IZC.masaD; ctx.beginPath(); ctx.arc(xx(r()), y0 + r() * (y1 - y0), 3 + r() * 5, 0, 7); ctx.fill(); }
    // czoło wylewanej masy: miękka krawędź
    if (fill < 1) { const g = ctx.createLinearGradient(fx - 40, 0, fx, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.35)"); ctx.fillStyle = g; ctx.fillRect(fx - 40, y0, 40, y1 - y0); }
    ctx.restore();
  };
  const ia = L(2), mode = s.mode || "eps";
  if (mode === "split") {
    ctx.save(); ctx.beginPath(); ctx.rect(X, Y, Wd * .5, Hd); ctx.clip(); if (ia > 0) isoEPS(ia); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(X + Wd * .5, Y, Wd * .5, Hd); ctx.clip(); if (ia > 0) isoMASA(ia, 1); ctx.restore();
  } else if (ia > 0) { if (mode === "eps") isoEPS(ia); else isoMASA(ia, s.fill ?? 1); }
  if (L(1) > 0) IZG.pipes.forEach(([cx, col]) => pipe(cx, col, L(1)));
  if (mode === "masa" && ia > 0 && (s.fill ?? 1) > 0) {  // masa przykrywa rury (widać zarys: rura w środku)
    ctx.save(); ctx.globalAlpha = ia * .55; ctx.beginPath(); ctx.rect(X, Y, Wd * (s.fill ?? 1), Hd); ctx.clip();
    IZG.pipes.forEach(([cx]) => { ctx.fillStyle = IZC.masa; ctx.beginPath(); ctx.arc(xx(cx), yy(IZG.bet[0]) - IZG.r * Hd, IZG.r * Hd * 1.02, 0, 7); ctx.fill(); });
    ctx.restore();
  }
  // 3. wylewka
  const crackX = s.crackX ?? .3;
  if (L(3) > 0) {
    ctx.save(); ctx.globalAlpha = L(3); ctx.translate(0, drop(L(3)));
    ctx.fillStyle = IZC.wyl; ctx.fillRect(X, yy(IZG.wyl[0]), Wd, (IZG.wyl[1] - IZG.wyl[0]) * Hd);
    const r = izRnd(11); ctx.fillStyle = IZC.wylD; for (let i = 0; i < 260; i++) ctx.fillRect(xx(r()), yy(IZG.wyl[0] + r() * (IZG.wyl[1] - IZG.wyl[0])), 2 + r() * 3, 2 + r() * 3);
    if (s.crack > 0) {  // pęknięcie od pustki w górę
      const u = E.out(clamp(s.crack)), r2 = izRnd(5); ctx.strokeStyle = "#151515"; ctx.lineWidth = 7; ctx.lineJoin = "round"; ctx.beginPath();
      const yb = yy(IZG.wyl[1]), yt = yy(IZG.tile[0]); let x = xx(crackX); ctx.moveTo(x, yb);
      const steps = 9; for (let i = 1; i <= Math.ceil(steps * u); i++) { x += (r2() - .5) * Wd * .05; ctx.lineTo(x, mix(yb, yt, Math.min(i / steps, u))); }
      ctx.stroke(); ctx.strokeStyle = `rgba(255,75,58,${(.6 + .4 * Math.sin(t * 9)).toFixed(2)})`; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
  }
  // 4. płytki
  if (L(4) > 0) {
    ctx.save(); ctx.globalAlpha = L(4); ctx.translate(0, drop(L(4)));
    const y0 = yy(IZG.tile[0]), h = (IZG.tile[1] - IZG.tile[0]) * Hd;
    for (let i = 0; i < 6; i++) {
      const ax = i / 6, cxm = ax + 1 / 12, near = s.crack > 0 && Math.abs(cxm - crackX) < 1 / 12;
      ctx.save(); if (near) { ctx.translate(xx(cxm), y0 + h); ctx.rotate(-.05 * E.out(clamp(s.crack))); ctx.translate(-xx(cxm), -(y0 + h)); }
      ctx.fillStyle = IZC.tile; ctx.fillRect(xx(ax) + 3, y0, Wd / 6 - 6, h); ctx.fillStyle = IZC.tileD; ctx.fillRect(xx(ax) + 3, y0 + h - 8, Wd / 6 - 6, 8);
      ctx.restore();
    }
    ctx.restore();
  }
  // mostki: czerwone strzałki ciepła przez szczeliny (tylko płyty)
  if (s.heat > 0 && (mode === "eps" || mode === "split")) {
    const xs = mode === "split" ? [.245] : [.245, .55, .885];
    xs.forEach((x0, i) => { for (let k = 0; k < 3; k++) {
      const ph = ((t * .9 + k / 3 + i * .17) % 1), y = mix(yy(IZG.bet[0]), yy(IZG.tile[0]) - Hd * .06, ph);
      ctx.save(); ctx.globalAlpha = s.heat * Math.sin(ph * Math.PI); ctx.strokeStyle = IZC.red; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath();
      ctx.moveTo(xx(x0), y + 40); ctx.quadraticCurveTo(xx(x0) + 14 * Math.sin(ph * 12), y + 20, xx(x0), y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(xx(x0) - 14, y + 14); ctx.lineTo(xx(x0), y); ctx.lineTo(xx(x0) + 14, y + 14); ctx.stroke(); ctx.restore(); } });
  }
  ctx.restore();
  // etykiety warstw (z lewej, na ciemnym pasku)
  if (s.labels !== false) {
    const lab = [["BETON", IZG.bet, 0], ["RURY", [IZG.bet[0] - IZG.r * 2.1, IZG.bet[0]], 1], [mode === "masa" ? "MASA IZZI THERM" : "IZOLACJA", IZG.iso, 2], ["WYLEWKA", IZG.wyl, 3], ["PŁYTKA", IZG.tile, 4]];
    lab.forEach(([txt, rg, i]) => { const a = L(i); if (a <= 0 || (s.only && !s.only.includes(i))) return;
      const cy = yy((rg[0] + rg[1]) / 2); ctx.save(); ctx.globalAlpha = a; ctx.font = '900 34px "Segoe UI Black", sans-serif';
      const w = ctx.measureText(txt).width + 36, lx = X + Wd - w - 16;
      ctx.fillStyle = i === 2 && mode === "masa" ? "#1f3d14" : "rgba(15,15,17,.82)"; ctx.beginPath(); ctx.roundRect(lx, cy - 26, w, 52, 26); ctx.fill();
      ctx.fillStyle = i === 2 && mode === "masa" ? IZC.green : "#fff"; ctx.textBaseline = "middle"; ctx.fillText(txt, lx + 18, cy + 2); ctx.restore(); });
  }
  if (mode === "split") {  // podpisy porównania
    ctx.save(); ctx.font = '900 44px "Segoe UI Black", sans-serif'; ctx.textBaseline = "middle";
    [["PŁYTY", .25, "#fff", "rgba(15,15,17,.85)"], ["MASA", .75, "#1f3d14", IZC.green]].forEach(([tx, cx, fg, bg]) => {
      const w = ctx.measureText(tx).width + 50; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(xx(cx) - w / 2, Y + 18, w, 70, 35); ctx.fill(); ctx.fillStyle = fg; ctx.fillText(tx, xx(cx) - w / 2 + 25, Y + 55); });
    ctx.fillStyle = "#fff"; ctx.fillRect(xx(.5) - 4, Y, 8, Hd); ctx.restore();
  }
}
// karta z kanwą przekroju; zwraca funkcję rysującą (t, stan)
function izSecCard(parent, y = 520, h = 820) {
  const c = el(parent, "iz-sec", `<canvas width="980" height="${h}"></canvas>`); c.style.top = y + "px"; c.style.height = h + "px";
  const ctx = c.firstChild.getContext("2d");
  return (vis, st) => { c.style.opacity = vis; if (vis <= 0) return; ctx.clearRect(0, 0, 980, h); izSection(ctx, 0, 0, 980, h, st); };
}
// paragon: pozycje pojawiają się po kolei, na dole suma z „?”
function izReceipt(parent, head, items, foot) {
  const e = el(parent, "iz-rc", `<div class="hd">${head}</div><div class="it"></div><div class="ft"><span>${foot[0]}</span><b>${foot[1]}</b></div>`);
  const box = e.querySelector(".it"), rows = items.map(([a, b]) => el(box, "r", `<span>${a}</span><b>${b}</b>`)), ft = e.querySelector(".ft");
  return (t, a, times, tf, z) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    e.style.transform = `translateX(-50%) rotate(-2deg) translateY(${((1 - E.out4(clamp((t - a) / .35))) * 900).toFixed(0)}px)`;
    rows.forEach((r, i) => { const ti = times[i]; r.style.display = t >= ti ? "flex" : "none"; r.style.opacity = t >= ti ? 1 : 0; r.style.transform = `translateX(${t >= ti ? ((1 - E.out4(clamp((t - ti) / .25))) * -60).toFixed(0) : -60}px)`; });
    ft.style.display = t >= tf ? "flex" : "none"; ft.style.opacity = t >= tf ? 1 : 0; ft.style.transform = `scale(${t >= tf ? mix(1.3, 1, outBack(clamp((t - tf) / .3), 2.2)).toFixed(3) : 1.3})`;
  };
}
// duża liczba + podpis + źródło
function izStat(parent, big, lab, src, cls = "") {
  const e = el(parent, "iz-stat " + cls, `<b>${big}</b><span>${lab}</span>${src ? `<small>${src}</small>` : ""}`);
  return (t, a, z, y = 560) => { e.style.top = y + "px"; return izPop(e, t, a, z, "translateX(-50%)", .5); };
}
// pasek kroków (jak w zs3): ST = [[czas, etykieta], ...]
function izSteps(parent, ST, top = 150) {
  const st = el(parent, "iz-st", `<div class="ln"><i></i></div>`), lnI = st.querySelector(".ln i"); st.style.top = top + "px";
  const n = ST.length, dots = ST.map((s, i) => { const d = el(st, "d", String(i + 1)); d.style.left = `calc(48px + ${i} * (100% - 96px) / ${n - 1})`; return d; });
  const lb = el(st, "lb", "");
  return (t, z) => {
    const on = t >= ST[0][0] - .05 && t < z; st.style.opacity = on ? 1 : 0; if (!on) return;
    const cur = Math.max(1, ST.filter(s => t >= s[0] - .04).length);
    dots.forEach((d, i) => { d.className = "d" + (i + 1 === cur ? " on" : i + 1 < cur ? " done" : "");
      d.style.transform = `scale(${i + 1 === cur ? mix(.7, 1.12, spring(t - ST[i][0], 2.4, .5)).toFixed(3) : 1})`; });
    const p0 = (cur - 2) / (n - 1), p1 = (cur - 1) / (n - 1), u = E.out4(clamp((t - ST[cur - 1][0]) / .4));
    lnI.style.width = (Math.max(0, mix(p0, p1, u)) * 100).toFixed(1) + "%";
    lb.textContent = ST[cur - 1][1]; const base = `calc(48px + ${cur - 1} * (100% - 96px) / ${n - 1})`; lb.style.left = base;
    lb.style.transform = `translateX(-50%) scale(${mix(.6, 1, spring(t - ST[cur - 1][0], 2.4, .55)).toFixed(3)})`;
    const L = lb.getBoundingClientRect(); if (L.left < 20) lb.style.left = `calc(${base} + ${(20 - L.left).toFixed(0)}px)`; if (L.right > 1060) lb.style.left = `calc(${base} - ${(L.right - 1060).toFixed(0)}px)`;
  };
}
// znaczek źródła w rogu (np. „Krajowa Ocena Techniczna”)
function izSource(parent, txt) { const e = el(parent, "iz-src", txt); return (t, a, z) => { e.style.opacity = t >= a && t < z ? clamp((t - a) / .2) : 0; }; }
