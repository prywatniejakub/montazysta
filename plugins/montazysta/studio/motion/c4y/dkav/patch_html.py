r"""Wstawia awatarkę UGC (pierwsze zdanie) do stron dk1/dk2/dk3: pierwsza scena = klatki <r>Ava (ava.js), bez haka tekstowego, napisy od t=0."""
import os, re
C4Y = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AVA_DRAW = """    if (k[0] === "ava") { const AVc = fr.ava || (fr.ava = useClip(window.AVA.clip)); premDraw(ctx, frameAt(AVc, t + window.AVA.shift), { z: (window.AVA.z || 1.2) + .06 * E.io(clamp(t / Math.max(1, len))), ax: .5, ay: (window.AVA.ay ?? .25) }); }
"""
R = {
    "dk1": [('  ["clip:dkWestaS", 0, tZob], ["clip:dkSew", tZob, S("b2")],', '  ["ava", 0, S("b2")],'),
            ("PR.off.push([0, S(\"b2\") - .05], [S(\"b6\") - .05, DUR + 1]);", "PR.off.push([S(\"b6\") - .05, DUR + 1]);"),
            ("  const hook = premHook(c, `Zobacz, gdzie<br>się je szyje`, 0, S(\"b2\") - .04);\n", "  const hook = () => {};\n")],
    "dk2": [('const CUTS = [["d2Drop", 0, S("b3")],', 'const CUTS = [["ava", 0, S("b2")], ["d2Drop", S("b2"), S("b3")],'),
            ("PR.off.push([0, S(\"b2\") - .05], ", "PR.off.push("),
            ("  const hook = premHook(c, `Rozlany sok<br>na fotelu?`, 0, S(\"b2\") - .04);\n", "  const hook = () => {};\n")],
    "dk3": [('const CUTS = [["d3g", 0, tZob], ["d3a", tZob, S("b2")],', 'const CUTS = [["ava", 0, S("b2")],'),
            ("PR.off.push([0, tZob - .05], ", "PR.off.push("),
            ("  const hook = premHook(c, `Krzesło Westa`, 0, tZob - .04);\n", "  const hook = () => {};\n")],
}
for r, reps in R.items():
    p = os.path.join(C4Y, r, r + ".html"); h = open(p, encoding="utf-8").read()
    if "window.AVA" in h: print(r, "już ma awatarkę"); continue
    for a, b in reps:
        assert a in h, (r, a[:60]); h = h.replace(a, b)
    h = h.replace('<script src="timing.js"></script>', '<script src="timing.js"></script>\n<script src="ava.js"></script>', 1)
    # rysowanie awatarki: przed pierwszym rozgałęzieniem rysowania kadru
    m = re.search(r"\n    (if|let prod|const k = )", h[h.index("return (lt, t) => {"):])
    anchor = h.index("ctx.fillStyle = \"#000\"; ctx.fillRect(0, 0, 1080, 1920);", h.index("return (lt, t) => {"))
    line_end = h.index("\n", anchor) + 1
    # k i len muszą już istnieć: wstawiamy po linii z wyliczeniem k (const k = CUTS.find...)
    kline = h.index("const k = CUTS.find", h.index("return (lt, t) => {")); kend = h.index("\n", kline) + 1
    ins_at = max(kend, line_end)
    h = h[:ins_at] + AVA_DRAW + h[ins_at:]
    # gałęzie rysujące inne sceny nie mogą rysować przy „ava”: pierwsza gałąź if -> else if
    h = h.replace(AVA_DRAW + "    if (", AVA_DRAW + "    else if (", 1)
    open(p, "w", encoding="utf-8").write(h); print(r, "OK")
