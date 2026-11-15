"use strict";
// 2026-09-26 HARD RULE: frame 0 of a reel is a full picture (the swipe is decided in ~1 s). No fade from black (engine.js)
// and the scene that starts at t = 0 never fades / blurs in, whatever the page passes.
window.FADE_IN = false;
{ const S0 = S; S = (a, z, build, o = {}) => S0(a, z, build, a <= .01 ? { ...o, inD: 0, inBlur: 0 } : o); }
// Shared pieces of the vertical SaaS-style reels (after saas.js): the AI cursor, a phone, the DM "SAAS" CTA scene.
const AIC = `<svg viewBox="0 0 32 32"><defs><linearGradient id="aicG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb8ff"/><stop offset="1" stop-color="#c77dff"/></linearGradient></defs><path d="M6 3l19 12.5-8.6 1.6 5 9.4-3.8 2-5-9.5L6 25z" fill="url(#aicG)" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
function rphone(parent, cx, cy, w, h) { const p = ctr(parent, "rphone", `<div class="scr"></div>`, cx, cy, w, h); p.scr = p.querySelector(".scr"); return p; }
// CTA: "DM me “SAAS” on Instagram" + the Instagram DM with the K logo, SAAS typed, the free-lesson reply.  key = the voice line.
function reelCTA(a, key) {
  return S(a, DUR, (cam, e) => {
    const k = wt(key), h = words(e, "DM me “SAAS”", 300, 128, k.slice(0, 3), { grad: [2] }), h2 = words(e, "on Instagram", 430, 70, [k[3], k[4]]);
    const w = ctr(e, "gl", `<div style="height:96px;display:flex;align-items:center;gap:18px;padding:0 28px;border-bottom:1px solid rgba(255,255,255,.1);font:700 30px var(--font);color:#fff"><span class="av" style="position:relative;width:60px;height:60px;border-radius:50%;overflow:hidden;background:linear-gradient(145deg,#5a86ff,#7b5cff 55%,#c56bff)">${KBA}</span>Kuba Builds AI</div>
      <div class="me bub me" style="position:absolute;right:30px;top:140px;font-size:36px;font-weight:800;letter-spacing:.04em"></div>
      <div class="rp bub them" style="position:absolute;left:30px;top:260px;max-width:640px;font-size:26px">Here's your free lesson 👇<div style="margin-top:14px;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#4f7cff,#8b6cff)"><div style="padding:22px;font:800 30px var(--font);letter-spacing:.02em">FREE LESSON #1</div><div style="padding:0 22px 20px;font:500 22px var(--font);opacity:.85">kubabuildsai.com</div></div></div>
      <div style="position:absolute;left:30px;right:30px;bottom:30px;height:84px;border-radius:42px;border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;padding:0 30px;font:500 30px var(--font);color:rgba(230,236,255,.5)">Message…</div>`, 540, 1100, 900, 760);
    w.querySelector(".av svg").style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    const me = w.querySelector(".me"), rpE = w.querySelector(".rp");
    const tS = W(key, "SaaS"), tSend = tS + .5, tR = W(key, "send") - .1, rip = ripple(e, 900, 1420, "150,160,255");
    sfx("CLICK", tSend, -16); sfx("IMP_SOFT", tR, -18);
    return (lt, t) => {
      h.up(t); h2.up(t); appear(w, t, a + .05, .5, 60);
      typeInto(me, "SAAS", t, tS - .1, 12, false); me.style.opacity = t > tS - .15 ? 1 : 0; rip(t, tSend);
      appear(rpE, t, tR, .5, 30); camSet(cam, [0, 0, 1]);
    };
  }, { inD: .35, outD: .01 });
}
