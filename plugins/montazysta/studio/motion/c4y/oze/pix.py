import os as _os_font
_C4Y_FONT = ("C\\:/Windows/Fonts/arialbd.ttf" if _os_font.name == "nt" else "/System/Library/Fonts/Supplemental/Arial Bold.ttf")
r"""Klipy Pixabay (darmowa licencja, bez atrybucji) do rolek OZE, 0 zł.
  ..\..\..\runtime\python.exe pix.py search <slug> "<zapytanie>"   -> stock/px_<slug>.json + stock/px_<slug>.jpg (arkusz)
  ..\..\..\runtime\python.exe pix.py get <id> [x=0.5]              -> stock/px<id>.mp4 (1080x1920)
"""
import html, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
ST = os.path.join(HERE, "stock")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"


def curl(url, out=None):
    a = ["curl", "-s", "-L", "-m", "180", "-A", UA, "-e", "https://pixabay.com/", url] + (["-o", out] if out else [])
    return subprocess.run(a, capture_output=True).stdout.decode("utf-8", "replace")


def search(slug, q):
    out, seen = [], set()
    for page in (1, 2):
        h = curl(f"https://pixabay.com/videos/search/{q.replace(' ', '%20')}/" + (f"?pagi={page}" if page > 1 else ""))
        # kafelek: link /videos/<slug>-<id>/ + miniatura .../<id>-<hash>_tiny.jpg + max-width/height
        for m in re.finditer(r'href="/videos/([a-z0-9-]+)-(\d+)/".{0,1500}?max-width:(\d+)px;max-height:(\d+)px"><img src="(https://cdn\.pixabay\.com/video/[^"]+?)_tiny\.jpg" alt="([^"]*)"', h, re.S):
            name, vid, w, hh, base, alt = m.groups()
            if vid in seen: continue
            seen.add(vid)
            out.append({"id": vid, "title": html.unescape(alt), "w": int(w), "h": int(hh), "base": base})
    os.makedirs(ST, exist_ok=True)
    json.dump(out, open(os.path.join(ST, f"px_{slug}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    th = os.path.join(ST, "_th_px_" + slug); os.makedirs(th, exist_ok=True)
    for f in os.listdir(th): os.remove(os.path.join(th, f))
    for i, o in enumerate(out[:32]):
        p = os.path.join(th, f"raw{i:02d}.jpg"); curl(o["base"] + "_small.jpg", p)
        if not os.path.exists(p) or os.path.getsize(p) < 500: curl(o["base"] + "_tiny.jpg", p)
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", p, "-vf",
                        f"scale=240:426:force_original_aspect_ratio=increase,crop=240:426,drawbox=x=0:y=0:w=150:h=34:color=black@0.7:t=fill,"
                        f"drawtext=fontfile='{_C4Y_FONT}':text='{i} {'P' if o['h'] > o['w'] else 'H'}{o['h'] if o['h'] < o['w'] else o['w']}':fontsize=24:fontcolor=yellow:x=6:y=4",
                        os.path.join(th, f"{i:03d}.png")])
    subprocess.run([FF, "-y", "-loglevel", "error", "-framerate", "1", "-i", os.path.join(th, "%03d.png"), "-vf", "tile=8x4:color=black",
                    "-frames:v", "1", os.path.join(ST, f"px_{slug}.jpg")])
    for i, o in enumerate(out[:32]): print(i, o["id"], f"{o['w']}x{o['h']}", o["title"][:70])


def get(vid, x=.5, ss=0, dur=10):
    out = os.path.join(ST, f"px{vid}.mp4")
    if os.path.exists(out): return out
    for fn in os.listdir(ST):
        if not (fn.startswith("px_") and fn.endswith(".json")): continue
        for o in json.load(open(os.path.join(ST, fn), encoding="utf-8")):
            if o["id"] != str(vid): continue
            raw = out + ".raw.mp4"
            for q in ("_large.mp4", "_medium.mp4"):
                curl(o["base"] + q, raw)
                if os.path.exists(raw) and os.path.getsize(raw) > 100000: break
            vf = ("scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" if o["h"] > o["w"] else
                  f"scale=-2:1920,crop=1080:1920:(iw-1080)*{x}:0")
            subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{ss}", "-t", f"{dur}", "-i", raw, "-an", "-vf", vf + ",fps=30",
                            "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-threads", "2", out], check=True)
            os.remove(raw); print("ok", vid, o["title"]); return out
    print("brak", vid)


if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    if cmd == "search": search(args[0], args[1])
    elif cmd == "get": get(args[0], *[float(a) for a in args[1:4]])
