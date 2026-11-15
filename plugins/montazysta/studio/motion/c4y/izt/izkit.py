r"""Wspólny silnik rolek Izzi Therm (klient od 2026-10-19, pakiet 15 rolek/mies.): it1, it2, ...
Obraz = filmy i zdjęcia z budów klienta (dane/klienci/izzitherm) + zdjęcia ze strony izzitherm.pl (izt/img).
Głos: ElevenLabs Tomasz (ten sam co rolka próbna izz1, którą zespół Piotra widział) TYLKO z ZGODA=<kwota> ELEVEN=1,
inaczej darmowy Edge (Marek) do odsłuchu.
  ..\..\..\runtime\python.exe script.py clips voice timing stills audio render
"""
import json, os, sys
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib")
sys.path.insert(0, LIB)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "zsz"))
import c4ykit  # noqa: E402
import zskit  # noqa: E402

TOMASZ = "JWUOwsYG4XgR9Od3eeon"  # Tomasz - Loud and Calm (PL), głos rolki próbnej izz1
SRC = os.path.join(c4ykit.ROOT, "dane", "klienci", "izzitherm")


def clips(items):
    """filmy klienta -> clips/<nazwa>/NNN.jpg (1080x1920, 30 kl./s).
    items = [(nazwa, plik względem dane/klienci/izzitherm, start_s, sekundy, opcje)], opcje: cx/cy = kadr 0..1, slow = zwolnienie (120 kl./s -> 4)"""
    man = {}
    for it in items:
        nm, rel, ss, dur = it[:4]
        o = it[4] if len(it) > 4 else {}
        d = os.path.join(c4ykit.CLIPS, nm); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        slow = o.get("slow", 1)
        vf = (f"setpts={slow}*PTS," if slow != 1 else "") + "fps=30,scale=1080:1920:force_original_aspect_ratio=increase," \
             f"crop=1080:1920:(iw-1080)*{o.get('cx', .5)}:(ih-1920)*{o.get('cy', .5)}" + (f",{o['vf']}" if o.get("vf") else "")
        c4ykit.run(["-ss", f"{ss}", "-t", f"{dur / slow:.3f}", "-i", os.path.join(SRC, rel), "-an", "-vf", vf, "-q:v", "3", os.path.join(d, "%03d.jpg")])
        man[nm] = len(os.listdir(d)); print("klip", nm, man[nm], "klatek")
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json")
    m = json.load(open(man_p, encoding="utf-8")); m.update(man)
    json.dump(m, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(m) + ";\n")


def main(here, name, lines, gaps, music, bed=-21.0, hold=2.4, clip_items=(), workers=5):
    steps = sys.argv[1:]
    if "clips" in steps: clips(clip_items)
    if "voice" in steps:
        if os.environ.get("ELEVEN") == "1":
            zskit.voice_eleven(here, lines, TOMASZ)
        else:
            zskit.voice_edge(here, lines, zskit.MAREK, "+6%")
    if "timing" in steps: c4ykit.timing(here, lines, gaps, hold=hold)
    if "stills" in steps:
        D = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))["DUR"]
        c4ykit.stills(here, name, [round(x * .5, 2) for x in range(int(D / .5) + 1)])
    if "audio" in steps: c4ykit.audio(here, name, music, bed=bed)
    if "render" in steps: c4ykit.render(here, name, workers=workers)
