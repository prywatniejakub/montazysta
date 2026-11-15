r"""Próbka Clips4you dla Shift (Tomek, joinshift.pl, 2026-10-05): shf1 „Firmy, które uczą roboty, płacą za film, na którym kroisz pomidory.”
Materiały: ich strona (ujęcia POV 640x360, film UGC 720x1280, zdjęcie opaski, ekrany aplikacji) w ../shift/src.
  ..\..\..\runtime\python.exe script.py frames voice timing   potem   stills   potem   audio render
"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit

NAME = "shf1"
LINES = [("b1", "Firmy, które uczą roboty, płacą za film, na którym kroisz pomidory."),
         ("b2", "Serio. Roboty uczą się pracy z ludzkich rąk."),
         ("b3", "Zakładasz opaskę, wpinasz telefon i robisz swoje."),
         ("b4", "W kuchni, w warsztacie, przy pakowaniu albo w sklepie."),
         ("b5", "Aplikacja widzi tylko dłonie. Bez twarzy, bez dźwięku."),
         ("b6", "Za każdą zaakceptowaną godzinę płacimy nawet pięćdziesiąt złotych. Wypłata co tydzień."),
         ("b7", "Pobierz aplikację Shift. Pracuj raz, zarabiaj podwójnie.")]
GAPS = {"b2": .15, "b3": .12, "b4": .1, "b5": .12, "b6": .12, "b7": .2}
STILLS = [0, 1.5, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]
SRC = os.path.join(HERE, "..", "shift", "src")
# nazwa -> (plik, start, długość, tryb)  wide = 960x540 (karta), full = 720x1280
SEG = {
    "sfTom": ("lib-07.mp4", 0.0, 5.0, "wide"), "sfDough": ("lib-01.mp4", 0.0, 5.0, "wide"), "sfSand": ("usa-clip-06.mp4", 0.0, 5.0, "wide"),
    "sfBerry": ("lib-15.mp4", 0.0, 5.0, "wide"), "sfCandy": ("lib-10.mp4", 0.0, 5.0, "wide"), "sfLeath": ("lib-14.mp4", 0.0, 5.0, "wide"),
    "sfToys": ("lib-12.mp4", 0.0, 5.0, "wide"), "sfWallet": ("usa-clip-12.mp4", 0.0, 5.0, "wide"),
    "sfUgcCuc": ("shift-ugc-operators.mp4", 9.6, 2.4, "full"), "sfUgcBand": ("shift-ugc-operators.mp4", 17.4, 2.6, "full"),
}


def frames():
    clips = os.path.join(HERE, "..", "clips")
    man = {}
    for n, (src, ss, dur, mode) in SEG.items():
        d = os.path.join(clips, n); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        vf = "fps=30,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" if mode == "full" else "fps=30,scale=960:540:flags=lanczos"
        subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", str(ss), "-t", str(dur), "-i", os.path.join(SRC, src), "-an",
                        "-vf", vf, "-q:v", "3", os.path.join(d, "%03d.jpg")], check=True)
        man[n] = len(os.listdir(d)); print(n, man[n])
    import importlib.util
    spec = importlib.util.spec_from_file_location("pano", os.path.join(HERE, "..", "schrony", "pano.py")); pano = importlib.util.module_from_spec(spec); spec.loader.exec_module(pano)
    pano.manifest_update(man)


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "frames" in steps: frames()
    if "voice" in steps: c4ykit.voice(HERE, LINES)
    if "timing" in steps: c4ykit.timing(HERE, LINES, GAPS, hold=1.2)
    if "stills" in steps: c4ykit.stills(HERE, NAME, STILLS)
    if "audio" in steps: c4ykit.audio(HERE, NAME, "shift_work_beat.mp3", bed=-17.0)
    if "render" in steps: c4ykit.render(HERE, NAME, workers=4)
