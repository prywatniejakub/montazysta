r"""Próbka Clips4you dla SIX SEVEN nr 2: ZWIASTUN KINOWY (parodia trailera). Głęboki lektor „Mateusz”, epicka muzyka
ElevenLabs, pasy kinowe, ziarno, ciepła kolorystyka, plansze tytułowe. Ujęcia z ICH nagrań (rożny, film SkyShot), inne niż w rolce 1.
  ..\..\..\runtime\python.exe script.py voice timing music frames stills audio render
"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit

NAME = "six7b"
MATEUSZ = "MM9TwXLP67IpAXY0UOGg"  # Mateusz - Polish Legend Narrator (głęboki baryton, ElevenLabs library)
LINES = [("t1", "Od twórców hitu: Po prostu zajebiście pyszne..."),
         ("t2", "W Goczałkowicach jest miejsce, gdzie rożen nigdy nie śpi."),
         ("t3", "Gdzie tortilla trafia prosto na grill."),
         ("t4", "A sos... nie bierze jeńców."),
         ("t5", "Six Seven. Street Food."),
         ("t6", "Już teraz. W Goczałkowicach.")]
GAPS = {"t2": .35, "t3": .3, "t4": .3, "t5": .55, "t6": .35}
MUSIC = ("Epic cinematic movie trailer music: deep braam hits, low taiko drums, rising tension strings, a dramatic pause "
         "then a huge final hit and short tail. Serious Hollywood blockbuster trailer, no vocals, 24 seconds.")

S7 = os.path.join(HERE, "..", "six7", "src")
K = "2844889742537973"
SEG = {  # nazwa -> (plik, start, długość)
    "tbMacro": ("1862905521730723", 1.0, 3.2), "tbWide": ("2594707680964559", 0.2, 2.6), "tbSpin": ("2006033270111572", 6.2, 3.0),
    "tbTwo": ("915053544497801", 18.0, 2.6), "tbBeef": ("1774830693877652", 5.0, 2.4), "tbFlame": (K, 13.6, 1.6),
    "tbPile": (K, 24.2, 2.4), "tbPress": (K, 39.75, 1.6), "tbSauce": (K, 43.9, 0.45), "tbSauce2": (K, 66.4, 2.6),
    "tbCab": (K, 54.0, 1.6), "tbPov": ("1834821131233239", 3.0, 4.0), "tbSign": (K, 82.0, 3.6),
}


def frames():
    clips = c4ykit.CLIPS
    man_p = os.path.join(clips, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8"))
    for n, (src, ss, dur) in SEG.items():
        d = os.path.join(clips, n); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        subprocess.run([c4ykit.FF, "-y", "-loglevel", "error", "-ss", str(ss), "-t", str(dur), "-i", os.path.join(S7, src + ".mp4"), "-an",
                        "-vf", "fps=30,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280", "-q:v", "3", os.path.join(d, "%03d.jpg")], check=True)
        man[n] = len(os.listdir(d)); print(n, man[n])
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(clips, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")


if __name__ == "__main__":
    steps = sys.argv[1:]
    if "voice" in steps: c4ykit.kit.tighten(os.path.join(HERE, "vo", "reel"), [t for _, t in LINES], voice_id=MATEUSZ, keep=.35)
    if "timing" in steps: c4ykit.timing(HERE, LINES, GAPS, hold=1.4)
    if "music" in steps: print(c4ykit.kit.music("six7_trailer", MUSIC, 24))
    if "frames" in steps: frames()
    if "stills" in steps: c4ykit.stills(HERE, NAME, [0, 1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15, 16.5, 18])
    if "audio" in steps:
        import longkit
        longkit.audio(HERE, NAME, longkit.page_sfx(HERE, NAME), music=os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "six7_trailer.mp3"), bed=-15.0)
    if "render" in steps: c4ykit.render(HERE, NAME, workers=4)
