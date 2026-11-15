# -*- coding: utf-8 -*-
"""Kontrola montażu rolki 9:16 przed oddaniem (agent Montażysta, 2026-11-09).

Sprawdza kodem błędy, które wracały mimo zasad w notatkach (ucięta twarz Kolmed 2026-11-04, ping z kodu 2026-11-09):
  plik    format 9:16, rozdzielczość, kl./s, dźwięk od t=0
  hook    klatka 0 z obrazem, tekst w klatce 0 (DOM), pierwsza zmiana obrazu
  kadr    ucięta twarz, twarz przy krawędzi, linia oczu, napis na twarzy (YuNet, 5 kl./s)
  napisy  strefy aplikacji, tekst za krawędzią, 2 linijki, ponad 3 słowa, środek, wielkość, grubość (geometria z DOM strony rolki)
  tempo   cięcia, najdłuższe ujęcie, martwy obraz
  dzwiek  głośność zintegrowana LUFS, true peak
  kolor   za ciemno, przepalenia, skoki jasności między ujęciami
  zakazy  zakazane dźwięki i głosy w plikach rolki
Progi: tools/kontrola/montaz_progi.json (źródła: wiedza/agenci/montazysta/kontrole.md).

Użycie:
  runtime\\python.exe -I tools\\kontrola\\montaz.py <rolka.mp4> [--strona rolka.html] [--folder folder_rolki]
        [--profil reklama|organik] [--wyjscie folder_raportu] [--bez-dom]
Wynik: raport.md, raport.json, arkusz-bledy.jpg, arkusz-calosc.jpg; kod wyjścia 0 = brak błędów krytycznych, 2 = są krytyczne.
"""
import argparse, glob, io, json, math, os, re, subprocess, sys, time

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path.insert(0, os.path.join(ROOT, "tools", "twarze", "pylib"))
import numpy as np  # noqa: E402
import cv2  # noqa: E402

FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
FP = os.path.join(ROOT, "ffmpeg", "ffprobe.exe")
YUNET = os.path.join(ROOT, "tools", "twarze", "modele", "face_detection_yunet_2023mar.onnx")
PROGI = json.load(io.open(os.path.join(ROOT, "tools", "kontrola", "montaz_progi.json"), encoding="utf-8"))
FPS_PROBEK = 5
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
KRYT, BLAD, UWAGA = "KRYTYCZNY", "BŁĄD", "UWAGA"


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")


# ---------------------------------------------------------------- dane pliku
def probe(p):
    r = run([FP, "-v", "error", "-show_streams", "-show_format", "-of", "json", p])
    return json.loads(r.stdout or "{}")


class Wynik:
    """Zbiera sprawdzenia (zaliczone/nie) i problemy z czasem do arkusza."""
    def __init__(self):
        self.spr, self.problemy = [], []

    def check(self, warstwa, kod, ok, poziom=BLAD, opis="", od=None, do=None, ramki=None, szczegol=""):
        self.spr.append({"warstwa": warstwa, "kod": kod, "ok": bool(ok), "poziom": None if ok else poziom, "opis": opis})
        if not ok:
            self.problemy.append({"warstwa": warstwa, "kod": kod, "poziom": poziom, "opis": opis,
                                  "od": od, "do": do, "ramki": ramki or [], "szczegol": szczegol})

    def wyniki_warstw(self):
        out = {}
        for s in self.spr:
            w = out.setdefault(s["warstwa"], [0.0, 0])
            w[0] += 1.0 if s["ok"] else (0.5 if s["poziom"] == UWAGA else 0.0)
            w[1] += 1
        return {k: round(100 * v[0] / v[1]) for k, v in out.items() if v[1]}

    def wynik(self):
        n = len(self.spr)
        if not n:
            return 0
        pkt = sum(1.0 if s["ok"] else (0.5 if s["poziom"] == UWAGA else 0.0) for s in self.spr)
        w = round(100 * pkt / n)
        if any(p["poziom"] == KRYT for p in self.problemy):
            w = min(w, 49)
        return w


def przedzialy(czasy, krok, min_trwanie):
    """Łączy czasy próbek w przedziały; zostawia te, które trwają co najmniej min_trwanie."""
    out = []
    for t in sorted(czasy):
        if out and t - out[-1][1] <= krok * 1.6:
            out[-1][1] = t
        else:
            out.append([t, t])
    return [(a, b + krok) for a, b in out if (b + krok - a) >= min_trwanie - 1e-6]


def fmt_t(t):
    return ("%.1f" % t).replace(".", ",") + " s"


# ---------------------------------------------------------------- klatki, twarze, kolor
def czytaj_klatki(p, W, H):
    """Klatki co 0,2 s w 540 px szerokości (do twarzy) i miniatury 270 px (arkusz, ruch, kolor)."""
    sw = 540
    sh = int(round(H * sw / W / 2)) * 2
    cmd = [FF, "-v", "error", "-i", p, "-vf", "fps=%d,scale=%d:%d" % (FPS_PROBEK, sw, sh), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    n = sw * sh * 3
    det = cv2.FaceDetectorYN.create(YUNET, "", (sw, sh), 0.6, 0.3, 50) if os.path.exists(YUNET) else None
    skala = W / sw
    out = []
    i = 0
    while True:
        buf = proc.stdout.read(n)
        if len(buf) < n:
            break
        fr = np.frombuffer(buf, np.uint8).reshape(sh, sw, 3)
        twarze = []
        if det is not None:
            _, f = det.detect(fr)
            if f is not None:
                for r in f:
                    x, y, w, h = [float(v) * skala for v in r[:4]]
                    oczy_y = (float(r[5]) + float(r[7])) / 2 * skala
                    twarze.append({"x": x, "y": y, "w": w, "h": h, "oczy_y": oczy_y, "pewnosc": float(r[14])})
        mini = cv2.resize(fr, (sw // 2, sh // 2), interpolation=cv2.INTER_AREA)
        ycc = cv2.cvtColor(mini, cv2.COLOR_BGR2YCrCb)[:, :, 0]
        hsv = cv2.cvtColor(mini, cv2.COLOR_BGR2HSV)
        out.append({"t": i / FPS_PROBEK, "mini": mini, "twarze": twarze,
                    "luma": float(ycc.mean()), "przepal": float((ycc > 250).mean()), "czern": float((ycc < 8).mean()),
                    "nasyc": float(hsv[:, :, 1].mean()), "szary": cv2.cvtColor(mini, cv2.COLOR_BGR2GRAY).astype(np.int16)})
        i += 1
    proc.wait()
    return out


def ciecia(p, prog):
    """Cięcia adaptacyjnie (jak AdaptiveDetector z PySceneDetect): wynik zmiany sceny z ffmpeg dla każdej klatki,
    cięcie = skok ponad 3x medianę otoczenia ±0,5 s i ponad próg minimalny. Nasze rendery mają rozmycie ruchu
    i podobne kolory, więc stały próg 0,3 nie łapał cięć (W2: max 0,25)."""
    r = run([FF, "-v", "error", "-i", p, "-an", "-vf", "select=gte(scene\\,0),metadata=print:key=lavfi.scene_score:file=-", "-f", "null", "-"])
    ts, sc = [], []
    t = None
    for linia in r.stdout.splitlines():
        m = re.search(r"pts_time:([0-9.]+)", linia)
        if m:
            t = float(m.group(1))
            continue
        m = re.search(r"scene_score=([0-9.]+)", linia)
        if m and t is not None:
            ts.append(t); sc.append(float(m.group(1)))
    out, ost = [], -9.0
    n = len(sc)
    for i in range(n):
        okno = [sc[j] for j in range(max(0, i - 15), min(n, i + 16)) if j != i]
        lok = float(np.median(okno)) if okno else 0.0
        if sc[i] > max(prog, 3.0 * lok + 0.02) and ts[i] - ost >= 0.4:
            out.append(round(ts[i], 2)); ost = ts[i]
    return out


def glosnosc(p):
    r = run([FF, "-v", "info", "-nostats", "-i", p, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"])
    s = r.stderr
    tail = s[s.rfind("Summary:"):] if "Summary:" in s else s
    I = re.search(r"I:\s+(-?[0-9.]+)\s+LUFS", tail)
    TP = re.search(r"True peak:\s+Peak:\s+(-?[0-9.inf]+)\s+dBFS", tail, re.S)
    LRA = re.search(r"LRA:\s+([0-9.]+)\s+LU", tail)
    return (float(I.group(1)) if I else None, float(TP.group(1)) if TP and TP.group(1) not in ("-inf", "inf") else None,
            float(LRA.group(1)) if LRA else None)


def start_dzwieku(p):
    r = run([FF, "-v", "info", "-nostats", "-i", p, "-vn", "-af", "silencedetect=noise=-45dB:d=0.04", "-t", "3", "-f", "null", "-"])
    m0 = re.search(r"silence_start:\s*(-?[0-9.]+)", r.stderr)
    if m0 and float(m0.group(1)) <= 0.02:
        m1 = re.search(r"silence_end:\s*([0-9.]+)", r.stderr)
        return float(m1.group(1)) if m1 else 3.0
    return 0.0


# ---------------------------------------------------------------- DOM strony rolki (napisy i strefy)
JS_TEKSTY = r"""
(() => {
  const W = innerWidth, H = innerHeight, out = [], grupy = new Map();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  const widoczny = el => { let op = 1, e = el;
    while (e && e.nodeType === 1) { const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      op *= parseFloat(cs.opacity || '1'); e = e.parentElement; }
    return op; };
  // Zakrycie: elementsFromPoint widzi tylko elementy z pointer-events, więc na czas kontroli włączamy je wszystkim.
  if (!document.getElementById('__kontrola_pe')) { const s = document.createElement('style'); s.id = '__kontrola_pe';
    s.textContent = '*{pointer-events:auto!important}'; document.head.appendChild(s); }
  const pelny = e => { if (widoczny(e) < 0.9) return false;
    if (['IMG', 'VIDEO', 'CANVAS'].includes(e.tagName)) return true;
    const cs = getComputedStyle(e), m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map(parseFloat); if (p.length < 4 || p[3] >= 0.9) return true; }
    return /url\(/.test(cs.backgroundImage); };
  const zakryty = (el, cx, cy) => { for (const e of document.elementsFromPoint(cx, cy)) {
      if (e === el || el.contains(e) || e.contains(el)) return false;
      if (pelny(e)) return true; }
    return true; };
  // Przycięcie przez rodziców z overflow hidden (np. maska wjazdu tekstu) = widoczna część tekstu.
  const przytnij = (el, r) => { let [a, b, c, d] = r, e = el.parentElement;
    while (e && e !== document.body) { const cs = getComputedStyle(e);
      if (/(hidden|clip)/.test(cs.overflow + cs.overflowX + cs.overflowY) || cs.clipPath !== 'none') {
        const q = e.getBoundingClientRect(); a = Math.max(a, q.left); b = Math.max(b, q.top); c = Math.min(c, q.right); d = Math.min(d, q.bottom); }
      e = e.parentElement; }
    return [a, b, c, d]; };
  while ((n = tw.nextNode())) {
    const txt = n.textContent.replace(/\s+/g, ' ').trim();
    if (!txt) continue;
    const el = n.parentElement; if (!el || ['SCRIPT','STYLE','TITLE','NOSCRIPT'].includes(el.tagName)) continue;
    const op = widoczny(el); if (op < 0.35) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const rs = [...rg.getClientRects()].filter(q => q.width > 1 && q.height > 1);
    if (!rs.length) continue;
    const x0 = Math.min(...rs.map(q => q.left)), y0 = Math.min(...rs.map(q => q.top));
    const x1 = Math.max(...rs.map(q => q.right)), y1 = Math.max(...rs.map(q => q.bottom));
    if (x1 <= 0 || y1 <= 0 || x0 >= W || y0 >= H) continue;
    const [v0, w0, v1, w1] = przytnij(el, [Math.max(0, x0), Math.max(0, y0), Math.min(W, x1), Math.min(H, y1)]);
    const pole = (x1 - x0) * (y1 - y0), widac = Math.max(0, v1 - v0) * Math.max(0, w1 - w0);
    if (widac < 0.25 * pole) continue;
    if (zakryty(el, (v0 + v1) / 2, (w0 + w1) / 2)) continue;
    const cs = getComputedStyle(el);
    if (/rgba\([^)]*,\s*0\)$/.test(cs.color)) continue;
    // napis = najwyższy przodek z „cap” w klasie (słowa napisu bywają osobnymi elementami z klasą typu cap-w)
    let cap = el.closest('[class*="cap" i]');
    while (cap && cap.parentElement && cap.parentElement.closest('[class*="cap" i]')) cap = cap.parentElement.closest('[class*="cap" i]');
    const rec = { t: txt.slice(0, 60), x0, y0, x1, y1, lh: Math.max(...rs.map(q => q.height)), fw: parseInt(cs.fontWeight) || 400,
                  it: cs.fontStyle === 'italic', op: Math.round(op * 100) / 100, cap: !!cap };
    if (cap) { let g = grupy.get(cap); if (!g) { g = { el: cap, recs: [] }; grupy.set(cap, g); } g.recs.push(...rs.map(q => [q.left, q.top, q.right, q.bottom])); g.slowa = (g.slowa || 0) + txt.split(' ').length; g.txt = ((g.txt || '') + ' ' + txt).trim(); }
    out.push(rec);
  }
  const caps = [];
  for (const g of grupy.values()) {
    // linijki: prostokąty słów nachodzące na siebie w pionie o min. 50% niższego = ta sama linijka (słowa podskakują przy wejściu)
    const linie = [];
    g.recs.forEach(r => { const l = linie.find(q => Math.min(q[1], r[3]) - Math.max(q[0], r[1]) >= 0.5 * Math.min(q[1] - q[0], r[3] - r[1]));
      if (l) { l[0] = Math.min(l[0], r[1]); l[1] = Math.max(l[1], r[3]); } else linie.push([r[1], r[3]]); });
    // środek liczony z całego napisu, także słów jeszcze niewidocznych (słowa wskakują po kolei na swoje miejsca)
    const pr = document.createRange(); pr.selectNodeContents(g.el);
    const cale = [...pr.getClientRects()].filter(q => q.width > 1 && q.height > 1);
    const fx0 = cale.length ? Math.min(...cale.map(q => q.left)) : null, fx1 = cale.length ? Math.max(...cale.map(q => q.right)) : null;
    caps.push({ t: g.txt.slice(0, 60), slowa: g.slowa, linie: linie.length, fx0, fx1,
      x0: Math.min(...g.recs.map(r => r[0])), y0: Math.min(...g.recs.map(r => r[1])),
      x1: Math.max(...g.recs.map(r => r[2])), y1: Math.max(...g.recs.map(r => r[3])) });
  }
  return { teksty: out, napisy: caps };
})()
"""


def dom_probki(strona, W, H, czas):
    sys.path.insert(0, os.path.join(ROOT, "motion"))
    import render as R  # silnik renderu (headless Edge przez CDP)
    R.W, R.H = W, H
    b = R.Browser(9333)
    probki = []
    try:
        b.open(strona)
        dur = b.js("window.DURATION") or czas
        dur = min(float(dur), czas + 0.5, 120.0)
        t = 0.0
        while t < dur - 0.02:
            b.js("window.render(%.4f)" % t)
            d = b.js(JS_TEKSTY) or {"teksty": [], "napisy": []}
            d["t"] = round(t, 2)
            probki.append(d)
            t += 0.1
    finally:
        b.close()
    return probki


def przetnij(a, b):
    x0, y0 = max(a[0], b[0]), max(a[1], b[1])
    x1, y1 = min(a[2], b[2]), min(a[3], b[3])
    return max(0.0, x1 - x0) * max(0.0, y1 - y0)


def strefy_zakazane(W, H, profil):
    s = PROGI["strefy"][profil]
    z = [("góra", (0, 0, W, H * s["gora"])), ("dół", (0, H * (1 - s["dol"]), W, H))]
    if s.get("prawa_kolumna"):
        k = s["prawa_kolumna"]
        z.append(("prawa kolumna przycisków", (W * k["x"], H * k["od"], W, H * k["do"])))
    return z


# ---------------------------------------------------------------- zakazy w plikach
def glosy_z_bibliotek(folder):
    """ID głosu rolki z silników typu g4f/g4d/g4p: wpis "<nazwa rolki>": dict(... voice=NAZWA ...) + NAZWA = "<id>" w lib."""
    nazwa = os.path.basename(os.path.normpath(folder or ""))
    if not nazwa:
        return []
    libs = glob.glob(os.path.join(ROOT, "motion", "c4y", "lib", "*.py")) + glob.glob(os.path.join(ROOT, "motion", "lib", "*.py"))
    mapa, ids = {}, []
    tresci = {}
    for p in libs:
        try:
            s = io.open(p, encoding="utf-8", errors="ignore").read()
        except Exception:
            continue
        tresci[p] = s
        for m in re.finditer(r'^([A-Z_]{2,})\s*=\s*["\']([A-Za-z0-9]{20})["\']', s, re.M):
            mapa[m.group(1)] = m.group(2)
    for p, s in tresci.items():
        for m in re.finditer(r'["\']%s["\']\s*:\s*dict\(([^\n]*)' % re.escape(nazwa), s):
            v = re.search(r"voice\s*=\s*([A-Z_]{2,})", m.group(1))
            if v and v.group(1) in mapa:
                ids.append(mapa[v.group(1)])
    return ids


def pliki_do_skanu(folder, strona):
    pl = set()
    if folder and os.path.isdir(folder):
        for ext in ("*.html", "*.js", "*.py", "*.json", "*.txt"):
            pl.update(os.path.normcase(os.path.abspath(p)) for p in glob.glob(os.path.join(folder, ext)))
        # alignment.json z naszego generatora głosu (motion/lib, od 2026-11-09 zapisuje voice_id) w podfolderach głosu
        pl.update(os.path.normcase(os.path.abspath(p)) for p in glob.glob(os.path.join(folder, "**", "alignment.json"), recursive=True))
    if strona and os.path.exists(strona):
        pl.add(os.path.normcase(os.path.abspath(strona)))
        html = io.open(strona, encoding="utf-8", errors="ignore").read()
        for src in re.findall(r'<script[^>]+src="([^"]+)"', html):
            if src.startswith("http"):
                continue
            p = os.path.normcase(os.path.abspath(os.path.join(os.path.dirname(strona), src.split("?")[0])))
            if os.path.exists(p) and "manifest" not in os.path.basename(p):
                pl.add(p)
    return sorted(pl)


def skan_zakazow(pliki):
    dz, gl = [], []
    for p in pliki:
        try:
            s = io.open(p, encoding="utf-8", errors="ignore").read()
        except Exception:
            continue
        for z in PROGI["zakazane_dzwieki"]:
            for m in re.finditer(z["wzor"], s, re.I):
                linia = s.count("\n", 0, m.start()) + 1
                frag = s[max(0, m.start() - 30): m.end() + 20].replace("\n", " ")
                if re.match(r"\s*(#|//)", s[s.rfind("\n", 0, m.start()) + 1: m.start()]):
                    continue  # zakomentowane
                wpis = {"plik": os.path.relpath(p, ROOT), "linia": linia, "co": z["opis"], "fragment": frag.strip()}
                if not any(d["plik"] == wpis["plik"] and d["linia"] == linia for d in dz):
                    dz.append(wpis)
        for vid, opis in PROGI["zakazane_glosy"].items():
            if vid.startswith("_") or vid not in s:
                continue
            o = opis if isinstance(opis, dict) else {"opis": opis, "poziom": KRYT}
            if not any(g["glos"] == vid for g in gl):
                gl.append({"plik": os.path.relpath(p, ROOT), "glos": vid, "co": o["opis"], "poziom": o.get("poziom", KRYT)})
    return dz, gl


# ---------------------------------------------------------------- główna kontrola
def kontrola(mp4, strona=None, folder=None, profil="reklama", bez_dom=False, niemy=False):
    W_ = Wynik()
    info = probe(mp4)
    v = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), None)
    a = next((s for s in info.get("streams", []) if s.get("codec_type") == "audio"), None)
    if not v:
        W_.check("plik", "wideo", False, KRYT, "brak ścieżki wideo")
        return W_, {}
    W, H = int(v["width"]), int(v["height"])
    czas = float(info.get("format", {}).get("duration") or v.get("duration") or 0)
    fr = v.get("avg_frame_rate", "0/1").split("/")
    fps = float(fr[0]) / float(fr[1]) if len(fr) == 2 and float(fr[1]) else 0
    meta = {"plik": mp4, "W": W, "H": H, "czas": round(czas, 2), "fps": round(fps, 2), "profil": profil, "niemy": niemy}

    # plik
    W_.check("plik", "format_9_16", abs(W / H - 9 / 16) < 0.01, KRYT, "format %dx%d, ma być 9:16" % (W, H))
    W_.check("plik", "rozdzielczosc", H >= 1920, UWAGA if H >= 1280 else BLAD, "wysokość %d px, ma być 1920" % H)
    W_.check("plik", "klatki_na_s", 24 <= fps <= 60.5, BLAD, "%.1f kl./s, ma być 24-60" % fps)
    if not niemy:  # --niemy: próbka efektu z motion/efekty, z założenia bez dźwięku (2026-11-10)
        W_.check("plik", "dzwiek_jest", a is not None, KRYT, "brak ścieżki dźwięku")

    # klatki
    kl = czytaj_klatki(mp4, W, H)
    meta["probek"] = len(kl)
    if not kl:
        W_.check("plik", "klatki", False, KRYT, "nie da się odczytać klatek")
        return W_, meta

    # hook: klatka 0
    k0 = kl[0]
    W_.check("hook", "klatka0_obraz", k0["luma"] > 16 and k0["czern"] < 0.85, KRYT, "klatka 0 czarna albo pusta (jasność %.0f)" % k0["luma"], 0, 0.2)
    if a is not None:
        st = start_dzwieku(mp4)
        W_.check("hook", "dzwiek_od_0", st <= PROGI["dzwiek"]["start_max_s"], BLAD, "dźwięk zaczyna się w %.2f s, ma od t=0" % st, 0, st)

    # tempo: cięcia i ruch
    cut = ciecia(mp4, PROGI["tempo"]["prog_ciecia"])
    granice = [0.0] + [c for c in cut if 0.05 < c < czas - 0.05] + [czas]
    ujecia = [(granice[i], granice[i + 1]) for i in range(len(granice) - 1) if granice[i + 1] - granice[i] > 0.05]
    najdl = max(ujecia, key=lambda u: u[1] - u[0]) if ujecia else (0, czas)
    meta["ciecia"] = cut
    meta["srednie_ujecie_s"] = round(czas / max(1, len(ujecia)), 2)
    roz = [float(np.abs(kl[i]["szary"] - kl[i - 1]["szary"]).mean()) for i in range(1, len(kl))]
    stoi = [kl[i]["t"] for i in range(1, len(kl)) if roz[i - 1] < PROGI["tempo"]["prog_ruchu"]]
    martwe = przedzialy(stoi, 1 / FPS_PROBEK, PROGI["tempo"]["martwy_obraz_s"])
    # karta końcowa z CTA może stać do 4 s (czas na przeczytanie), reszta rolki nie
    martwe = [m for m in martwe if not (m[1] >= czas - 0.6 and (m[1] - m[0]) <= 4.0)]
    W_.check("tempo", "martwy_obraz", not martwe, BLAD, "obraz stoi bez ruchu: " + ", ".join("%s-%s" % (fmt_t(x), fmt_t(y)) for x, y in martwe),
             martwe[0][0] if martwe else None, martwe[0][1] if martwe else None)
    # najdłuższe ujęcie liczy się tylko, gdy w nim mało się dzieje (ruch kamery i napisy też trzymają widza)
    W_.check("tempo", "najdluzsze_ujecie", (najdl[1] - najdl[0]) <= PROGI["tempo"]["max_ujecie_s"] or not martwe, UWAGA,
             "najdłuższe ujęcie %s (%s-%s)" % (fmt_t(najdl[1] - najdl[0]), fmt_t(najdl[0]), fmt_t(najdl[1])), najdl[0], najdl[1])
    pierwsza = next((kl[i]["t"] for i in range(1, len(kl)) if roz[i - 1] > 6), None)
    pz = min([c for c in cut if c > 0.05] + ([pierwsza] if pierwsza else []) + [czas])
    W_.check("hook", "pierwsza_zmiana", pz <= PROGI["tempo"]["pierwsza_zmiana_s"], UWAGA,
             "pierwsza wyraźna zmiana obrazu dopiero w %s" % fmt_t(pz), 0, pz)

    # kadr: twarze
    pk = PROGI["kadr"]
    uciete, oczy_nisko, przy_kraw = [], [], []
    for k in kl:
        for f in k["twarze"]:
            if f["w"] < pk["min_szer_twarzy"] * W:
                continue
            m = pk["margines_krawedzi_px"]
            if f["x"] < m or f["y"] < m or f["x"] + f["w"] > W - m or f["y"] + f["h"] > H - m:
                uciete.append((k["t"], f))
            elif f["x"] < 0.04 * W or f["x"] + f["w"] > 0.96 * W:
                przy_kraw.append((k["t"], f))
            if f["w"] >= pk["duza_twarz"] * W:
                oy = f["oczy_y"] / H
                if not (pk["linia_oczu"][0] <= oy <= pk["linia_oczu"][1]):
                    oczy_nisko.append((k["t"], f, oy))
    tw_uc = przedzialy([t for t, _ in uciete], 1 / FPS_PROBEK, 0.39)
    W_.check("kadr", "twarz_ucieta", not tw_uc, KRYT, "twarz ucięta przez krawędź kadru: " + ", ".join("%s-%s" % (fmt_t(x), fmt_t(y)) for x, y in tw_uc),
             tw_uc[0][0] if tw_uc else None, tw_uc[0][1] if tw_uc else None,
             ramki=[("twarz", t, (f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])) for t, f in uciete[:6]])
    tw_kr = przedzialy([t for t, _ in przy_kraw], 1 / FPS_PROBEK, 0.39)
    W_.check("kadr", "twarz_przy_krawedzi", not tw_kr, UWAGA, "twarz bardzo blisko krawędzi: " + ", ".join("%s-%s" % (fmt_t(x), fmt_t(y)) for x, y in tw_kr),
             tw_kr[0][0] if tw_kr else None, tw_kr[0][1] if tw_kr else None,
             ramki=[("twarz", t, (f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])) for t, f in przy_kraw[:4]])
    oc = przedzialy([t for t, _, _ in oczy_nisko], 1 / FPS_PROBEK, 0.59)
    W_.check("kadr", "linia_oczu", not oc, UWAGA, "oczy mówiącego poza %d-%d%% wysokości kadru: %s" % (
        pk["linia_oczu"][0] * 100, pk["linia_oczu"][1] * 100, ", ".join("%s-%s" % (fmt_t(x), fmt_t(y)) for x, y in oc)),
        oc[0][0] if oc else None, oc[0][1] if oc else None,
        ramki=[("twarz", t, (f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])) for t, f, _ in oczy_nisko[:4]])
    meta["probek_z_twarza"] = sum(1 for k in kl if any(f["w"] >= pk["min_szer_twarzy"] * W for f in k["twarze"]))

    # kolor
    pc = PROGI["kolor"]
    ciemne = przedzialy([k["t"] for k in kl if k["luma"] < pc["luma_min"]], 1 / FPS_PROBEK, 0.59)
    jasne = przedzialy([k["t"] for k in kl if k["luma"] > pc["luma_max"] or k["przepal"] > pc["przepal_proc"]], 1 / FPS_PROBEK, 0.59)
    W_.check("kolor", "za_ciemno", not ciemne, UWAGA, "obraz bardzo ciemny: " + ", ".join("%s-%s" % (fmt_t(x), fmt_t(y)) for x, y in ciemne),
             ciemne[0][0] if ciemne else None, ciemne[0][1] if ciemne else None)
    W_.check("kolor", "przepalenia", not jasne, UWAGA, "przepalone jasne partie: " + ", ".join("%s-%s" % (fmt_t(x), fmt_t(y)) for x, y in jasne),
             jasne[0][0] if jasne else None, jasne[0][1] if jasne else None)
    lumy = []
    for u0, u1 in ujecia:
        w = [k["luma"] for k in kl if u0 + 0.1 <= k["t"] < u1 - 0.1]
        if w:
            lumy.append((u0, float(np.median(w))))
    skoki = [(lumy[i][0], abs(lumy[i][1] - lumy[i - 1][1])) for i in range(1, len(lumy)) if abs(lumy[i][1] - lumy[i - 1][1]) > pc["skok_lumy"]]
    W_.check("kolor", "skoki_jasnosci", len(skoki) <= 2, UWAGA, "duże skoki jasności między ujęciami: " + ", ".join(fmt_t(t) for t, _ in skoki),
             skoki[0][0] if skoki else None, None)

    # dźwięk
    if a is not None:
        I, TP, LRA = glosnosc(mp4)
        meta.update({"lufs": I, "true_peak": TP, "lra": LRA})
        lo, hi = PROGI["dzwiek"]["lufs"]
        W_.check("dzwiek", "glosnosc", I is not None and lo <= I <= hi, BLAD, "głośność %s LUFS, ma być %s do %s" % (I, lo, hi))
        W_.check("dzwiek", "true_peak", TP is not None and TP <= PROGI["dzwiek"]["true_peak_max"], BLAD,
                 "true peak %s dBTP, max %s" % (TP, PROGI["dzwiek"]["true_peak_max"]))

    # napisy i strefy (DOM)
    if strona and not bez_dom:
        try:
            pr = dom_probki(strona, W, H, czas)
        except Exception as e:
            pr = []
            W_.check("napisy", "dom", False, UWAGA, "nie udało się odczytać strony rolki: %s" % str(e)[:160])
        meta["probek_dom"] = len(pr)
        if pr:
            pn = PROGI["napisy"]
            zakaz = strefy_zakazane(W, H, profil)
            bok = PROGI["strefy"][profil]["bok"]
            tw_t = {round(k["t"], 1): k["twarze"] for k in kl}
            zb = {k: [] for k in ("strefa", "kraw", "bok", "linie", "slowa", "srodek", "maly", "cienki", "twarz")}
            for d in pr:
                t = d["t"]
                for x in d["teksty"]:
                    if x["op"] < 0.6:
                        continue  # tekst w trakcie wejścia albo wyjścia, ledwo widoczny
                    r = (x["x0"], x["y0"], x["x1"], x["y1"])
                    pole = max(1.0, (r[2] - r[0]) * (r[3] - r[1]))
                    for nazwa, z in zakaz:
                        if przetnij(r, z) / pole > 0.15:
                            zb["strefa"].append((t, nazwa, x))
                    if r[0] < -1 or r[1] < -1 or r[2] > W + 1 or r[3] > H + 1:
                        zb["kraw"].append((t, x))
                    elif r[0] < W * pn["margines_twardy"] or r[2] > W * (1 - pn["margines_twardy"]):
                        zb["kraw"].append((t, x))
                    elif r[0] < W * bok or r[2] > W * (1 - bok):
                        zb["bok"].append((t, x))
                    if x["lh"] < pn["min_wys_tekstu_px"] * H / 1920:
                        zb["maly"].append((t, x))
                    if x["cap"] and (x["fw"] < pn["min_grubosc_napisu"] or x["it"]):
                        zb["cienki"].append((t, x))
                for c in d["napisy"]:
                    r = (c["x0"], c["y0"], c["x1"], c["y1"])
                    if c["linie"] > pn["max_linii"]:
                        zb["linie"].append((t, c))
                    if c["slowa"] > pn["max_slow"]:
                        zb["slowa"].append((t, c))
                    sx0 = c["fx0"] if c.get("fx0") is not None else r[0]
                    sx1 = c["fx1"] if c.get("fx1") is not None else r[2]
                    if abs((sx0 + sx1) / 2 - W / 2) > pn["max_odchylenie_srodka"] * W:
                        zb["srodek"].append((t, c))
                    for f in tw_t.get(round(round(t * FPS_PROBEK) / FPS_PROBEK, 1), []):
                        fa = (f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"])
                        if f["w"] >= pk["min_szer_twarzy"] * W and przetnij(r, fa) / max(1.0, f["w"] * f["h"]) > pk["pokrycie_twarzy_napisem"]:
                            zb["twarz"].append((t, c, fa))
            tr = PROGI["trwalosc_bledu_s"]

            def zakresy(lista):
                return przedzialy([e[0] for e in lista], 0.1, tr)

            def opis_zakresow(z):
                return ", ".join("%s-%s" % (fmt_t(a_), fmt_t(b_)) for a_, b_ in z[:6]) + (" (+%d)" % (len(z) - 6) if len(z) > 6 else "")

            def ramki(lista, typ="tekst"):
                out, bylo = [], set()
                for e in lista:
                    x = e[-1] if typ != "twarz" else e[1]
                    kl_ = round(e[0], 1)
                    if kl_ in bylo or len(out) >= 6:
                        continue
                    bylo.add(kl_)
                    out.append((typ, e[0], (x["x0"], x["y0"], x["x1"], x["y1"])))
                return out

            for kod, lista, poziom, op in [
                ("napis_w_strefie_aplikacji", zb["strefa"], KRYT, "tekst w strefie aplikacji (%s)" % profil),
                ("tekst_za_krawedzia", zb["kraw"], KRYT, "tekst ucięty albo przyklejony do krawędzi kadru"),
                ("napis_2_linijki", zb["linie"], KRYT, "napis w 2 lub więcej linijkach"),
                ("napis_na_twarzy", zb["twarz"], BLAD, "napis zasłania twarz"),
                ("napis_ponad_3_slowa", zb["slowa"], BLAD, "napis ma więcej niż %d słowa" % PROGI["napisy"]["max_slow"]),
                ("tekst_blisko_boku", zb["bok"], UWAGA, "tekst w marginesie bocznym %d%%" % (bok * 100)),
                ("napis_nie_na_srodku", zb["srodek"], UWAGA, "napis przesunięty od środka kadru"),
                ("tekst_za_maly", zb["maly"], UWAGA, "tekst za mały na telefon"),
                ("napis_cienki_lub_kursywa", zb["cienki"], UWAGA, "napis cienką czcionką albo kursywą")]:
                z = zakresy(lista)
                if kod == "napis_w_strefie_aplikacji":
                    strefy_txt = sorted({e[1] for e in lista})
                    op += ": " + ", ".join(strefy_txt) if strefy_txt else ""
                przyk = ""
                if lista:
                    e = lista[0]
                    przyk = "np. „%s”" % (e[-1]["t"] if kod != "napis_na_twarzy" else e[1]["t"])
                W_.check("napisy" if kod != "napis_na_twarzy" else "kadr", kod, not z, poziom,
                         (op + " " + opis_zakresow(z) + (" " + przyk if przyk else "")).strip(),
                         z[0][0] if z else None, z[0][1] if z else None,
                         ramki=ramki(lista, "twarz" if kod == "napis_na_twarzy" else "tekst") if z else [])
            pierwszy = pr[0]
            tekst0 = [x for x in pierwszy["teksty"] if x["op"] >= 0.6]
            W_.check("hook", "tekst_w_klatce_0", bool(tekst0), UWAGA, "brak tekstu w klatce 0 (hak ma być widoczny od t=0)", 0, 0.1)
    else:
        meta["dom"] = "pominięte (brak strony rolki)"

    # zakazy
    pl = pliki_do_skanu(folder, strona)
    dz, gl = skan_zakazow(pl)
    for vid in glosy_z_bibliotek(folder):
        o = PROGI["zakazane_glosy"].get(vid)
        if isinstance(o, dict) and not any(g["glos"] == vid for g in gl):
            gl.append({"plik": "silnik (wpis rolki w motion/c4y/lib)", "glos": vid, "co": o["opis"], "poziom": o.get("poziom", KRYT)})
    meta["pliki_skanowane"] = len(pl)
    W_.check("zakazy", "zakazane_dzwieki", not dz, KRYT, "zakazane dźwięki: " + "; ".join("%s:%d %s" % (d["plik"], d["linia"], d["co"]) for d in dz[:5]))
    gk = [g for g in gl if g["poziom"] == KRYT]
    gu = [g for g in gl if g["poziom"] != KRYT]
    W_.check("zakazy", "zakazane_glosy", not gk, KRYT, "głos z pół internetu: " + "; ".join("%s (%s)" % (g["co"], g["plik"]) for g in gk[:3]))
    W_.check("zakazy", "popularny_glos", not gu, UWAGA, "popularny głos (zmiana tylko za zgodą): " + "; ".join("%s (%s)" % (g["co"], g["plik"]) for g in gu[:3]))

    meta["klatki"] = kl
    return W_, meta


# ---------------------------------------------------------------- arkusze i raport
def rysuj_strefy(img, W, H, profil):
    h, w = img.shape[:2]
    sx, sy = w / W, h / H
    nak = img.copy()
    for _, (x0, y0, x1, y1) in strefy_zakazane(W, H, profil):
        cv2.rectangle(nak, (int(x0 * sx), int(y0 * sy)), (int(x1 * sx), int(y1 * sy)), (40, 40, 220), -1)
    cv2.addWeighted(nak, 0.22, img, 0.78, 0, img)
    b = PROGI["strefy"][profil]["bok"]
    for x in (b * W, (1 - b) * W):
        cv2.line(img, (int(x * sx), 0), (int(x * sx), h), (60, 60, 230), 1)
    return img


def arkusze(W_, meta, folder_wyj):
    kl = meta.get("klatki") or []
    if not kl:
        return []
    W, H, profil = meta["W"], meta["H"], meta["profil"]
    pliki = []
    # całość: co 1 s, 10 w rzędzie
    co = max(1, FPS_PROBEK)
    wyb = [k for i, k in enumerate(kl) if i % co == 0][:60]
    th = [rysuj_strefy(k["mini"].copy(), W, H, profil) for k in wyb]
    for i, im in enumerate(th):
        cv2.putText(im, fmt_t(wyb[i]["t"]).replace(",", "."), (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
    if th:
        while len(th) % 10:
            th.append(np.zeros_like(th[0]))
        rzedy = [np.hstack(th[i:i + 10]) for i in range(0, len(th), 10)]
        p = os.path.join(folder_wyj, "arkusz-calosc.jpg")
        cv2.imwrite(p, np.vstack(rzedy), [cv2.IMWRITE_JPEG_QUALITY, 82])
        pliki.append(p)
    # błędy: po jednej klatce na ramkę problemu
    kafle = []
    for pb in W_.problemy:
        for typ, t, r in pb["ramki"][:2]:
            k = min(kl, key=lambda q: abs(q["t"] - t))
            im = rysuj_strefy(k["mini"].copy(), W, H, profil)
            sx, sy = im.shape[1] / W, im.shape[0] / H
            kol = (255, 160, 0) if typ == "twarz" else (0, 255, 255)
            cv2.rectangle(im, (int(r[0] * sx), int(r[1] * sy)), (int(r[2] * sx), int(r[3] * sy)), kol, 2)
            pas = np.zeros((44, im.shape[1], 3), np.uint8)
            cv2.putText(pas, pb["kod"][:26], (5, 17), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(pas, fmt_t(t).replace(",", ".") + " " + pb["poziom"].replace("Ł", "L").replace("Ą", "A"), (5, 37), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (80, 200, 255), 1, cv2.LINE_AA)
            kafle.append(np.vstack([im, pas]))
    if kafle:
        kafle = kafle[:24]
        while len(kafle) % 6:
            kafle.append(np.zeros_like(kafle[0]))
        rzedy = [np.hstack(kafle[i:i + 6]) for i in range(0, len(kafle), 6)]
        p = os.path.join(folder_wyj, "arkusz-bledy.jpg")
        cv2.imwrite(p, np.vstack(rzedy), [cv2.IMWRITE_JPEG_QUALITY, 85])
        pliki.append(p)
    return pliki


def raport(W_, meta, folder_wyj, pliki):
    wyn, warstwy = W_.wynik(), W_.wyniki_warstw()
    kryt = [p for p in W_.problemy if p["poziom"] == KRYT]
    bl = [p for p in W_.problemy if p["poziom"] == BLAD]
    uw = [p for p in W_.problemy if p["poziom"] == UWAGA]
    L = ["# Kontrola montażu: %s" % os.path.basename(meta.get("plik", "")), "",
         "**Wynik: %d/100** (krytyczne: %d, błędy: %d, uwagi: %d). Profil stref: %s. Plik %dx%d, %s, %.0f kl./s." % (
             wyn, len(kryt), len(bl), len(uw), meta.get("profil"), meta.get("W", 0), meta.get("H", 0), fmt_t(meta.get("czas", 0)), meta.get("fps", 0)),
         "", "Warstwy: " + ", ".join("%s %d" % (k, v) for k, v in warstwy.items()), ""]
    if meta.get("lufs") is not None:
        L.append("Dźwięk: %s LUFS, true peak %s dBTP, LRA %s LU. Średnie ujęcie: %s s, cięcia: %d." % (
            meta.get("lufs"), meta.get("true_peak"), meta.get("lra"), meta.get("srednie_ujecie_s"), len(meta.get("ciecia", []))))
        L.append("")
    for nazwa, lista in (("Krytyczne (blokują oddanie)", kryt), ("Błędy", bl), ("Uwagi", uw)):
        if lista:
            L.append("## " + nazwa)
            for p in lista:
                L.append("- **%s** [%s] %s" % (p["kod"], p["warstwa"], p["opis"]))
            L.append("")
    if not W_.problemy:
        L += ["Wszystkie kontrole zaliczone.", ""]
    L.append("Sprawdzone: " + ", ".join("%s%s" % (s["kod"], "" if s["ok"] else " ✗") for s in W_.spr))
    if pliki:
        L += ["", "Arkusze: " + ", ".join(os.path.basename(p) for p in pliki)]
    io.open(os.path.join(folder_wyj, "raport.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
    m = {k: v for k, v in meta.items() if k != "klatki"}
    js = {"wynik": wyn, "warstwy": warstwy, "krytyczne": len(kryt), "bledy": len(bl), "uwagi": len(uw),
          "problemy": [{k: v for k, v in p.items() if k != "ramki"} for p in W_.problemy], "sprawdzenia": W_.spr, "meta": m}
    io.open(os.path.join(folder_wyj, "raport.json"), "w", encoding="utf-8").write(json.dumps(js, ensure_ascii=False, indent=1))
    return "\n".join(L)


def znajdz_strone(mp4, folder):
    if not folder:
        return None
    nazwa = os.path.splitext(os.path.basename(mp4))[0]
    kand = [os.path.join(folder, nazwa + ".html"), os.path.join(folder, os.path.basename(folder.rstrip("\\/")) + ".html")]
    kand += sorted(glob.glob(os.path.join(folder, "*.html")))
    for i, p in enumerate(kand):
        if os.path.exists(p):
            if i < 2:
                return p  # <nazwa>.html albo <folder>.html = strona tej rolki
            s = io.open(p, encoding="utf-8", errors="ignore").read()
            if "window.render" in s or "READY" in s or re.search(r'src="[^"]*lib/[^"]+\.js"', s):
                return p
    return None


def main():
    ap = argparse.ArgumentParser(description="Kontrola montażu rolki 9:16")
    ap.add_argument("mp4")
    ap.add_argument("--strona")
    ap.add_argument("--folder")
    ap.add_argument("--profil", default="wszystkie", choices=list(PROGI["strefy"].keys()))
    ap.add_argument("--wyjscie")
    ap.add_argument("--bez-dom", action="store_true")
    ap.add_argument("--niemy", action="store_true", help="próbka efektu bez dźwięku: pomija kontrolę ścieżki dźwięku (tylko motion/efekty/probki)")
    a = ap.parse_args()
    mp4 = os.path.abspath(a.mp4)
    folder = os.path.abspath(a.folder) if a.folder else os.path.dirname(mp4)
    strona = os.path.abspath(a.strona) if a.strona else znajdz_strone(mp4, folder)
    wyj = os.path.abspath(a.wyjscie) if a.wyjscie else os.path.join(folder, "kontrola")
    os.makedirs(wyj, exist_ok=True)
    t0 = time.time()
    W_, meta = kontrola(mp4, strona, folder, a.profil, a.bez_dom, a.niemy)
    meta["strona"] = strona
    pl = arkusze(W_, meta, wyj)
    txt = raport(W_, meta, wyj, pl)
    print(txt)
    print("Raport: %s (%.0f s)" % (os.path.join(wyj, "raport.md"), time.time() - t0))
    sys.exit(2 if any(p["poziom"] == KRYT for p in W_.problemy) else 0)


if __name__ == "__main__":
    main()
