r"""4 style montażu tej samej rolki (kz2 „Nos ciągle zatkany?”) do wyboru przez użytkownika: A klinika czysto, B edytorski, C dokument, D karty ze szkła.
Projekt: wiedza/projekty/styl-rolek-klinika-2026-11-01.md. Głos, cięcia i klatki bierzemy z gotowej rolki motion/c4y/kz2 (bez ponownego cięcia).
Kolejność: html + audio + stills (arkusz) -> przegląd -> render.
    ..\..\..\runtime\python.exe styl.py A B C D prep      potem      ... render
"""
import os, sys, json, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(C4Y, "lib"))
import c4ykit

BAZA = "kz2"
MUZYKA = {"A": "aqua_clean.mp3", "B": "g4d_calm.mp3", "C": "story.mp3", "D": "steady.mp3"}
CFG = {"hi": r"^(drożności|nosa|sterydowe|konchoplastyki|małżowin|radiowych|znieczuleniu)", "odo": "s5", "lt": "s3",
       "ltn": "lek. Sebastian Pilkiewicz", "ltr": "otolaryngolog · KOLMED", "end": "Zatkany nos?",
       "hook": ["Nos ciągle", "zatkany?"], "label": "KOLMED · laryngologia"}


def prep(st):
    rid = "kzs" + st.lower(); out = os.path.join(C4Y, rid); src = os.path.join(C4Y, BAZA)
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(src):
        if f.startswith("vo_") or f in ("timing.js", "timing.json", "pieces.js", "logo2.png"):
            shutil.copy(os.path.join(src, f), out)
    shutil.copy(os.path.join(HERE, "logo_w.png"), out)
    cfg = dict(CFG)
    if st == "C": cfg["label"] = "KOLMED &nbsp;|&nbsp; laryngologia"
    html = open(os.path.join(HERE, "szablon-styl.html"), encoding="utf-8").read()
    html = html.replace("__STYLE__", st).replace("__RID__", rid).replace("__CFG__", json.dumps(cfg, ensure_ascii=False))
    open(os.path.join(out, rid + ".html"), "w", encoding="utf-8").write(html)
    return rid, out


if __name__ == "__main__":
    st = [a for a in sys.argv[1:] if a in "ABCD" and len(a) == 1]; kroki = [a for a in sys.argv[1:] if a not in st]
    for s in st:
        rid, out = prep(s)
        T = json.load(open(os.path.join(out, "timing.json"), encoding="utf-8"))
        if "stills" in kroki:
            L = {l["key"]: l for l in T["lines"]}
            lt = L["s3"]["slot"] + 1.4; odo = [w["t"] for w in L["s5"]["words"] if w["w"].startswith("około")][0] + 1.3
            tend = L["s5"]["words"][-1]["e"] + .42
            c4ykit.stills(out, rid, [.25, .9, 3.0, lt, L["s4"]["slot"] + .12, odo, tend + .5, T["DUR"] - .3])
        if "audio" in kroki: c4ykit.audio(out, rid, MUZYKA[s], bed=-27.0)
        if "render" in kroki: c4ykit.render(out, rid, workers=3)
