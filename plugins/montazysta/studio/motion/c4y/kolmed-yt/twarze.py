r"""Śledzenie twarzy w poziomym filmie 4K, żeby kadr 9:16 jechał za mówcą (użytkownik 2026-11-04: „ucieka twarz z kadru”, „widać kawałek oka”).
Stały środek kadru nie działa, bo w filmach klienta kamera i ludzie się ruszają, a montażysta tnie na inne ujęcia.
Detekcja: OpenCV 4.10 (tools/twarze/pylib, kaskady Haara: przód + profil w obie strony) co 1/6 s na pasie [top, top + hf] wysokości,
największa twarz blisko poprzedniej; przeskok > 12% szerokości = cięcie w filmie (bez wygładzania przez cięcie); wygładzenie średnią 0,8 s.
Wynik: środek kadru (ułamek szerokości) dla każdej klatki 30 fps; bez twarzy = środek z konfiguracji.
"""
import os, sys, subprocess, json
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
sys.path.insert(0, os.path.join(ROOT, "tools", "twarze", "pylib"))
import cv2

FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
_C = cv2.data.haarcascades
FRONT = cv2.CascadeClassifier(_C + "haarcascade_frontalface_alt2.xml")
PROF = cv2.CascadeClassifier(_C + "haarcascade_profileface.xml")
SFPS, DW = 6, 960  # próbki na sekundę, szerokość obrazu do detekcji


def probki(src, fs, ln, hf, top):
    """klatki (szare, DW szerokości) z pasa [top, top + hf] wysokości, SFPS na sekundę"""
    r = subprocess.run([FF, "-v", "error", "-ss", f"{fs:.3f}", "-t", f"{ln:.3f}", "-i", src, "-an",
                        "-vf", f"fps={SFPS},crop=iw:ih*{hf}:0:ih*{top},scale={DW}:-2,format=gray", "-f", "rawvideo", "-"], capture_output=True)
    pr = subprocess.run([FF, "-v", "error", "-ss", f"{fs:.3f}", "-i", src, "-frames:v", "1", "-an",
                         "-vf", f"crop=iw:ih*{hf}:0:ih*{top},scale={DW}:-2", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True)
    h = len(pr.stdout) // DW
    n = len(r.stdout) // (DW * h)
    return [np.frombuffer(r.stdout[i * DW * h:(i + 1) * DW * h], np.uint8).reshape(h, DW) for i in range(n)], h


def twarze(img):
    """lista (cx, cy, w) w pikselach obrazu detekcji"""
    out = []
    eq = cv2.equalizeHist(img)
    mn = int(img.shape[0] * .12)
    for f in FRONT.detectMultiScale(eq, 1.1, 5, minSize=(mn, mn)): out.append(f)
    for f in PROF.detectMultiScale(eq, 1.1, 5, minSize=(mn, mn)): out.append(f)
    fl = cv2.flip(eq, 1)
    for (x, y, w, h) in PROF.detectMultiScale(fl, 1.1, 5, minSize=(mn, mn)): out.append((img.shape[1] - x - w, y, w, h))
    return [(x + w / 2, y + h / 2, w) for (x, y, w, h) in out]


def sciezka(src, fs, ln, hf, top, cx0, iw_ratio):
    """środek kadru (ułamek szerokości źródła) dla każdej klatki 30 fps; iw_ratio = szerokość kadru / szerokość źródła"""
    imgs, h = probki(src, fs, ln, hf, top)
    pts, prev = [], None
    det = [twarze(im) for im in imgs]
    big = sorted(max(f[2] for f in fc) for fc in det if fc)
    ref = big[len(big) // 2] if big else 0  # typowa szerokość twarzy mówcy w ujęciu
    for fc in det:
        fc = [f for f in fc if f[2] >= .5 * ref]  # dużo mniejsze = fałszywe wykrycia na sprzęcie w tle
        if fc:
            if prev is None: best = max(fc, key=lambda f: f[2])
            else: best = min(fc, key=lambda f: abs(f[0] / DW - prev) - f[2] / DW * .5)  # blisko poprzedniej, większa wygrywa
            prev = best[0] / DW; pts.append(prev)
        else: pts.append(None)
    # dziury: najbliższa znana wartość; brak twarzy w całym ujęciu = konfiguracja
    known = [i for i, v in enumerate(pts) if v is not None]
    if not known: return [cx0] * int(round(ln * 30)), 0
    for i, v in enumerate(pts):
        if v is None: pts[i] = pts[min(known, key=lambda k: abs(k - i))]
    # mediana z 5 próbek (0,8 s): krótkie fałszywe wykrycia (np. sprzęt w tle) znikają, prawdziwe cięcia w filmie zostają
    pts = [sorted(pts[max(0, i - 2):i + 3])[len(pts[max(0, i - 2):i + 3]) // 2] for i in range(len(pts))]
    # odcinki między cięciami (przeskok > 12% szerokości), w odcinku średnia ruchoma 5 próbek
    segs, cur = [], [0]
    for i in range(1, len(pts)):
        if abs(pts[i] - pts[i - 1]) > .12: segs.append(cur); cur = [i]
        else: cur.append(i)
    segs.append(cur)
    sm = list(pts)
    for s in segs:
        for i in s:
            win = [pts[j] for j in s if abs(j - i) <= 2]; sm[i] = sum(win) / len(win)
    half = iw_ratio / 2
    sm = [min(1 - half, max(half, v)) for v in sm]
    seg_of = {i: k for k, s in enumerate(segs) for i in s}
    out = []
    for f in range(int(round(ln * 30))):
        t = f / 30 * SFPS; i = min(int(t), len(sm) - 1); j = min(i + 1, len(sm) - 1); u = t - int(t)
        out.append(sm[i] if seg_of[i] != seg_of[j] else sm[i] * (1 - u) + sm[j] * u)
    return out, len(known) / len(pts)
