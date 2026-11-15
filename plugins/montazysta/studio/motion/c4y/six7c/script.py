r"""Próbka Clips4you dla SIX SEVEN nr 3: TREND TIKTOK „najszczersza recenzja” z ICH filmu z rodziną (bez lektora):
napisy w białych dymkach jak w TikToku, przewijanie „5 minut wcześniej”, ocena 10/10, końcówka z memem „6-7” (nazwa lokalu).
Muzyka i efekty z ElevenLabs. Oś czasu w six7c.html (DUR w timing.json).
  ..\..\..\runtime\python.exe script.py sounds frames timing stills audio render
"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import c4ykit

NAME = "six7c"
DUR = 15.6
S7 = os.path.join(HERE, "..", "six7", "src")
F = "1039415418738466"  # film z rodziną (ich rolka)
SEG = {"fGirlA": (F, 32.2, 1.8), "fOrder": (F, 24.0, 0.95), "fPass": (F, 25.0, 1.4), "fBowl": (F, 28.0, 1.4), "fMom": (F, 30.0, 1.4),
       "fGirlB": (F, 33.4, 4.45), "fDad": (F, 40.6, 2.8), "fKids": (F, 48.55, 0.9)}
MUSIC = ("Playful bouncy TikTok trend beat, funny and upbeat, plucky synth and claps, light bass, catchy, 118 bpm, "
         "no vocals, 18 seconds.")


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


def timing():
    T = {"DUR": DUR, "lines": [], "chapters": []}
    json.dump(T, open(os.path.join(HERE, "timing.json"), "w", encoding="utf-8"))
    open(os.path.join(HERE, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T) + ";\n")


def sounds():
    k = c4ykit.kit
    print(k.music("six7_tiktok_beat", MUSIC, 18))
    print(k.sound("record_scratch", "Vinyl record scratch rewind sound effect, short and funny", 1.2))
    print(k.sound("vine_boom", "Deep cinematic bass boom meme sound effect, single hit, punchy", 1.5))


if __name__ == "__main__":
    a = sys.argv[1:]
    if "sounds" in a: sounds()
    if "frames" in a: frames()
    if "timing" in a: timing()
    if "stills" in a: c4ykit.stills(HERE, NAME, [0, 1, 2.2, 3.2, 4.6, 5.8, 7, 8.8, 10.2, 11.8, 13.6, 14.6, 15.4])
    if "audio" in a:
        import mixkit
        mixkit.mix(HERE, NAME, DUR, os.path.join(c4ykit.MOTION, "kuba", "assets", "music", "six7_tiktok_beat.mp3"), bed=-16.0)
    if "render" in a: c4ykit.render(HERE, NAME, workers=4)
