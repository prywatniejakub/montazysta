r"""Clips4you reels (PL, light style of clips4you.pl): shared pipeline.
voice (ElevenLabs PL "Adam", kit.tighten) -> timing (longkit) -> clips (real reels as JPG frames for phones)
-> page (reel.html + c4y.js, window.render) -> audio (longkit mix) -> render (motion/render.py) -> mux + frame-0 check.
  ..\..\..\runtime\python.exe script.py voice timing clips stills audio render
"""
import os, sys, json, subprocess
HERE_LIB = os.path.dirname(os.path.abspath(__file__))
C4Y = os.path.dirname(HERE_LIB)
MOTION = os.path.dirname(C4Y)
ROOT = os.path.dirname(MOTION)
sys.path.insert(0, os.path.join(MOTION, "kuba", "lib"))
sys.path.insert(0, os.path.join(MOTION, "kuba"))
sys.path.insert(0, os.path.join(MOTION, "lib"))
import longkit  # noqa: E402
kit = longkit.kit
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
PY = os.path.join(ROOT, "runtime", "python.exe")
CLIPS = os.path.join(C4Y, "clips")

K = r"C:\Users\komputer\Desktop\KANAŁY\5 Sociale (IG, TikTok, FB, X)\Rolki"
PUB = r"C:\Users\komputer\Documents\Codex\2026-09-23\zbu\outputs\kuba-builds-ai\public\clips\media"
SRC = {  # name: (file, start, seconds)
    "sa02": (os.path.join(PUB, "SA02.mp4"), 0.0, 6.0),
    "sa01": (os.path.join(PUB, "SA01.mp4"), 0.0, 6.0),
    "sa03": (os.path.join(PUB, "SA03.mp4"), 0.0, 6.0),
    "banana": (os.path.join(K, "Do wrzucenia", "I built an app by talking into a banana.mp4"), 0.0, 6.0),
    "pointab": (os.path.join(K, "Do wrzucenia", "Point A to Point B.mp4"), 0.0, 5.0),
    "ico1": (r"C:\Users\komputer\Desktop\INNE PROJEKTY\SEBEK reklamy ICOONE\ICOONE S1 · Dziwny kombinezon.mp4", 0.0, 6.0),
    "ico2": (r"C:\Users\komputer\Desktop\INNE PROJEKTY\SEBEK reklamy ICOONE\ICOONE S4 · Tak pracuje maszyna.mp4", 0.0, 6.0),
    "yomi1": (os.path.join(ROOT, "exports", "rolki", "yomi-us", "EN 04 · Lamborghini 600K.mp4"), 0.0, 6.0),
    "vibe": (os.path.join(K, "Dodane", "The 4 levels of vibe coding.mp4"), 4.0, 6.0),
}


def run(args):
    subprocess.run([FF, "-y", "-loglevel", "error"] + args, check=True)


def clips(names, fps=30):
    """real reels -> clips/<name>/001.jpg ... (540x960) + clips/manifest.js (frame counts for the page)"""
    os.makedirs(CLIPS, exist_ok=True)
    man_p = os.path.join(CLIPS, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8")) if os.path.exists(man_p) else {}
    for n in names:
        d = os.path.join(CLIPS, n)
        if os.path.isdir(d) and n in man:
            continue
        os.makedirs(d, exist_ok=True)
        f, ss, dur = SRC[n]
        run(["-ss", f"{ss}", "-t", f"{dur}", "-i", f, "-an", "-vf",
             f"fps={fps},scale=540:960:force_original_aspect_ratio=increase,crop=540:960", "-q:v", "3", os.path.join(d, "%03d.jpg")])
        man[n] = len([x for x in os.listdir(d) if x.endswith(".jpg")])
        print(f"clip {n}: {man[n]} frames")
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")


def voice(here, lines):
    d = os.path.join(here, "vo", "reel"); os.makedirs(d, exist_ok=True)
    kit.tighten(d, [t for _, t in lines])  # default voice = voicekit.VOICE (Adam, native Polish, eleven_v3)


def timing(here, lines, gaps, hold=.9):
    return longkit.timing(here, [("reel", "Reel", lines)], gaps, t0=.02, hold=hold)


def stills(here, name, times):
    out = os.path.join(here, "stills")
    subprocess.run([PY, os.path.join(MOTION, "render.py"), os.path.join(here, name + ".html"), out, "--size", "1080x1920",
                    "--stills", ",".join(f"{t:.2f}" for t in times)], check=True)


def audio(here, name, music, bed=-25.0):
    longkit.audio(here, name, longkit.page_sfx(here, name), music=os.path.join(MOTION, "kuba", "assets", "music", music), bed=bed)


FPS = 30  # skrypt rolki może podnieść do 60 (np. hook AI po interpolacji RIFE)


def render(here, name, workers=6):
    v = os.path.join(here, "video.mp4")
    dur = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))["DUR"]
    subprocess.run([PY, os.path.join(MOTION, "render.py"), os.path.join(here, name + ".html"), v, "--size", "1080x1920",
                    "--fps", str(FPS), "--sub", "1" if FPS >= 60 else "2", "--workers", str(workers), "--crf", "18", "--end", f"{dur:.2f}"], check=True)
    out = os.path.join(here, name + ".mp4")
    run(["-i", v, "-i", os.path.join(here, "audio.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac",
         "-b:a", "192k", "-shortest", "-movflags", "+faststart", out])
    run(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(here, "f0.jpg")])
    print("done:", out)


def main(here, name, lines, gaps, clip_names, music, still_times):
    steps = sys.argv[1:] or ["voice", "timing"]
    if "voice" in steps:
        voice(here, lines)
    if "timing" in steps:
        timing(here, lines, gaps)
    if "clips" in steps:
        clips(clip_names)
    if "stills" in steps:
        stills(here, name, still_times)
    if "audio" in steps:
        audio(here, name, music)
    if "render" in steps:
        render(here, name)
