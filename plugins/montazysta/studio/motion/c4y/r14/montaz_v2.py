r"""Rolka 14 „Sznurówka”, montaż dynamiczny jak r10_dyn (0 zł): przyspieszone podejście (speed ramp), wycięte przerwy w mowie
(skok zbliżeniem), ukryte cięcie w bucie ze świstem (lato -> zima), filmowe kolory, cicha muzyka trailerowa, napisy zdaniami,
kółko AI, czarna karta CTA jak w r10.
  ..\..\..\runtime\python.exe montaz.py      -> r14_v2.mp4 + f0.jpg (v1 = montaz_v1.py)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(HERE, "..", "lib"), os.path.join(HERE, "..", "sekunda"), os.path.join(HERE, "..", "r6"), os.path.join(ROOT, "motion")]
from kino import ff, dur, SFX, SOUNDS, PEAK
from montaz import shots
from montaz2 import GRADE, MUSIC, FPS

# (klip, od, do (w klipie), prędkość, zoom bazowy, [(t uderzenia w wycinku filmu, siła)])
SEG = [("c1", 1.20, 3.20, 2.0, 1.00, []),            # podejście x2, kuca
       ("c1", 3.20, 5.30, 1.0, 1.00, []),            # „Patrzysz, jak facet wiąże buta.”
       ("c1b", 0.25, 1.45, 1.0, 1.12, []),           # POPRAWKA 2026-10-11 (c1 mówił „przewjasz”): skok zbliżeniem, „I dalej tu jesteś.”
       ("c1b", 1.45, 3.07, 1.6, 1.12, []),           # kamera w dół na but, przyspieszona, dźwięk klipu wyciszony
       ("c2", 0.00, 1.90, 1.3, 1.00, []),            # ukryte cięcie: but w śniegu, kubek, wstaje = zima
       ("c2", 1.90, 3.82, 1.0, 1.00, []),            # „Nudna scena, a obejrzałeś.”
       ("c2", 4.18, 6.40, 1.0, 1.10, [(1.12, 0.10)])]  # „Pomyśl, co zrobi rolka o Twojej firmie.”
LENS = [(b - a) / sp for _, a, b, sp, _, _ in SEG]
STARTS = [sum(LENS[:i]) for i in range(len(SEG))]
END0 = sum(LENS); TOTAL = END0 + 2.0
CAPS = [(0.00, STARTS[2], "Patrzysz, jak facet<br>wiąże buta."),
        (STARTS[2], STARTS[4], "I <b>dalej tu jesteś.</b>"),
        (STARTS[5], STARTS[6], "Nudna scena,<br>a obejrzałeś."),
        (STARTS[6], END0, "Pomyśl, co zrobi rolka<br>o <b>Twojej firmie.</b>")]


def main():
    tmp = os.path.join(HERE, "_m"); os.makedirs(tmp, exist_ok=True)
    segs = []
    for i, (clip, a, b, sp, z0, hits) in enumerate(SEG):
        L = LENS[i]
        z = f"{z0}+0.05*t/{L:.3f}" + "".join(f"+{s}*if(gt(t,{t0}),min(1,(t-{t0})/0.18),0)" for t0, s in hits)
        out = os.path.join(tmp, f"s{i}.mov")
        ff(["-i", os.path.join(HERE, f"{clip}_768P.mp4"), "-filter_complex",
            f"[0:v]trim=start={a}:end={b},setpts=(PTS-STARTPTS)/{sp},fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            f"tpad=stop_mode=clone:stop_duration=0.3,trim=duration={L:.4f},setpts=PTS-STARTPTS,"
            f"scale=w='trunc(1080*({z})/2)*2':h='trunc(1920*({z})/2)*2':eval=frame,crop=1080:1920,{GRADE},format=yuv420p,settb=AVTB[v];"
            f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,atempo={sp},volume={0 if (clip, a) == ('c1b', 1.45) else 1},aresample=48000,atrim=duration={L:.4f},apad=whole_dur={L:.4f},"
            f"afade=t=in:d=0.01,afade=t=out:st={L - 0.02:.3f}:d=0.02[a]",
            "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", "-t", f"{L:.4f}", out])
        segs.append(out)
    black = os.path.join(tmp, "end.mov")
    ff(["-f", "lavfi", "-i", f"color=c=black:s=1080x1920:r={FPS}:d={TOTAL - END0:.3f}", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
        "-t", f"{TOTAL - END0:.3f}", "-vf", "format=yuv420p,settb=AVTB", "-c:v", "libx264", "-crf", "12", "-c:a", "pcm_s16le", black])
    segs.append(black)

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
    fc.append("[ac]volume=1.15[acv]"); mix = ["[acv]"]
    ins += ["-i", MUSIC]
    fc.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,volume=-18dB,afade=t=in:d=0.15,"
              f"afade=t=out:st={END0 - 0.35:.2f}:d=0.35,atrim=0:{END0:.2f}[mus]"); mix.append("[mus]"); n += 1
    sfx = [(0.03, "IMP_SOFT", -7), (STARTS[2], "WH_SOFT", -13), (STARTS[4] + 0.05, "WH_SWING", -6),
           (STARTS[4] + 1.25, "IMP_BASS", -13), (STARTS[6] + 1.12, "IMP_SOFT", -11),
           (END0, "RISER", -15), (END0 + 0.02, "BOX", -3), (END0 + 0.05, "IMP_BASS", -5)]
    for k, (t, name, db) in enumerate(sfx):
        ins += ["-i", os.path.join(SFX, SOUNDS[name])]
        fc.append(f"[{n + k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,"
                  f"adelay={int(max(0, t - PEAK[name]) * 1000)}:all=1[s{k}]"); mix.append(f"[s{k}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{TOTAL:.3f},alimiter=limit=0.95[aout]")
    out = os.path.join(HERE, "r14_v2.mp4")
    ff(ins + ["-filter_complex", ";".join(fc), "-map", v, "-map", "[aout]", "-t", f"{TOTAL:.3f}", "-r", str(FPS), "-c:v", "libx264", "-crf", "17",
              "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    ff(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(HERE, "f0.jpg")])
    print(f"r14_v2.mp4: {dur(out):.2f} s, cięcia: " + ", ".join(f"{s:.2f}" for s in STARTS) + f", karta {END0:.2f}")


if __name__ == "__main__":
    main()
