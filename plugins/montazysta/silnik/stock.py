"""Darmowe B-rolle ze stocku (Pexels, Pixabay), 0 zł, bez kluczy i kont.
  stock <projekt> "<zapytanie po angielsku>" [--zrodlo pexels|pixabay] [--nazwa slug]
      -> stock/<slug>.json + stock/<slug>.jpg (arkusz miniatur z numerami) + lista w terminalu
  stock-pobierz <projekt> <id> [--x 0.5] [--od 0] [--sek 10]
      -> materialy/stock_<id>.mp4 (1080x1920, 30 kl./s, bez dźwięku) + nowe źródło w rolka.json

Obsada na rynek PL: zanim klip trafi na oś, obejrzyj arkusz i KAŻDĄ osobę w kadrze (także dłonie i tło):
wygląd środkowoeuropejski, bez osób czarnoskórych. Kod tego nie sprawdzi, to obowiązkowy punkt przeglądu.
"""
import html, json, re, subprocess, urllib.parse

import narzedzia as N

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
MAKS = 32


def curl(url, out=None, referer=None):
    cmd = ["curl", "-s", "-L", "-m", "180", "-A", UA]
    if referer:
        cmd += ["-e", referer]
    cmd += [url] + (["-o", str(out)] if out else [])
    return subprocess.run(cmd, capture_output=True).stdout.decode("utf-8", "replace")


def _pexels(q):
    found = []
    for page in (1, 2):
        h = curl(f"https://www.pexels.com/search/videos/{urllib.parse.quote(q)}/?page={page}")
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', h, re.S)

        def walk(o):
            if isinstance(o, dict):
                if o.get("type") == "video" and isinstance(o.get("attributes"), dict):
                    found.append(o["attributes"])
                    return
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)

        walk(json.loads(m.group(1)) if m else {})
    out, seen = [], set()
    for a in found:
        if a["id"] in seen:
            continue
        seen.add(a["id"])
        v = a.get("video") or {}
        files = [(f["width"], f["height"], f["link"]) for f in v.get("video_files", []) if f.get("file_type") == "video/mp4" and f.get("link")]
        if not files:
            continue
        w, h, _ = max(files, key=lambda f: f[0] * f[1])
        # pion 1080x1920 bez powiększania: poziomy plik musi mieć >= 1900 px wysokości (4K), pionowy >= 1000 px szerokości
        if not ((h >= 1900) if w > h else (w >= 1000)):
            continue
        out.append({"id": str(a["id"]), "zrodlo": "pexels", "tytul": a.get("title") or "", "sek": a.get("duration"), "w": w, "h": h,
                    "miniatura": (v.get("thumbnail") or {}).get("medium"), "pliki": sorted(files, key=lambda f: f[0] * f[1])})
    return out


def _pixabay(q):
    out, seen = [], set()
    for page in (1, 2):
        h = curl(f"https://pixabay.com/videos/search/{urllib.parse.quote(q)}/" + (f"?pagi={page}" if page > 1 else ""), referer="https://pixabay.com/")
        for m in re.finditer(r'href="/videos/([a-z0-9-]+)-(\d+)/".{0,1500}?max-width:(\d+)px;max-height:(\d+)px"><img src="(https://cdn\.pixabay\.com/video/[^"]+?)_tiny\.jpg" alt="([^"]*)"', h, re.S):
            _, vid, w, hh, base, alt = m.groups()
            if vid in seen:
                continue
            seen.add(vid)
            out.append({"id": vid, "zrodlo": "pixabay", "tytul": html.unescape(alt), "sek": None, "w": int(w), "h": int(hh),
                        "miniatura": base + "_small.jpg", "baza": base})
    return out


def szukaj(a):
    P = N.projekt(a.projekt)
    slug = a.nazwa or re.sub(r"[^a-z0-9]+", "-", a.zapytanie.lower()).strip("-")[:40]
    wyniki = (_pexels if a.zrodlo == "pexels" else _pixabay)(a.zapytanie)[:MAKS]
    st = P / "stock"
    th = st / f"_min_{slug}"
    th.mkdir(parents=True, exist_ok=True)
    for f in th.iterdir():
        f.unlink()
    (st / f"{slug}.json").write_text(json.dumps(wyniki, ensure_ascii=False, indent=1), encoding="utf-8")
    kafle = 0  # kolejne numery plików bez dziur, bo ffmpeg czyta %03d po kolei (wzorzec glob nie działa na Windowsie)
    for i, o in enumerate(wyniki):
        raw = th / f"raw{i:02d}.jpg"
        curl(o["miniatura"], raw, referer="https://pixabay.com/" if o["zrodlo"] == "pixabay" else None)
        if not raw.exists() or raw.stat().st_size < 500:
            continue
        etykieta = f"{i} {'P' if o['h'] > o['w'] else 'H'}"
        kadr = "scale=240:426:force_original_aspect_ratio=increase,crop=240:426"
        try:
            N.ff("-i", raw, "-vf", f"{kadr},drawbox=x=0:y=0:w=90:h=34:color=black@0.7:t=fill,drawtext=text='{etykieta}':fontsize=26:fontcolor=yellow:x=6:y=4", th / f"{kafle:03d}.png")
        except subprocess.CalledProcessError:
            N.ff("-i", raw, "-vf", kadr, th / f"{kafle:03d}.png")  # ffmpeg bez czcionek: arkusz bez numerów
        kafle += 1
    if kafle:
        N.ff("-framerate", "1", "-i", th / "%03d.png", "-vf", "tile=8x4:color=black", "-frames:v", "1", st / f"{slug}.jpg")
    for i, o in enumerate(wyniki):
        print(i, o["id"], f"{o['sek'] or '?'}s", f"{o['w']}x{o['h']}", o["tytul"][:70])
    print(f"Arkusz: {st / (slug + '.jpg')} (numery od lewej, wierszami). Sprawdź obsadę przed pobraniem.")
    return 0


def pobierz(a):
    P = N.projekt(a.projekt)
    cel = P / "materialy" / f"stock_{a.id}.mp4"
    o = None
    for plik in (P / "stock").glob("*.json"):
        o = next((x for x in json.loads(plik.read_text(encoding="utf-8")) if str(x["id"]) == str(a.id)), None)
        if o:
            break
    if not o:
        raise SystemExit(f"Nie znam klipu {a.id}. Najpierw: stock <projekt> \"<zapytanie>\".")
    if not cel.exists():
        cel.parent.mkdir(exist_ok=True)
        raw = cel.with_suffix(".raw.mp4")
        if o["zrodlo"] == "pexels":
            w, h, link = next((f for f in o["pliki"] if (f[1] >= 1900 if f[0] > f[1] else f[0] >= 1080)), o["pliki"][-1])
            curl(link, raw)
        else:
            for q in ("_large.mp4", "_medium.mp4"):
                curl(o["baza"] + q, raw, referer="https://pixabay.com/")
                if raw.exists() and raw.stat().st_size > 100_000:
                    break
        pion = o["h"] > o["w"]
        vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" if pion else f"scale=-2:1920,crop=1080:1920:(iw-1080)*{a.x}:0"
        N.ff("-ss", a.od, "-t", a.sek, "-i", raw, "-an", "-vf", vf + f",fps={N.FPS}", "-c:v", "libx264", "-crf", "18", "-preset", "fast", cel)
        raw.unlink(missing_ok=True)
    spec = N.spec(P)
    zr = spec.setdefault("zrodla", {})
    rel = f"materialy/{cel.name}"
    klucz = next((k for k, v in zr.items() if (v["plik"] if isinstance(v, dict) else v) == rel), None)
    if not klucz:
        klucz = next(chr(c) for c in range(97, 123) if chr(c) not in zr)
        zr[klucz] = {"plik": rel, "stock": f"{o['zrodlo']} {o['id']}"}
        (P / "rolka.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"ok: {rel} jako źródło „{klucz}” ({o['tytul'][:60]})")
    return 0


def dodaj_polecenia(s):
    p = s.add_parser("stock")
    p.add_argument("projekt")
    p.add_argument("zapytanie")
    p.add_argument("--zrodlo", choices=("pexels", "pixabay"), default="pexels")
    p.add_argument("--nazwa")
    p.set_defaults(f=szukaj)
    p = s.add_parser("stock-pobierz")
    p.add_argument("projekt")
    p.add_argument("id")
    p.add_argument("--x", type=float, default=.5, help="środek kadru przy klipie poziomym, 0-1")
    p.add_argument("--od", type=float, default=0)
    p.add_argument("--sek", type=float, default=10)
    p.set_defaults(f=pobierz)
