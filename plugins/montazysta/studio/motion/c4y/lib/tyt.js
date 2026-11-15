// tyt.js: rolka z prawdziwych nagrań klienta (Tytus, 2026-10-15). Wymaga c4y.js, prem.js, pieces.js (PIECES, ENDP).
// Ujęcia na pełny kadr: twarde cięcia z najazdem albo przejście „whip” (przesunięcie + rozmycie), slow motion ze źródła 60 kl./s.
// Plansza końcowa: tło = ostatnie ujęcie u góry, biała karta od dołu (nazwa, miasta, przycisk).
function tytReel(cfg) {
  const DUR = T.DUR, PC = window.PIECES, EP = window.ENDP, AC = cfg.accent || "#ffd23f";
  const WH = .2;
  scene(0, DUR + 1, (c) => {
    const cv = el(c, "p-full", `<canvas width="1080" height="1920"></canvas>`).firstChild, ctx = cv.getContext("2d");
    const fr = {}; PC.forEach(p => fr[p.name] = useClip(p.name));
    const bg = useClip(EP.name);
    el(c, "p-shade");
    const flash = el(c, "t-flash");
    const hook = premHook(c, cfg.hook, 0, cfg.hookEnd ?? (PC[1] ? PC[1].a : 1.5));
    premCaps(c, voiceWords().filter(w => w.t < EP.a - .02), { hi: w => cfg.hi && cfg.hi.test(w) ? AC : null });
    const endc = el(c, "t-end", `<div class="k">${cfg.kicker}</div><div class="h">${cfg.title}</div><div class="m">${cfg.cities}</div><div class="b">${cfg.button}</div>`),
      btn = endc.querySelector(".b");
    sfx("IMP_BASS", .02, -12);
    PC.slice(1).forEach(p => sfx(p.wh ? "WH_SWING" : "WH_SOFT", p.a - .07, p.wh ? -15 : -21));
    (cfg.hits || []).forEach(t => sfx("IMP_SOFT", t, -15));
    sfx("WH_SWING", EP.a - .1, -14); sfx("POP", EP.a + .55, -12);
    PR.off.push([EP.a - .02, DUR + 1]);
    const draw = (im, z, dx, blur) => premDraw(ctx, im, { z, dx, blur });
    return (lt, t) => {
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
      if (t >= EP.a) {
        const dt = t - EP.a, im = frameAt(bg, dt);
        draw(im, 1.04 + .05 * clamp(dt / 3), 0, 16 * Math.max(0, 1 - dt / .14));
        ctx.fillStyle = `rgba(0,0,0,${(.25 * clamp(dt / .4)).toFixed(3)})`; ctx.fillRect(0, 0, 1080, 1920);
        endc.style.opacity = 1; endc.style.transform = `translateY(${((1 - E.out4(clamp((dt - .1) / .4))) * 1100).toFixed(1)}px)`;
        const a = dt - .55; btn.style.opacity = a > 0 ? 1 : 0;
        btn.style.transform = `translateX(-50%) scale(${a > 0 ? (mix(.5, 1, outBack(clamp(a / .3), 2.4)) * (1 + .025 * Math.sin(a * 6))).toFixed(4) : .5})`;
        flash.style.opacity = 0;
      } else {
        endc.style.opacity = 0;
        const i = Math.max(0, PC.findIndex(x => t >= x.a && t < x.b)), p = PC[i], dt = t - p.a, len = p.b - p.a;
        const L = cutLook(dt, len, { push: p.slow ? .05 : .08, punch: i === 0 || p.wh ? 0 : .07 });
        if (p.wh && dt < WH && i > 0) {  // whip: poprzednie ujęcie wyjeżdża, nowe wjeżdża, oba rozmyte
          const q = PC[i - 1], u = E.io(clamp(dt / WH)), d = p.dir;
          draw(frameAt(fr[q.name], q.b - q.a + dt), 1.1, -d * 1080 * u, 22 * Math.sin(u * Math.PI));
          draw(frameAt(fr[p.name], dt), 1.1, d * 1080 * (1 - u), 22 * Math.sin(u * Math.PI));
        } else draw(frameAt(fr[p.name], dt), L.z, 0, 0);
        flash.style.opacity = !p.wh && i > 0 && dt < .09 ? (.35 * (1 - dt / .09)).toFixed(3) : 0;
      }
      hook(t); premCapsUpdate(t);
    };
  }, { push: 0, cut: true });
  boot(cfg.audio);
}
