// oze.js: grafiki rolek OZE (Fundusz Modernizacji Budynków), 2026-11-01. Wymaga c4y.js + prem.js + zs.js + oze.css.
// Każda funkcja buduje element i zwraca update(t, ...czasy). Grafiki tylko tam, gdzie darmowy stock nie ma ujęcia (falownik, magazyn, ceny, formularz).
const OY = "#ffc928";
// słowa do napisów: krótki przyimek/spójnik skleja się z następnym słowem, żeby napis nie kończył się na „W”, „NA”, „I”
const OZ_SHORT = new Set(["w", "z", "i", "u", "o", "a", "na", "do", "po", "za", "ze", "we", "od", "bez"]);
function ozWords(ws) {
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], nx = ws[i + 1];
    if (nx && OZ_SHORT.has(w.w.toLowerCase()) && !/[.,:;!?]$/.test(w.w)) { out.push({ ...nx, w: w.w + " " + nx.w, t: w.t }); i++; }
    else out.push(w);
  }
  return out;
}
// karta ceny: kind "sun" | "snow" (ikona dnia albo nocy), lab = mały napis, val = duży
function ozPrice(parent, kind, top, ic, lab, val, arrow) {
  const e = el(parent, `oz-price ${kind}`, `<div class="ic">${ic}</div><div class="tx"><b>${lab}</b><strong>${val}</strong></div><div class="ar">${arrow}</div>`);
  e.style.top = top + "px";
  return (t, a, z) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const s = spring(t - a, 2.2, .6); e.style.transform = `translateX(${((1 - s) * (kind === "sun" ? -1 : 1) * 700).toFixed(1)}px)`;
  };
}
// falownik: stan "ok" (zielone diody, kW) albo "stop" (czerwona dioda, 0,0 kW); port = podpis „wejście na magazyn?”
function ozInverter(parent) {
  const e = el(parent, "oz-inv", `<div class="scr"><span class="v">3,8 kW</span><small class="m">PRACA</small></div>` +
    `<div class="led l1"></div><div class="led l2"></div><div class="led l3"></div><div class="fins"></div>` +
    `<div class="cab c1"></div><div class="cab c2"></div><div class="cab c3"></div><div class="cab c4"></div><div class="port">WEJŚCIE NA<br>MAGAZYN?</div>`);
  const scr = e.querySelector(".scr"), v = e.querySelector(".v"), m = e.querySelector(".m"), leds = [...e.querySelectorAll(".led")], port = e.querySelector(".port");
  return (t, a, z, stopAt = 1e9, portAt = 1e9) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    const s = spring(t - a, 2.2, .55); e.style.transform = `scale(${mix(.7, 1, s).toFixed(4)})`;
    const stop = t >= stopAt, blink = Math.floor((t - stopAt) * 3) % 2 === 0;
    scr.className = "scr" + (stop ? " bad" : ""); v.textContent = stop ? "0,0 kW" : "3,8 kW"; m.textContent = stop ? "WYŁĄCZONY" : "PRACA";
    leds.forEach((l, i) => { l.className = `led l${i + 1}` + (stop ? (i === 2 && blink ? " r" : "") : (i < 2 ? " g" : "")); });
    if (stop) e.style.transform += ` translateX(${shake(t, stopAt, 14).toFixed(1)}px)`;
    port.style.opacity = t >= portAt ? 1 : 0;
    if (t >= portAt) port.style.transform = `scale(${mix(.5, 1, outBack(clamp((t - portAt) / .3), 2.2)).toFixed(3)})`;
  };
}
// magazyn energii: paski ładują się od a do full
function ozBattery(parent) {
  const e = el(parent, "oz-bat", `<div class="cap"></div><div class="body">${[0, 1, 2, 3, 4].map(i => `<div class="bar" style="bottom:${34 + i * 110}px"></div>`).join("")}<div class="bolt">⚡</div></div>`);
  const bars = [...e.querySelectorAll(".bar")], bolt = e.querySelector(".bolt");
  return (t, a, z, full) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    e.style.transform = `scale(${mix(.7, 1, spring(t - a, 2.2, .55)).toFixed(4)})`;
    const k = Math.floor(clamp((t - a - .15) / Math.max(.3, full - a - .15)) * 5.01);
    bars.forEach((b, i) => { b.style.opacity = i < k ? 1 : 0; });
    bolt.style.opacity = k >= 5 ? 1 : 0;
  };
}
// kroki 1-2-3: labels = ["FALOWNIK, MOC, WIEK", ...], times = [t1, t2, t3]
function ozSteps(parent, labels) {
  const e = el(parent, "oz-steps", labels.map((l, i) => `<div class="r"><i>${i + 1}</i>${l}</div>`).join(""));
  const rows = [...e.querySelectorAll(".r")];
  return (t, times, z) => {
    const on = t >= times[0] - .05 && t < z; e.style.opacity = on ? 1 : 0; if (!on) return;
    rows.forEach((r, i) => {
      const a = times[i], nx = times[i + 1] ?? 1e9;
      r.className = "r" + (t >= nx ? " done" : t >= a ? " on" : "");
      r.style.transform = t >= a && t < a + .4 ? `scale(${mix(.9, 1, spring(t - a, 2.6, .5)).toFixed(4)})` : "";
    });
  };
}
// plakietka (0 ZŁ, 16 000 ZŁ...)
function ozBadge(parent, html, top, cls = "") {
  const e = el(parent, "oz-badge " + cls, html); e.style.top = top + "px";
  return (t, a, z) => zsPop(e, t, a, z, "translateX(-50%)", .5);
}
// telefon: formularz (pola wpisują się, klik), potem „Wysłane”, potem połączenie przychodzące
function ozPhone(parent) {
  const e = el(parent, "oz-ph", `<div class="sc"><div class="f"><h4>Bezpłatny audyt instalacji</h4><p>Zostaw numer, oddzwonimy.</p>` +
    `<div class="in i1"><em>Imię</em><span></span></div><div class="in i2"><em>Telefon</em><span></span></div><div class="in i3"><em>Miejscowość</em><span></span></div>` +
    `<div class="btn">Wyślij</div><div class="ok">✓ Wysłane<br>Oddzwonimy</div></div>` +
    `<div class="call"><div class="who">Lokalny instalator</div><div class="st">połączenie przychodzące…</div><div class="av">👷</div><div class="ring"></div><div class="dec">✕</div><div class="acc">✆</div></div></div>`);
  const ins = [...e.querySelectorAll(".in")], txt = ["Marek", "600 *** ***", "Tarnów"], btn = e.querySelector(".btn"), ok = e.querySelector(".ok"), call = e.querySelector(".call"),
    av = e.querySelector(".call .av"), acc = e.querySelector(".call .acc"), ring = e.querySelector(".call .ring");
  const tap = el(parent, "oz-tap");
  return (t, a, z, sendAt, callAt) => {
    const on = t >= a && t < z; e.style.opacity = on ? 1 : 0; tap.style.opacity = 0; if (!on) return;
    e.style.transform = `translateY(${((1 - E.out4(clamp((t - a) / .25))) * 1400).toFixed(1)}px)`;
    const typeEnd = sendAt - .25, per = (typeEnd - a - .3) / 3;
    ins.forEach((f, i) => {
      const s0 = a + .3 + i * per, u = clamp((t - s0) / (per * .8));
      f.querySelector("span").textContent = txt[i].slice(0, Math.round(u * txt[i].length));
      f.className = `in i${i + 1}` + (t >= s0 && t < s0 + per ? " on" : "");
    });
    // stuknięcie w „Wyślij”
    if (t >= sendAt - .2 && t < sendAt + .25) {
      tap.style.left = "540px"; tap.style.top = (130 + 26 + btn.offsetTop + btn.offsetHeight / 2) + "px";  // .f = offsetParent przycisku
      tap.style.opacity = 1 - clamp((t - sendAt) / .25); tap.style.transform = `scale(${mix(1.3, .8, clamp((t - sendAt + .2) / .3)).toFixed(3)})`;
    }
    btn.style.transform = t >= sendAt && t < sendAt + .15 ? "scale(.95)" : "";
    ok.style.opacity = t >= sendAt + .1 ? 1 : 0;
    if (t >= sendAt + .1) ok.style.transform = `scale(${mix(.6, 1, outBack(clamp((t - sendAt - .1) / .3), 2.2)).toFixed(3)})`;
    call.style.opacity = t >= callAt ? 1 : 0;
    if (t >= callAt) { const u = ((t - callAt) * 1.4) % 1; ring.style.transform = `scale(${mix(1, 1.9, u).toFixed(3)})`; ring.style.opacity = (1 - u).toFixed(3);
      acc.style.transform = `scale(${(1 + .08 * Math.sin((t - callAt) * 9)).toFixed(3)})`; av.style.transform = `rotate(${(Math.sin((t - callAt) * 24) * 6).toFixed(1)}deg)`;
      e.style.transform += ` translateX(${(Math.sin((t - callAt) * 40) * (Math.floor((t - callAt) * 2) % 2 ? 0 : 6)).toFixed(1)}px)`; }
  };
}
