r"""Lesson 1 in the SaaS film style (level 2: continuity transitions) — the SAME voice + timing as ../l1 (not re-voiced),
a new picture (l1s.html + l1s.js on ../lib/saas.js) and a new music bed (assets/music/saas_long.mp3).
  ..\..\..\runtime\python.exe script.py timing   /   script.py audio   /   script.py stills
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import longkit

NAME = "l1s"
SRC = os.path.join(HERE, "..", "l1")


def timing():
    T = json.load(open(os.path.join(SRC, "timing.json"), encoding="utf-8"))
    for l in T["lines"]:  # voice files stay in ../l1/vo
        if l.get("file"):
            l["file"] = os.path.relpath(os.path.join(SRC, l["file"]), HERE).replace("\\", "/")
    json.dump(T, open(os.path.join(HERE, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(HERE, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print("timing copied, DUR", T["DUR"])


if __name__ == "__main__":
    steps = sys.argv[1:] or ["timing"]
    if "timing" in steps:
        timing()
    if "audio" in steps:
        longkit.audio(HERE, NAME, longkit.page_sfx(HERE, NAME), music=os.path.join(longkit.kit.ASSETS, "music", "saas_long.mp3"), bed=-24.18)  # music 2 % quieter (user, 2026-09-25): 20*log10(.98) = -0.18 dB
    for st in ("stills", "render", "mux"):
        if st in steps:
            longkit.run(HERE, NAME, [], {}, [st])
