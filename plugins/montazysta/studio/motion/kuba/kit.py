"""Kuba Builds AI reels: voice (ElevenLabs, the Clips4you "Adam" voice), a voice-first timeline, gameplay frames,
music/SFX generation and the soundtrack mix.  Pages use ../../lib/engine.js with the timing.js written here.

Per reel folder (r1..r6): script.py defines LINES (+ GAPS, CUTS, SFX, MUSIC) and calls the steps below.
"""
import json, math, os, re, shutil, subprocess, sys

ROOT = (__import__("os").environ.get("C4Y_ROOT") or __import__("os").path.expanduser("~/Montaz/studio"))
MOTION = os.path.join(ROOT, "motion")
KUBA = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(KUBA, "assets")
sys.path[:0] = [os.path.join(MOTION, "lib"), os.path.join(ROOT, "app", "vendor"), os.path.join(ROOT, "app")]
import voicekit  # noqa: E402
import audiokit as AK  # noqa: E402
import dubbing as D  # noqa: E402

FF = AK.FF
REC = os.path.join(ROOT, "recordings")


def eleven():
    return D.ElevenLabs(D.secrets().get("elevenlabs_api_key"))


# ---------------------------------------------------------------- voice + timeline
LIAM = "TX3LPaxmHKxFdv7VOQHJ"  # Liam - Energetic, Social Media Creator (premade, in the account)
REEL = "JKbdwi8BFwQlr1n3fwoT"  # Reel - Conversational Voice for Short Content (library, added 2026-09-23) - the user's pick


def voice(here, lines, seps=None, voice_id=None):
    return voicekit.generate(here, lines, voice=voice_id or voicekit.VOICE, seps=seps)


def tighten(here, lines, voice_id=None, keep=.2, db=-38, mind=.24):
    """cut the dead air INSIDE lines (eleven_v3 likes 0.5-0.9 s dramatic pauses): silences found by ffmpeg silencedetect
    longer than `keep` shrink to `keep` -> voice_t.mp3 + lines.json in the new times (each line marked "tight").
    Run after voice, before timing; re-runnable (always starts from the cached take, no credits)."""
    raw = voice(here, lines, voice_id=voice_id)  # cached: rewrites lines.json in voice.mp3 times
    json.dump(raw, open(os.path.join(here, "lines_raw.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    mp3 = os.path.join(here, "voice.mp3")
    p = subprocess.run([FF, "-hide_banner", "-i", mp3, "-af", f"silencedetect=n={db}dB:d={mind}", "-f", "null", "-"],
                       capture_output=True, text=True)
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", p.stderr)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    # every long silence goes, also the ones at line edges: the aligner often starts a line inside the pause before it
    cuts = [(a + keep * .6, b - keep * .4) for a, b in zip(st, en) if b - a > keep]
    def mp(t):
        s = 0.0
        for a, b in cuts:
            if t >= b:
                s += b - a
            elif t > a:
                s += t - a
        return round(t - s, 3)
    keepseg, prev = [], 0.0
    for a, b in cuts:
        keepseg.append((prev, a))
        prev = b
    keepseg.append((prev, None))
    fc = []
    for i, (a, b) in enumerate(keepseg):
        tr = f"atrim=start={a:.3f}" + (f":end={b:.3f}" if b else "")
        fc.append(f"[0:a]{tr},asetpts=PTS-STARTPTS,afade=t=in:d=0.008" + (f",afade=t=out:st={b - a - .008:.3f}:d=0.008" if b else "") + f"[s{i}]")
    fc.append("".join(f"[s{i}]" for i in range(len(keepseg))) + f"concat=n={len(keepseg)}:v=0:a=1[o]")
    AK.run(["-i", mp3, "-filter_complex", ";".join(fc), "-map", "[o]", "-c:a", "libmp3lame", "-q:a", "2", os.path.join(here, "voice_t.mp3")])
    out = [{**l, "start": mp(l["start"]), "end": mp(l["end"]), "tight": True,
            "words": [{**w, "s": mp(w["s"]), "e": mp(w["e"])} for w in l["words"]]} for l in raw]
    json.dump(out, open(os.path.join(here, "lines.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"tighten: {len(cuts)} pauses cut, -{sum(b - a for a, b in cuts):.2f} s")
    for l in out:
        print(f"{l['start']:6.2f} {l['end']:6.2f} ({l['end'] - l['start']:.2f}s)  {l['text']}")
    return out


def swap_last(here, lines, voice_id):
    """replace only the LAST line of an accepted voice take: the new line is voiced alone (in _swap/) and spliced
    after the old take's second-to-last line; voice.mp3 + alignment.json are rewritten (originals kept in _swap/old_*)"""
    sw = os.path.join(here, "_swap")
    os.makedirs(sw, exist_ok=True)
    mp3, alp = os.path.join(here, "voice.mp3"), os.path.join(here, "alignment.json")
    if not os.path.exists(os.path.join(sw, "old_voice.mp3")):
        shutil.copyfile(mp3, os.path.join(sw, "old_voice.mp3"))
        shutil.copyfile(alp, os.path.join(sw, "old_alignment.json"))
    old = json.load(open(os.path.join(sw, "old_alignment.json"), encoding="utf-8"))
    al = old["alignment"]
    chars = al["characters"]
    joined = "".join(chars)
    prev = lines[-2].strip()
    j = joined.find(prev)
    if j < 0:
        raise RuntimeError("second-to-last line not found in the old take")
    j += len(prev)
    end_prev = al["character_end_times_seconds"][j - 1]
    nxt = next((al["character_start_times_seconds"][k] for k in range(j, len(chars)) if not chars[k].isspace()), end_prev + 1)
    cut = round(min(end_prev + .3, nxt - .05), 3)
    new = os.path.join(sw, "new")
    os.makedirs(new, exist_ok=True)
    nal = os.path.join(new, "alignment.json")
    if os.path.exists(nal) and json.load(open(nal, encoding="utf-8"))["text"] != lines[-1]:  # the CTA text changed
        os.remove(nal)
    voicekit.generate(new, [lines[-1]], voice=voice_id)
    na = json.load(open(os.path.join(new, "alignment.json"), encoding="utf-8"))["alignment"]
    subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(sw, "old_voice.mp3"), "-i", os.path.join(new, "voice.mp3"),
                    "-filter_complex", f"[0:a]aresample=44100,atrim=0:{cut},asetpts=PTS-STARTPTS[a];[1:a]aresample=44100[b];"
                    "[a][b]concat=n=2:v=0:a=1[o]", "-map", "[o]", "-c:a", "libmp3lame", "-b:a", "192k", mp3], check=True)
    sep = list(voicekit.SEP)
    out = {"characters": chars[:j] + sep + na["characters"],
           "character_start_times_seconds": al["character_start_times_seconds"][:j] + [cut] * len(sep) + [round(s + cut, 3) for s in na["character_start_times_seconds"]],
           "character_end_times_seconds": al["character_end_times_seconds"][:j] + [cut] * len(sep) + [round(s + cut, 3) for s in na["character_end_times_seconds"]]}
    json.dump({"text": voicekit.join(lines), "alignment": out}, open(alp, "w", encoding="utf-8"), ensure_ascii=False)
    return voicekit.generate(here, lines, voice=voice_id)


def timing(here, gaps=None, gap=.24, t0=.1, hold=1.8):
    """lines one after another (gap after each, gaps[i] = pause before line i), no music grid"""
    lines = json.load(open(os.path.join(here, "lines.json"), encoding="utf-8"))
    slots, t = [], t0
    for i, l in enumerate(lines):
        if i:
            t += (gaps or {}).get(i, gap)
        slots.append(round(t, 3))
        t += l["end"] - l["start"]
    dur = round(t + hold, 2)
    T = {"voice": "voice_t.mp3" if lines and lines[0].get("tight") else "voice.mp3", "DUR": dur, "DROP": -10, "BRK": None, "REDROP": None, "END": -10, "BAR": 2.0, "BEAT": .5, "H0": 0,
         "GRID0": 0, "ACC": [], "beats": [], "segments": [], "lines": []}
    for l, s in zip(lines, slots):
        T["lines"].append({"text": l["text"], "slot": s, "src": [l["start"], l["end"]],
                           "words": [{"w": w["w"], "t": round(s + w["s"] - l["start"], 3), "e": round(s + w["e"] - l["start"], 3)}
                                     for w in l["words"]]})
    json.dump(T, open(os.path.join(here, "timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(here, "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(T, ensure_ascii=False) + ";\n")
    print(f"DUR {dur}")
    for L in T["lines"]:
        print(f"  {L['slot']:6.2f}  {L['text']}")
    return T


def load(here):
    return json.load(open(os.path.join(here, "timing.json"), encoding="utf-8"))


W, LS, LE = AK.W, AK.LS, AK.LE


# ---------------------------------------------------------------- gameplay frames for the Minecraft pages
def frames(here, cuts, size=960, fps=30, crop=1440):
    """cuts = [(video_t0, video_t1, recording_name, src_start)] -> frames/NNNNN.jpg in cut order + frames.js
    (window.CUTS = [[a, b, base_frame]]).  Centre crop of the 2560x1440 recordings: a square (size, crop) or a
    rectangle (size=(w, h), crop=(cw, ch))."""
    sw, sh = size if isinstance(size, tuple) else (size, size)
    cw, chh = crop if isinstance(crop, tuple) else (crop, crop)
    out = os.path.join(here, "frames")
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        os.remove(os.path.join(out, f))
    table, base = [], 0
    for a, b, name, s in cuts:
        n = int(math.ceil((b - a) * fps)) + 2
        src = os.path.join(REC, name + ".mkv")
        subprocess.run([FF, "-v", "error", "-y", "-ss", f"{s:.3f}", "-i", src, "-frames:v", str(n), "-an",
                        "-vf", f"fps={fps},crop={cw}:{chh}:(iw-{cw})/2:(ih-{chh})/2,scale={sw}:{sh}:flags=lanczos",
                        "-q:v", "3", "-start_number", str(base + 1), os.path.join(out, "%05d.jpg")], check=True, timeout=600)
        got = sum(1 for k in range(base + 1, base + n + 1) if os.path.exists(os.path.join(out, f"{k:05d}.jpg")))
        if got == 0:
            raise RuntimeError(f"no frames from {name} @ {s}")
        for k in range(base + got + 1, base + n + 1):  # the recording ended early: hold its last frame
            shutil.copyfile(os.path.join(out, f"{base + got:05d}.jpg"), os.path.join(out, f"{k:05d}.jpg"))
        table.append([round(a, 3), round(b, 3), base])
        base += n
    open(os.path.join(here, "frames.js"), "w", encoding="utf-8").write(
        f"window.CUTS = {json.dumps(table)}; window.GFPS = {fps}; window.NFRAMES = {base};\n")
    print(f"frames: {base} in {len(cuts)} cuts")


# ---------------------------------------------------------------- generated music / sfx (cached in assets/)
def music(name, prompt, secs):
    path = os.path.join(ASSETS, "music", name + ".mp3")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        data = eleven().music(prompt, secs)
        open(path, "wb").write(data)
    return path


def sound(name, prompt, secs):
    path = os.path.join(ASSETS, "sfx", name + ".mp3")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        data = eleven().sound_effect(prompt, secs)
        open(path, "wb").write(data)
    return path


def peak(path):
    """time of the loudest 10 ms block (where an SFX 'hits')"""
    r = subprocess.run([FF, "-v", "error", "-i", path, "-af", "aresample=8000,asetnsamples=80,astats=metadata=1:reset=1,"
                        "ametadata=print:key=lavfi.astats.Overall.Peak_level:file=-", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace")
    best, t, bt = -999, 0, 0
    for line in r.stdout.splitlines():
        m = re.search(r"pts_time:([\d.]+)", line)
        if m:
            t = float(m.group(1))
        m = re.search(r"Peak_level=(-?[\d.]+|-inf)", line)
        if m and m.group(1) != "-inf" and float(m.group(1)) > best:
            best, bt = float(m.group(1)), t
    return bt


# ---------------------------------------------------------------- soundtrack
def audio(here, music_path, sfx, name, bed=-25.0, voice_lufs=-15.0, music_start=0.0, voice=True):
    """voice lines at their slots, a music bed (trimmed/looped to DUR), SFX events (file, at, gain_db, maxlen);
    file = a name from audiokit (biblioteka/Dźwięki) or an absolute path; 'at' = the moment the SFX should hit.
    voice=False: music + SFX only (a preview while the real voice can't be generated yet)"""
    t = load(here)
    DUR = t["DUR"]
    tmp = lambda n: os.path.join(here, f"_{n}.wav")
    L = t["lines"]
    fc, ins = [], []
    for i, ln in enumerate(L if voice else []):
        a, z = ln["src"]
        a = max(0, a - .05) if i == 0 else max(L[i - 1]["src"][1] + .02, a - .05)
        z = z + .16 if i == len(L) - 1 else min(L[i + 1]["src"][0] - .03, z + .16)
        ins += ["-i", os.path.join(here, t.get("voice", "voice.mp3"))]
        fc.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim={a:.3f}:{z:.3f},asetpts=PTS-STARTPTS,"
                  f"afade=t=in:d=0.02,afade=t=out:st={max(0, z - a - .06):.3f}:d=0.06,"
                  f"adelay={int(max(0, ln['slot'] - (ln['src'][0] - a)) * 1000)}:all=1,{AK.FILL},apad,atrim=0:{DUR}[v{i}]")
    if voice:
        fc.append("".join(f"[v{i}]" for i in range(len(L))) + f"amix=inputs={len(L)}:normalize=0[vo]")
        AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[vo]", "-c:a", "pcm_s24le", tmp("vo")])
    else:  # silence in place of the voice keeps the mix below unchanged
        AK.run(["-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo", "-t", f"{DUR}", "-c:a", "pcm_s24le", tmp("vo")])
    # music bed
    AK.run(["-stream_loop", "-1", "-ss", f"{music_start:.3f}", "-i", music_path, "-af",
            f"aresample=48000,aformat=channel_layouts=stereo,atrim=0:{DUR},afade=t=in:d=0.25,afade=t=out:st={DUR - 1.6:.2f}:d=1.6",
            "-c:a", "pcm_s24le", tmp("mus")])
    # sfx
    events = list(sfx)
    if events:
        fc, ins = [], []
        for n, (f, at, gain, maxlen) in enumerate(events):
            path = f if os.path.isabs(f) else os.path.join(AK.LIB, f)
            pk = AK.PEAK.get(f)
            if pk is None:
                pk = peak(path)
                AK.PEAK[f] = pk
            start = at - pk
            ins += ["-i", path]
            chain = f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=start={max(0, -start):.4f}"
            if maxlen:
                chain += f",afade=t=out:st={maxlen * .6:.3f}:d={maxlen * .4:.3f},atrim=0:{maxlen:.3f}"
            fc.append(chain + f",asetpts=PTS-STARTPTS,volume={gain}dB,adelay={int(max(0, start) * 1000)}:all=1,{AK.FILL},apad,atrim=0:{DUR}[x{n}]")
        fc.append("".join(f"[x{n}]" for n in range(len(events))) + f"amix=inputs={len(events)}:normalize=0[fx]")
        AK.run(ins + ["-filter_complex", ";".join(fc), "-map", "[fx]", "-c:a", "pcm_s24le", tmp("fx")])
    gm = bed - AK.lufs(tmp("mus"))
    gv = voice_lufs - AK.lufs(tmp("vo")) if voice else 0.0
    mixin = ["-i", tmp("vo"), "-i", tmp("mus")] + (["-i", tmp("fx")] if events else [])
    fxs = "[2:a]volume=0dB[c];" if events else ""
    amix = f"[a][b]{'[c]' if events else ''}amix=inputs={3 if events else 2}:normalize=0"
    AK.run(mixin + ["-filter_complex", f"[0:a]volume={gv:.2f}dB[a];[1:a]volume={gm:.2f}dB[b];{fxs}{amix},"
                    f"alimiter=limit=0.84:attack=3:release=60:level=disabled[o]", "-map", "[o]", "-c:a", "pcm_s24le", tmp("mix")])
    g = -14 - AK.lufs(tmp("mix")) if voice else 0.0  # no voice: the music stays where it will sit under the voice
    out = os.path.join(here, "audio.wav")
    AK.run(["-i", tmp("mix"), "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled", "-c:a", "pcm_s16le", out])
    AK.run(["-i", out, "-c:a", "aac", "-b:a", "192k", os.path.join(here, name + ".m4a")])
    for n in ("vo", "mus", "fx", "mix"):
        if os.path.exists(tmp(n)):
            os.remove(tmp(n))
    print(f"audio: voice {gv:+.1f} dB, music {gm:+.1f} dB, final {AK.lufs(out):.1f} LUFS, {DUR} s")


def cfg(here, C):
    open(os.path.join(here, "cfg.js"), "w", encoding="utf-8").write("window.CFG = " + json.dumps(C, ensure_ascii=False) + ";\n")


def page(here, name, kind):
    """<name>.html from lib/<kind>.html ({{NAME}} = the reel name, audio = <name>.m4a)"""
    tpl = open(os.path.join(KUBA, "lib", kind + ".html"), encoding="utf-8").read()
    open(os.path.join(here, name + ".html"), "w", encoding="utf-8").write(tpl.replace("{{NAME}}", name))


def seq_cuts(t, plan, dur=None):
    """plan = [(start_time, recording, src_start)] in order -> [(a, b, rec, src)] (each cut ends where the next begins)"""
    dur = dur or t["DUR"]
    out = []
    for k, (a, rec, src) in enumerate(plan):
        b = plan[k + 1][0] if k + 1 < len(plan) else dur + .2
        out.append((max(0, a), b, rec, src))
    return out


def render(here, name, fps=30, sub=3, workers=4, stills=None):
    py = os.path.join(ROOT, "runtime", "python.exe")
    page_ = os.path.join(here, name + ".html")
    if stills:
        subprocess.run([py, os.path.join(MOTION, "render.py"), page_, os.path.join(here, "stills"), "--size", "1080x1920",
                        "--stills", ",".join(f"{s:.2f}" for s in stills)], check=True)
        return
    subprocess.run([py, os.path.join(MOTION, "render.py"), page_, os.path.join(here, "video.mp4"), "--size", "1080x1920",
                    "--fps", str(fps), "--sub", str(sub), "--workers", str(workers), "--crf", "16"], check=True)


def mux(here, video, name, out):
    subprocess.run([FF, "-v", "error", "-y", "-i", os.path.join(here, video), "-i", os.path.join(here, "audio.wav"),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart", out], check=True)
