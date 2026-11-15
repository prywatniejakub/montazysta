"use strict";
// 5x7 pixel font + 12x12 pixel icons drawn on canvases (image-rendering: pixelated) — retro game UI without font files.
const PX_FONT = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"], B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."], D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"], F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"], H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."], J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"], L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"], N: ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"], R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."], T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."], X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."], Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."], 1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"], 3: ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."], 5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."], 7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."], 9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."], "#": [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."],
  "$": ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."], ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", "..#..", ".#..."], "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."], "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "/": [".....", "....#", "...#.", "..#..", ".#...", "#....", "....."], "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  "%": ["##...", "##..#", "...#.", "..#..", ".#...", "#..##", "...##"], ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "=": [".....", ".....", "#####", ".....", "#####", ".....", "....."], "@": [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".###."],
};
// width in font pixels of a string (5 per glyph + 1 gap, a space is 3)
function pxWidth(text) { let w = 0; for (const ch of text.toUpperCase()) w += (ch === " " ? 3 : 5) + 1; return Math.max(0, w - 1); }
// draw text with the classic 1-pixel drop shadow of the game UI
function pxDraw(ctx, text, x, y, s, color, shadow = "rgba(0,0,0,.85)") {
  const pass = (dx, dy, c) => {
    ctx.fillStyle = c; let cx = x;
    for (const ch of text.toUpperCase()) {
      if (ch === " ") { cx += 4 * s; continue; }
      const g = PX_FONT[ch]; if (g) g.forEach((row, ry) => { for (let rx = 0; rx < 5; rx++) if (row[rx] === "#") ctx.fillRect(cx + (rx + dx) * s, y + (ry + dy) * s, s, s); });
      cx += 6 * s;
    }
  };
  if (shadow) pass(1, 1, shadow);
  pass(0, 0, color);
}
// a canvas element with pixel text (s = size of one font pixel)
function pxText(parent, text, s, color, cls = "") {
  const cv = document.createElement("canvas"), w = (pxWidth(text) + 1) * s, h = 8 * s;
  cv.width = w; cv.height = h; cv.className = "px " + cls; cv.style.width = w + "px"; cv.style.height = h + "px";
  pxDraw(cv.getContext("2d"), text, 0, 0, s, color); parent.appendChild(cv); cv.set = (txt, col = color) => {
    const nw = (pxWidth(txt) + 1) * s; if (nw !== cv.width) { cv.width = nw; cv.style.width = nw + "px"; }
    const c = cv.getContext("2d"); c.clearRect(0, 0, cv.width, cv.height); pxDraw(c, txt, 0, 0, s, col);
  };
  return cv;
}

// 12x12 icons: letters index the palette, "." = empty
const PX_ICONS = {
  diamond: { p: { k: "#0b3b38", a: "#e8fffb", b: "#6ff0e0", c: "#1fb5a8" }, m: [
    "............", "...kkkkkk...", "..kaabbbbk..", ".kaabbbbbbk.", "kbbbbbbbbbck", ".kbbbbbbbck.", "..kbbbbbck..", "...kbbbck...", "....kbck....", ".....kk.....", "............", "............"] },
  emerald: { p: { k: "#0b3b1a", a: "#d9ffe0", b: "#41d96b", c: "#138a3a" }, m: [
    ".....kk.....", "....kabk....", "...kaabbk...", "..kaabbbck..", "..kabbbbck..", "..kbbbbbck..", "..kbbbbcck..", "..kbbbccck..", "...kbccck...", "....kcck....", ".....kk.....", "............"] },
  coin: { p: { k: "#5a3d00", a: "#fff3a6", b: "#f5c542", c: "#b8860b" }, m: [
    "....kkkk....", "..kkbbbbkk..", ".kbaabbbbck.", ".kabbcbbbck.", "kbabcccbbbck", "kbabbcbbbbck", "kbbbbcccbbck", "kbbbbbbcbbck", ".kbbbcccbck.", ".kcbbbcbbck.", "..kkccccckk.", "....kkkk...."] },
  book: { p: { k: "#2a0806", a: "#f2e6cf", b: "#b3261e", c: "#6e140f" }, m: [
    "............", ".kkkkkkkkk..", ".kbbbbbbbak.", ".kbccccbbak.", ".kbbbbbbbak.", ".kbccccbbak.", ".kbbbbbbbak.", ".kbbbbbbbak.", ".kbbbbbbbak.", ".kkkkkkkkak.", "..kaaaaaaak.", "...kkkkkkkk."] },
  phone: { p: { k: "#0e0f12", a: "#9fd8ff", b: "#2c2f36", c: "#ffffff" }, m: [
    "...kkkkkk...", "..kbbbbbbk..", "..kaaaaaak..", "..kaccaaak..", "..kaccaaak..", "..kaaaaaak..", "..kaaccaak..", "..kaaccaak..", "..kaaaaaak..", "..kbbbbbbk..", "..kbbccbbk..", "...kkkkkk..."] },
  reject: { p: { k: "#2a0000", r: "#ff4d4d" }, m: [
    "............", ".kk......kk.", ".krk....krk.", "..krk..krk..", "...krkkrk...", "....krrk....", "....krrk....", "...krkkrk...", "..krk..krk..", ".krk....krk.", ".kk......kk.", "............"] },
  chart: { p: { k: "#0a2a12", g: "#4cff7a", d: "#1b8a3c" }, m: [
    "..........kk", ".........kgk", "........kgk.", "...kk..kgk..", "..kgk.kgk...", ".kgkgkgk....", "kgk.kgk.....", "kk...k......", "............", "kkkkkkkkkkkk", "kddddddddddk", "kkkkkkkkkkkk"] },
  trophy: { p: { k: "#5a3d00", a: "#fff3a6", b: "#f5c542", c: "#b8860b" }, m: [
    ".kkkkkkkkkk.", "kbabbbbbbbck", "kbabbbbbbbck", ".kbabbbbbck.", "..kbbbbbck..", "...kbbbck...", "....kbck....", ".....kk.....", "....kbck....", "...kkbckk...", "..kbbbbbck..", "..kkkkkkkk.."] },
  plane: { p: { k: "#1a1f28", w: "#e8eef7" }, m: [
    ".....kk.....", "....kwwk....", "....kwwk....", "..kkkwwkkk..", ".kwwwwwwwwk.", "kwwwwwwwwwwk", ".kkkkwwkkkk.", "....kwwk....", "....kwwk....", "...kkwwkk...", "..kwwwwwwk..", "...kkkkkk..."] },
  clock: { p: { k: "#1b1b1b", w: "#f4f4f4" }, m: [
    "...kkkkkk...", "..kwwwwwwk..", ".kwwwkwwwwk.", "kwwwwkwwwwwk", "kwwwwkwwwwwk", "kwwwwkkkkwwk", "kwwwwwwwwwwk", "kwwwwwwwwwwk", ".kwwwwwwwwk.", "..kwwwwwwk..", "...kkkkkk...", "............"] },
  down: { p: { k: "#2a0000", r: "#ff4d4d" }, m: [
    "....kkkk....", "....krrk....", "....krrk....", "....krrk....", "....krrk....", ".kkkkrrkkkk.", "..krrrrrrk..", "...krrrrk...", "....krrk....", ".....kk.....", "............", "............"] },
  creeper: { p: { k: "#0b1f08", g: "#5ec94f", d: "#2f7a27" }, m: [
    "kkkkkkkkkkkk", "kgggdgggdggk", "kgkkggggkkgk", "kgkkggggkkgk", "kggggkkggggk", "kgggkkkkgggk", "kgggkkkkgggk", "kgggkggkgggk", "kgdggggggdgk", "kggggdggggdk", "kgdggggdgggk", "kkkkkkkkkkkk"] },
  villager: { p: { k: "#3b2718", s: "#c08a68", b: "#4a3020", e: "#ffffff", g: "#2f9e5b", n: "#a8704f", d: "#8a5a3c" }, m: [
    "..kkkkkkkk..", ".kssssssssk.", ".kssssssssk.", ".kbbbbbbbbk.", ".ksegssgesk.", ".kssssssssk.", ".ksssnnsssk.", ".ksssnnsssk.", ".ksssnnsssk.", ".ksdsnnsdsk.", ".kssssssssk.", "..kkkkkkkk.."] },
  house: { p: { k: "#2a160c", w: "#a0703a", r: "#7a3b2e", g: "#9fd8ff", d: "#5a3a1a" }, m: [
    ".....kk.....", "....krrk....", "...krrrrk...", "..krrrrrrk..", ".krrrrrrrrk.", "kkkkkkkkkkkk", ".kwwwwwwwwk.", ".kwggwwggwk.", ".kwggwwggwk.", ".kwwwddwwwk.", ".kwwwddwwwk.", ".kkkkkkkkkk."] },
  pickaxe: { p: { k: "#1b1b1b", p: "#6fe3e0", h: "#8a5a2b" }, m: [
    "..kkkkkkk...", ".kpppppppk..", "kppkkkkkppk.", "kpk.khk.kpk.", "kk..khk..kk.", "....khk.....", "....khk.....", "....khk.....", "....khk.....", "....khk.....", "....khk.....", ".....k......"] },
  wheat: { p: { k: "#2a2a10", y: "#e8c547", g: "#5fa83a" }, m: [
    "....k..k....", "...kyk.kyk..", "...kyk.kyk..", "..kyyk.kyyk.", "..kyk..kyk..", "...kg..kg...", "...kg..kg...", "....kg.kg...", "....kgkg....", ".....kg.....", ".....kg.....", ".....kk....."] },
  heart: { p: { k: "#2a0000", r: "#ff4d4d", a: "#ffb3b3" }, m: [
    "............", ".kkk...kkk..", "kraark.krrrk", "krarrrkrrrrk", "krrrrrrrrrrk", "krrrrrrrrrrk", ".krrrrrrrrk.", "..krrrrrrk..", "...krrrrk...", "....krrk....", ".....kk.....", "............"] },
};
function pxIcon(parent, name, s = 6, cls = "") {
  const ic = PX_ICONS[name], cv = document.createElement("canvas"); cv.width = cv.height = 12 * s; cv.className = "px " + cls;
  cv.style.width = cv.style.height = 12 * s + "px";
  const c = cv.getContext("2d"); ic.m.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") { c.fillStyle = ic.p[ch]; c.fillRect(x * s, y * s, s, s); } }));
  parent.appendChild(cv); return cv;
}
// isometric grass-ish block = the brand mark
function pxBlock(parent, size = 64) {
  const e = document.createElement("div"); e.className = "pxblock"; e.style.width = e.style.height = size + "px";
  e.innerHTML = `<svg viewBox="0 0 64 64" width="${size}" height="${size}" shape-rendering="crispEdges">
    <path d="M32 4 L60 18 L32 32 L4 18 Z" fill="#7ed957"/><path d="M4 18 L32 32 L32 60 L4 46 Z" fill="#8a5a2b"/><path d="M60 18 L32 32 L32 60 L60 46 Z" fill="#6b4420"/>
    <path d="M4 18 L32 32 L32 38 L4 24 Z" fill="#5fb23c"/><path d="M60 18 L32 32 L32 38 L60 24 Z" fill="#4a9a2e"/></svg>`;
  parent.appendChild(e); return e;
}
