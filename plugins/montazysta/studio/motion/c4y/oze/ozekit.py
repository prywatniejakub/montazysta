r"""Silnik rolek OZE dla fanpage'a Fundusz Modernizacji Budynków (2026-11-01): fmb1, fmb2, fmb3.
Obraz: darmowe klipy Pexels/Pixabay z oze/stock (pex2.py, pix.py) + grafiki oze.js; napisy prem.js; reszta jak zskit.
Głos: darmowy Edge (domyślnie) albo ElevenLabs (TYLKO po zgodzie użytkownika: ZGODA=<kwota> ELEVEN=1).
  ..\..\..\runtime\python.exe script.py clips voice timing stills audio render
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "zsz"))
import zskit  # noqa: E402
c4ykit = zskit.c4ykit
ST = os.path.join(HERE, "stock")
TOMASZ, ADAM = "JWUOwsYG4XgR9Od3eeon", None  # ElevenLabs: Tomasz Grey (pewny), Adam = domyślny voicekit


def stock(items):
    """klipy -> clips/<nazwa>/NNN.jpg (1080x1920, 30 kl./s); items = [(nazwa, plik w oze/stock bez .mp4, start_s, sekundy)]"""
    man = {}
    for nm, src, ss, dur in items:
        d = os.path.join(c4ykit.CLIPS, nm); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        c4ykit.run(["-ss", f"{ss}", "-t", f"{dur}", "-i", os.path.join(ST, f"{src}.mp4"), "-an", "-vf", "fps=30", "-q:v", "3", os.path.join(d, "%03d.jpg")])
        man[nm] = len(os.listdir(d)); print("klip", nm, man[nm], "klatek")
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    m = json.load(open(man_p, encoding="utf-8")) if os.path.exists(man_p) else {}; m.update(man)
    json.dump(m, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(m) + ";\n")


def sheet(here, name):
    """arkusz klatek co 0,5 s z stills/ (do recenzji przed płatnym głosem)"""
    st = os.path.join(here, "stills")
    fs = sorted(f for f in os.listdir(st) if f.endswith(".png"))
    lst = os.path.join(st, "_lista.txt")
    open(lst, "w", encoding="utf-8").write("".join(f"file '{os.path.join(st, f)}'\nduration 1\n" for f in fs))
    c4ykit.run(["-f", "concat", "-safe", "0", "-i", lst, "-vf", "scale=216:384,tile=10x6:padding=4:color=black", "-frames:v", "1", os.path.join(here, f"{name}_arkusz.jpg")])


def main(here, name, lines, gaps, music, clips=(), bed=-22.0, eleven_voice=TOMASZ, hold=1.0):
    steps = sys.argv[1:]
    if "clips" in steps: stock(clips)
    if "voice" in steps:
        if os.environ.get("ELEVEN") == "1":
            zskit.voice_eleven(here, lines, eleven_voice)
        else:
            zskit.voice_edge(here, lines, zskit.MAREK, "+6%")
    if "timing" in steps: c4ykit.timing(here, lines, gaps, hold=hold)
    if "stills" in steps:
        D = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))["DUR"]
        c4ykit.stills(here, name, [round(x * .5, 2) for x in range(int(D / .5) + 1)])
        sheet(here, name)
    if "audio" in steps: c4ykit.audio(here, name, music, bed=bed)
    if "render" in steps: c4ykit.render(here, name, workers=int(os.environ.get("WORKERS", "2")))
