"use strict";
// PAKIET 3 Go4Driver (2026-10-25): rolki DLA FIRM, wielojęzyczne. Obraz bez języka i kraju (uwaga klienta 2026-10-20):
// lektor z offu, ujęcia AI bez mówienia, grafiki kodem z tekstem z REEL.tx (plik językowy), napisy liczone z głosu.
// Nowy język = nowy głos + REEL.tx + render, bez nowych ujęć. Bez nazw i logo innych portali.
// Potrzebuje c4y.js, g4s.js (G4.shots, G4.end, G4.keyAt), timing.js, reel.js (window.REEL).
const R = window.REEL, TX = R.tx;
const G4F = {};

// kotwica czasu niezależna od języka: "b2" start linii, "b2+.5" 50% linii, "b2@3" 4. słowo, "b2>" koniec linii, "~-.1" przesunięcie (s)
G4F.at = a => {
  if (typeof a === "number") return a;
  const [s, off] = String(a).split("~");
  const m = /^([a-z]\w*?)(?:\+([\d.]+)|@(\d+)|(>))?$/.exec(s);
  if (!m) throw new Error("kotwica: " + a);
  const w = LN(m[1]).words, a0 = w[0].t, z = w[w.length - 1].e;
  const t = m[2] ? a0 + (+m[2]) * (z - a0) : m[3] ? w[Math.min(+m[3], w.length - 1)].t : m[4] ? z : a0;
  return t + (+(off || 0));
};

// ujęcie AI (klatki clips/<clip>): ruch kamery z0 -> z1 i przesunięcie dx/dy, gdy ujęcie dłuższe niż klip = zwolnienie, nie pętla
G4F.clip = (c, o) => {
  const L = el(c, "layer clipl", `<canvas width="1080" height="1920"></canvas>`); el(L, "shade");
  if (o.ai) el(L, "aitag", "AI");  // znaczek AI na ujęciu z postacią (wiedza/feedback-znaczek-ai.md)
  const ctx = L.querySelector("canvas").getContext("2d"), fr = useClip(o.clip);
  L.draw = (t, t0, t1) => {
    const n = fr.length; if (!n) return;
    const skip = o.skip || 0, len = n / 30 - skip, span = Math.max(.3, t1 - t0), sp = Math.min(1, len / (span + .3));
    const im = fr[Math.min(n - 1, Math.max(0, Math.round((skip + (t - t0) * sp) * 30)))];
    if (!im || !im.complete || !im.naturalWidth) return;
    const u = E.io(clamp((t - t0) / span)), [z0, z1] = o.z || [1.03, 1.1];
    const z = mix(z0, z1, u), sw = 1080 * z, sh = 1920 * z, k = Math.max(sw / im.naturalWidth, sh / im.naturalHeight);
    const w = im.naturalWidth * k, h = im.naturalHeight * k;
    ctx.drawImage(im, 540 - w / 2 + mix(0, o.dx || 0, u) + (o.fx || 0), 960 - h / 2 + mix(0, o.dy || 0, u) + (o.fy || 0), w, h);
  };
  return L;
};

// karta oferty Go4Driver (tekst z TX.card): wiersze wskakują po kolei od t0
G4F.card = (c, d) => {
  const L = el(c, "layer dark gcard", `<div class="card" style="top:${d.top || 360}px">
    <div class="lg"><span>Go<b>4</b>Driver</span><small>${d.ex || ""}</small></div>
    <div class="job">${d.job}</div><div class="where">${d.where || ""}</div>
    <div class="ftags">${d.tags.map(x => `<i>${x}</i>`).join("")}</div>
    <div class="pay on">${d.pay}</div></div>`);
  const parts = [...L.querySelectorAll(".job, .where, .ftags i, .pay")];
  L.upd = (t, t0, hi = []) => parts.forEach((p, i) => {
    const ti = t0 + .12 + i * (d.step || .22);
    if (t >= ti) rise(p, t, ti, 30, .3); else p.style.opacity = 0;
    p.classList.toggle("hi", hi.some(([k, th]) => k === i && t >= th));
  });
  return L;
};

// filtry: kierowca klika chipy (TX.filters), szare oferty znikają, zostaje jedna: Twoja (TX.yours)
G4F.filters = (c, d) => {
  const L = el(c, "layer dark gfil", `<div class="fl">${d.label || ""}</div><div class="chips">${d.chips.map(x => `<i>${x}</i>`).join("")}</div>
    <div class="list">${Array.from({ length: 5 }, (_, i) => `<div class="gh${i === 2 ? " me" : ""}"><u></u><u></u>${i === 2 ? `<b>${d.yours}</b><span>${d.yoursSub || ""}</span>` : ""}</div>`).join("")}</div>`);
  const ch = [...L.querySelectorAll(".chips i")], gh = [...L.querySelectorAll(".gh")], me = L.querySelector(".me");
  const tap = el(L, "tap"), rip = el(L, "rip");
  L.upd = (t, times) => {
    ch.forEach((e, i) => e.classList.toggle("on", t >= times[i]));
    const k = times.filter(x => t >= x).length, last = times[k - 1];
    gh.forEach((g, i) => {
      if (g === me) return;
      const out = [0, 4, 1, 3].indexOf(i) < k;  // każde kliknięcie gasi jedną szarą ofertę
      g.style.opacity = out ? Math.max(0, 1 - (t - times[[0, 4, 1, 3].indexOf(i)]) / .25) : 1;
    });
    if (k >= times.length) { me.classList.add("on"); pop(me, t, times[times.length - 1] + .1, .92, 3, .55); } else { me.classList.remove("on"); me.style.transform = "none"; me.style.opacity = 1; }
    // palec na chipie
    const j = times.findIndex(x => t >= x - .35 && t < x + .5);
    if (j >= 0) {
      const r = ch[j].getBoundingClientRect(), b = L.getBoundingClientRect(), sx = 1080 / b.width;
      const x = (r.left - b.left + r.width / 2) * sx, y = (r.top - b.top + r.height / 2) * sx, tt = times[j];
      [tap, rip].forEach(e => { e.style.left = x + "px"; e.style.top = y + "px"; });
      tap.style.opacity = clamp((t - tt + .35) / .1) * (1 - P(t, tt + .25, tt + .5));
      if (t >= tt) { const u = (t - tt) / .5; rip.style.opacity = 1 - u; rip.style.transform = `scale(${1 + u * 2.4})`; } else rip.style.opacity = 0;
    } else { tap.style.opacity = 0; rip.style.opacity = 0; }
    void last;
  };
  return L;
};

// dodanie oferty w 3 krokach (TX.steps), każdy krok odhacza się w swoim czasie
G4F.steps = (c, d) => {
  const L = el(c, "layer dark gsteps", `<div class="lg2">Go<b>4</b>Driver</div><div class="stl">${d.title || ""}</div>
    <div class="sts">${d.items.map((x, i) => `<div class="st"><em>${i + 1}</em><span>${x}</span><i>✓</i></div>`).join("")}</div>`);
  const st = [...L.querySelectorAll(".st")];
  L.upd = (t, times) => st.forEach((s, i) => {
    if (t >= times[i] - .25) rise(s, t, times[i] - .25, 40, .3); else s.style.opacity = 0;
    s.classList.toggle("on", t >= times[i] + .35);
  });
  return L;
};

// duży tekst kinetyczny: wiersze (html, <b> = limonka) wskakują w swoich czasach
G4F.kin = (c, d) => {
  const L = el(c, "layer dark gkin", d.rows.map(x => `<div class="kr">${x}</div>`).join(""));
  const rows = [...L.querySelectorAll(".kr")];
  L.style.setProperty("--top", (d.top || 640) + "px");
  L.upd = (t, times) => rows.forEach((r, i) => { if (t >= times[i]) pop(r, t, times[i], .7, 2.6, .6); else r.style.opacity = 0; });
  return L;
};

// porównanie: ogólnikowe ogłoszenie bez marki (szare, gaśnie) nad konkretną kartą Go4Driver
G4F.compare = (c, d) => {
  const L = el(c, "layer dark gcmp", `<div class="vg"><div class="vt">${d.vague.title}</div>${d.vague.rows.map(x => `<div class="vr">${x}</div>`).join("")}<div class="vx"></div></div>`);
  const vg = L.querySelector(".vg"), x = L.querySelector(".vx");
  const cd = d.card ? G4F.card(L, Object.assign({ top: 700, step: .12 }, d.card)) : null;  // bez karty = samo ogólnikowe ogłoszenie
  if (cd) { cd.classList.remove("layer", "dark", "gcard"); cd.classList.add("inner"); }
  L.upd = (t, tA, tB) => {
    if (t >= tA) rise(vg, t, tA, 40, .3); else vg.style.opacity = 0;
    x.style.opacity = t >= tB - .1 ? 1 : 0; x.style.transform = `scaleX(${P(t, tB - .1, tB + .15).toFixed(3)})`;
    const f = t >= tB ? `grayscale(1) opacity(${mix(1, .45, P(t, tB, tB + .4)).toFixed(3)})` : "none";
    vg.querySelectorAll(".vt, .vr").forEach(e => { e.style.filter = f; });
    if (cd) { cd.style.opacity = t >= tB ? 1 : 0; cd.upd(t, tB); }
  };
  return L;
};

// napisy z głosu: nazwa marki jako jedno słowo (Go4Driver), cięcie na interpunkcji, frazy dzielone równo po maks. R.capn słów
// (4 słowa = 2 + 2, nie 3 + 1), bez kończenia napisu krótkim słowem; pierwszy napis od klatki 0; słowa z R.keys na limonkowo
G4F.caps = (c, calm) => {
  const K = (R.keys || []).map(norm), groups = [], N = R.capn || 3;
  T.lines.forEach(l => {
    const ws = [];
    l.words.forEach(w => {  // „Go For Driver” -> jedno słowo „Go4Driver”
      const p = ws[ws.length - 1], pp = ws[ws.length - 2];
      if (/^driver/i.test(w.w) && p && /^for$/i.test(p.w) && pp && /^go$/i.test(pp.w)) { ws.splice(-2, 2, { w: "Go4Driver" + w.w.slice(6), t: pp.t, e: w.e }); }
      else ws.push({ ...w });
    });
    const phrases = []; let ph = [];
    ws.forEach((w, i) => { ph.push(w); if (/[,.?!:;]$/.test(w.w) || i === ws.length - 1) { phrases.push(ph); ph = []; } });
    // fraza mieści się w 2 linijkach (do ok. 22 znaków, maks. N+1 słów) = jeden napis; dłuższa = równe kawałki po znakach,
    // granica nigdy po krótkim słowie („o”, „i”, „w”, „na”), krótkie słowo idzie z następnym
    const len = g => g.reduce((n, w) => n + w.w.length + 1, -1);
    phrases.forEach(ph => {
      if (len(ph) <= 22 && ph.length <= N + 1) { groups.push(ph); return; }
      const k = Math.ceil(len(ph) / 20), per = len(ph) / k;
      let g = [];
      ph.forEach((w, i) => {
        g.push(w);
        const rest = ph.length - 1 - i, short = norm(w.w).length <= 2 || (ph[i + 1] && norm(ph[i + 1].w) === "sie");
        if (rest && !short && (len(g) >= per - 2 || g.length >= N) && groups.length < 999) { groups.push(g); g = []; }
      });
      if (g.length) { const last = groups[groups.length - 1]; if (g.length === 1 && last && len(last) + len(g) < 24) last.push(...g); else groups.push(g); }
    });
  });
  const clean = s => s.replace(/[,.:;]+$/, "");
  const els = groups.map((g, i) => {
    const html = g.map(w => K.some(k => k && norm(w.w).startsWith(k)) ? `<span class="k">${clean(w.w)}</span>` : clean(w.w)).join(" ");
    const e = el(c, calm ? "ccap" : "cap", calm ? `<span>${html}</span>` : html);
    const nx = groups[i + 1];
    e.a = i === 0 ? 0 : g[0].t; e.z = nx ? Math.min(nx[0].t, g[g.length - 1].e + .7) : g[g.length - 1].e + .35;
    return e;
  });
  if (calm) return (t, stop = 1e9) => els.forEach(e => { if (t >= e.a - .05 && t < e.z && t < stop) { const u = e.a === 0 ? 1 : E.out(clamp((t - e.a + .05) / .25)), v = clamp((e.z - t) / .15);
    e.style.opacity = Math.min(u, v); e.style.transform = `translateY(${((1 - u) * 14).toFixed(1)}px)`; } else e.style.opacity = 0; });
  return (t, stop = 1e9) => els.forEach(e => { if (t >= e.a && t < e.z && t < stop) { if (e.a === 0) { e.style.opacity = 1; e.style.transform = "none"; } else pop(e, t, e.a, .78, 3.2, .6); } else e.style.opacity = 0; });
};

// tło grafik: rozmyty, przyciemniony B-roll (R.bg = nazwa klipu), zamiast płaskiego tła; jeden wspólny dla wszystkich grafik
G4F.bgLayer = (L, clip) => {
  const cv = document.createElement("canvas"); cv.width = 270; cv.height = 480; cv.className = "gbg";
  L.insertBefore(cv, L.firstChild);
  const ctx = cv.getContext("2d"), fr = useClip(clip);
  return t => { const n = fr.length; if (!n) return; const i = Math.floor(t * 30) % (2 * n - 2), im = fr[i < n ? i : 2 * n - 2 - i];
    cv.style.transform = `scale(${(1.04 + .06 * ((t / 9) % 1)).toFixed(4)})`;
    if (im && im.complete && im.naturalWidth) ctx.drawImage(im, 0, 0, 270, 480); };
};

// cała rolka z REEL: layers {id: {kind, ...}}, shots [[kotwica, id, {from|fade, ...}]], hook (napis na klatce 0), end {at, sub, cta}
G4F.build = () => {
  const DUR = T.DUR;
  const SHOTS = R.shots.map(([a, id, o]) => [Math.max(0, G4F.at(a)), id, Object.assign({}, o || {})]);
  const tEnd = G4F.at(R.end.at);
  SHOTS.push([tEnd, "end", { from: 1 }]);
  SHOTS[0][0] = 0;
  const span = i => [SHOTS[i][0], SHOTS[i + 1] ? SHOTS[i + 1][0] : DUR];
  const times = arr => (arr || []).map(G4F.at);
  scene(0, DUR + 1, c => {
    const L = {};
    Object.entries(R.layers).forEach(([id, d]) => {
      if (d.kind === "clip") L[id] = G4F.clip(c, d);
      else L[id] = G4F[d.kind](c, Object.assign({}, d, TX[d.tx || id] || {}));
      L[id].def = d;
      if (R.bg && d.kind !== "clip") L[id].bgd = G4F.bgLayer(L[id], R.bg);
    });
    L.end = G4.end(c, TX.endSub, TX.endCta);
    if (R.bg) L.end.bgd = G4F.bgLayer(L.end, R.bg);  // plansza końcowa na tym samym rozmytym tle co grafiki
    const capbox = el(c, "capbox");
    const caps = G4F.caps(capbox, R.calm);
    const hook = R.hook ? at(el(c, "hook", R.hook), null, 170) : null;
    const bar = R.bar ? el(c, "label gbar", `<i></i>${R.bar}`) : null;  // stały pasek z wołaniem adresata (tekst z pliku językowego)
    const tHookOut = SHOTS[1] ? SHOTS[1][0] : 2;
    const shots = G4.shots(L, SHOTS);
    G4.whooshes(SHOTS);
    (R.sfx || []).forEach(([n, a, g]) => sfx(n, G4F.at(a), g));
    sfx("IMP_SOFT", tEnd, -8);
    const T_ = {};  // czasy animacji grafik, liczone raz
    Object.entries(R.layers).forEach(([id, d]) => { T_[id] = times(d.times); });
    return (lt, t) => {
      const s = shots(t);
      [s.i, s.i - 1].forEach(i => {
        if (i < 0) return;
        const id = SHOTS[i][1], lay = L[id]; if (!lay || !lay.def || lay.def.kind !== "clip") return;
        if (i === s.i || (s.prev === id)) { const [a, z] = span(i); lay.draw(t, a, z); }
      });
      Object.entries(L).forEach(([id, lay]) => {
        if (!lay.def || lay.def.kind === "clip") return;
        if (lay.bgd && (s.cur === id || s.prev === id)) lay.bgd(t);
        const k = lay.def.kind, tt = T_[id];
        if (k === "card") lay.upd(t, tt[0] ?? 0, (lay.def.hi || []).map(([j, a]) => [j, G4F.at(a)]));
        else if (k === "compare") lay.upd(t, tt[0], tt[1]);
        else lay.upd(t, tt);
      });
      if (L.end.bgd && t >= tEnd - .3) L.end.bgd(t);
      L.end.upd(t, tEnd);
      caps(t, tEnd);
      if (bar) bar.style.opacity = t < tEnd ? 1 : 0;
      if (hook) { if (t < tHookOut) { hook.style.opacity = 1; hook.style.transform = "translateX(-50%)"; } else hook.style.opacity = clamp(1 - (t - tHookOut) / .2); }
    };
  }, { push: 0, cut: true });
};
