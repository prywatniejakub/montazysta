"use strict";
// Odbicia zwycięzców pod nową ofertę (o03, o12, o15; 2026-10-26): klocki ze zwycięskich 03, 12 i 15 (po c4y.js i c4yad.js).
// Bez rzemiosła (napisy, montaż) i bez „wyceny”: wiedza/feedback-scenariusze-wynik-nie-narzedzia.md.
(() => { const st = document.createElement("style"); st.textContent = `
.guar { position: absolute; left: 90px; right: 90px; padding: 44px 40px; text-align: center; background: var(--yel); }
.guar small { display: inline-block; padding: 8px 18px; border-radius: 12px; background: var(--ink); color: var(--yel); font: 900 32px/1 var(--d); letter-spacing: .12em; }
.guar b { display: block; margin-top: 26px; font: 900 76px/1.05 var(--d); letter-spacing: -.035em; }
.step { position: absolute; left: 70px; top: 180px; display: flex; align-items: center; gap: 26px; }
.step i { width: 110px; height: 110px; border-radius: 30px; background: var(--ink); color: var(--yel); display: flex; align-items: center; justify-content: center; font: 900 70px/1 var(--d); font-style: normal; flex: 0 0 110px; }
.step .h { position: static; text-align: left; }
.pill2 { position: absolute; display: inline-flex; align-items: center; gap: 12px; height: 80px; padding: 0 28px; border-radius: 20px; background: #fff; border: 4px solid var(--ink); box-shadow: 6px 6px 0 var(--ink); font: 800 38px/1 var(--d); white-space: nowrap; }
.pill2 svg { width: 36px; height: 36px; }
.pk { position: absolute; left: 80px; width: 920px; padding: 26px 32px; background: #fff; border: 5px solid var(--ink); border-radius: 32px; box-shadow: 12px 12px 0 var(--ink); display: flex; gap: 26px; align-items: center; }
.pk > i { flex: 0 0 110px; height: 110px; border-radius: 28px; background: var(--yel); border: 4px solid var(--ink); display: flex; align-items: center; justify-content: center; font-style: normal; font-size: 62px; }
.pk b { display: block; font: 900 58px/1.05 var(--d); letter-spacing: -.03em; }
.pk span { display: block; margin-top: 10px; font: 700 34px/1.25 var(--b); color: var(--mut); }
.seal { position: absolute; left: 140px; top: 560px; width: 800px; height: 800px; border-radius: 50%; background: var(--yel); border: 10px solid var(--ink); box-shadow: 16px 16px 0 var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.seal .ring { position: absolute; inset: 28px; border-radius: 50%; border: 5px dashed var(--ink); }
.seal small { font: 900 44px/1 var(--d); letter-spacing: .14em; }
.seal b { font: 900 230px/1 var(--d); letter-spacing: -.05em; }
.seal span { margin-top: 8px; font: 900 56px/1.1 var(--d); letter-spacing: -.03em; }
.pill.c { left: 50%; }
.notif { position: absolute; left: 70px; right: 70px; padding: 26px 30px; border-radius: 34px; background: #fff; border: 5px solid var(--ink); box-shadow: 12px 12px 0 var(--ink); display: flex; gap: 24px; align-items: center; }
.notif > i { flex: 0 0 104px; height: 104px; border-radius: 26px; background: var(--yel); border: 4px solid var(--ink); display: flex; align-items: center; justify-content: center; font-style: normal; }
.notif > i svg { width: 56px; height: 56px; }
.notif small { display: block; font: 800 30px/1 var(--b); color: var(--mut); letter-spacing: .02em; }
.notif b { display: block; margin-top: 10px; font: 900 52px/1.05 var(--d); letter-spacing: -.03em; }
.notif span { display: block; margin-top: 8px; font: 700 36px/1.2 var(--b); color: var(--mut); }
.notif em { position: absolute; right: 30px; top: 26px; font: 800 28px/1 var(--b); font-style: normal; color: var(--mut); }
.roles { position: absolute; left: 70px; right: 70px; display: flex; flex-direction: column; gap: 34px; }
.roles .role { position: relative; height: 120px; font-size: 50px; padding: 0 34px; }
.roles .role i { font-size: 58px; }
`; document.head.appendChild(st); })();

// Nagłówek kroku z numerem (jak w 03).
const stepHead = (c, n, src, size = 84) => { const s = el(c, "step", `<i>${n}</i>`); const h = H(s, src, 0, size); h.style.position = "static"; return { s, h }; };

// Powiadomienie o zgłoszeniu (bez „wyceny”: kto, firma, „chce porozmawiać”).
const Notif = (c, y, kto, firma, kiedy = "teraz") => at(el(c, "notif", `<i>${ICO.phone}</i><div><small>NOWE ZGŁOSZENIE</small><b>${kto}</b><span>${firma}</span></div><em>${kiedy}</em>`), null, y);

// Rolka jako reklama w telefonie.
const AdPhone = (c, clip, x, y, w) => Phone(c, clip, x, y, w, `<span class="tag">Sponsorowane</span>`);

// Pieczęć gwarancji: MINIMUM 30 spotkań albo pracujemy bez opłat / za darmo.
function SealScene(key, w30, wAlbo, dopisek) {
  return scene(LS(key), LS(nextKey(key)), (c) => {
    const top = at(el(c, "pill w0 c", "Gwarancja"), null, 250);
    const seal = el(c, "seal", `<div class="ring"></div><small>MINIMUM</small><b>30</b><span>spotkań<br><em style="font-style:normal;font-size:46px">${dopisek}</em></span>`);
    const t30 = W(key, w30), tA = W(key, wAlbo), em = seal.querySelector("em");
    sfx("IMP_BASS", t30 + .05, -12); sfx("IMP_SOFT", tA, -10);
    return (lt, t) => {
      pop(top, t, LS(key) + .05, .6, 2.4, .55, "translateX(-50%)");
      pop(seal, t, t30 - .05, 1.8, 2.6, .45, `rotate(${(-8 + 4 * Math.sin(t * 2)).toFixed(2)}deg)`);
      em.style.opacity = t >= tA - .05 ? 1 : 0;
      seal.querySelector(".ring").style.transform = `rotate(${(t * 20).toFixed(1)}deg)`;
    };
  });
}
function nextKey(k) { return "b" + (+k.slice(1) + 1); }
