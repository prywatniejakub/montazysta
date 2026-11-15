import os as _os_font
_C4Y_FONT = ("C\\:/Windows/Fonts/arialbd.ttf" if _os_font.name == "nt" else "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
r"""Klipy Pexels do rolek OZE (Fundusz Modernizacji Budynków), 0 zł: wszystkie orientacje, poziome 4K przycinane do pionu.
  ..\..\..\runtime\python.exe pex2.py search <slug> "<zapytanie po angielsku>"   -> stock/<slug>.json + stock/<slug>.jpg (arkusz)
  ..\..\..\runtime\python.exe pex2.py get <id> [x=0.5]                            -> stock/<id>.mp4 (1080x1920, x = środek kadru 0-1)
"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
ST = os.path.join(HERE, "stock")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"


def curl(url, out=None):
    a = ["curl", "-s", "-L", "-m", "180", "-A", UA, url] + (["-o", out] if out else [])
    return subprocess.run(a, capture_output=True).stdout.decode("utf-8", "replace")


def search(slug, q):
    found = []
    for page in (1, 2):
        h = curl(f"https://www.pexels.com/search/videos/{q.replace(' ', '%20')}/?page={page}")
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', h, re.S)

        def walk(o):
            if isinstance(o, dict):
                if o.get("type") == "video" and isinstance(o.get("attributes"), dict):
                    found.append(o["attributes"]); return
                for v in o.values(): walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
        walk(json.loads(m.group(1)) if m else {})
    out, seen = [], set()
    for a in found:
        if a["id"] in seen: continue
        seen.add(a["id"])
        v = a.get("video") or {}
        files = [(f["width"], f["height"], f["link"]) for f in v.get("video_files", []) if f.get("file_type") == "video/mp4" and f.get("link")]
        if not files: continue
        w, h, _ = max(files, key=lambda f: f[0] * f[1])
        # pion wymaga ok. 1080 px szerokości kadru: poziomy plik musi mieć wysokość >= 1900 (4K), pionowy szerokość >= 1000
        ok = (h >= 1900) if w > h else (w >= 1000)
        out.append({"id": a["id"], "title": a.get("title"), "dur": a.get("duration"), "w": w, "h": h, "ok": ok,
                    "thumb": (v.get("thumbnail") or {}).get("medium"), "files": sorted(files, key=lambda f: f[0] * f[1])})
    out = [o for o in out if o["ok"]]
    os.makedirs(ST, exist_ok=True)
    json.dump(out, open(os.path.join(ST, slug + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    th = os.path.join(ST, "_th_" + slug); os.makedirs(th, exist_ok=True)
    for f in os.listdir(th): os.remove(os.path.join(th, f))
    for i, o in enumerate(out[:32]):
        p = os.path.join(th, f"raw{i:02d}.jpg"); curl(o["thumb"], p)
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", p, "-vf",
                        f"scale=240:426:force_original_aspect_ratio=increase,crop=240:426,drawbox=x=0:y=0:w=170:h=34:color=black@0.7:t=fill,"
                        f"drawtext=fontfile='{_C4Y_FONT}':text='{i} {o['dur']}s {'P' if o['h'] > o['w'] else 'H'}':fontsize=26:fontcolor=yellow:x=6:y=4",
                        os.path.join(th, f"{i:03d}.png")])
    subprocess.run([FF, "-y", "-loglevel", "error", "-framerate", "1", "-i", os.path.join(th, "%03d.png"), "-vf", "tile=8x4:color=black",
                    "-frames:v", "1", os.path.join(ST, slug + ".jpg")])
    for i, o in enumerate(out[:32]): print(i, o["id"], f"{o['dur']}s", f"{o['w']}x{o['h']}", (o["title"] or "")[:70])


def get(pid, x=.5, ss=0, dur=10):
    out = os.path.join(ST, f"{pid}.mp4")
    if os.path.exists(out): return out
    for fn in os.listdir(ST):
        if not fn.endswith(".json"): continue
        for o in json.load(open(os.path.join(ST, fn), encoding="utf-8")):
            if str(o["id"]) != str(pid): continue
            # najmniejszy plik, który daje pion 1080x1920 bez powiększania
            w, h, link = next((f for f in o["files"] if (f[1] >= 1900 if f[0] > f[1] else f[0] >= 1080)), o["files"][-1])
            raw = out + ".raw.mp4"; curl(link, raw)
            vf = ("scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" if h > w else
                  f"scale=-2:1920,crop=1080:1920:(iw-1080)*{x}:0")
            subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{ss}", "-t", f"{dur}", "-i", raw, "-an", "-vf", vf + ",fps=30",
                            "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-threads", "2", out], check=True)
            os.remove(raw); print("ok", pid, o["title"]); return out
    print("brak", pid)


if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    if cmd == "search": search(args[0], args[1])
    elif cmd == "get": get(args[0], *[float(a) for a in args[1:4]])
