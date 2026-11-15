r"""Schrony (Sebastian, e-schrony.pl): panoramy ze spacerów 3DVista (turtlehouse.pl, shellhouse.pl, schronpubliczny.pl ...).
  ..\..\..\runtime\python.exe pano.py list                -> pano/<site>.json (id, label, levels)
  ..\..\..\runtime\python.exe pano.py fetch <site> <lvl>  -> pano/<site>/<label>/<face>.jpg (sklejone kafelki) + cube.jpg (c3x2: r l u / d f b)
  ..\..\..\runtime\python.exe pano.py preview <site>      -> pano/<site>/_sheet.jpg (każda panorama: 4 kierunki)
  ..\..\..\runtime\python.exe pano.py shot <site> <label> <name> <dur> yaw0 yaw1 pitch0 pitch1 fov0 fov1  -> ../clips/<name>/NNN.jpg (ruch kamery, 720x1280)
"""
import os, sys, re, json, subprocess, urllib.request, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
CLIPS = os.path.join(HERE, "..", "clips")
PANO = os.path.join(HERE, "pano")
SITES = ["turtlehouse.pl", "shellhouse.pl", "schronpubliczny.pl", "lobsterhouse.pl", "ratelhouse.pl"]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
FACES = "rludfb"


def get(url):  # curl.exe (certyfikaty Windows; urllib w runtime odrzuca łańcuch tych stron)
    for _ in range(4):
        r = subprocess.run(["curl.exe", "-s", "-f", "-L", "--max-time", "60", "-A", UA["User-Agent"], url], capture_output=True)
        if not r.returncode: break
    if r.returncode: raise RuntimeError(f"curl {r.returncode} {url}")
    return r.stdout


def ff(args):
    subprocess.run([FF, "-y", "-loglevel", "error"] + args, check=True)


def list_site(site):
    idx = get(f"https://{site}/").decode("utf-8", "replace")
    v = (re.search(r"\?v=(\d+)", idx) or [None, ""])[1]
    s = get(f"https://{site}/script_general.js?v={v}").decode("utf-8", "replace")
    lv = {}
    for u in re.finditer(r'"url":"media/(panorama_[0-9A-F_]+?)_0/\{face\}/(\d+)/\{row\}_\{column\}\.webp"', s):  # kolejność kluczy różna w wersjach 3DVista
        a, b = s.rfind('{"', 0, u.start()), s.find("}", u.end()) + 1
        try: o = json.loads(s[a:b])
        except ValueError: continue
        if o.get("class") != "TiledImageResourceLevel": continue
        lv.setdefault(u.group(1), {})[int(u.group(2))] = {"h": o["height"], "cols": o["colCount"] // 6, "rows": o["rowCount"]}
    labs = [(m.start(), m.group(1)) for m in re.finditer(r'"data":\{"label":"([^"]*)"', s)]
    lab = {}
    for pid in lv:
        best = None
        for m in re.finditer(r'"id":"' + pid + '"', s):
            for pos, l in labs:
                dd = abs(pos - m.start())
                if dd < 600 and (best is None or dd < best[0]): best = (dd, l)
        if best: lab[pid] = best[1]
    out = [{"id": p, "label": re.sub(r"[^\w.-]+", "_", lab.get(p, p)), "levels": lv[p]} for p in lv]
    os.makedirs(PANO, exist_ok=True)
    json.dump(out, open(os.path.join(PANO, site + ".json"), "w"), indent=1)
    print(site, len(out), "panoram")
    return out


def fetch(site, level, only=None):
    pans = json.load(open(os.path.join(PANO, site + ".json")))
    for p in pans:
        if only and p["label"] not in only: continue
        L = p["levels"][str(level)]
        d = os.path.join(PANO, site, p["label"]); td = os.path.join(d, f"t{level}"); os.makedirs(td, exist_ok=True)
        jobs = []
        for f in FACES:
            for r in range(L["rows"]):
                for c in range(L["cols"]):
                    jobs.append((f"https://{site}/media/{p['id']}_0/{f}/{level}/{r}_{c}.webp", os.path.join(td, f"{f}_{r}_{c}.webp")))
        def dl(j):
            if os.path.exists(j[1]) and os.path.getsize(j[1]) > 200: return
            data = get(j[0]); open(j[1] + ".part", "wb").write(data); os.replace(j[1] + ".part", j[1])
        with cf.ThreadPoolExecutor(12) as ex: list(ex.map(dl, jobs))
        n = L["rows"]
        for f in FACES:  # kafelki -> ściana (xstack n x n)
            ins, lay = [], []
            for r in range(n):
                for c in range(n):
                    ins += ["-i", os.path.join(td, f"{f}_{r}_{c}.webp")]
                    lay.append(f"{'+'.join(['w0'] * c) or '0'}_{'+'.join(['h0'] * r) or '0'}")
            if n == 1:
                ff(ins + ["-q:v", "2", os.path.join(d, f + ".jpg")])
            else:
                ff(ins + ["-filter_complex", f"xstack=inputs={n*n}:layout={'|'.join(lay)}", "-q:v", "2", os.path.join(d, f + ".jpg")])
        ins = []
        for f in FACES: ins += ["-i", os.path.join(d, f + ".jpg")]
        ff(ins + ["-filter_complex", "xstack=inputs=6:layout=0_0|w0_0|w0+w0_0|0_h0|w0_h0|w0+w0_h0", "-q:v", "2", os.path.join(d, "cube.jpg")])
        print("ok", site, p["label"])


def view(cube, out, yaw, pitch, fov_h, w, h):
    ff(["-i", cube, "-vf", f"v360=c3x2:flat:yaw={yaw}:pitch={pitch}:h_fov={fov_h}:v_fov={fov_v(fov_h, w, h)}:w={w}:h={h}:interp=lanczos", "-q:v", "2", out])


def wrap(y):
    return (y + 180) % 360 - 180


def fov_v(fh, w, h):
    import math
    return 2 * math.degrees(math.atan(math.tan(math.radians(fh) / 2) * h / w))


def preview(site):
    pans = json.load(open(os.path.join(PANO, site + ".json")))
    tiles = []
    for p in pans:
        d = os.path.join(PANO, site, p["label"]); cube = os.path.join(d, "cube.jpg")
        if not os.path.exists(cube): continue
        for k, yaw in enumerate((0, 90, 180, -90)):
            o = os.path.join(d, f"_v{k}.jpg"); view(cube, o, yaw, -5, 90, 480, 360); tiles.append(o)
    rows = len(tiles) // 4
    ins = []
    for t in tiles: ins += ["-i", t]
    lay = "|".join(f"{(i % 4) * 480}_{(i // 4) * 360}" for i in range(len(tiles)))
    labels = ",".join(f"drawtext=text='{i}\\: {p['label']}':x=8:y={i*360+8}:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.6" for i, p in enumerate([q for q in pans if os.path.exists(os.path.join(PANO, site, q['label'], 'cube.jpg'))]))
    ff(ins + ["-filter_complex", f"xstack=inputs={len(tiles)}:layout={lay},scale=1440:-1" + ("" if not labels else "," + labels.replace("y=", "y=").replace("fontsize=26", "fontsize=20")), "-q:v", "3", os.path.join(PANO, site, "_sheet.jpg")])
    print("sheet", rows, "rows")


def dirs(site, labels, out):
    """siatka: wiersz = panorama, kolumny = yaw -180..135 co 45 (pionowe kadry 9:16) -> out"""
    tiles = []
    for lb in labels:
        cube = os.path.join(PANO, site, lb, "cube.jpg")
        for yaw in range(-180, 180, 45):
            o = os.path.join(PANO, site, lb, f"_d{yaw}.jpg")
            ff(["-i", cube, "-vf", f"v360=c3x2:flat:yaw={yaw}:pitch=-5:h_fov=70:v_fov={fov_v(70, 180, 320):.2f}:w=180:h=320,"
                f"drawtext=text='{yaw}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6", "-q:v", "3", o])
            tiles.append(o)
    ins = []
    for t in tiles: ins += ["-i", t]
    lay = "|".join(f"{(i % 8) * 180}_{(i // 8) * 320}" for i in range(len(tiles)))
    ff(ins + ["-filter_complex", f"xstack=inputs={len(tiles)}:layout={lay}", "-q:v", "3", out])


def manifest_update(counts):
    man_p = os.path.join(CLIPS, "manifest.json")
    man = json.load(open(man_p, encoding="utf-8"))
    man.update(counts)
    json.dump(man, open(man_p, "w", encoding="utf-8"), indent=1)
    open(os.path.join(CLIPS, "manifest.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(man) + ";\n")


def shot(site, label, name, dur, y0, y1, p0, p1, f0, f1, w=720, h=1280, fps=30, manifest=True):
    """ruch kamery: yaw/pitch/fov od -> do (ease in-out), klatki do clips/<name>/NNN.jpg"""
    import math
    cube = os.path.join(PANO, site, label, "cube.jpg")
    d = os.path.join(CLIPS, name); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    n = int(round(dur * fps))
    # UWAGA: komendy sendcmd dla v360 obracają PRZYROSTOWO (yaw/pitch dodają się), więc każda klatka = osobny FFmpeg z kątem bezwzględnym
    def one(i):
        u = i / max(1, n - 1); e = .5 - .5 * math.cos(math.pi * u)
        fh = f0 + (f1 - f0) * e
        ff(["-i", cube, "-vf", f"v360=c3x2:flat:yaw={wrap(y0 + (y1 - y0) * e):.3f}:pitch={p0 + (p1 - p0) * e:.3f}:h_fov={fh:.3f}:v_fov={fov_v(fh, w, h):.3f}"
            f":w={w}:h={h}:interp=lanczos", "-frames:v", "1", "-q:v", "3", os.path.join(d, f"{i + 1:03d}.jpg")])
    with cf.ThreadPoolExecutor(10) as ex: list(ex.map(one, range(n)))
    cnt = len([x for x in os.listdir(d) if x.endswith(".jpg")])
    if manifest: manifest_update({name: cnt})
    print(name, cnt)
    return cnt


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "list":
        for s in (a[1:] or SITES):
            try: list_site(s)
            except Exception as e: print(s, "BŁĄD", e)
    elif a[0] == "fetch": fetch(a[1], int(a[2]), a[3:] or None)
    elif a[0] == "preview": preview(a[1])
    elif a[0] == "dirs": dirs(a[1], a[3:], a[2])
    elif a[0] == "shot": shot(a[1], a[2], a[3], float(a[4]), *map(float, a[5:11]))
