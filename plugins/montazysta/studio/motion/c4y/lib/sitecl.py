r"""Example reels of clips4you.pl (clips4you/site/media/c: h1-h5 mechanic, w01-w12 industries; stills made on Pexels footage)
-> clips/cNN/001..150.jpg (540x960, 30 fps) with a slow ping-pong zoom so the loop is seamless, + manifest update.
These are the ONLY reels the Clips4you films may show (user 2026-09-30: not Kuba's EN reels, not other YouTubers' clips)."""
import os, json, subprocess
LIB = os.path.dirname(os.path.abspath(__file__)); C4Y = os.path.dirname(LIB); ROOT = os.path.dirname(os.path.dirname(C4Y))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe"); SRC = os.path.join(ROOT, "clips4you", "site", "media", "c"); CL = os.path.join(C4Y, "clips")
NAMES = ["h1", "h2", "h3", "h4", "h5"] + [f"w{i:02d}" for i in range(1, 13)]
man_p = os.path.join(CL, "manifest.json"); man = json.load(open(man_p, encoding="utf-8"))
for i, n in enumerate(NAMES):
    cid = f"c{i + 1:02d}"; d = os.path.join(CL, cid); os.makedirs(d, exist_ok=True)
    if len([x for x in os.listdir(d) if x.endswith(".jpg")]) < 150:
        z = "1+0.045*sin(PI*on/150)"
        subprocess.run([FF, "-y", "-loglevel", "error", "-loop", "1", "-i", os.path.join(SRC, n + ".jpg"), "-vf",
                        f"scale=1080:1920,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=540x960:fps=30",
                        "-frames:v", "150", "-q:v", "3", os.path.join(d, "%03d.jpg")], check=True)
    man[cid] = 150; print(cid, n)
json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
open(os.path.join(CL, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")
