import os as _os_font
_C4Y_FONT = ("C\\:/Windows/Fonts/arialbd.ttf" if _os_font.name == "nt" else "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
r"""Klipy wideo z Pexels (darmowa licencja komercyjna) do rolek Żółtego Szalika. 0 zł.
  ..\..\..\runtime\python.exe pexv.py search <slug> "<zapytanie po angielsku>"   -> stock/<slug>.json + stock/<slug>.jpg (arkusz)
  ..\..\..\runtime\python.exe pexv.py get <id> [<id>..]                           -> stock/<id>.mp4 (pion, ok. 1080x1920)
"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
ST = os.path.join(HERE, "stock")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"


def curl(url, out=None):
    a = ["curl", "-s", "-L", "-m", "120", "-A", UA, url] + (["-o", out] if out else [])
    r = subprocess.run(a, capture_output=True)
    return r.stdout.decode("utf-8", "replace")


def search(slug, q):
    h = curl(f"https://www.pexels.com/search/videos/{q.replace(' ', '%20')}/?orientation=portrait")
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', h, re.S)
    found = []

    def walk(o):
        if isinstance(o, dict):
            if o.get("type") == "video" and isinstance(o.get("attributes"), dict):
                found.append(o["attributes"]); return
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(json.loads(m.group(1)) if m else {})
    out = []
    for a in found:
        v = a.get("video") or {}
        files = [f for f in v.get("video_files", []) if f.get("file_type") == "video/mp4" and f.get("height", 0) > f.get("width", 1)]
        out.append({"id": a["id"], "title": a.get("title"), "desc": a.get("description"), "dur": a.get("duration"), "fps": a.get("fps"),
                    "thumb": (v.get("thumbnail") or {}).get("medium"), "license": a.get("license"),
                    "author": " ".join(x for x in [(a.get("user") or {}).get("first_name"), (a.get("user") or {}).get("last_name")] if x),
                    "files": sorted([(f["height"], f["link"]) for f in files if f.get("link")])})
    os.makedirs(ST, exist_ok=True)
    json.dump(out, open(os.path.join(ST, slug + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    th = os.path.join(ST, "_th_" + slug); os.makedirs(th, exist_ok=True)
    for f in os.listdir(th): os.remove(os.path.join(th, f))
    for i, o in enumerate(out[:24]):
        p = os.path.join(th, f"raw{i:02d}.jpg"); curl(o["thumb"], p)
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", p, "-vf",
                        f"scale=240:426:force_original_aspect_ratio=increase,crop=240:426,drawbox=x=0:y=0:w=150:h=34:color=black@0.7:t=fill,"
                        f"drawtext=fontfile='{_C4Y_FONT}':text='{i} {o['dur']}s':fontsize=26:fontcolor=yellow:x=6:y=4", os.path.join(th, f"{i:03d}.png")])
    subprocess.run([FF, "-y", "-loglevel", "error", "-framerate", "1", "-i", os.path.join(th, "%03d.png"), "-vf", "tile=8x3:color=black",
                    "-frames:v", "1", os.path.join(ST, slug + ".jpg")])
    for i, o in enumerate(out[:24]): print(i, o["id"], f"{o['dur']}s", (o["title"] or "")[:70])


def get(pid):
    out = os.path.join(ST, f"{pid}.mp4")
    if os.path.exists(out): return out
    for fn in os.listdir(ST):
        if fn.endswith(".json"):
            for o in json.load(open(os.path.join(ST, fn), encoding="utf-8")):
                if str(o["id"]) == str(pid) and o["files"]:
                    best = [f for f in o["files"] if f[0] >= 1920] or o["files"]
                    raw = out + ".raw.mp4"; curl(best[0][1], raw)
                    subprocess.run([FF, "-y", "-loglevel", "error", "-i", raw, "-an", "-vf",
                                    "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30", "-c:v", "libx264", "-crf", "18", "-preset", "fast", out], check=True)
                    os.remove(raw); print("ok", pid, o["title"]); return out
    print("brak", pid)


if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    if cmd == "search": search(args[0], args[1])
    elif cmd == "get":
        for a in args: get(a)
