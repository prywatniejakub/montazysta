"""Soundtrack for a motion ad from timing.json: voice lines on their slots, the re-arranged music, SFX by peak time.
Every clip gets its own ffmpeg input (asplit with far-apart delays made ffmpeg spin forever), steps run separately,
voice ends up about 9 LU above the bed, final mix -14 LUFS.  Writes audio.wav + <name>.m4a for the live preview.
"""
import json, os, re, subprocess

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
FF = os.path.join(ROOT, "ffmpeg", "ffmpeg.exe")
LIB = os.path.join(ROOT, "biblioteka", "Dźwięki")
MUSIC = os.path.join(ROOT, "biblioteka", "Muzyka", "AI ElevenLabs", "BUM — lekki bas — fashion beat — minimalis - d34aff1df205.wav")

WH_SOFT, WH_SWING, WH_BAMBOO = r"01 Whoosh/03 - Soft Whoosh.wav", r"01 Whoosh/02 - Swing Woosh.wav", r"01 Whoosh/01 - Bamboo Whoosh.wav"
WH_SPAWN, WH_DATA = r"01 Whoosh/05 - Spawn Whoosh.wav", r"01 Whoosh/04 - Digital Data Whoosh.wav"
IMP_SOFT, IMP_BASS = r"02 Impact/06 - Soft Cinematic Impact.wav", r"02 Impact/07 - Bass Cinematic Impact.wav"
RISER = r"03 Riser/11 - Short Aesthetic Riser.wav"
CLICK, POP, DING = r"06 Komedia i UI/28 - UI Click.wav", "pop.wav", "ding.wav"
BOX = "02 Impact/08 - Whoosh Hit Faller.wav"
FLASH = "06 Komedia i UI/28 - UI Click.wav"
PEAK = {WH_SOFT: .34, WH_SWING: .09, WH_BAMBOO: .08, WH_SPAWN: .63, WH_DATA: .01, IMP_SOFT: .15, IMP_BASS: .25,
        RISER: 1.98, CLICK: .22, POP: 0, DING: 0, BOX: .20, FLASH: .20}


# ffmpeg 9 adelay only shifts timestamps; after apad/atrim/amix that shift was lost and every clip played at 0 s.
# aresample with first_pts=0 turns the shift into real leading silence.
FILL = "aresample=async=1:first_pts=0"


def timing(here):
    return json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))


def LI(t, k):
    """line index from an index or a line key (variant templates)"""
    return k if isinstance(k, int) else [l.get("key") for l in t["lines"]].index(k)


def HAS(t, k):
    return k < len(t["lines"]) if isinstance(k, int) else any(l.get("key") == k for l in t["lines"])


def W(t, i, needle, nth=0, frac=None):
    """video time of the first word of line i that starts with needle (same rule as W() in engine.js);
    frac = fallback point inside the line when a variant rewrote it"""
    i = LI(t, i)
    n = re.sub(r"\W", "", needle.lower())
    hits = [w for w in t["lines"][i]["words"] if re.sub(r"\W", "", w["w"].lower()).startswith(n)]
    if not hits and frac is not None:
        return LF(t, i, frac)
    return hits[min(nth, len(hits) - 1)]["t"]


def LS(t, i):
    return t["lines"][LI(t, i)]["slot"]


def LE(t, i):
    return t["lines"][LI(t, i)]["words"][-1]["e"]


def LF(t, i, u):
    return LS(t, i) + (LE(t, i) - LS(t, i)) * u


def SYNC(t, k, text, frac=0):
    """same rule as sync() in engine.js: first spoken word matching a word of the on-screen phrase"""
    ws = [w for w in t["lines"][LI(t, k)]["words"] if re.sub(r"\W", "", w["w"].lower())]
    for c in re.sub(r"<[^>]*>", " ", str(text)).split():
        c = re.sub(r"\W", "", c.lower())
        if len(c) < 3:
            continue
        stem = c[:max(3, len(c) - 2)]
        hit = next((w for w in ws if re.sub(r"\W", "", w["w"].lower()).startswith(stem)), None)
        if hit:
            return hit["t"]
    return LF(t, k, frac)


def run(args):
    subprocess.run([FF, "-v", "error", "-y"] + args, check=True, timeout=240)


def lufs(path):
    r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace")
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


def frame(t):
    """standard sfx every ad gets: riser into the drop, impacts on drop / re-drop / ending"""
    s = [(RISER, t["DROP"], -10, None), (WH_SOFT, t["DROP"] - .08, -10, None), (IMP_BASS, t["DROP"], -8, None),
         (IMP_SOFT, t["END"], -6, None), (IMP_BASS, t["END"], -12, None)]
    if t.get("REDROP") and abs(t["REDROP"] - t["END"]) > .1:
        s.append((BOX, t["REDROP"], -12, None))
    for a in t.get("ACC", []):  # accent lines of the variant templates (plan.arrange)
        if abs(a - t["END"]) > .1:
            s.append((BOX, a, -13, None))
    return s


def build(here, sfx, name, check_voice=True):
    t = json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))
    DUR = t["DUR"]
    tmp = lambda n: os.path.join(here, f"_{n}.wav")
    # voice: each line cut from voice.mp3 (a little air around it, never into the next line)
    L = t["lines"]
    fc, ins = [], []
    for i, ln in enumerate(L):
        a, z = ln["src"]
        a = max(0, a - .05) if i == 0 else max(L[i - 1]["src"][1] + .02, a - .05)
        z = z + .14 if i == len(L) - 1 else min(L[i + 1]["src"][0] - .03, z + .14)
        ins += ["-i", os.path.join(here, "voice.mp3")]
        fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={a:.3f}:{z:.3f},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d=0.02,afade=t=out:st={max(0, z - a - .06):.3f}:d=0.06,"
                  f"adelay={int(max(0, ln['slot'] - (ln['src'][0] - a)) * 1000)}:all=1,{FILL},apad,atrim=0:{DUR}[v{i}]")
    fc.append("".join(f"[v{i}]" for i in range(len(L))) + f"amix=inputs={len(L)}:normalize=0[vo]")
    run(ins + ["-filter_complex", ";".join(fc), "-map", "[vo]", "-c:a", "pcm_s24le", tmp("vo")])
    # guard: the last line must end where the plan put it (catches clips collapsing to 0 s)
    r = subprocess.run([FF, "-hide_banner", "-nostats", "-i", tmp("vo"), "-af", "silencedetect=noise=-45dB:d=0.3", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace")
    quiet = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    want = L[-1]["slot"] + L[-1]["src"][1] - L[-1]["src"][0]
    if check_voice and (not quiet or abs(quiet[-1] - want) > .6):
        raise RuntimeError(f"voice track misplaced: speech ends at {quiet[-1] if quiet else '?'} s, plan says {want:.2f} s")
    # music
    fc, ins = [], []
    for i, (a, z, at) in enumerate(t["segments"]):
        ins += ["-i", MUSIC]
        fc.append(f"[{i}:a]aresample=48000,atrim={a:.4f}:{z:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,"
                  f"afade=t=out:st={max(0, z - a - .012):.4f}:d=0.012,adelay={int(at * 1000)}:all=1,{FILL},apad,atrim=0:{DUR}[s{i}]")
    fc.append("".join(f"[s{i}]" for i in range(len(t["segments"]))) + f"amix=inputs={len(t['segments'])}:normalize=0[mus]")
    run(ins + ["-filter_complex", ";".join(fc), "-map", "[mus]", "-c:a", "pcm_s24le", tmp("mus")])
    # sfx
    events = frame(t) + list(sfx)
    fc, ins = [], []
    for n, (f, at, gain, maxlen) in enumerate(events):
        start = at - PEAK[f]
        ins += ["-i", os.path.join(LIB, f)]
        chain = f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={max(0, -start):.4f}"
        if maxlen:
            chain += f",afade=t=out:st={maxlen * .6:.3f}:d={maxlen * .4:.3f}"
        fc.append(chain + f",asetpts=PTS-STARTPTS,volume={gain}dB,adelay={int(max(0, start) * 1000)}:all=1,{FILL},apad,atrim=0:{DUR}[x{n}]")
    fc.append("".join(f"[x{n}]" for n in range(len(events))) + f"amix=inputs={len(events)}:normalize=0[fx]")
    run(ins + ["-filter_complex", ";".join(fc), "-map", "[fx]", "-c:a", "pcm_s24le", tmp("fx")])
    run(["-i", tmp("mus"), "-i", tmp("fx"), "-filter_complex", "[0:a][1:a]amix=inputs=2:normalize=0[b]", "-map", "[b]", "-c:a", "pcm_s24le", tmp("bed")])
    gv, gb = -15 - lufs(tmp("vo")), -24 - lufs(tmp("bed"))
    run(["-i", tmp("vo"), "-i", tmp("bed"), "-filter_complex",
         f"[0:a]volume={gv:.2f}dB[a];[1:a]volume={gb:.2f}dB[c];[a][c]amix=inputs=2:normalize=0,"
         f"afade=t=out:st={DUR - .8:.2f}:d=0.8,alimiter=limit=0.84:attack=3:release=60:level=disabled[o]",
         "-map", "[o]", "-c:a", "pcm_s24le", tmp("mix")])
    g = -14 - lufs(tmp("mix"))
    out = os.path.join(here, "audio.wav")
    run(["-i", tmp("mix"), "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled", "-c:a", "pcm_s16le", out])
    run(["-i", out, "-c:a", "aac", "-b:a", "192k", os.path.join(here, name + ".m4a")])
    for n in ("vo", "mus", "fx", "bed", "mix"):
        os.remove(tmp(n))
    print(f"audio: voice {gv:+.1f} dB, bed {gb:+.1f} dB, final {lufs(out):.1f} LUFS, {DUR} s")
