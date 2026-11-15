r"""Rolka 15 „Podcast”, montaż jak klip z podcastu (0 zł): twarde cięcia pytający / odpowiadający, przerwy w mowie wycięte skokiem
zbliżenia (jump cut jak w klipach Sartaina), ujęcie reakcji prowadzącego w pauzie gościa, bez muzyki pod rozmową (realizm),
łańcuch głosu „podcast” jak r14_v6, napisy zdaniami, kółko AI, czarna karta CTA jak r10.
Ujęcia wybrane z dubli: ha (pytanie) + ga (odpowiedź), reakcja z końcówki hb; zapas: hb / gb (wiedza/clips4you-r15-podcast.md).
  ..\..\..\runtime\python.exe montaz.py      -> r15_v2.mp4 + f0.jpg (v1 z „klientów” = montaz_v1.py)
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
sys.path[:0] = [os.path.join(HERE, "..", "lib"), os.path.join(HERE, "..", "sekunda"), os.path.join(HERE, "..", "r6"), os.path.join(ROOT, "motion")]
from kino import ff, dur, SFX, SOUNDS, PEAK
from montaz import shots
from montaz2 import FPS

# (klip, od, do (w klipie), zoom bazowy) - pomiar głośności co 0,1 s + słowa z Whispera (stt.json)
SEG = [("hc", 0.52, 1.36, 1.00),    # v2: „Masz firmę.” (ha/hb mówiły źle „klientów”, użytkownik 2026-10-11)
       ("hc", 1.76, 5.08, 1.10),    # skok zbliżeniem: „Co sprawiło, że telefon dzwoni non stop?”
       ("ga", 0.62, 1.38, 1.00),    # „Rolki.”
       ("hb", 4.06, 4.46, 1.10),    # reakcja prowadzącego (cisza) w pauzie gościa
       ("ga", 1.72, 4.46, 1.10)]    # „I nawet nie musiałem ich nagrywać.” + uśmiech
GRADE = ("eq=contrast=1.05:saturation=1.06,unsharp=5:5:0.4:5:5:0.0,vignette=angle=PI/6,noise=alls=3:allf=t+u")
VOICE = ("highpass=f=75,afftdn=nr=8:nf=-50,equalizer=f=180:t=o:w=1.2:g=1.5,equalizer=f=450:t=o:w=1:g=-2.5,"
         "equalizer=f=3500:t=o:w=1.2:g=1.5,deesser=i=0.4,acompressor=threshold=-24dB:ratio=3:attack=5:release=90:makeup=4dB,volume=3.5dB")
LENS = [b - a for _, a, b, _ in SEG]
STARTS = [sum(LENS[:i]) for i in range(len(SEG))]
END0 = sum(LENS); TOTAL = END0 + 2.0
CAPS = [(0.00, STARTS[1], "Masz firmę."),
        (STARTS[1], STARTS[2], "Co sprawiło, że telefon<br><b>dzwoni non stop?</b>"),
        (STARTS[2], STARTS[4], "<b>Rolki.</b>"),
        (STARTS[4], END0, "I nawet nie musiałem<br><b>ich nagrywać.</b>")]


def main():
    tmp = os.path.join(HERE, "_m"); os.makedirs(tmp, exist_ok=True)
    segs = []
    for i, (clip, a, b, z0) in enumerate(SEG):
        L = LENS[i]
        z = f"{z0}+0.03*t/{L:.3f}"
        out = os.path.join(tmp, f"s{i}.mov")
        ff(["-i", os.path.join(HERE, f"{clip}_768P.mp4"), "-filter_complex",
            f"[0:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            f"tpad=stop_mode=clone:stop_duration=0.3,trim=duration={L:.4f},setpts=PTS-STARTPTS,"
            f"scale=w='trunc(1080*({z})/2)*2':h='trunc(1920*({z})/2)*2':eval=frame,crop=1080:1920,{GRADE},format=yuv420p,settb=AVTB[v];"
            f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,atrim=duration={L:.4f},apad=whole_dur={L:.4f},"
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
    fc.append(f"[ac]{VOICE}[acv]"); mix = ["[acv]"]
    sfx = [(END0 - 0.6, "RISER", -17), (END0 + 0.02, "BOX", -3), (END0 + 0.05, "IMP_BASS", -5)]
    for k, (t, name, db) in enumerate(sfx):
        ins += ["-i", os.path.join(SFX, SOUNDS[name])]
        fc.append(f"[{n + k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={db}dB,"
                  f"adelay={int(max(0, t - PEAK[name]) * 1000)}:all=1[s{k}]"); mix.append(f"[s{k}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{TOTAL:.3f},alimiter=limit=0.95[aout]")
    out = os.path.join(HERE, "r15_v2.mp4")
    ff(ins + ["-filter_complex", ";".join(fc), "-map", v, "-map", "[aout]", "-t", f"{TOTAL:.3f}", "-r", str(FPS), "-c:v", "libx264", "-crf", "17",
              "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    ff(["-i", out, "-frames:v", "1", "-q:v", "2", os.path.join(HERE, "f0.jpg")])
    print(f"r15_v2.mp4: {dur(out):.2f} s, cięcia: " + ", ".join(f"{s:.2f}" for s in STARTS) + f", karta {END0:.2f}")


if __name__ == "__main__":
    main()
