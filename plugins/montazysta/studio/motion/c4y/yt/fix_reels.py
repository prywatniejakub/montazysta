"""2026-09-30 corrections (user): only the site's example reels (clips cNN from clips4you/site/media/c), no captions of mine
over reels that already have captions, honest wording (new brand, experienced team; example reels, not client work)."""
import os, re
YT = os.path.dirname(os.path.abspath(__file__)); C4Y = os.path.dirname(YT)
MAP = {"ico1": "c06", "sa01": "c01", "yomi1": "c07", "sa02": "c08", "ico2": "c10", "banana": "c09", "sa03": "c11", "pointab": "c12"}
ALL = ["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12", "c02", "c03", "c04", "c05", "c13", "c14", "c15", "c16", "c17"]
ALLJS = "[" + ", ".join(f'"{c}"' for c in ALL) + "]"


def edit(rel, pairs=(), regex=()):
    p = os.path.join(C4Y, rel); s = open(p, encoding="utf-8").read(); s0 = s
    for a, b in pairs:
        if a not in s:
            print("!! not found", rel, "::", a[:70]); continue
        s = s.replace(a, b)
    for a, b in regex:
        s = re.sub(a, b, s)
    if s != s0:
        open(p, "w", encoding="utf-8").write(s)
    print("ok", rel)


def remap(s):
    s = re.sub(r'const REELS = \[[^\]]*\];', f"const REELS = {ALLJS};", s)
    for a, b in MAP.items():
        s = re.sub(r'(["\'])' + a + r'/1', r'/1' + b + r'/1', s)
    return s


# specific edits BEFORE the global remap (they match old names)
edit("yt/f1/sc2.js", [
    ('const ph = phone4(e, 1300, 600, 300, "sa02"); const cp = cap4(ph, "Ile to <b>kosztuje?</b>", 90, 34);', 'const ph = phone4(e, 1300, 600, 300, "sa02");'),
    ('const ph = phone4(cam, 0, 70, 330, "sa01"); ph.style.opacity = 0; const cp = cap4(ph, "Ile to <b>naprawdę</b> kosztuje?", 70, 36);', 'const ph = phone4(cam, 0, 70, 330, "sa01"); ph.style.opacity = 0; const cp = el(ph, "div", "");'),
    ('const ph = phone4(cam, 260, 80, 380, "pointab"); const words4 = ["Z", "godziny", "rozmowy", "robimy", "30", "rolek"];\n  const cp = cap4(ph, words4.map((w, i) => `<span class="w4" style="opacity:0">${i === 4 || i === 5 ? `<b>${w}</b>` : w}</span>`).join(" "), 470, 40); const cw4 = [...cp.querySelectorAll(".w4")];',
     'const ph = phone4(cam, 260, 80, 380, "pointab"); const cp = el(ph, "div", ""), cw4 = [];'),
    ('ph.draw(lt, { zoom: 1 + .35 * Math.sin(P(t, tZ - .05, tZ + .7, ioc) * Math.PI) * 0 + .35 * P(t, tZ - .05, tZ + .35, ioe) * (1 - P(t, tMu, tMu + .5, ioe) * .7) });',
     'const tN = W("c2", "napisy"); ph.draw(lt, { zoom: mix(1.9, 1.0, P(t, tN - .05, tN + .6, ioe)) + .3 * P(t, tZ - .05, tZ + .3, ioe) * (1 - P(t, tMu, tMu + .5, ioe)), cy: .5 });  // raw centre crop -> the edited reel with its captions'),
    ('const h = HX(e, "Na [prawdziwych] [rolkach]", 130, 92, [W("c3", "tak"), W("c3", "prawdz"), W("c3", "rolkach")]);', 'const h = HX(e, "[Gotowe] [rolki]", 130, 100, [W("c3", "gotowe"), W("c3", "rolki")]);'),
])
edit("yt/f1/sc3.js", [
    ('`<div style="font:900 40px var(--d)">Rolka 7 z 30</div><div style="font:600 26px/1.4 var(--b);color:#6b6b74;margin-top:10px">„Tak pracuje maszyna”<br>0:31 · napisy · muzyka · okładka</div>`',
     '`<div style="font:900 40px var(--d)">Rolka 7 z 30</div><div style="font:600 26px/1.4 var(--b);color:#6b6b74;margin-top:10px">„Łazienka 4 m² w 9 dni”<br>0:31 · napisy · muzyka · okładka</div>`'),
    ('const fly = phone4(cam, 420, 60, 240, "sa02"); const flyCap = cap4(fly, "Dlaczego <b>my?</b>", 70, 28);', 'const fly = phone4(cam, 420, 60, 240, "sa02");'),
    ('const big = phone4(cam, 380, 90, 340, "sa02"); const bigCap = cap4(big, "Dlaczego warto wybrać <b>właśnie nas?</b>", 80, 32); big.style.opacity = 0;',
     'const big = phone4(cam, 380, 90, 340, "sa02"); const bigCap = cap4(big, "Dlaczego warto wybrać <b>właśnie nas?</b>", 80, 32); big.style.opacity = 0;  // centre crop hides the example reel\'s own captions'),
    ('fly.draw(lt);', 'fly.draw(lt, { zoom: 1.7, cy: .5 });'),
    ('big.draw(lt);', 'big.draw(lt, { zoom: 1.7, cy: .5 });'),
])
edit("yt/f3/sc1.js", [
    ('[["Tydzień 1", "sa02", "Ile to <b>kosztuje?</b>", W("b2", "trafia")], ["Tydzień 2", "ico2", "Tak to <b>robimy</b>", W("b2", "pokaz")], ["Tydzień 3", "pointab", "Ile to <b>trwa?</b>", W("b2", "mówisz")]]',
     '[["Tydzień 1", "sa02", "", W("b2", "trafia")], ["Tydzień 2", "ico2", "", W("b2", "pokaz")], ["Tydzień 3", "c02", "", W("b2", "mówisz")]]'),
    ('const p = phone4(cam, -560 + k * 380, 110, 280, n); cap4(p, cp, 60, 30);', 'const p = phone4(cam, -560 + k * 380, 110, 280, n);'),
])
# the shared ending: honest "kim jesteśmy" + example reels, no views badge
edit("lib/c4yend.js", [
    ('const WALL = ["ico1", "sa01", "yomi1", "sa02", "ico2", "banana", "sa03", "pointab"];', f"const WALL = {ALLJS};"),
    ('const h = HX(e, "Kim [jesteśmy?]", 130, 100, [W("e1", "kim"), W("e1", "jesteś")]);',
     'const h = HX(e, "Nowa marka. [Doświadczony zespół.]", 130, 90, [W("e1", "clips"), W("e1", "nowa"), W("e1", "ale"), W("e1", "nowi"), W("e1", "ludzie")]);'),
    ('const lg = logo4(cam, 0, -40, 110);', 'const lg = logo4(cam, 0, -40, 110); const nb4 = yp(cam, "nowa marka, 2026", 0, 70, "w sm");'),
    ('`<div style="font:900 130px/1 var(--d);letter-spacing:-.05em"><span class="num a">0</span> lat</div><div style="font:700 28px var(--b);color:#6b6b74;margin-top:8px">w reklamie internetowej</div>`',
     '`<div style="font:900 130px/1 var(--d);letter-spacing:-.05em"><span class="num a">0</span>+ lat</div><div style="font:700 28px var(--b);color:#6b6b74;margin-top:8px;text-align:center">doświadczenia zespołu<br>w reklamie internetowej</div>`'),
    ('`<div style="font:900 130px/1 var(--d);letter-spacing:-.05em"><span class="num b">0</span>+</div><div style="font:700 28px var(--b);color:#6b6b74;margin-top:8px">firm, dla których robiliśmy reklamy</div>`',
     '`<div style="font:900 130px/1 var(--d);letter-spacing:-.05em"><span class="num b">0</span>+</div><div style="font:700 28px var(--b);color:#6b6b74;margin-top:8px;text-align:center">firm, dla których<br>zespół robił reklamy</div>`'),
    ('const A = bcard(cam, -330, 210, 520, 260,', 'const A = bcard(cam, -330, 230, 520, 290,'),
    ('const B = bcard(cam, 330, 210, 520, 260,', 'const B = bcard(cam, 330, 230, 520, 290,'),
    ('t7 = W("e1", "siedem"), t150 = W("e1", "sto");', 't7 = W("e1", "siedm"), t150 = W("e1", "stu");'),
    ('const l = P(t, E1 - .2, E1 + .5, ioe), up = P(t, t7 - .4, t7 + .2, ioe); lg.style.opacity = l; lg.style.transform = `translateY(${-up * 60}px) scale(${mix(1.25, .9, up)})`;',
     'const l = P(t, E1 - .2, E1 + .5, ioe), up = P(t, t7 - .4, t7 + .2, ioe); lg.style.opacity = l; lg.style.transform = `translateY(${-up * 90}px) scale(${mix(1.25, .9, up)})`; inout(nb4, t, W("e1", "nowa") - .1, t7 - .3, { pop: true });'),
    ('const h = HX(e, "Te rolki zrobiliśmy [my]", 130, 96, [W("e2", "te"), W("e2", "rolki"), W("e2", "zrobil"), W("e2", "my")]);',
     'const h = HX(e, "Tak mogą wyglądać [Twoje rolki]", 130, 92, [W("e2", "tak"), W("e2", "mogą"), W("e2", "wygląd"), W("e2", "twoje"), W("e2", "rolki")]);'),
    ('    const tag = yp(cam, `${ico(IK.eye)}8,7 tys. wyświetleń na YouTube`, 0, 500, "w");\n', ''),
    ('      inout(tag, t, E2 + .5, 1e9, { pop: true });\n', ''),
])
edit("lib/c4yfilm.py", [
    ('("e1", "Kim jesteśmy? Za nami siedem lat w reklamie internetowej i ponad sto pięćdziesiąt firm, dla których robiliśmy reklamy."),',
     '("e1", "Kim jesteśmy? Clips4you to nowa marka, ale nie nowi ludzie. Nasz zespół od ponad siedmiu lat robi reklamy w internecie, dla ponad stu pięćdziesięciu firm."),'),
    ('("e2", "Te rolki zrobiliśmy my."),', '("e2", "Tak mogą wyglądać Twoje rolki."),'),
])
edit("yt/f1/script.py", [('("c3", "Tak to wygląda na prawdziwych rolkach.")', '("c3", "Tak wyglądają gotowe rolki.")')])

# global remap of reel names in every film file + thumbnails
for rel in ["yt/f1/sc1.js", "yt/f1/sc2.js", "yt/f1/sc3.js", "yt/f2/sc1.js", "yt/f2/sc2.js", "yt/f3/sc1.js", "yt/f3/sc2.js",
            "yt/f1/f1.html", "yt/f2/f2.html", "yt/f3/f3.html", "yt/f1/thumb/thumb.html", "yt/f2/thumb/thumb.html", "yt/f3/thumb/thumb.html"]:
    p = os.path.join(C4Y, rel); s = open(p, encoding="utf-8").read(); s2 = remap(s)
    s2 = re.sub(r'\["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12"\]\.forEach\(n => clipImgs', ALLJS + '.forEach(n => clipImgs', s2)
    s2 = s2.replace('const R = ["c06", "c01", "c07", "c08", "c10", "c09", "c11", "c12"]', "const R = " + ALLJS)
    if s2 != s:
        open(p, "w", encoding="utf-8").write(s2)
    left = [n for n in MAP if re.search(r'["\']' + n + r'["\']', s2)]
    print("remap", rel, "left:", left)
