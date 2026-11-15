"use strict";
// Clips4you reklamy: wspólne elementy (po c4y.js). Bez logo (marka jest w profilu), hook = postać z banku w pełnym kadrze.
document.getElementById("bug").style.display = "none";
const ARROW = '<svg viewBox="0 0 24 24" style="width:56px;height:56px;vertical-align:-8px;margin-left:10px"><path d="M12 4v15M5.5 12.5L12 19l6.5-6.5" fill="none" stroke="#111113" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
(() => { const st = document.createElement("style"); st.textContent = `
.full { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; display: block; }
.callout { position: absolute; left: 50%; top: 104px; transform: translateX(-50%); padding: 20px 36px; background: var(--yel); border: 6px solid var(--ink); border-radius: 24px; box-shadow: 10px 10px 0 var(--ink); font: 900 66px/1 var(--d); letter-spacing: -.03em; white-space: nowrap; }
.aitag { position: absolute; right: 64px; top: 84px; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.07); border: 1.5px solid rgba(255,255,255,.26); color: rgba(255,255,255,.5); font: 800 15px/37px var(--b); text-align: center; letter-spacing: .02em; z-index: 60; }
.aitag.dk { background: rgba(17,17,19,.04); border-color: rgba(17,17,19,.2); color: rgba(17,17,19,.4); }
.cap { position: absolute; left: 50px; right: 50px; top: 1330px; text-align: center; font: 900 92px/1.04 var(--d); letter-spacing: -.035em; color: #fff; text-shadow: 0 7px 0 #111113, 0 0 30px rgba(0,0,0,.5); }
.cap b { color: var(--yel); }
.role { position: absolute; padding: 0 26px; height: 80px; border-radius: 18px; background: #fff; border: 4px solid var(--ink); box-shadow: 6px 6px 0 var(--ink); display: inline-flex; align-items: center; gap: 12px; font: 800 38px/1 var(--d); letter-spacing: -.02em; white-space: nowrap; }
.role i { font-style: normal; font-size: 40px; }
.plat { position: absolute; left: 0; right: 0; display: flex; justify-content: center; gap: 14px; }
.plat span { padding: 14px 20px; border-radius: 16px; background: #fff; border: 4px solid var(--ink); font: 800 30px/1 var(--b); }
.strike { position: absolute; left: 90px; right: 90px; height: 150px; border-radius: 30px; background: #fff; border: 5px solid var(--ink); box-shadow: 10px 10px 0 var(--ink); display: flex; align-items: center; gap: 28px; padding: 0 36px; font: 800 58px/1 var(--d); letter-spacing: -.03em; }
.strike .x { width: 84px; height: 84px; border-radius: 50%; background: var(--redsoft); display: flex; align-items: center; justify-content: center; flex: 0 0 84px; }
.strike .x svg { width: 44px; height: 44px; }
.strike s { text-decoration-color: var(--red); text-decoration-thickness: 8px; color: #8d8a80; }
`; document.head.appendChild(st); })();

// Scena hooka: klatki clips/<key> (60 kl./s), wołanie u góry, napisy [html, słowo startu z b1], znaczek AI.
// 4:5 (window.F45, lib/c4y45.css): te same klatki 1080x1920 wykadrowane do 1080x1350 od wysokości o.oy (domyślnie 250).
const F45 = !!window.F45, SH = F45 ? 1350 : 1920;
function HookScene(key, callout, caps, o = {}) {
  const oy = F45 ? (o.oy ?? 250) : 0;
  return scene(0, LS("b2"), (c) => {
    const cv = el(c, "", `<canvas class="full" width="1080" height="${SH}"></canvas>`).querySelector("canvas"), ctx = cv.getContext("2d");
    const fr = useClip(key);
    const call = el(c, "callout", callout + ARROW);
    el(c, "aitag", "AI");  // znaczek AI: małe, ledwo widoczne kółko w prawym górnym rogu (wiedza/feedback-znaczek-ai.md)
    const cs = caps.map(([h, w]) => { const e = el(c, "cap", h); e.t0 = typeof w === "number" ? w : w ? W("b1", w) : 0; return e; });  // w = słowo z b1 albo czas (s)
    cs[0].t0 = 0;
    if (o.sfx) sfx("IMP_SOFT", W("b1", o.sfx), -12);
    return (lt, t) => {
      const i = Math.min(fr.length - 1, Math.max(0, Math.round(t * 60))), im = fr[i];  // round, nie floor (t z render.py ma 6 miejsc)
      if (im && im.complete && im.naturalWidth) ctx.drawImage(im, 0, oy, 1080, SH, 0, 0, 1080, SH);
      cs.forEach((e, k) => { const on = t >= e.t0 && (k === cs.length - 1 || t < cs[k + 1].t0); e.style.opacity = on ? 1 : 0; e.style.transform = `scale(${on ? mix(.86, 1, spring(t - e.t0, 3, .55)) : 1})`; });
      call.style.transform = `translateX(-50%) rotate(-2deg) scale(${1 + .03 * Math.sin(t * 6)})`;
    };
  }, { push: 0 });
}

// CTA: umów rozmowę (kursor klika przycisk)
// 4:5: wszystko wyżej i ciaśniej (L), telefony te same
function CtaScene(key, head = "Umów [15 minut]<br>rozmowy.", btn = "Umawiam rozmowę →", phones = [["ico2", 160, 640, -7], ["sa02", 415, 600, 0], ["banana", 670, 640, 7]]) {
  const L = F45 ? { h: 96, dy: -250, pw: 236, cta: 900, url: 1135, c0: 1330, c1: 1000, rip: 1032 }
                : { h: 200, dy: 0, pw: 250, cta: 1260, url: 1530, c0: 1720, c1: 1360, rip: 1392 };
  return scene(LS(key), T.DUR + 1, (c) => {
    const h = H(c, head, L.h, 104);
    const ph = phones.map(([n, x, y, r]) => { const p = Phone(c, n, x + (250 - L.pw) / 2, y + L.dy, L.pw); p.r = r; return p; });
    const cta = at(el(c, "cta", btn), null, L.cta);
    const url = at(el(c, "sub", `clips4you.pl`), null, L.url); url.style.fontWeight = 800;
    const cur = at(el(c, "cursor", ICO.cursor), 0, 0), rip = el(c, "ripple");
    const tClick = W(key, "Kliknij") + .25;
    sfx("CLICK", tClick, -4);
    return (lt, t) => {
      markIn(h, t, W(key, "pietna") - .05);
      ph.forEach((p, i) => { pop(p, t, LS(key) + .05 + i * .07, .6, 2.2, .55, `rotate(${p.r}deg)`); play(p, t, LS(key)); });
      const press = t >= tClick && t < tClick + .16 ? 1 : 0;
      cta.style.transform = `translate(${press * 10}px, ${press * 10}px)`; cta.style.boxShadow = press ? "6px 6px 0 #111113" : "";
      const u = P(t, tClick - .7, tClick - .05, E.io);
      at(cur, mix(900, 640, u), mix(L.c0, L.c1, u)); cur.style.opacity = t < tClick - .75 ? 0 : 1;
      const r = clamp((t - tClick) / .5); at(rip, 690, L.rip); rip.style.opacity = t < tClick ? 0 : 1 - r; rip.style.transform = `scale(${1 + r * 4})`;
    };
  });
}
