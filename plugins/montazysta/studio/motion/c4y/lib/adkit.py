r"""Reklamy Clips4you z banku postaci (motion/c4y/postac/<scena>/veo.mp4, płacimy raz).
Hook reklamy = wycinek 6-sekundowego ujęcia (od START) o długości linii b1 -> nasz głos -> Sync Lipsync -> RIFE -> 60 kl./s
-> klatki c4y/clips/<nazwa>_hook (strona: lib/c4yad.js, HookScene). Reszta jak c4ykit (głos, timing, audio, render 60 kl./s).
  ..\..\..\runtime\python.exe script.py voice timing hook stills    potem    script.py audio render
"""
import os, sys, json, time
HERE_LIB = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE_LIB)
import c4ykit
sys.path.insert(0, os.path.join(c4ykit.MOTION, "kuba", "lib"))
import falkit
BANK = os.path.join(c4ykit.C4Y, "postac")


def retry(fn, what, tries, wait=30):
    for i in range(1, tries + 1):
        try:
            return fn()
        except Exception as e:
            if i == tries:
                raise
            print(f"{what}: fal odbija (proba {i}), ponawiam za {wait} s:", str(e)[:120], flush=True)
            time.sleep(wait)


def hook(here, name, scene, start=0.0):
    ai = os.path.join(here, "ai"); os.makedirs(ai, exist_ok=True)
    t = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))
    b1 = next(l for l in t["lines"] if l["key"] == "b1")
    a, b = b1["src"]; d = b - a + .05
    aud = os.path.join(ai, "b1.mp3")
    c4ykit.run(["-ss", f"{a:.3f}", "-to", f"{b + .05:.3f}", "-i", os.path.join(here, b1["file"]), "-c:a", "libmp3lame", "-q:a", "2", aud])
    cut = os.path.join(ai, "cut.mp4")
    c4ykit.run(["-ss", f"{start:.3f}", "-i", os.path.join(BANK, scene, "veo.mp4"), "-i", aud, "-map", "0:v", "-map", "1:a", "-t", f"{d:.3f}",
                "-c:v", "libx264", "-crf", "16", "-c:a", "aac", cut])
    lip = os.path.join(ai, "lip.mp4")
    if not os.path.exists(lip) or "--relip" in sys.argv:
        retry(lambda: falkit.lipsync(cut, aud, lip), "lipsync", 40)
    l120 = os.path.join(ai, "lip120.mp4")
    try:  # fal potrafi chwilowo odbijać („User is locked”) mimo środków: ponawiamy, zanim zrobimy płynność lokalnie
        url = falkit.host(lip)
        retry(lambda: falkit.run("fal-ai/rife/video", {"video_url": url, "num_frames": 4, "use_scene_detection": False, "use_calculated_fps": True}, l120), "RIFE", 20)
    except Exception as e:  # np. brak środków na fal: płynność lokalnie (ffmpeg minterpolate, darmowe, trochę słabsze niż RIFE)
        print("RIFE niedostępny:", str(e)[:160], "-> minterpolate lokalnie")
        c4ykit.run(["-i", lip, "-an", "-vf", "minterpolate=fps=120:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1", "-c:v", "libx264", "-crf", "14", l120])
    frames(name, l120)
    print(f"({d:.2f} s, scena {scene} od {start}s)")


def frames(name, l120):
    key = name + "_hook"; fd = os.path.join(c4ykit.CLIPS, key); os.makedirs(fd, exist_ok=True)
    for f in os.listdir(fd):
        os.remove(os.path.join(fd, f))
    c4ykit.run(["-i", l120, "-an", "-vf", "fps=60,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920", "-q:v", "2",
                os.path.join(fd, "%03d.jpg")])
    man_p = os.path.join(c4ykit.CLIPS, "manifest.json"); man = json.load(open(man_p, encoding="utf-8"))
    man[key] = len(os.listdir(fd))
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(c4ykit.CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")
    print("hook frames:", man[key])


def main(here, name, lines, gaps, clips, music, stills, scene, start=0.0):
    c4ykit.FPS = 60
    argv0, steps = sys.argv[0], sys.argv[1:]
    pre = [x for x in steps if x in ("voice", "timing", "clips")]
    post = [x for x in steps if x in ("stills", "audio", "render")]
    if pre:
        sys.argv = [argv0] + pre; c4ykit.main(here, name, lines, gaps, clips, music, stills)
    if "hook" in steps:
        hook(here, name, scene, start)
    if post:
        sys.argv = [argv0] + post; c4ykit.main(here, name, lines, gaps, clips, music, stills)
