// rolka.js: składa film z pieces.js. Ujęcia na pełny kadr: twarde cięcie z najazdem, przejście „whip” (przesunięcie + rozmycie)
// albo miękkie przenikanie w stylu spokojnym. Hak od klatki 0, napisy z głosem, liczniki, plansza końcowa. Rolka może dodać własne warstwy w dodatki.js.
function rolka(cfg) {
  const DUR = T.DUR, PC = window.PIECES, EP = window.ENDP, AC = cfg.akcent || "#ffd23f", CALM = cfg.styl === "spokojny";
  const WH = .2, FD = .5;
  scene(0, DUR + 1, c => {
    const cv = el(c, "p-full", `<canvas width="1080" height="1920"></canvas>`).firstChild, ctx = cv.getContext("2d");
    const fr = {}; PC.forEach(p => fr[p.name] = useClip(p.name));
    const bg = EP ? useClip(EP.name) : null;
    el(c, "p-shade");
    if (cfg.znaczek_ai) el(c, "aitag", "AI");
    const flash = el(c, "t-flash");
    const hook = cfg.hak ? premHook(c, cfg.hak, 0, cfg.hak_do ?? (PC[1] ? PC[1].a : 1.5)) : () => {};
    const re = cfg.wyroznij ? new RegExp(cfg.wyroznij, "i") : null;
    premCaps(c, voiceWords().filter(w => !EP || w.t < EP.a - .02), { hi: w => re && re.test(w) ? AC : null, calm: CALM });
    const kon = EP && cfg.koniec, endc = kon ? el(c, "t-end", `<div class="k">${kon.nad || ""}</div><div class="h">${kon.tytul || ""}</div><div class="m">${kon.pod || ""}</div><div class="b">${kon.przycisk || ""}</div>`) : null,
      btn = endc && endc.querySelector(".b");
    if (kon && kon.kolor) { btn.style.background = kon.kolor; endc.querySelector(".k").style.color = kon.kolor; }
    if (kon && !kon.przycisk) btn.remove();
    const odo = (cfg.liczniki || []).map(k => { PR.off.push([k.od, k.koniec]); return { k, o: premOdo(c, k.cyfry || String(k.na).length, { prefix: k.przedrostek, suffix: k.sufiks, label: k.etykieta, color: k.kolor || AC, space: true, top: k.top }) }; });
    const dod = (window.DODATKI || []).map(f => f(c, cfg)).filter(Boolean);

    sfx("IMP_BASS", .02, CALM ? -20 : -13);
    PC.slice(1).forEach(p => { if (p.wh) sfx("WH_SWING", p.a - .07, -17); else if (p.zmiana) sfx("WH_SOFT", p.a - .07, -22); });
    odo.forEach(({ k }) => sfx("IMP_SOFT", k.od, -16));
    if (EP) { sfx("WH_SWING", EP.a - .1, -15); if (kon && kon.przycisk) sfx("POP", EP.a + .55, -14); PR.off.push([EP.a - .02, DUR + 1]); }

    const draw = (im, z, dx, blur, alpha = 1) => { ctx.globalAlpha = alpha; premDraw(ctx, im, { z, dx, blur }); ctx.globalAlpha = 1; };
    return (lt, t) => {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
      if (EP && t >= EP.a) {
        const dt = t - EP.a;
        draw(frameAt(bg, dt), 1.04 + .05 * clamp(dt / 3), 0, 16 * Math.max(0, 1 - dt / .14));
        ctx.fillStyle = `rgba(0,0,0,${(.25 * clamp(dt / .4)).toFixed(3)})`; ctx.fillRect(0, 0, 1080, 1920);
        endc.style.opacity = 1; endc.style.transform = `translateY(${((1 - E.out4(clamp((dt - .1) / .4))) * 1100).toFixed(1)}px)`;
        if (btn && btn.isConnected) {
          const a = dt - .55; btn.style.opacity = a > 0 ? 1 : 0;
          btn.style.transform = `translateX(-50%) scale(${a > 0 ? (mix(.5, 1, outBack(clamp(a / .3), 2.4)) * (1 + .025 * Math.sin(a * 6))).toFixed(4) : .5})`;
        }
        flash.style.opacity = 0;
      } else {
        if (endc) endc.style.opacity = 0;
        const i = Math.max(0, PC.findIndex(x => t >= x.a && t < x.b)), p = PC[i] || PC[PC.length - 1], dt = t - p.a, len = p.b - p.a;
        const L = cutLook(dt, len, CALM ? { push: .04, punch: 0 } : { push: p.slow ? .05 : .06, punch: i === 0 || p.wh || !p.zmiana ? 0 : .07 });
        if (p.wh && dt < WH && i > 0) {  // whip: poprzednie ujęcie wyjeżdża, nowe wjeżdża, oba rozmyte
          const q = PC[i - 1], u = E.io(clamp(dt / WH)), d = p.dir;
          draw(frameAt(fr[q.name], q.b - q.a + dt), 1.1, -d * 1080 * u, 22 * Math.sin(u * Math.PI));
          draw(frameAt(fr[p.name], dt), 1.1, d * 1080 * (1 - u), 22 * Math.sin(u * Math.PI));
        } else if (p.fade && dt < FD && i > 0) {
          const q = PC[i - 1];
          draw(frameAt(fr[q.name], q.b - q.a + dt), 1.04, 0, 0);
          draw(frameAt(fr[p.name], dt), L.z, 0, 0, E.io(clamp(dt / FD)));
        } else draw(frameAt(fr[p.name], dt), L.z, 0, 0);
        flash.style.opacity = p.zmiana && !p.wh && !p.fade && dt < .09 ? (.3 * (1 - dt / .09)).toFixed(3) : 0;
        if (odo.some(({ k }) => t >= k.od && t < k.koniec)) { ctx.filter = "blur(18px) brightness(.55)"; ctx.drawImage(cv, 0, 0); ctx.filter = "none"; }
      }
      odo.forEach(({ k, o }) => premOdoRun(o, t, k.od, k.do, k.koniec, k.z || 0, k.na));
      hook(t); premCapsUpdate(t); dod.forEach(u => u(t));
    };
  }, {});
  boot("rolka.m4a");
}
