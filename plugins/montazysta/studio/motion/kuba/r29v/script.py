r"""Reel r29v - "Point A -> Point B" (B2C: young, ambitious, wants to learn to build with AI; SaaS style, 2026-09-26).
Kuba real footage + Sync Lipsync 2 Pro (hook b1 + promise b6, same "Reel" voice). Frame 0: "You are here: Point A" pin
-> light: saved AI videos pile up to 50, "Built: 0", other people's projects fly past -> dark: point B, a chat prompt
-> code -> the site on a phone -> three quick "yours" screens -> Kuba: "from A to B in seven days" + the pin travels -> CTA.
  ..\..\..\runtime\python.exe script.py voice timing hook lipsync frames   /   script.py audio
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import longkit
import falkit
kit = longkit.kit

NAME = "r29v"
SRC = os.path.join(kit.ROOT, "rolki", "Saas ADS", "surowe")
LINES = [("b1", "You've saved fifty AI videos. And built nothing."),
         ("b2", "That's point A. Everyone builds. You scroll."),
         ("b3", "Point B? You just tell AI your idea."),
         ("b4", "And it builds it with you, step by step."),
         ("b5", "Your site. Your app. Something people use."),
         ("b6", "I'll take you from A to B in seven days."),
         ("b7", "DM me SaaS, and I'll send you my free first lesson.")]
CHAPTERS = [("reel", "Reel", LINES)]
GAPS = {"b2": .12, "b3": .12, "b4": .08, "b5": .1, "b6": .12, "b7": .1}
MUSIC = os.path.join(kit.ASSETS, "music", "saas.mp3")  # rotate: r28v steady, r27v story, r26v chat
SHOTS = {"b1": (os.path.join(SRC, "download (13).mp4"), 0.0), "b6": (os.path.join(SRC, "download (8).mp4"), 0.40)}  # clean: close-up 0-4.9 s / wide 0-5.7 s

if __name__ == "__main__":
    steps = sys.argv[1:] or ["voice", "timing"]
    if "voice" in steps:
        d = os.path.join(HERE, "vo", "reel"); os.makedirs(d, exist_ok=True)
        kit.tighten(d, [t for _, t in LINES], voice_id=kit.REEL)
    if "timing" in steps:
        longkit.timing(HERE, CHAPTERS, GAPS, t0=.02, hold=.9)
    T = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8")) if os.path.exists(os.path.join(HERE, "timing.json")) else None
    if "hook" in steps:  # each on-camera line: its audio + the same length of footage (30 fps)
        for L in T["lines"]:
            if L["key"] not in SHOTS:
                continue
            a, z = L["src"]; dur = z - a + .15
            kit.AK.run(["-i", os.path.join(HERE, L["file"]), "-af", f"atrim={max(0, a - .03):.3f}:{z + .12:.3f},asetpts=PTS-STARTPTS",
                        "-c:a", "libmp3lame", "-q:a", "2", os.path.join(HERE, f"say_{L['key']}.mp3")])
            f, ss = SHOTS[L["key"]]
            kit.AK.run(["-ss", f"{ss:.3f}", "-i", f, "-t", f"{dur:.3f}", "-an", "-vf", "fps=30", "-c:v", "libx264", "-crf", "14",
                        "-preset", "slow", "-pix_fmt", "yuv420p", os.path.join(HERE, f"shot_{L['key']}.mp4")])
    if "lipsync" in steps:
        for k in SHOTS:
            falkit.lipsync(os.path.join(HERE, f"shot_{k}.mp4"), os.path.join(HERE, f"say_{k}.mp3"), os.path.join(HERE, f"ls_{k}.mp4"))
    if "frames" in steps:
        for k in list(SHOTS):
            d = os.path.join(HERE, "clips", k); os.makedirs(d, exist_ok=True)
            kit.AK.run(["-i", os.path.join(HERE, f"ls_{k}.mp4"), "-vf", "fps=30,scale=1080:1920:flags=lanczos", "-q:v", "2", os.path.join(d, "%03d.jpg")])
            print(k, len(os.listdir(d)), "frames")
    if "audio" in steps:
        longkit.audio(HERE, NAME, longkit.page_sfx(HERE, NAME), music=MUSIC, bed=-25.0)
