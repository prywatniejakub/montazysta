"""Soundtrack for showreel.html: music re-arranged on the bar grid + SFX placed by their measured peaks.
  audio.py out.wav
"""
import os, subprocess, sys, re

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
LIB = os.path.join(ROOT, "biblioteka", "Dźwięki")
MUSIC = os.path.join(ROOT, "biblioteka", "Muzyka", "AI ElevenLabs", "BUM — lekki bas — fashion beat — minimalis - d34aff1df205.wav")
DUR = 24.6
BAR = 2.52667
H0 = .024
DROP = H0 + 4 * BAR
D2 = DROP + 2 * BAR
END = DROP + 4 * BAR
CUT = .05  # cut just before a downbeat

WH_SOFT, WH_SWING, WH_BAMBOO = r"01 Whoosh/03 - Soft Whoosh.wav", r"01 Whoosh/02 - Swing Woosh.wav", r"01 Whoosh/01 - Bamboo Whoosh.wav"
WH_SPAWN, WH_DATA = r"01 Whoosh/05 - Spawn Whoosh.wav", r"01 Whoosh/04 - Digital Data Whoosh.wav"
IMP_SOFT, IMP_BASS = r"02 Impact/06 - Soft Cinematic Impact.wav", r"02 Impact/07 - Bass Cinematic Impact.wav"
RISER = r"03 Riser/11 - Short Aesthetic Riser.wav"
CLICK, POP, DING = r"06 Komedia i UI/28 - UI Click.wav", "pop.wav", "ding.wav"
BOX = "02 Impact/08 - Whoosh Hit Faller.wav"
FLASH = "06 Komedia i UI/28 - UI Click.wav"
PEAK = {WH_SOFT: .34, WH_SWING: .09, WH_BAMBOO: .08, WH_SPAWN: .63, WH_DATA: .01, IMP_SOFT: .15, IMP_BASS: .25,
        RISER: 1.98, CLICK: .22, POP: 0, DING: 0, BOX: .20, FLASH: .20}

# (file, time the peak lands on, gain dB, max length or None)
SFX = [
    (IMP_SOFT, H0, -14, None),
    (WH_SOFT, 2.45, -12, None), (WH_SPAWN, 2.75, -8, None), (WH_DATA, 2.79, -24, 1.9),
    (WH_SWING, 4.95, -12, None), (WH_BAMBOO, 5.15, -12, None),
    *[(CLICK, H0 + 2 * BAR + .42 + k * .075 + .05, -24, None) for k in range(5)],
    (WH_SOFT, 7.5, -12, None), (WH_SPAWN, 7.78, -8, None),
    *[(CLICK, H0 + 3 * BAR + k * BAR / 4, -14, None) for k in (1, 2, 3)],
    *[(POP, H0 + 3 * BAR + k * BAR / 4, -22, None) for k in (1, 2, 3)],
    (RISER, DROP, -10, None), (WH_SOFT, 10.05, -10, None), (IMP_BASS, DROP, -8, None),
    (WH_SWING, 11.33, -10, None), (WH_BAMBOO, 11.65, -12, None), (WH_SWING, 12.6, -10, None),
    *[(POP, 12.74 + .6 * (k / 13) ** 1.8, -24, None) for k in range(14)], (DING, 13.34, -18, None),
    (WH_SOFT, 13.88, -12, None), (WH_SPAWN, 14.1, -8, None), (WH_BAMBOO, 14.3, -14, None),
    (WH_SWING, 15.12, -12, None), (BOX, D2, -12, None),
    (WH_SOFT, 16.45, -12, None), (WH_SWING, 17.06, -8, None), (IMP_SOFT, D2 + BAR, -16, None), (FLASH, 17.85, -16, None),
    (WH_SPAWN, 18.5, -8, None), (WH_SOFT, 20.15, -10, None),
    (IMP_SOFT, END, -6, None), (IMP_BASS, END, -12, None),
]


def main(out):
    args = [FF, "-v", "error", "-y", "-i", MUSIC]
    files = sorted({s[0] for s in SFX})
    for f in files:
        args += ["-i", os.path.join(LIB, f)]
    fc = ["[0:a]aresample=48000,asplit=3[m1][m2][m3]",
          f"[m1]atrim=0:{D2 - CUT:.4f},asetpts=PTS-STARTPTS,afade=t=out:st={D2 - CUT - .012:.4f}:d=0.012[s1]",
          f"[m2]atrim={DROP - CUT:.4f}:{D2 - CUT:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,afade=t=out:st={2 * BAR - .012:.4f}:d=0.012,"
          f"adelay={int((D2 - CUT) * 1000)}:all=1[s2]",
          f"[m3]atrim={D2 - CUT:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,adelay={int((END - CUT) * 1000)}:all=1[s3]"]
    labels = ["[s1]", "[s2]", "[s3]"]
    uses = {f: sum(1 for s in SFX if s[0] == f) for f in files}
    for k, f in enumerate(files):
        outs = "".join(f"[i{k + 1}_{j}]" for j in range(uses[f]))
        fc.append(f"[{k + 1}:a]aresample=48000,aformat=channel_layouts=stereo,asplit={uses[f]}{outs}")
    taken = {f: 0 for f in files}
    for n, (f, t, gain, maxlen) in enumerate(SFX):
        idx = f"i{files.index(f) + 1}_{taken[f]}"
        taken[f] += 1
        start = t - PEAK[f]
        skip = max(0, -start)
        chain = f"[{idx}]atrim=start={skip:.4f}"
        if maxlen:
            chain += f":duration={maxlen},afade=t=out:st={maxlen * .6:.3f}:d={maxlen * .4:.3f}"
        chain += f",asetpts=PTS-STARTPTS,volume={gain}dB,adelay={int(max(0, start) * 1000)}:all=1[x{n}]"
        fc.append(chain)
        labels.append(f"[x{n}]")
    fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,"
              f"atrim=0:{DUR},afade=t=out:st={DUR - .9:.3f}:d=0.9[mix]")
    subprocess.run(args + ["-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", out + ".raw.wav"], check=True)
    # loudness to about -14 LUFS with a soft limiter
    r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", out + ".raw.wav", "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace")
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])
    gain = -14 - lufs
    print(f"mix {lufs:.1f} LUFS -> gain {gain:+.1f} dB")
    subprocess.run([FF, "-v", "error", "-y", "-i", out + ".raw.wav", "-af",
                    f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled", "-c:a", "pcm_s16le", out],
                   check=True)
    os.remove(out + ".raw.wav")


if __name__ == "__main__":
    main(sys.argv[1])
