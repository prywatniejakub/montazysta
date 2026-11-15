"use strict";
// helpers of the Kuba Proof / Chat reels (need engine.js + pixel.js)
function kbFooter(color = "#e9e9e9") {
  const f = el(document.getElementById("scenes"), "div", "kb-foot");
  pxBlock(f, 50); pxText(f, "KUBA BUILDS AI", 4, color);
  return f;
}
// a window with a title bar; returns the element with .body
function win(parent, w, h, title) { const e = box(parent, "win", w, h, `<div class="bar"><i></i><i></i><i></i><b>${title}</b></div><div class="body"></div>`); e.body = e.querySelector(".body"); return e; }
// code that types itself: lines = array of html strings (spans for colours); reveal chars between t0 and t1
function codeBox(parent, lines) {
  const c = el(parent, "div", "code");
  const plain = lines.map(l => l.replace(/<[^>]*>/g, ""));
  const total = plain.reduce((a, l) => a + l.length + 1, 0);
  c.show = (t, t0, t1, cursor = true) => {
    const n = Math.floor(total * clamp((t - t0) / Math.max(.01, t1 - t0)));
    let left = n, html = "";
    for (let i = 0; i < lines.length; i++) {
      if (left <= 0) break;
      const take = Math.min(left, plain[i].length);
      html += (i ? "\n" : "") + clipHtml(lines[i], take);
      left -= plain[i].length + 1;
    }
    const blink = cursor && (Math.floor(t * 2.2) % 2 === 0 || n < total);
    c.innerHTML = html + (blink ? '<span class="cur"></span>' : "");
  };
  return c;
}
// keep the first n visible characters of an html string (tags are kept)
function clipHtml(h, n) {
  let out = "", seen = 0, i = 0;
  while (i < h.length && seen < n) {
    if (h[i] === "<") { const j = h.indexOf(">", i); out += h.slice(i, j + 1); i = j + 1; continue; }
    out += h[i]; seen++; i++;
  }
  const open = (out.match(/<span/g) || []).length - (out.match(/<\/span>/g) || []).length;
  return out + "</span>".repeat(Math.max(0, open));
}
// text that types itself into an element
function typeInto(e, text, t, t0, cps = 28) { const n = Math.max(0, Math.floor((t - t0) * cps)); e.textContent = text.slice(0, n); return n >= text.length; }
// slide + fade in (spring) at a, out at z
function inOut(e, t, a, z, dy = 60, f = 1.6) {
  if (t < a - .01 || (z != null && t > z + .01)) { e.style.opacity = 0; return 0; }
  const s = spring(t - a, f, .6), o = z != null ? P(t, z - .2, z, E.inCubic) : 0;
  e.style.opacity = clamp((t - a) / .12) * (1 - o);
  return { s, o, y: (1 - clamp(s)) * dy - o * 30 };
}
const ICO = {
  sheet: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9h17M3.5 14.5h17M9 3.5v17"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  report: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7M9 8h3"/>',
  invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  wand: '<path d="M4 20L16 8M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.6 1.2 1.2.6-1.2.6-.6 1.2-.6-1.2-1.2-.6 1.2-.6z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 7.8L20 18M8.2 16.2L20 6"/>',
  text: '<path d="M4 6V4h16v2M12 4v16M9 20h6"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
};
