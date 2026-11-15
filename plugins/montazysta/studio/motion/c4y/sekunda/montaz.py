r"""SEKUNDA: montaż lokalny (0 zł). Ujęcia z script.py (c1-c7), głos vo/voice.mp3 (lines.json), muzyka, efekty.
Przejścia „przewinięcia” (xfade slideup) w momentach słów lektorki, napisy i karta końcowa z HTML (Edge), kółko AI.
  ..\..\..\runtime\python.exe montaz.py      -> sekunda.mp4 + f0.jpg
"""
import base64, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(HERE, "..", "lib"), os.path.join(ROOT, "motion")]
import kino
from kino import ff, dur, SFX, SOUNDS, PEAK

MUSIC = os.path.join(ROOT, "motion", "kuba", "assets", "music", "six7_trailer.mp3")
FPS = 60
# (klip, sekunda w klipie od której gra, początek w filmie, koniec w filmie, przejście NA WEJŚCIU: (typ, czas))
SEG = [("c1", 0.00, 0.00, 3.88, None, 0.9),
       ("c2", 0.55, 3.88, 6.77, ("slideup", 0.28), 1.0),
       ("c3", 1.40, 6.77, 8.43, ("slideup", 0.24), 1.0),
       ("c5", 0.90, 8.43, 9.84, ("slideup", 0.22), 1.0),
       ("c6", 0.25, 9.84, 10.88, ("slideup", 0.20), 1.0),
       ("c4", 0.05, 10.88, 14.32, ("slideup", 0.40), 1.0),   # „Chyba że…”: przewijanie hamuje i staje
       ("c7", 1.85, 14.32, 16.60, ("fade", 0.06), 1.0)]
END0, TOTAL = 16.60, 22.0
CAPS = [(0.0, 1.5, "Sekunda."), (1.5, 5.35, "Tyle ma Twoja firma,<br>zanim ktoś przewinie dalej."), (5.35, 6.75, "Miasto przewija."),
        (6.75, 8.42, "Tramwaj przewija."), (8.42, 10.86, "Cała Polska przewija."),
        (10.86, 14.25, "Chyba że zobaczy coś,<br>czego jeszcze nie widział."), (14.3, 16.6, "<b>Właśnie to zrobiłeś.</b>")]
CSS = """@import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&family=Montserrat:wght@800;900&display=block&subset=latin-ext");
*{box-sizing:border-box;margin:0;padding:0} html,body{width:1080px;height:1920px;overflow:hidden;background:transparent;-webkit-font-smoothing:antialiased}
.cap{position:absolute;left:70px;right:70px;top:1440px;text-align:center;color:#fff;font:800 60px/1.15 Montserrat,sans-serif;letter-spacing:-.02em;
 text-shadow:0 2px 2px rgba(0,0,0,.55),0 0 26px rgba(0,0,0,.55)} .cap b{color:#ffd60a;font-weight:900}
.aitag{position:absolute;right:64px;top:84px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.26);
 color:rgba(255,255,255,.5);font:800 15px/37px Inter,sans-serif;text-align:center}
.logo{position:absolute;left:0;right:0;top:760px;text-align:center;color:#fff;font:900 128px/1 Montserrat,sans-serif;letter-spacing:-.04em}
.logo i{font-style:normal;color:#ffd60a}
.tag{position:absolute;left:80px;right:80px;top:930px;text-align:center;color:rgba(255,255,255,.86);font:600 50px/1.25 Inter,sans-serif}
.pill{position:absolute;left:50%;top:1120px;transform:translateX(-50%);padding:24px 44px;background:#ffd60a;border:6px solid #fff;border-radius:24px;
 font:900 60px/1 Montserrat,sans-serif;color:#111113;white-space:nowrap}
.bg{position:absolute;inset:0;background:#000}"""


def vdur(path):
    """długość samego obrazu (dekodowanie, nie nagłówek)"""
    import subprocess
    r = subprocess.run([kino.FF, "-hide_banner", "-i", path, "-map", "0:v", "-f", "null", "-"], capture_output=True, text=True, errors="ignore").stderr
    t = r.rsplit("time=", 1)[1].split()[0]
    h, m, s = t.split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def shots(items, out_dir):
    """[(nazwa, html)] -> przezroczyste PNG 1080x1920 (Edge)"""
    import render
    render.W, render.H = 1080, 1920
    b = render.Browser(9395)
    try:
        b.call("Page.enable")
        b.call("Emulation.setDeviceMetricsOverride", width=1080, height=1920, deviceScaleFactor=1, mobile=False)
        b.call("Emulation.setDefaultBackgroundColorOverride", color={"r": 0, "g": 0, "b": 0, "a": 0})
        for name, html in items:
            page = os.path.join(out_dir, name + ".html")
            open(page, "w", encoding="utf-8").write(f"<!doctype html><meta charset='utf-8'><style>{CSS}</style><body>{html}"
                                                    "<script>document.fonts.ready.then(()=>{window.READY=true})</script>")
            b.call("Page.navigate", url="file:///" + page.replace("\\", "/"))
            for _ in range(200):
                time.sleep(0.05)
                try:
                    if b.js("window.READY === true"):
                        break
                except Exception:
                    pass
            time.sleep(0.25)
            r = b.call("Page.captureScreenshot", format="png", clip={"x": 0, "y": 0, "width": 1080, "height": 1920, "scale": 1})
            open(os.path.join(out_dir, name + ".png"), "wb").write(base64.b64decode(r["data"]))
            os.remove(page)
    finally:
        b.close()


def main():
    tmp = os.path.join(HERE, "_m"); os.makedirs(tmp, exist_ok=True)
    # 1. segmenty: każdy z zapasem na początku równym przejściu na wejściu
    segs = []
    for clip, sin, t0, t1, tr, sp in SEG:
        d_in = tr[1] if tr else 0.0
        src = os.path.join(HERE, f"{clip}_768P.mp4")
        a = max(0.0, sin - d_in * sp); length = (t1 - t0 + d_in) * sp
        avail = vdur(src) - a - 0.02                 # obraz bywa krótszy niż ścieżka: wtedy lekko zwalniamy zamiast zamrażać
        if avail < length:
            sp *= avail / length; length = avail
            print(f"{clip}: za krótki, zwalniam do {sp:.2f}x")
        out = os.path.join(tmp, clip + ".mov")
        ff(["-ss", f"{a:.3f}", "-t", f"{length + 0.05:.3f}", "-i", src, "-filter_complex",
            f"[0:v]setpts=(PTS-STARTPTS)/{sp},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS},format=yuv420p,"
            f"tpad=stop_mode=clone:stop_duration=0.1,settb=AVTB,"
            f"trim=duration={t1 - t0 + d_in:.4f}[v];[0:a]asetpts=PTS-STARTPTS,atempo={sp},aresample=48000,atrim=duration={t1 - t0 + d_in:.4f},apad=whole_dur={t1 - t0 + d_in:.4f}[a]",
            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", out])
        segs.append((out, t0, t1, tr))
    # karta końcowa: czarny segment
    black = os.path.join(tmp, "end.mov")
    ff(["-f", "lavfi", "-i", f"color=c=black:s=1080x1920:r={FPS}:d={TOTAL - END0:.3f}", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
        "-t", f"{TOTAL - END0:.3f}", "-vf", "format=yuv420p,settb=AVTB", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", black])
    segs.append((black, END0, TOTAL, ("fade", 0.04)))
    # 2. łączenie: xfade (obraz) + acrossfade (dźwięk tła ujęć) o tych samych długościach
    ins, fc = [], []
    for p, *_ in segs:
        ins += ["-i", p]
    v, a = "[0:v]", "[0:a]"
    for k in range(1, len(segs)):
        typ, d = segs[k][3]
        off = segs[k][1] - d
        fc.append(f"{v}[{k}:v]xfade=transition={typ}:duration={d}:offset={off:.4f}[v{k}]"); v = f"[v{k}]"
        fc.append(f"{a}[{k}:a]acrossfade=d={d}:c1=tri:c2=tri[a{k}]"); a = f"[a{k}]"
    # 3. nakładki: napisy, kółko AI, karta końcowa
    items = [(f"cap{i}", f'<div class="cap">{h}</div>') for i, (_, _, h) in enumerate(CAPS)]
    items += [("ai", '<div class="aitag">AI</div>'), ("logo", '<div class="logo">Clips<i>4</i>you</div>'),
              ("tag", '<div class="tag">Rolki, przy których<br>kciuk staje.</div>'), ("pill", '<div class="pill">Umów rozmowę →</div>')]
    shots(items, tmp)
    lay = [(f"cap{i}", t0, t1) for i, (t0, t1, _) in enumerate(CAPS)] + [("ai", 0, END0), ("logo", 16.8, TOTAL), ("tag", 18.05, TOTAL), ("pill", 19.3, TOTAL)]
    n = len(segs)
    for k, (name, t0, t1) in enumerate(lay):
        ins += ["-i", os.path.join(tmp, name + ".png")]
        fc.append(f"{v}[{n + k}:v]overlay=0:0:enable='between(t,{t0:.3f},{t1:.3f})'[o{k}]"); v = f"[o{k}]"
    n += len(lay)
    # 4. dźwięk: tło ujęć + głos + muzyka (cicho, wycisza się przed czernią) + przewinięcia + uderzenie
    ins += ["-i", os.path.join(HERE, "vo", "voice.mp3"), "-i", MUSIC]
    fc.append(f"{a}volume=0.55[amb]")
    fc.append(f"[{n}:a]aresample=48000,volume=1.15[vo]")
    fc.append(f"[{n + 1}:a]aresample=48000,volume=-17dB,afade=t=in:d=0.6,afade=t=out:st={END0 - 0.45:.2f}:d=0.45,atrim=0:{END0:.2f}[mus]")
    mix = ["[amb]", "[vo]", "[mus]"]
    sfx = [(segs[k][1] - segs[k][3][1] / 2, "WH_SWING", -9) for k in range(1, 6)] + [(10.88, "IMP_SOFT", -10), (14.35, "RISER", -14),
                                                                                    (END0 + 0.02, "BOX", -2), (END0 + 0.05, "IMP_BASS", -4)]
    for k, (t, name, db) in enumerate(sfx):
        ins += ["-i", os.path.join(SFX, SOUNDS[name])]
        fc.append(f"[{n + 2 + k}:a]aresample=48000,volume={db}dB,adelay={int(max(0, t - PEAK[name]) * 1000)}:all=1[s{k}]"); mix.append(f"[s{k}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{TOTAL:.3f},alimiter=limit=0.95[aout]")
    out = os.path.join(HERE, "sekunda.mp4")
    ff(ins + ["-filter_complex", ";".join(fc), "-map", v, "-map", "[aout]", "-t", f"{TOTAL:.3f}", "-r", str(FPS), "-c:v", "libx264", "-crf", "17",
              "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    ff(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(HERE, "f0.jpg")])
    print(f"sekunda.mp4: {dur(out):.2f} s")


if __name__ == "__main__":
    main()
