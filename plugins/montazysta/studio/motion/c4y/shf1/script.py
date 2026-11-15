r"""Próbka Clips4you dla Shift nr 1, WERSJA 2 (2026-10-05, po odrzuceniu v1 = folder v1/): lektor „Oscar” (ElevenLabs, energiczny, social media),
krótkie zdania, pełny kadr HD (ich Instagram 1080x1920 + film UGC + zdjęcia ze strony), napisy max 3 słowa (lib/prem.js), liczniki 50 i 400 zł.
  ..\..\..\runtime\python.exe script.py frames voice timing   potem   stills   potem   audio render
"""
import os, sys, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "schrony"))
import c4ykit

NAME = "shf1"
OSCAR = "04BD7Fenyf9Ysq983wrd"  # Oscar - Energetic & Direct (PL, social media, biblioteka ElevenLabs)
LINES = [("b1", "Firmy AI płacą za filmy, na których kroisz warzywa."),
         ("b2", "Serio. Uczą na nich roboty."),
         ("b3", "Zakładasz opaskę z telefonem."),
         ("b4", "I robisz swoje. Kuchnia, warsztat, sklep."),
         ("b5", "Kamera widzi tylko Twoje dłonie."),
         ("b6", "Godzina nagrania? Nawet pięćdziesiąt złotych."),
         ("b7", "Osiem godzin? Nawet czterysta."),
         ("b8", "Shift. Pracuj raz, zarabiaj podwójnie.")]
GAPS = {"b2": .12, "b3": .1, "b4": .1, "b5": .1, "b6": .12, "b7": .12, "b8": .15}
STILLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
SRC = os.path.join(HERE, "..", "shift", "src")
IG, UGC = os.path.join(SRC, "ig", "DdRUEodIY_-.mp4"), os.path.join(SRC, "shift-ugc-operators.mp4")
SEG = {  # pionowe HD -> 1080x1920
    "f1Drill": (IG, 32.2, 2.6), "f1Paint": (IG, 54.1, 1.9), "f1Engine": (UGC, 6.0, 2.4), "f1App": (UGC, 25.3, 2.6), "f1Grid": (IG, 48.0, 2.2),
}


def frames():
    clips = os.path.join(HERE, "..", "clips"); man = {}
    for n, (f, ss, dur) in SEG.items():
        d = os.path.join(clips, n); os.makedirs(d, exist_ok=True)
        for x in os.listdir(d): os.remove(os.path.join(d, x))
        subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", str(ss), "-t", str(dur), "-i", f, "-an", "-vf",
                        "fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", "-q:v", "4", os.path.join(d, "%03d.jpg")], check=True)
        man[n] = len(os.listdir(d)); print(n, man[n])
    import pano
    pano.manifest_update(man)


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "frames" in steps: frames()
    if "voice" in steps: c4ykit.kit.tighten(os.path.join(HERE, "vo", "reel"), [t for _, t in LINES], voice_id=OSCAR)
    if "timing" in steps: c4ykit.timing(HERE, LINES, GAPS, hold=1.4)
    if "stills" in steps: c4ykit.stills(HERE, NAME, STILLS)
    if "audio" in steps: c4ykit.audio(HERE, NAME, "shift_work_beat.mp3", bed=-19.0)
    if "render" in steps: c4ykit.render(HERE, NAME, workers=4)
