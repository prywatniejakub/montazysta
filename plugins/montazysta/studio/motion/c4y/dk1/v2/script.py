r"""Próbka Clips4you dla Dobre Krzesła (Paweł, dobrekrzesla.pl, 2026-10-05): dk1 „Zanim kupisz krzesła do jadalni, zobacz, gdzie się je szyje.”
Materiały: ich shorty YouTube (../dkrzesla/src): produkcja qYRAdylk-d4 (napisy wypalone na środku = przykrywa nasza „naklejka”),
realizacja Westa _zD8i8ffiLw, katalog xQnzRJkBf-0 (packshoty), showroom Kłobuck pMsD1Bd20ME (koniec).
  ..\..\..\runtime\python.exe script.py frames voice timing   potem   stills   potem   audio render
"""
import os, sys, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "schrony"))
import c4ykit

NAME = "dk1"
LINES = [("b1", "Zanim kupisz krzesła do jadalni, zobacz, gdzie się je szyje."),
         ("b2", "Jesteśmy polskim producentem. Tniemy, szyjemy i tapicerujemy sami."),
         ("b3", "A potem takie krzesła stają w Twojej jadalni."),
         ("b4", "Krzesła, fotele i stoliki, w wielu kolorach tkanin."),
         ("b5", "Nie wiesz, który wybrać? Usiądź na nich w naszym showroomie w Kłobucku."),
         ("b6", "Albo zamów na dobre krzesła kropka pe el. Raty zero procent.")]
GAPS = {"b2": .15, "b3": .12, "b4": .12, "b5": .12, "b6": .15}
STILLS = [0, 1.5, 3, 4.2, 5.5, 6.5, 7.5, 9, 10.5, 11.3, 12, 12.8, 13.6, 14.6, 15.5, 17, 18.5, 20, 22]
SRC = os.path.join(HERE, "..", "dkrzesla", "src")
P, WE, KA, FX = "qYRAdylk-d4.mp4", "_zD8i8ffiLw.mp4", "xQnzRJkBf-0.mp4", "pMsD1Bd20ME.mp4"
SEG = {  # nazwa -> (plik, start, długość)  wszystko 720x1280 pełny kadr
    "dkWestaC": (WE, 12.2, 3.0), "dkWestaW": (WE, 30.0, 3.5), "dkWestaS": (WE, 24.0, 3.0),
    "dkPlane": (P, 0.0, 3.0), "dkSaw": (P, 3.0, 3.0), "dkSew": (P, 6.0, 5.5), "dkUph": (P, 12.0, 3.0), "dkSew2": (P, 15.0, 3.0),
    "dkShow": (FX, 27.0, 1.6),
}
# packshoty z katalogu (pojedyncze klatki, wycięty sam produkt): nazwa -> czas
PACK = {"pkWoven": 10.6, "pkWovenB": 15.2, "pkWood": 18.2, "pkX": 21.2, "pkArm": 33.2, "pkRecl": 40.6, "pkGreen": 43.6, "pkSwivel": 52.6, "pkTable": 28.6}


def frames():
    clips = os.path.join(HERE, "..", "clips")
    man = {}
    for n, (src, ss, dur) in SEG.items():
        d = os.path.join(clips, n); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", str(ss), "-t", str(dur), "-i", os.path.join(SRC, src), "-an",
                        "-vf", "fps=30,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280", "-q:v", "3", os.path.join(d, "%03d.jpg")], check=True)
        man[n] = len(os.listdir(d)); print(n, man[n])
    import pano
    pano.manifest_update(man)
    pk = os.path.join(HERE, "pack"); os.makedirs(pk, exist_ok=True)
    for n, t in PACK.items():  # kadr produktu bez paska z adresem: y 14%-80%
        subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", str(t), "-i", os.path.join(SRC, KA), "-frames:v", "1",
                        "-vf", "crop=iw:ih*0.62:0:ih*0.15", "-q:v", "2", os.path.join(pk, n + ".jpg")], check=True)


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "frames" in steps: frames()
    if "voice" in steps:
        os.makedirs(os.path.join(HERE, "vo", "reel"), exist_ok=True)
        for f in ("voice.mp3", "alignment.json"):
            fp = os.path.join(HERE, "vo", "reel", f)
            if os.path.exists(fp): os.remove(fp)
        c4ykit.kit.tighten(os.path.join(HERE, "vo", "reel"), [t for _, t in LINES], voice_id="JWUOwsYG4XgR9Od3eeon")  # Tomasz Grey (v2)
    if "timing" in steps: c4ykit.timing(HERE, LINES, GAPS, hold=1.3)
    if "stills" in steps: c4ykit.stills(HERE, NAME, STILLS)
    if "audio" in steps: c4ykit.audio(HERE, NAME, "krzesla_house.mp3", bed=-17.0)
    if "render" in steps: c4ykit.render(HERE, NAME, workers=4)
