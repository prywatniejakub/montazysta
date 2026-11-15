r"""Reel r25v - "I built an app by talking into a banana." (SaaS style + the retention playbook, 2026-09-26).
Hook = Kuba himself (HeyGen Avatar IV from motion/kuba/l1/img/kuba.webp, lip-synced to the SAME "Reel" voice line b1),
then the SaaS montage: the banana mic -> a voice wave -> the chat box -> code -> a phone app with login + payment ->
light: "two years ago, a whole team" -> one sentence and a banana -> DM CTA.
  ..\..\..\runtime\python.exe script.py voice timing   /   script.py hook   /   script.py audio
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
import longkit
kit = longkit.kit

NAME = "r25v"
LINES = [("b1", "I built an app by talking into a banana."),
         ("b2", "Okay, it's a mic. But I really just talk."),
         ("b3", "I say what I want. AI writes every line of code."),
         ("b4", "One evening later, it's a real app. Login, payments, everything."),
         ("b5", "Two years ago, that took a whole team."),
         ("b6", "Now it takes one sentence. And a banana."),
         ("b7", "DM me SaaS, and I'll send you a free lesson on building yours.")]
CHAPTERS = [("reel", "Reel", LINES)]
GAPS = {"b2": .12, "b3": .15, "b4": .15, "b5": .2, "b6": .15, "b7": .2}
MUSIC = os.path.join(kit.ASSETS, "music", "saas.mp3")

if __name__ == "__main__":
    steps = sys.argv[1:] or ["voice", "timing"]
    if "voice" in steps:  # one ElevenLabs take, then the dead air inside the lines is cut (voice_t.mp3)
        d = os.path.join(HERE, "vo", "reel"); os.makedirs(d, exist_ok=True)
        kit.tighten(d, [t for _, t in LINES], voice_id=kit.REEL)
    if "timing" in steps:
        longkit.timing(HERE, CHAPTERS, GAPS, t0=.02, hold=1.3)
    if "hook" in steps:  # b1 alone as its own audio file for the HeyGen lip-sync
        T = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8")); L = T["lines"][0]
        a, z = L["src"]
        kit.AK.run(["-i", os.path.join(HERE, L["file"]), "-af", f"atrim={max(0, a - .03):.3f}:{z + .12:.3f},asetpts=PTS-STARTPTS",
                    "-c:a", "libmp3lame", "-q:a", "2", os.path.join(HERE, "hook_b1.mp3")])
    if "audio" in steps:
        longkit.audio(HERE, NAME, longkit.page_sfx(HERE, NAME), music=MUSIC, bed=-25.0)
