r"""Budowa rolek Go4Driver w NOWYM STYLU (lib/g4s.js, wzór go4d8): głos i usta z rolki pakietu 1, własna strona <nazwa>.html.
  ..\..\runtime\python.exe c4y\lib\g4s.py <nazwa> <źródło> timing stills audio render send ["Tytuł"]
np. g4s.py go4d9 go4d5 timing stills
"""
import json, os, subprocess, sys
LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, LIB)
import c4ykit  # noqa: E402
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))
END = 1.9
MUSIC = os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_groove.mp3")
# styl spokojny (decyzja 2026-10-06: klient dostaje 2 style do wyboru)
CALM = {"go4d10", "go4d11"}
MUSIC_CALM = os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "g4d_calm.mp3")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    name, src, steps = sys.argv[1], sys.argv[2], sys.argv[3:]
    here, srcd = os.path.join(c4ykit.C4Y, name), os.path.join(c4ykit.C4Y, src)
    title = next((s for s in steps if " " in s or s[:1].isupper()), name)
    if "timing" in steps:
        T = json.load(open(os.path.join(srcd, "timing.json"), encoding="utf-8"))
        T["DUR"] = round(T["lines"][-1]["words"][-1]["e"] + .15 + END, 2)
        json.dump(T, open(os.path.join(here, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        open(os.path.join(here, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
        print(name, "DUR", T["DUR"], "VEND", T["VEND"])
    T = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))
    if "stills" in steps:
        c4ykit.stills(here, name, [round(x * .5, 2) for x in range(int(T["DUR"] * 2) + 1)])
    if "audio" in steps:
        import mixkit
        calm = name in CALM
        mixkit.mix(here, name, T["DUR"], MUSIC_CALM if calm else MUSIC, tracks=[(os.path.join(srcd, "vo", "reel", "voice_t.mp3"), T["DELAY"], 0, 0.0, None)],
                   bed=-20.0 if calm else -17.0)
    if "render" in steps:
        c4ykit.render(here, name, workers=6)
    if "send" in steps:
        subprocess.run([c4ykit.PY, os.path.join(c4ykit.ROOT, "tools", "realizacje", "realizacje.py"), "wyslij", "go4driver",
                        os.path.join(here, name + ".mp4"), "--tytul", title, "--opis", os.path.join(srcd, "opis.txt")], check=True)


if __name__ == "__main__":
    main()
