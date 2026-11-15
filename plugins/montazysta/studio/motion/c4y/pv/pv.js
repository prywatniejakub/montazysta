// pv.js: rolki PV dla klienta OZE (2026-11-14). Styl 22 (b-roll) podniesiony: kadry AI z ruchem kamery (lustro, inne kadrowanie, przenikanie pór dnia),
// stock z ludźmi, plansze 5-6 słów w kolorze rolki, wspólna końcówka (przycisk + pasek Google). Wymaga c4y.js + prem.js + pv.css.
// window.ACC = kolor akcentu, window.ACC_BOX = biały napis na tle akcentu (rolka 2), window.ACC_DARK = ciemny tekst na przycisku (złoty akcent).
const ACC = window.ACC || "#2f8cff";
document.documentElement.style.setProperty("--acc", ACC);
if (window.ACC_BOX) document.body.classList.add("acbox");
if (window.ACC_DARK) document.body.classList.add("acdark");
(document.getElementById("bug") || { remove() {} }).remove();

const PVI = {};
function pvImg(id) {
  if (PVI[id]) return PVI[id];
  const i = new Image(); LOADS.push(new Promise(r => { i.onload = i.onerror = r; })); i.src = `../pv_kadry/${id}.png`; return (PVI[id] = i);
}
function pvSrc(sh, name, dt, len) {
  if (sh.k === "clip") return frameFit(useClip(name), dt + (sh.off || 0), len + (sh.off || 0));
  return pvImg(name);
}
// geometria kadru w chwili t (cover + zoom + kotwica), we współrzędnych źródła
function pvGeo(sh, t, im) {
  const dt = Math.max(0, t - sh.a), len = Math.max(.4, sh.b - sh.a), u = E.io(clamp(dt / len));
  const z = mix(sh.z0 ?? 1.04, sh.z1 ?? 1.12, u) + ((sh.tr || "cut") === "cut" && sh.a > 0 ? .05 * Math.max(0, 1 - dt / .2) : 0);
  const ax = mix(sh.ax0 ?? .5, sh.ax1 ?? sh.ax0 ?? .5, u), ay = mix(sh.ay0 ?? .5, sh.ay1 ?? sh.ay0 ?? .5, u);
  const iw = im.naturalWidth, ih = im.naturalHeight, base = Math.max(1080 / iw, 1920 / ih) * z, w = iw * base, h = ih * base;
  return { base, x: (1080 - w) * ax, y: (1920 - h) * ay, w, h };
}
// punkt źródła (px obrazu) -> ekran, z lustrem
function pvPin(sh, t, sx, sy) {
  const im = sh.k === "clip" ? null : pvImg(sh.s); if (!im || !im.naturalWidth) return { x: 540, y: 960 };
  const g = pvGeo(sh, t, im); let x = g.x + sx * g.base; const y = g.y + sy * g.base;
  if (sh.mir) x = 1080 - x; return { x, y };
}
function pvGlow(ctx, gl, g, t) {
  if (t < (gl.a ?? -1)) return;
  let k = 1;
  if (gl.blink) k = Math.floor((t - (gl.a ?? 0)) * gl.blink * 2) % 2 ? .18 : 1;
  if (gl.pulse) k = .7 + .3 * Math.sin((t - (gl.a ?? 0)) * gl.pulse * 6.283);
  if (gl.a != null) k *= clamp((t - gl.a) / .15);
  const x = g.x + gl.x * g.base, y = g.y + gl.y * g.base, r = gl.r * g.base;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = k * (gl.o ?? 1);
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, "#ffffff"); gr.addColorStop(.12, gl.c); gr.addColorStop(.4, gl.c + "88"); gr.addColorStop(1, gl.c + "00");
  ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  if (gl.star) {  // błysk słońca na panelach: dwie smugi
    const L = r * 3.2, rot = (t - (gl.a ?? 0)) * .25;
    [rot, rot + 1.571].forEach(an => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(an);
      const lg = ctx.createLinearGradient(-L, 0, L, 0); lg.addColorStop(0, "#fff0"); lg.addColorStop(.5, "#ffffffcc"); lg.addColorStop(1, "#fff0");
      ctx.fillStyle = lg; ctx.fillRect(-L, -r * .05, 2 * L, r * .1); ctx.restore();
    });
  }
  ctx.restore();
}
function pvDrawShot(ctx, sh, t, dx = 0, blur = 0) {
  const dt = Math.max(0, t - sh.a), len = Math.max(.4, sh.b - sh.a);
  const im = pvSrc(sh, sh.s, dt, len); if (!im || !im.complete || !im.naturalWidth) return;
  const g = pvGeo(sh, t, im);
  let sx = 0, sy = 0; if (sh.shake) { sx = shake(t, sh.shake[0], sh.shake[1]); sy = shake(t + .07, sh.shake[0], sh.shake[1] * .7); }
  const zb = (sh.tr || "cut") === "cut" && sh.a > 0 && dt < .12 ? 10 * (1 - dt / .12) : 0;
  ctx.save(); ctx.translate(dx + sx, sy);
  if (sh.mir) { ctx.translate(1080, 0); ctx.scale(-1, 1); }
  const f = [sh.f || "", (zb + blur) > .3 ? `blur(${(zb + blur).toFixed(1)}px)` : ""].join(" ").trim(); if (f) ctx.filter = f;
  ctx.drawImage(im, g.x, g.y, g.w, g.h);
  if (sh.blend && t >= sh.blend.a) {  // ten sam kadr w innej porze dnia (dzień -> wieczór: zapalają się okna)
    const im2 = pvImg(sh.blend.s);
    if (im2.naturalWidth) { const ga = ctx.globalAlpha; ctx.globalAlpha = ga * E.io(clamp((t - sh.blend.a) / (sh.blend.b - sh.blend.a))); ctx.drawImage(im2, g.x, g.y, g.w, g.h); ctx.globalAlpha = ga; }
  }
  ctx.filter = "none";
  (sh.glow || []).forEach(gl => pvGlow(ctx, gl, g, t));
  ctx.restore();
}
// ekran dzielony: ten sam dom w dzień (lewa) i wieczorem (prawa), ukośna linia wjeżdża w a+0,1
function pvDrawSplit(ctx, sh, t) {
  pvDrawShot(ctx, { ...sh, k: "img" }, t);
  const u = E.out4(clamp((t - sh.a - .05) / .45)), off = (1 - u) * 1300;
  const x1 = 640 + off, x2 = 440 + off;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(1080 + 400, 0); ctx.lineTo(1080 + 400, 1920); ctx.lineTo(x2, 1920); ctx.closePath(); ctx.clip();
  pvDrawShot(ctx, { ...sh, k: "img", s: sh.s2, f: sh.f2 || sh.f }, t); ctx.restore();
  ctx.save(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 8; ctx.shadowColor = "rgba(255,255,255,.8)"; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x2, 1920); ctx.stroke(); ctx.restore();
}
// lista ujęć: { k: "img"|"clip"|"split", s, a, b, z0, z1, ax0, ax1, ay0, ay1, mir, f, tr: "cut"|"fade"|"whip", fd, dir, glow: [...], blend: {s, a, b} }
function pvShots(parent, shots) {
  const cv = el(parent, "pv-cv", `<canvas width="1080" height="1920"></canvas>`).firstChild, ctx = cv.getContext("2d");
  shots.forEach(s => { if (s.k === "clip") useClip(s.s); else { pvImg(s.s); if (s.s2) pvImg(s.s2); if (s.blend) pvImg(s.blend.s); } });
  shots.forEach((s, i) => { if (i > 0 && s.snd !== 0) sfx(s.tr === "whip" ? "WH_SWING" : "WH_SOFT", s.a - .06, s.tr === "whip" ? -24 : s.tr === "fade" ? -31 : -28); });
  const draw = (s, t, dx = 0, bl = 0) => s.k === "split" ? pvDrawSplit(ctx, s, t) : pvDrawShot(ctx, s, t, dx, bl);
  return t => {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 1920);
    const i = shots.findIndex(s => t >= s.a && t < s.b), k = i < 0 ? shots.length - 1 : i, sh = shots[k];
    if (sh.tr === "whip" && k > 0 && t - sh.a < .24) {
      const u = clamp((t - sh.a) / .24), e = E.out4(u), d = sh.dir || 1;
      draw(shots[k - 1], t, -d * 1080 * e, 18 * (1 - u)); draw(sh, t, d * 1080 * (1 - e), 18 * (1 - u));
    } else if (sh.tr === "fade" && k > 0 && t - sh.a < (sh.fd || .4)) {
      draw(shots[k - 1], t); ctx.save(); ctx.globalAlpha = E.io(clamp((t - sh.a) / (sh.fd || .4))); draw(sh, t); ctx.restore();
    } else draw(sh, t);
  };
}

// plansze: { a, z, t: "TEKST z *akcentem / nowa linia", y, cls: "s"|"mid", times: [czas słowa,...] (opcjonalnie) }
function pvCards(parent, list) {
  const box = el(parent, "pv-cards");
  const items = list.map(c => {
    const e = el(box, "pv-card " + (c.cls || "")); e.style.top = (c.y ?? 300) + "px"; if (c.size) e.style.fontSize = c.size + "px";
    const ws = []; let grp = null, first = true;
    c.t.split(" ").forEach(tok => {
      if (tok === "/") { e.appendChild(document.createElement("br")); grp = null; first = true; return; }
      const acc = tok.startsWith("*"), txt = acc ? tok.slice(1) : tok;
      let host = e;
      if (acc && grp) { grp.appendChild(document.createTextNode(" ")); host = grp; }          // kolejne słowo akcentu: spacja w tej samej grupie
      else {
        if (!first) e.appendChild(document.createTextNode(" "));
        if (acc) { grp = document.createElement("span"); grp.className = "ac"; e.appendChild(grp); host = grp; } else grp = null;
      }
      const w = document.createElement("span"); w.className = "w" + (txt === "•" ? " dot" : ""); w.textContent = txt; host.appendChild(w);
      ws.push({ el: w, acc }); first = false;
    });
    return { ...c, e, ws };
  });
  return t => items.forEach(c => {
    const on = t >= c.a && t < c.z; c.e.style.opacity = on ? 1 : 0; if (!on) return;
    const out = clamp((c.z - t) / .14), lt = t - c.a;
    c.e.style.opacity = out; c.e.style.transform = `scale(${(1 + .02 * E.io(clamp(lt / Math.max(.5, c.z - c.a)))).toFixed(4)})`;
    c.ws.forEach((w, i) => {
      const t0 = c.now ? -1 : c.times ? c.times[i] : c.a + i * .055, u = clamp((t - t0) / .26);  // now = widoczna od klatki 0 (hak)
      w.el.style.opacity = t < t0 ? 0 : clamp(u * 2.2);
      const s = w.acc ? mix(.6, 1, outBack(u, 2.4)) : mix(.92, 1, E.out4(u));
      w.el.style.transform = `translateY(${((1 - E.out4(u)) * 46).toFixed(1)}px) scale(${s.toFixed(3)})`;
    });
  });
}

// plakietka przypięta do punktu kadru: tag(t, sh) -> pozycja z pvPin
function pvTag(parent, html, cls = "") {
  const e = el(parent, "pv-tag " + cls, html);
  return (t, a, z, sh, sx, sy, ox = 46, oy = -40) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const p = pvPin(sh, t, sx, sy), left = cls.includes("l");
    e.style.left = (left ? p.x - ox - e.offsetWidth : p.x + ox) + "px"; e.style.top = (p.y + oy - e.offsetHeight / 2) + "px";
    e.style.transform = `scale(${mix(.4, 1, outBack(clamp((t - a) / .3), 2.2)).toFixed(3)})`;
  };
}
// karta rachunku
function pvBill(parent, kwota) {
  const e = el(parent, "pv-bill", `<div class="hd"><span>Rachunek za prąd</span><i>DO ZAPŁATY</i></div><div class="ln"></div><div class="ln b"></div>` +
    `<div class="lb">Kwota do zapłaty</div><div class="v">0,00 zł</div>`);
  const v = e.querySelector(".v");
  return (t, a, z) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const u = E.out4(clamp((t - a) / .35)); e.style.transform = `translateY(${((1 - u) * 700).toFixed(1)}px) rotate(${mix(6, -2.5, u).toFixed(2)}deg)`;
    const k = E.out(clamp((t - a - .2) / .9)); v.textContent = (kwota * k).toFixed(2).replace(".", ",") + " zł";
  };
}
// telefon z aplikacją falownika: mode "day" (dziś mało) | "year" (licznik roku) | "call" (firma nie odbiera)
const SVG_HOUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/></svg>';
const SVG_PHONE = '<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1z"/></svg>';
const SVG_MISS = '<svg viewBox="0 0 24 24" fill="none" stroke="#e5372f" stroke-width="2.6" stroke-linecap="round"><path d="M4 8l6 6 4-4 6 6"/><path d="M15 16h5v-5"/></svg>';
function pvPhone(parent, mode, o = {}) {
  const exp = mode === "year" ? [10, 18, 42, 66, 84, 92, 96, 88, 66, 42, 18, 9] : [6, 18, 38, 60, 80, 94, 100, 94, 80, 60, 38, 18];
  const real = exp.map((v, i) => v * (mode === "year" ? .7 : (o.low || .34)) * (1 + .12 * Math.sin(i * 2.1)));
  const bars = exp.map((v, i) => `<div class="c"><div class="gh" style="height:${v}%"></div><div class="re" style="height:0%" data-h="${real[i].toFixed(1)}"></div></div>`).join("");
  const tabs = ["Dzień", "Miesiąc", "Rok"].map(x => `<span class="${(mode === "year" ? "Rok" : "Dzień") === x ? "on" : ""}">${x}</span>`).join("");
  const e = el(parent, "pv-ph " + mode, `<div class="sc"><div class="isl"></div><div class="sb"><span>18:42</span><span>●●● 82%</span></div>` +
    `<div class="app"><div class="ti">Moja instalacja</div><div class="su"><i></i>6,0 kWp · falownik online</div><div class="tabs">${tabs}</div>` +
    `<div class="big"><small>${mode === "year" ? "Produkcja: ostatni rok" : "Produkcja dziś · słonecznie"}</small><div class="vv"><b>0</b><em>kWh</em><span class="pc">−30%</span></div></div>` +
    `<div class="ch">${bars}</div><div class="lg"><span class="a"><i></i>Twoja produkcja</span><span class="b"><i></i>Powinna być</span></div>` +
    `<div class="norm">Norma dla 6 kW: <b>ok. 6 000 kWh</b></div><div class="warn">▼ Produkcja poniżej normy</div></div>` +
    `<div class="call"><div class="av">${SVG_HOUSE}</div><div class="nm">Firma montażowa</div><div class="st">Łączenie…</div><div class="end">${SVG_PHONE}</div></div>` +
    `<div class="log"><h5>Ostatnie</h5>${["pon. 9:12", "śr. 14:40", "pt. 11:05"].map(d => `<div class="r"><i>${SVG_MISS}</i><div><b>Firma montażowa</b><small>wychodzące · brak odpowiedzi</small></div><em>${d}</em></div>`).join("")}</div></div>`);
  const b = e.querySelector(".big b"), pc = e.querySelector(".pc"), norm = e.querySelector(".norm"), warn = e.querySelector(".warn"), res = [...e.querySelectorAll(".re")];
  const call = e.querySelector(".call"), st = e.querySelector(".call .st"), log = e.querySelector(".log"), rows = [...e.querySelectorAll(".log .r")];
  // q = { a, z, count: [t0, t1, v1], norm: t, bad: t, warn: t, noAns: t, log: [t1, t2, t3] }
  return (t, q) => {
    const on = t >= q.a && t < q.z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const u = E.out4(clamp((t - q.a) / .32)), fl = 1 + .035 * E.io(clamp((t - q.a) / Math.max(1, q.z - q.a)));
    e.style.transform = `translateY(${((1 - u) * 1400).toFixed(1)}px) rotate(${mix(4, 0, u).toFixed(2)}deg) scale(${fl.toFixed(4)})`;
    if (q.count) {
      const [c0, c1, v1] = q.count, k = E.out(clamp((t - c0) / (c1 - c0))), v = v1 * k;
      b.textContent = v1 >= 100 ? String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : v.toFixed(1).replace(".", ",");
      res.forEach((r, i) => { const kk = E.out(clamp((t - c0 - i * .05) / .6)); r.style.height = (+r.dataset.h * kk).toFixed(1) + "%"; });
    }
    const bad = q.bad != null && t >= q.bad; b.className = bad ? "bad" : ""; res.forEach(r => r.classList.toggle("bad", bad));
    pc.style.opacity = bad ? 1 : 0; if (bad) pc.style.transform = `scale(${mix(.5, 1, outBack(clamp((t - q.bad) / .3), 2.4)).toFixed(3)})`;
    [[norm, q.norm], [warn, q.warn]].forEach(([n, tt]) => { const sh = tt != null && t >= tt; n.style.opacity = sh ? 1 : 0;
      if (sh) n.style.transform = `translateY(${((1 - E.out4(clamp((t - tt) / .3))) * 40).toFixed(1)}px)`; });
    const inCall = q.call != null && t >= q.call && (q.log == null || t < q.log[0] - .15);
    call.style.opacity = inCall ? 1 : 0;
    if (inCall) { const na = q.noAns != null && t >= q.noAns; st.textContent = na ? "Brak odpowiedzi" : "Łączenie" + ".".repeat(1 + Math.floor((t - q.call) * 3) % 3); st.className = "st" + (na ? " bad" : ""); }
    const lg = q.log != null && t >= q.log[0] - .15; log.style.opacity = lg ? 1 : 0;
    rows.forEach((r, i) => { const tt = q.log ? q.log[i] : 1e9, s = t >= tt; r.style.opacity = s ? 1 : 0;
      if (s) r.style.transform = `translateX(${((1 - E.out4(clamp((t - tt) / .28))) * 500).toFixed(1)}px)`; });
  };
}
// dwie karty dzień / wieczór
const SVG_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="#f5a400" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.4" fill="#ffc928"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
const SVG_MOON = '<svg viewBox="0 0 24 24"><path fill="#ffd970" d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>';
function pvDN(parent, kind, lab, val, arrow, top) {
  const e = el(parent, `pv-dn ${kind}`, `<div class="ic">${kind === "sun" ? SVG_SUN : SVG_MOON}</div><div class="tx"><b>${lab}</b><strong>${val}</strong></div><div class="ar">${arrow}</div>`);
  e.style.top = top + "px";
  return (t, a, z) => { const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const s = spring(t - a, 2.2, .62); e.style.transform = `translateX(${((1 - s) * (kind === "sun" ? -1 : 1) * 900).toFixed(1)}px)`; };
}
// chip poziomu magazynu
function pvBat(parent) {
  const e = el(parent, "pv-bat", `<div class="cell"><i></i></div><span>0%</span>`), fill = e.querySelector("i"), lab = e.querySelector("span");
  return (t, a, z, sh, sx, sy, full) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const p = pvPin(sh, t, sx, sy); e.style.left = (p.x - e.offsetWidth / 2) + "px"; e.style.top = p.y + "px";
    e.style.transform = `scale(${mix(.5, 1, outBack(clamp((t - a) / .3), 2.2)).toFixed(3)})`;
    const k = mix(.08, .86, E.io(clamp((t - a - .2) / Math.max(.4, full - a - .2)))); fill.style.width = (k * 76).toFixed(1) + "px"; lab.textContent = Math.round(k * 100) + "%";
  };
}
// plansza końcowa: przycisk + pasek Google 4,9 ★★★★★ | 500+ sprawdzonych instalacji; stuknięcie w przycisk w tap
const SVG_G = '<svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function pvEnd(parent, btn) {
  const e = el(parent, "pv-end", `<div class="btn"><span>${btn}</span><i>→</i></div>` +
    `<div class="bar"><div class="r1">${SVG_G}<span class="gn">Google</span><span>4,9</span><span class="st">★★★★★</span></div><div class="r2"><b>500+</b> sprawdzonych instalacji</div></div>` +
    `<div class="arr">↓</div><div class="tap"></div>`);
  const b = e.querySelector(".btn"), bar = e.querySelector(".bar"), arr = e.querySelector(".arr"), tap = e.querySelector(".tap");
  return (t, a, tapAt) => {
    if (t < a) { e.style.opacity = 0; return; } e.style.opacity = 1;
    const sb = spring(t - a, 2, .55), tp = tapAt != null && t >= tapAt && t < tapAt + .3;
    b.style.transform = `translateX(-50%) scale(${(mix(.55, 1, sb) * (tp ? .95 : 1 + .025 * Math.sin((t - a) * 5))).toFixed(4)})`; b.style.opacity = clamp((t - a) / .1);
    const ub = E.out4(clamp((t - a - .25) / .35)); bar.style.opacity = ub; bar.style.transform = `translateY(${((1 - ub) * 120).toFixed(1)}px)`;
    const ua = clamp((t - a - .6) / .3); arr.style.opacity = ua; arr.style.transform = `translateY(${(Math.sin((t - a) * 6) * 14).toFixed(1)}px)`;
    const ut = tapAt != null ? (t - tapAt + .25) / .6 : -1; tap.style.opacity = ut > 0 && ut < 1 ? (1 - ut).toFixed(3) : 0;
    if (ut > 0 && ut < 1) tap.style.transform = `scale(${mix(1.4, .8, Math.min(1, ut * 1.6)).toFixed(3)})`;
  };
}
