r"""Rolka 10 „Zatrzymałeś się”: montaż lokalny (0 zł). Klipy c1 (ulica) i c2 (kawiarnia) z script.py, głos i tło z wideo,
cięcie na syntetyczne pstryknięcie, napisy zdaniami (czasy z obwiedni głosu), kółko AI, czarna karta z CTA i uderzeniem.
  ..\..\..\runtime\python.exe montaz.py      -> r10.mp4 + f0.jpg
"""
import os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(HERE, "..", "lib"), os.path.join(HERE, "..", "sekunda"), os.path.join(ROOT, "motion")]
import kino
from kino import ff, dur, SFX, SOUNDS, PEAK
from montaz import shots, vdur   # silnik nakładek z rolki SEKUNDA (HTML -> PNG przez Edge, te same style)

FPS = 60
# (klip, sekunda w klipie, początek w filmie, koniec w filmie)
SEG = [("c1", 0.00, 0.00, 7.00), ("c2", 1.00, 7.00, 11.18)]
END0, TOTAL = 11.18, 13.20
CAPS = [(0.00, 1.95, "Zatrzymałeś się<br>na tej rolce."),
        (3.45, 6.98, "Twoi klienci zatrzymują się<br><b>dokładnie tak samo.</b>"),
        (7.70, 8.92, "Ta była o nas."),
        (8.92, END0, "Następna może być<br>o <b>Twojej firmie.</b>")]


def main():
    tmp = os.path.join(HERE, "_m"); os.makedirs(tmp, exist_ok=True)
    segs = []
    for clip, sin, t0, t1 in SEG:
        src = os.path.join(HERE, f"{clip}_768P.mp4")
        length = min(t1 - t0, vdur(src) - sin - 0.02)
        out = os.path.join(tmp, clip + ".mov")
        ff(["-ss", f"{sin:.3f}", "-t", f"{length + 0.05:.3f}", "-i", src, "-filter_complex",
            f"[0:v]setpts=PTS-STARTPTS,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS},format=yuv420p,"
            f"tpad=stop_mode=clone:stop_duration=0.3,settb=AVTB,trim=duration={t1 - t0:.4f}[v];"
            f"[0:a]asetpts=PTS-STARTPTS,aresample=48000,atrim=duration={t1 - t0:.4f},apad=whole_dur={t1 - t0:.4f}[a]",
            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", out])
        segs.append(out)
    black = os.path.join(tmp, "end.mov")
    ff(["-f", "lavfi", "-i", f"color=c=black:s=1080x1920:r={FPS}:d={TOTAL - END0:.3f}", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
        "-t", f"{TOTAL - END0:.3f}", "-vf", "format=yuv420p,settb=AVTB", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", black])
    segs.append(black)
    # pstryknięcie palcami (synteza: krótki trzask szumu + suchy klik), 0 zł
    snap = os.path.join(tmp, "snap.wav")
    ff(["-f", "lavfi", "-i", "aevalsrc='(random(0)*2-1)*exp(-90*t)+0.6*sin(2*PI*2400*t)*exp(-140*t)':s=48000:d=0.25",
        "-af", "highpass=f=1400,volume=1.6", snap])

    ins, fc = [], []
    for p in segs:
        ins += ["-i", p]
    # twarde cięcia przez concat (xfade skracał oś i gubił kartę końcową); dźwięk każdego kawałka z 10 ms wyciszeniem na brzegach
    lens = [SEG[0][3] - SEG[0][2], SEG[1][3] - SEG[1][2], TOTAL - END0]
    for k, L in enumerate(lens):
        fc.append(f"[{k}:a]afade=t=in:d=0.01,afade=t=out:st={L - 0.01:.3f}:d=0.01[ca{k}]")
    fc.append("".join(f"[{k}:v][ca{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[vc][ac]")
    v, a = "[vc]", "[ac]"

    items = [(f"cap{i}", f'<div class="cap">{h}</div>') for i, (_, _, h) in enumerate(CAPS)]
    items += [("ai", '<div class="aitag">AI</div>'), ("logo", '<div class="logo">Clips<i>4</i>you</div>'),
              ("tag", '<div class="tag">Zdobywamy klientów rolkami.</div>'), ("pill", '<div class="pill">Zostaw kontakt ↓</div>'),
              ("sub", '<div class="tag" style="top:1290px;font-size:42px">i zobacz, jak to robimy</div>')]
    shots(items, tmp)
    lay = [(f"cap{i}", t0, t1) for i, (t0, t1, _) in enumerate(CAPS)] + [
        ("ai", 0, END0), ("logo", END0 + 0.08, TOTAL), ("tag", END0 + 0.45, TOTAL), ("pill", END0 + 0.85, TOTAL), ("sub", END0 + 1.05, TOTAL)]
    n = len(segs)
    for k, (name, t0, t1) in enumerate(lay):
        ins += ["-i", os.path.join(tmp, name + ".png")]
        fc.append(f"{v}[{n + k}:v]overlay=0:0:enable='between(t,{t0:.3f},{t1:.3f})'[o{k}]"); v = f"[o{k}]"
    n += len(lay)

    fc.append(f"{a}volume=1.0[amb]")
    mix = ["[amb]"]
    ins += ["-i", snap]
    fc.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int((SEG[1][2] - 0.02) * 1000)}:all=1[snp]"); mix.append("[snp]")
    sfx = [(SEG[1][2] + 0.02, "WH_SOFT", -16), (END0, "RISER", -18), (END0 + 0.02, "BOX", -3), (END0 + 0.05, "IMP_BASS", -5)]
    for k, (t, name, db) in enumerate(sfx):
        ins += ["-i", os.path.join(SFX, SOUNDS[name])]
        fc.append(f"[{n + 1 + k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,"
                  f"adelay={int(max(0, t - PEAK[name]) * 1000)}:all=1[s{k}]"); mix.append(f"[s{k}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{TOTAL:.3f},alimiter=limit=0.95[aout]")
    out = os.path.join(HERE, "r10.mp4")
    ff(ins + ["-filter_complex", ";".join(fc), "-map", v, "-map", "[aout]", "-t", f"{TOTAL:.3f}", "-r", str(FPS), "-c:v", "libx264", "-crf", "17",
              "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    ff(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(HERE, "f0.jpg")])
    print(f"r10.mp4: {dur(out):.2f} s")


if __name__ == "__main__":
    main()
