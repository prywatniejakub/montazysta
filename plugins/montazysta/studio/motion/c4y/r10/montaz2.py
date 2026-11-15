r"""Rolka 10, wersja DYNAMICZNA (użytkownik 2026-10-10 noc, 0 zł, jak r6/montaz2.py): głos i tło z wideo, wycięta cisza w c1
(skok zoomem), najazdy, uderzenia zbliżeń, filmowe kolory, muzyka trailerowa, pstryk na cięciu do kawiarni.
  ..\..\..\runtime\python.exe montaz2.py      -> r10_dyn.mp4
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(HERE, "..", "lib"), os.path.join(HERE, "..", "sekunda"), os.path.join(HERE, "..", "r6"), os.path.join(ROOT, "motion")]
from kino import ff, dur, SFX, SOUNDS, PEAK
from montaz import shots
from montaz2 import zoom_expr, GRADE, MUSIC, FPS

# (klip, od w klipie, długość, start w filmie, [(t uderzenia w wycinku, siła)], wylot?)
SEG = [("c1", 0.00, 2.00, 0.00, [], True),
       ("c1", 3.45, 3.55, 2.00, [(1.75, 0.10)], False),
       ("c2", 1.00, 4.18, 5.55, [(2.00, 0.12)], False)]
END0, TOTAL = 9.73, 11.73
CAPS = [(0.00, 2.00, "Zatrzymałeś się<br>na tej rolce."),
        (2.00, 5.55, "Twoi klienci zatrzymują się<br><b>dokładnie tak samo.</b>"),
        (5.55, 7.55, "Ta była o nas."),
        (7.55, END0, "Następna może być<br>o <b>Twojej firmie.</b>")]


def main():
    tmp = os.path.join(HERE, "_m2"); os.makedirs(tmp, exist_ok=True)
    segs = []
    for i, (clip, a, L, t0, hits, out_tr) in enumerate(SEG):
        z = zoom_expr(L, hits, out_tr, i == 1)
        out = os.path.join(tmp, f"s{i}.mov")
        ff(["-ss", f"{a:.3f}", "-i", os.path.join(HERE, f"{clip}_768P.mp4"), "-filter_complex",
            f"[0:v]setpts=PTS-STARTPTS,fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            f"tpad=stop_mode=clone:stop_duration=0.3,trim=duration={L:.4f},setpts=PTS-STARTPTS,"
            f"scale=w='trunc(1080*({z})/2)*2':h='trunc(1920*({z})/2)*2':eval=frame,crop=1080:1920,{GRADE},format=yuv420p,settb=AVTB[v];"
            f"[0:a]asetpts=PTS-STARTPTS,aresample=48000,atrim=duration={L:.4f},apad=whole_dur={L:.4f},"
            f"afade=t=in:d=0.01,afade=t=out:st={L - 0.02:.3f}:d=0.02[a]",
            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", "-t", f"{L:.4f}", out])
        segs.append(out)
    black = os.path.join(tmp, "end.mov")
    ff(["-f", "lavfi", "-i", f"color=c=black:s=1080x1920:r={FPS}:d={TOTAL - END0:.3f}", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
        "-t", f"{TOTAL - END0:.3f}", "-vf", "format=yuv420p,settb=AVTB", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", black])
    segs.append(black)
    snap = os.path.join(tmp, "snap.wav")
    ff(["-f", "lavfi", "-i", "aevalsrc='(random(0)*2-1)*exp(-90*t)+0.6*sin(2*PI*2400*t)*exp(-140*t)':s=48000:d=0.25",
        "-af", "highpass=f=1400,volume=1.6", snap])

    ins, fc = [], []
    for p in segs:
        ins += ["-i", p]
    fc.append("".join(f"[{k}:v][{k}:a]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[vc][ac]")
    v = "[vc]"
    items = [(f"cap{i}", f'<div class="cap">{h}</div>') for i, (_, _, h) in enumerate(CAPS)]
    items += [("ai", '<div class="aitag">AI</div>'), ("logo", '<div class="logo">Clips<i>4</i>you</div>'),
              ("tag", '<div class="tag">Zdobywamy klientów rolkami.</div>'), ("pill", '<div class="pill">Zostaw kontakt ↓</div>'),
              ("sub", '<div class="tag" style="top:1290px;font-size:42px">i zobacz, jak to robimy</div>')]
    shots(items, tmp)
    lay = [(f"cap{i}", a, b) for i, (a, b, _) in enumerate(CAPS)] + [
        ("ai", 0, END0), ("logo", END0 + 0.08, TOTAL), ("tag", END0 + 0.45, TOTAL), ("pill", END0 + 0.85, TOTAL), ("sub", END0 + 1.05, TOTAL)]
    n = len(segs)
    for k, (name, a, b) in enumerate(lay):
        ins += ["-i", os.path.join(tmp, name + ".png")]
        fc.append(f"{v}[{n + k}:v]overlay=0:0:enable='between(t,{a:.3f},{b:.3f})'[o{k}]"); v = f"[o{k}]"
    n += len(lay)
    mix = ["[ac]"]
    ins += ["-i", MUSIC]
    fc.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,volume=-17dB,afade=t=in:d=0.15,"
              f"afade=t=out:st={END0 - 0.35:.2f}:d=0.35,atrim=0:{END0:.2f}[mus]"); mix.append("[mus]"); n += 1
    ins += ["-i", snap]
    fc.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int((SEG[2][3] - 0.02) * 1000)}:all=1[snp]"); mix.append("[snp]"); n += 1
    sfx = [(0.03, "IMP_SOFT", -7), (SEG[1][3], "WH_SWING", -7), (SEG[2][3] + 0.02, "WH_SOFT", -14),
           (SEG[1][3] + 1.75, "IMP_SOFT", -11), (SEG[2][3] + 2.0, "IMP_BASS", -10),
           (END0, "RISER", -15), (END0 + 0.02, "BOX", -3), (END0 + 0.05, "IMP_BASS", -5)]
    for k, (t, name, db) in enumerate(sfx):
        ins += ["-i", os.path.join(SFX, SOUNDS[name])]
        fc.append(f"[{n + k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,"
                  f"adelay={int(max(0, t - PEAK[name]) * 1000)}:all=1[s{k}]"); mix.append(f"[s{k}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{TOTAL:.3f},alimiter=limit=0.95[aout]")
    out = os.path.join(HERE, "r10_dyn.mp4")
    ff(ins + ["-filter_complex", ";".join(fc), "-map", v, "-map", "[aout]", "-t", f"{TOTAL:.3f}", "-r", str(FPS), "-c:v", "libx264", "-crf", "17",
              "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    print(f"r10_dyn.mp4: {dur(out):.2f} s")


if __name__ == "__main__":
    main()
